"""Pages Corrections et Import (avec les explications sur l'Excel, la banlist et l'algorithme)."""

import json

from rapidfuzz import fuzz, process
import pandas as pd
import streamlit as st

from ygo import analysis as A
from ygo import builds
from ygo import importer
from ygo.fr import BANLIST, tr
from ygo.importer import CORRECTIONS_PATH, normalize
from ygo.ui.core import card_img, catalog, con, refresh, search
from ygo.ui.style import page_header


def page_corrections():
    page_header(
        "Corrections",
        "Associe à la bonne carte les noms de l'Excel non reconnus ou reconnus de façon approximative.",
        "Données",
    )
    st.caption("Une correction est enregistrée dans corrections.json et reste valable aux prochains imports.")
    overrides = {r[0] for r in con.execute("SELECT excel_name FROM name_overrides")}
    rows = [dict(r) for r in con.execute("""SELECT col.excel_name, GROUP_CONCAT(DISTINCT col.location) AS location,
            SUM(col.quantity) AS quantity, MIN(col.match_score) AS match_score, c.name_fr, c.name_en
        FROM collection col LEFT JOIN cards c ON c.id = col.card_id
        WHERE col.card_id IS NULL OR col.match_score < 100
        GROUP BY col.excel_name, col.card_id ORDER BY col.card_id IS NOT NULL, match_score""")]
    rows = [r for r in rows if r["excel_name"] not in overrides]
    st.subheader("À vérifier")
    if not rows:
        st.success("Toutes les cartes sont reconnues.")
    for r in rows:
        current = r["name_fr"] or r["name_en"]
        status = f"reconnue comme *{current}* (score {r['match_score']})" if current else ":red[non reconnue]"
        correction_form(r["excel_name"], f"{r['location']} ×{r['quantity']} → {status}")

    st.subheader("Corrections enregistrées")
    saved = con.execute("""SELECT o.excel_name, c.name_fr, c.name_en FROM name_overrides o
                           JOIN cards c ON c.id = o.card_id ORDER BY o.excel_name""").fetchall()
    labels = {r["excel_name"]: f"{r['excel_name']}  →  {r['name_fr'] or r['name_en']}" for r in saved}
    picked = st.selectbox("Correction à revoir", [None, *labels], format_func=lambda k: "—" if k is None else labels[k])
    if picked:
        correction_form(picked, None)


def correction_form(excel_name: str, status: str | None):
    """Cartes candidates les plus proches du nom de l'Excel ; la carte actuelle est présélectionnée,
    son image s'affiche pour vérifier avant de valider."""
    df = catalog()
    current = con.execute("SELECT card_id FROM collection WHERE excel_name = ? AND card_id IS NOT NULL",
                          (excel_name,)).fetchone()
    current_id = current[0] if current else None
    with st.container(border=status is not None):
        if status:
            st.markdown(f"**{excel_name}** — {status}")
        form, preview = st.columns([3, 1])
        text = form.text_input("Chercher une autre carte (laisser vide = cartes les plus proches)",
                               key=f"fix_q_{excel_name}")
        if text:
            res = search(df, text).head(100)
        else:
            q = normalize(excel_name)
            names = dict(zip(df.index, df["name_fr"].fillna(df["name_en"]).map(normalize)))
            found = process.extract(q, names, scorer=fuzz.WRatio, limit=30)
            # même pondération que l'import : WRatio seul sur-note les sous-chaînes
            found.sort(key=lambda m: -(m[1] + fuzz.ratio(q, m[0])))
            res = df.loc[[i for _, _, i in found[:10]]]
        if current_id is not None and current_id not in set(res["id"]):
            res = pd.concat([df[df["id"] == current_id], res])
        if res.empty:
            form.caption("Aucun résultat.")
            return
        ids = [int(i) for i in res["id"]]
        labels = {int(x.id): f"{x.nom} ({x['catégorie']})" for _, x in res.iterrows()}
        index = ids.index(current_id) if current_id in ids else 0
        choice = form.selectbox("Carte", ids, index=index, format_func=labels.get, key=f"fix_s_{excel_name}")
        card_img(preview, df[df["id"] == choice].iloc[0], max_width="140px")
        if form.button("Valider", key=f"fix_b_{excel_name}", disabled=choice == current_id and status is None):
            save_correction(excel_name, choice)
            refresh()


def save_correction(excel_name: str, card_id: int):
    con.execute("INSERT OR REPLACE INTO name_overrides VALUES (?, ?)", (excel_name, card_id))
    con.execute("UPDATE collection SET card_id = ?, match_score = 100 WHERE excel_name = ?", (card_id, excel_name))
    importer.fill_missing_french_names(con)
    con.commit()
    data = json.loads(CORRECTIONS_PATH.read_text(encoding="utf8")) if CORRECTIONS_PATH.exists() else {}
    data[excel_name] = card_id
    CORRECTIONS_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=4), encoding="utf8")


def page_import():
    page_header(
        "Import & mise à jour",
        "Relis ton Excel, mets à jour le catalogue et la banlist, et découvre comment tout est calculé.",
        "Données",
    )
    st.markdown(f"Source : `{importer.EXCEL_PATH.name}`. Chaque feuille est un **emplacement** "
                "(Arc-v, classeur, boîte A…). Les feuilles `deck_…` sont aussi importées comme decks.")
    st.warning("Le réimport remplace toute la collection et les decks `deck_…` par le contenu de l'Excel. "
               "Les autres decks sont conservés.")
    c1, c2, c3 = st.columns(3)
    if c1.button("Réimporter l'Excel", type="primary"):
        st.session_state["import_report"] = importer.import_excel(con)
    if c2.button("Mettre à jour le catalogue (banlist, nouvelles cartes)"):
        with st.spinner("Téléchargement du catalogue YGOPRODeck…"):
            importer.download_catalog(force=True)
            n = importer.load_catalog(con)
            importer.import_excel(con)
        st.success(f"{n} cartes dans le catalogue.")
    if c3.button("Recréer la proposition de build"):
        builds.create(con)
        st.success(f"Deck « {builds.NAME} » recréé.")
    report = st.session_state.get("import_report")
    if report:
        ok = sum(1 for r in report if r["card_id"])
        st.success(f"{ok} / {len(report)} lignes reconnues.")
        missing = [{"Feuille": r["sheet"], "Nom dans l'Excel": r["excel"], "Score": r["score"]}
                   for r in report if not r["card_id"]]
        if missing:
            st.dataframe(pd.DataFrame(missing), hide_index=True)

    st.divider()
    tab_excel, tab_ban, tab_build = st.tabs(["Format de l'Excel", "La banlist", "Comment est calculé un build"])
    with tab_excel:
        explain_excel()
    with tab_ban:
        explain_banlist()
    with tab_build:
        explain_build()


def explain_excel():
    st.markdown("""
#### Une feuille = un emplacement
Chaque feuille du classeur représente un endroit où sont rangées tes cartes (`Arc-v`, `classeur`, `boite A`…).
Ton stock total d'une carte est la **somme de toutes les feuilles**.
Une feuille dont le nom commence par **`deck_`** (ex. `deck_mekk_beta`) est en plus importée comme **deck** :
ses cartes comptent dans ton stock *et* forment un deck dans le Constructeur.

#### Les colonnes
La première ligne doit contenir les en-têtes ci-dessous. Seules quelques colonnes sont lues : toutes les autres
informations (type, effet, banlist…) viennent du catalogue officiel, inutile de les remplir.
""")
    st.dataframe(pd.DataFrame([
        {"Colonne": "carte", "Utilisée": "Oui", "Rôle": "Nom de la carte, en français ou en anglais. Les fautes et "
                                                       "les accents manquants sont tolérés."},
        {"Colonne": "nombre", "Utilisée": "Oui", "Rôle": "Nombre d'exemplaires (1 si vide)."},
        {"Colonne": "magie / piège / monstre", "Utilisée": "Aide", "Rôle": "Un « x » dans la bonne colonne aide à "
                                                                         "distinguer deux cartes au nom proche."},
        {"Colonne": "fusion / synchro / xyz / link", "Utilisée": "Aide", "Rôle": "Un « x » indique un monstre "
                                                                               "d'Extra Deck (même usage)."},
        {"Colonne": "étoile", "Utilisée": "Aide", "Rôle": "Niveau, Rang ou valeur Lien : départage les homonymes."},
        {"Colonne": "rareté", "Utilisée": "Oui", "Rôle": "Rareté de ton exemplaire (Commune, Rare, Super Rare, "
                                                         "Ultra Rare, Secret Rare, Starlight…), texte libre. Pour une "
                                                         "même carte en deux raretés, fais deux lignes."},
        {"Colonne": "pendule, ban, limitation, effet, contexte, type", "Utilisée": "Non",
         "Rôle": "Ignorées : remplies automatiquement depuis le catalogue."},
    ]), hide_index=True, width="stretch")
    st.markdown("""
#### Exemple
| carte | magie | piège | monstre | synchro | étoile | nombre | rareté |
|---|---|---|---|---|---|---|---|
| Ciel Bleu Mekk-Chevalier | | | x | | 5 | 3 | Commune |
| Infini Éphémère | | x | | | | 2 | Secret Rare |
| Infini Éphémère | | x | | | | 1 | Starlight |
| Artilleur Hyper Psychique | | | x | x | 9 | 2 | Super Rare |

#### Reconnaissance des noms
Chaque nom est comparé aux 14 000+ cartes du catalogue (noms français et anglais). Au-dessus de 95/100 de
ressemblance, la carte est reconnue automatiquement ; en dessous, elle part dans la page **Corrections**, où ton
choix est enregistré dans `corrections.json` pour tous les imports suivants. Une même carte présente sur plusieurs
lignes d'une feuille voit ses quantités additionnées.
""")
    sheets = con.execute("""SELECT location, COUNT(*) AS lignes, SUM(quantity) AS cartes,
                            SUM(card_id IS NULL) AS non_reconnues FROM collection GROUP BY location""").fetchall()
    if sheets:
        st.markdown("#### Ton fichier actuel")
        st.dataframe(pd.DataFrame([{"Feuille": r["location"], "Lignes": r["lignes"], "Exemplaires": r["cartes"],
                                    "Non reconnues": r["non_reconnues"]} for r in sheets]), hide_index=True)


def explain_banlist():
    catalog_file = importer.DATA_DIR / "cards_en.json"
    from datetime import datetime
    updated = datetime.fromtimestamp(catalog_file.stat().st_mtime).strftime("%d/%m/%Y") if catalog_file.exists() else "?"
    st.markdown(f"""
#### D'où vient la banlist ?
La banlist est celle du **TCG** (format des tournois officiels en Europe et en Amérique). Elle est fournie
avec le catalogue YGOPRODeck, mis à jour le **{updated}**. Konami la change plusieurs fois par an : le bouton
« Mettre à jour le catalogue » ci-dessus récupère la dernière version.

#### Les statuts
| Statut | Exemplaires autorisés dans Main + Extra + Side |
|---|---|
| Illimitée | 3 |
| Semi-Limitée | 2 |
| Limitée | 1 |
| Interdite | 0 : la carte rend le deck illégal |

Le statut est affiché sur chaque fiche de carte. Le Constructeur et l'Analyse signalent un deck qui dépasse ces limites.
""")
    rows = con.execute("""SELECT c.name_fr, c.name_en, c.ban_tcg, o.owned FROM owned o JOIN cards c ON c.id = o.card_id
                          WHERE c.ban_tcg IS NOT NULL ORDER BY c.ban_tcg, c.name_fr""").fetchall()
    if rows:
        st.markdown("#### Tes cartes concernées")
        st.dataframe(pd.DataFrame([{"Carte": r["name_fr"] or r["name_en"], "Statut": tr(BANLIST, r["ban_tcg"]),
                                    "Autorisées": A.BAN_LIMIT.get(r["ban_tcg"], 3), "En stock": r["owned"]}
                                   for r in rows]), hide_index=True, width="stretch")


def explain_build():
    st.markdown("""
#### Un algorithme d'optimisation
Les builds se calculent dans la page **Générateur de build**. Un algorithme y cherche, parmi les combinaisons
possibles de ton stock, le Main Deck qui maximise tes objectifs.

**1. Les contraintes, non négociables**
- Uniquement des cartes de **ton stock** : chaque carte est plafonnée à min(stock, banlist, 3) exemplaires.
- La **banlist TCG** (voir l'onglet précédent).
- La taille du Main Deck que tu choisis (40 à 45), plus les cartes que tu **forces** ou **exclues**.

**2. Le score d'un deck**
Chaque deck candidat est jugé par simulation de mains de départ, avec le même modèle que les pages Duel et Méta :
- part de **mains fortes en premier** (un starter, de quoi l'invoquer et une protection pour le tour adverse) ;
- part de **mains fortes en second** (un starter et de quoi couper le combo adverse ou nettoyer son terrain) ;
- **indice face au méta** : régularité face aux interruptions des decks qui gagnent actuellement en tournoi ;
- une pénalité pour les cartes **hors moteur Mekk**.

Tu règles le poids de chaque objectif avec des curseurs.

**3. La recherche**
- **Départ glouton** : on remplit le deck avec les cartes les plus utiles (starters, interruptions, protections…).
- **Recuit simulé** : des milliers de fois, on retire une carte et on en ajoute une autre. Une amélioration est
  toujours gardée ; une dégradation l'est parfois au début, pour ne pas rester bloqué sur une solution moyenne.
- Tous les essais sont jugés sur **les mêmes mains tirées** : deux variantes se comparent équitablement.

**4. La vérification**
Le deck trouvé est réévalué sur **20 000 nouvelles mains** et comparé à tes autres builds. Un gain qui ne serait
qu'un coup de chance des tirages de la recherche disparaîtrait à cette étape.

**5. L'Extra Deck**
Il est rempli par règles : Liens Mekk-Chevalier d'abord, puis les Extra génériques invocables avec tes monstres
(les Synchro seulement si Girsu, ton Syntoniseur, est dans le deck).

**Limites du modèle**
L'algorithme optimise la **régularité des mains**, pas l'issue d'un duel : il ne joue pas les combos et ne connaît
chaque carte que par son rôle. Garde un œil critique sur le résultat ; les cartes forcées et exclues sont là pour
ça. La proposition `mekk_opti`, construite à la main, reste disponible pour comparer.
""")

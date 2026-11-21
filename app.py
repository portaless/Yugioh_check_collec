"""IHM Yu-Gi-Oh! : collection, constructeur de deck, analyse.   Lancer :  streamlit run app.py"""
import json
from html import escape
from pathlib import Path

import pandas as pd
import streamlit as st
import streamlit.components.v1 as components
from rapidfuzz import fuzz, process

from ygo import analysis as A
from ygo import builds, importer
from ygo import simulation as S
from ygo.db import connect, is_extra
from ygo.fr import ARCHETYPES, ATTRIBUTES, BANLIST, RACES, ZONES, ZONES_REV, tr
from ygo.images import image_src
from ygo.importer import CORRECTIONS_PATH, normalize

st.set_page_config(page_title="Yu-Gi-Oh! – Ma collection", page_icon="🃏", layout="wide")

# Galerie : un bouton transparent recouvre chaque vignette, le clic sur l'image ouvre la fiche.
# La fiche (visionneuse) est élargie à presque tout l'écran.
st.html("""<style>
div[class*="st-key-tile_"] { position: relative; }
div[class*="st-key-tile_"] .stElementContainer:has(.stButton) { position: absolute; inset: 0; z-index: 2; margin: 0; }
div[class*="st-key-tile_"] .stButton, div[class*="st-key-tile_"] .stButton button {
    width: 100%; height: 100%; opacity: 0; cursor: zoom-in; }
.card-img { width: 100%; display: block; border-radius: 6px; }
div[class*="st-key-tile_"] img { transition: transform .15s ease, box-shadow .15s ease; border-radius: 4px; }
div[class*="st-key-tile_"]:hover img { transform: translateY(-3px); box-shadow: 0 6px 16px rgba(0,0,0,.35); }
div[role="dialog"] { width: min(1200px, 94vw) !important; max-width: none !important; }
</style>""")


@st.cache_resource
def get_con():
    return connect()


con = get_con()

CATEGORY_LABELS = {"spell": "Magie", "trap": "Piège"}
EXTRA_LABELS = {"fusion": "Fusion", "synchro": "Synchro", "xyz": "Xyz", "link": "Lien"}


def category(frame: str) -> str:
    if frame in CATEGORY_LABELS:
        return CATEGORY_LABELS[frame]
    if is_extra(frame):
        return "Extra Deck (" + EXTRA_LABELS[frame.split("_")[0]] + ")"
    return "Monstre"


@st.cache_data
def catalog() -> pd.DataFrame:
    df = pd.read_sql("""SELECT c.*, COALESCE(o.owned, 0) AS owned FROM cards c
                        LEFT JOIN owned o ON o.card_id = c.id""", con)
    df["nom"] = df["name_fr"].fillna(df["name_en"])
    df["catégorie"] = df["frame_type"].map(category)
    df["type_fr"] = df["race"].map(lambda v: tr(RACES, v))
    df["attribut"] = df["attribute"].map(lambda v: tr(ATTRIBUTES, v))
    df["banlist"] = df["ban_tcg"].map(lambda v: tr(BANLIST, v))
    df["archétype"] = df["archetype"].map(lambda v: tr(ARCHETYPES, v))
    # la recherche accepte aussi le nom anglais, pratique pour les cartes vues en tournoi
    df["search"] = (df["name_fr"].fillna("") + " " + df["name_en"]).map(normalize)
    return df.sort_values("nom").reset_index(drop=True)


def refresh():
    catalog.clear()
    st.rerun()


def search(df: pd.DataFrame, text: str) -> pd.DataFrame:
    q = normalize(text or "")
    if not q:
        return df
    mask = pd.Series(True, index=df.index)
    for word in q.split():
        mask &= df["search"].str.contains(word, regex=False)
    return df[mask]


# --------------------------------------------------------------------------- fiche et galerie

def card_img(container, c, max_width: str = "100%"):
    src = image_src(int(c["id"]), c["image_url"])
    if src:
        container.html(f"<img class='card-img' src='{src}' loading='lazy' alt='{escape(c['nom'])}' "
                       f"style='max-width:{max_width}'>")


def card_facts(c) -> dict:
    facts = {"Catégorie": c["catégorie"], "Type": c["type_fr"], "Attribut": c["attribut"]}
    if pd.notna(c["level"]):
        facts["Rang" if "xyz" in c["frame_type"] else "Niveau"] = "★" * int(c["level"]) + f"  ({int(c['level'])})"
    if pd.notna(c["linkval"]):
        facts["Lien"] = int(c["linkval"])
    if pd.notna(c["scale"]):
        facts["Échelle Pendule"] = int(c["scale"])
    if pd.notna(c["atk"]):
        facts["ATK / DEF"] = f"{int(c['atk'])} / {'-' if pd.isna(c['def']) else int(c['def'])}"
    facts["Archétype"] = c["archétype"]
    facts["Banlist TCG"] = c["banlist"] or "Illimitée"
    facts["En stock"] = int(c["owned"])
    if pd.notna(c["price_cm"]):
        facts["Cardmarket"] = f"≈ {c['price_cm']:.2f} €"
    return {k: str(v) for k, v in facts.items() if v not in ("", None)}


def effect_text(c) -> str:
    return c["desc_en"] if pd.isna(c["desc_fr"]) else c["desc_fr"]


VIEWER_HTML = (Path(__file__).parent / "ygo" / "viewer.html").read_text(encoding="utf8")
VIEWER_WINDOW = 300  # cartes envoyées au navigateur autour de celle ouverte


@st.dialog("Fiche de la carte", width="large")
def card_dialog(ids: list[int], pos: int):
    """Visionneuse exécutée dans le navigateur : changer de carte ne repasse pas par le serveur."""
    start = max(0, min(pos - VIEWER_WINDOW // 2, len(ids) - VIEWER_WINDOW))
    window = ids[start:start + VIEWER_WINDOW]
    df = catalog().set_index("id").loc[window].reset_index()
    cards = [{"src": image_src(int(c["id"]), c["image_url"]), "name": c["nom"],
              "facts": list(card_facts(c).items()), "effect": effect_text(c), "english": bool(pd.isna(c["desc_fr"]))}
             for c in df.to_dict("records")]
    # "</" échappé pour qu'un texte de carte ne puisse pas fermer la balise <script>
    payload = json.dumps(cards, ensure_ascii=False).replace("</", "<\\/")
    components.html(VIEWER_HTML.replace("__CARDS__", payload).replace("__POS__", str(pos - start)), height=620)


def open_card(ids: list[int], pos: int):
    card_dialog(ids, pos)


def cards_gallery(items: list[tuple[int, str]], key: str, per_row: int = 6):
    """Galerie à partir de (code carte, badge), dans l'ordre donné."""
    df = catalog()
    view = df.set_index("id").loc[[i for i, _ in items]].reset_index()
    gallery(view.assign(badge=[b for _, b in items]), key, per_row)


def gallery(df: pd.DataFrame, key: str, per_row: int = 6):
    """Grille d'images ; un clic sur une image ouvre la fiche, navigable avec Précédente/Suivante.
    Colonne optionnelle 'badge' : texte affiché après le nom (×2, +1…)."""
    if df.empty:
        st.caption("Aucune carte.")
        return
    ids = [int(i) for i in df["id"]]
    records = df.to_dict("records")
    for i in range(0, len(records), per_row):
        cols = st.columns(per_row)
        for j, (col, c) in enumerate(zip(cols, records[i:i + per_row])):
            with col, st.container(key=f"tile_{key}_{c['id']}_{i + j}"):
                card_img(st, c)
                badge = f" {c['badge']}" if c.get("badge") else ""
                st.caption(f"**{c['nom']}**{badge}")
                if st.button(c["nom"], key=f"open_{key}_{c['id']}_{i + j}"):
                    open_card(ids, i + j)


# --------------------------------------------------------------------------- pages

def page_collection():
    st.title("Ma collection")
    df = catalog()
    locations = [r[0] for r in con.execute("SELECT DISTINCT location FROM collection ORDER BY 1")]

    f1, f2, f3, f4 = st.columns([3, 2, 2, 2])
    text = f1.text_input("Recherche", placeholder="ex. mekk, ciel bleu, infini…")
    cats = f2.multiselect("Catégorie", sorted(df["catégorie"].unique()), placeholder="Choisir…")
    locs = f3.multiselect("Emplacement", locations, placeholder="Choisir…")
    owned_only = f4.toggle("Seulement mes cartes", value=True)

    view = search(df, text)
    if owned_only:
        view = view[view["owned"] > 0]
    if cats:
        view = view[view["catégorie"].isin(cats)]
    if locs:
        ids = [r[0] for r in con.execute(
            f"SELECT card_id FROM collection WHERE location IN ({','.join('?' * len(locs))})", locs)]
        view = view[view["id"].isin(ids)]
    g1, g2 = st.columns([3, 1])
    arch = g1.multiselect("Archétype", sorted(a for a in view["archétype"].unique() if a), placeholder="Choisir…")
    if arch:
        view = view[view["archétype"].isin(arch)]
    per_row = g2.select_slider("Cartes par ligne", [4, 5, 6, 8], value=6)

    m1, m2, m3 = st.columns(3)
    m1.metric("Cartes différentes", len(view))
    m2.metric("Exemplaires", int(view["owned"].sum()))
    m3.metric("Valeur Cardmarket ≈", f"{(view['owned'] * view['price_cm'].fillna(0)).sum():.2f} €")

    tab_gallery, tab_list = st.tabs(["Galerie", "Tableau"])
    with tab_gallery:
        gallery(view.assign(badge="×" + view["owned"].astype(str)), "coll", per_row=per_row)
    with tab_list:
        cols = {"nom": "Nom", "catégorie": "Catégorie", "type_fr": "Type", "attribut": "Attribut", "level": "Niv.",
                "atk": "ATK", "def": "DEF", "archétype": "Archétype", "banlist": "Banlist", "owned": "Stock"}
        event = st.dataframe(view[list(cols)].rename(columns=cols), hide_index=True, width="stretch",
                             height=460, on_select="rerun", selection_mode="single-row")
        st.caption("Clique sur une ligne pour ouvrir la fiche.")
        if event.selection.rows:
            open_card([int(i) for i in view["id"]], event.selection.rows[0])


def deck_selector(key: str, label: str = "Deck") -> int | None:
    decks = {r["name"]: r["id"] for r in con.execute("SELECT id, name FROM decks ORDER BY name")}
    if not decks:
        st.info("Aucun deck. Crée-en un dans le constructeur de deck.")
        return None
    name = st.selectbox(label, list(decks), key=key)
    return decks[name]


def show_issues(cards):
    issues = A.check(cards)
    if not issues:
        st.success("Deck légal (banlist TCG) et constructible avec ton stock.")
    for level, msg in issues:
        (st.error if level == "error" else st.warning)(msg)


def deck_counts(cards):
    return {z: sum(c["quantity"] for c in cards if c["zone"] == z) for z in ZONES}


def page_builder():
    st.title("Constructeur de deck")
    df = catalog()

    with st.sidebar.expander("Créer / dupliquer un deck"):
        new = st.text_input("Nom du nouveau deck")
        base = st.selectbox("Partir de", ["(deck vide)"] + [r[0] for r in con.execute("SELECT name FROM decks ORDER BY 1")])
        if st.button("Créer", disabled=not new.strip()):
            con.execute("INSERT INTO decks (name) VALUES (?)", (new.strip(),))
            new_id = con.execute("SELECT id FROM decks WHERE name = ?", (new.strip(),)).fetchone()[0]
            if base != "(deck vide)":
                con.execute("""INSERT INTO deck_cards SELECT ?, card_id, zone, quantity FROM deck_cards
                               WHERE deck_id = (SELECT id FROM decks WHERE name = ?)""", (new_id, base))
                con.execute("UPDATE decks SET notes = (SELECT notes FROM decks WHERE name = ?) WHERE id = ?", (base, new_id))
            con.commit()
            st.rerun()

    deck_id = deck_selector("builder_deck")
    if deck_id is None:
        return
    deck = con.execute("SELECT * FROM decks WHERE id = ?", (deck_id,)).fetchone()
    if deck["name"].startswith(importer.DECK_SHEET_PREFIX):
        st.caption("Ce deck vient de l'Excel : un nouvel import l'écrasera. Pour le modifier durablement, "
                   "duplique-le (barre latérale).")
    cards = A.deck_cards(con, deck_id)

    add_col, deck_col = st.columns([1, 2])
    with add_col:
        st.subheader("Ajouter une carte")
        text = st.text_input("Rechercher", key="add_search")
        owned_only = st.toggle("Seulement mes cartes", value=True, key="add_owned")
        res = search(df, text)
        if owned_only:
            res = res[res["owned"] > 0]
        res = res.head(200)
        if len(res):
            labels = {f"{r.nom}  ({r['catégorie']}, stock {int(r.owned)})": r.id for _, r in res.iterrows()}
            choice = st.selectbox("Carte", list(labels))
            card = df[df["id"] == labels[choice]].iloc[0]
            default_zone = "extra" if is_extra(card["frame_type"]) else "main"
            zone = st.radio("Zone", list(ZONES), format_func=ZONES.get, index=list(ZONES).index(default_zone), horizontal=True)
            qty = st.number_input("Quantité", 1, 3, 1)
            if st.button("Ajouter au deck", type="primary"):
                con.execute("""INSERT INTO deck_cards VALUES (?, ?, ?, ?)
                               ON CONFLICT(deck_id, card_id, zone) DO UPDATE SET quantity = MIN(3, quantity + excluded.quantity)""",
                            (deck_id, int(card["id"]), zone, int(qty)))
                con.commit()
                st.rerun()
            card_img(st, card, max_width="260px")
            st.write(effect_text(card))
        else:
            st.caption("Aucun résultat.")

    with deck_col:
        n = deck_counts(cards)
        st.subheader(f"{deck['name']} — Main {n['main']} · Extra {n['extra']} · Side {n['side']}")
        show_issues(cards)
        if deck["notes"]:
            with st.expander("Notes / justification du build"):
                st.markdown(deck["notes"])

        table = pd.DataFrame([{
            "id": c["id"], "Zone": ZONES[c["zone"]], "Carte": c["name_fr"] or c["name_en"], "Qté": c["quantity"],
            "Stock": c["owned"], "Rôle": A.role(c), "Banlist": tr(BANLIST, c["ban_tcg"]),
        } for c in cards])
        if table.empty:
            st.info("Deck vide : ajoute des cartes à gauche.")
            return
        edited = st.data_editor(
            table, hide_index=True, width="stretch", height=min(38 * len(table) + 40, 600),
            disabled=["id", "Carte", "Stock", "Rôle", "Banlist"],
            column_config={"id": None,
                           "Qté": st.column_config.NumberColumn(min_value=0, max_value=3, step=1, help="0 = retirer"),
                           "Zone": st.column_config.SelectboxColumn(options=list(ZONES.values()))},
            key=f"editor_{deck_id}")
        b1, b2, b3 = st.columns(3)
        if b1.button("Enregistrer les modifications", type="primary"):
            con.execute("DELETE FROM deck_cards WHERE deck_id = ?", (deck_id,))
            merged = edited[edited["Qté"] > 0].groupby(["id", "Zone"], as_index=False)["Qté"].sum()
            con.executemany("INSERT INTO deck_cards VALUES (?, ?, ?, ?)",
                            [(deck_id, int(r.id), ZONES_REV[r.Zone], min(3, int(r["Qté"]))) for _, r in merged.iterrows()])
            con.commit()
            st.rerun()
        b2.download_button("Exporter en .ydk", A.export_ydk(cards, deck["name"]),
                           file_name=f"{deck['name']}.ydk", help="Format lu par EDOPro, YGO Omega, etc.")
        if b3.button("Supprimer ce deck"):
            st.session_state["confirm_delete"] = deck_id
        if st.session_state.get("confirm_delete") == deck_id:
            st.warning(f"Supprimer définitivement « {deck['name']} » ?")
            if st.button("Oui, supprimer"):
                con.execute("DELETE FROM decks WHERE id = ?", (deck_id,))
                con.commit()
                st.session_state.pop("confirm_delete")
                st.rerun()

    st.divider()
    for zone, label in ZONES.items():
        items = [(c["id"], f"×{c['quantity']}") for c in cards if c["zone"] == zone]
        if items:
            st.markdown(f"**{label}**")
            cards_gallery(items, f"deck_{zone}", per_row=8)


# (fond, texte) : teintes douces, lisibles en thème clair comme sombre
TONES = {"good": ("rgba(46,160,120,.18)", "#2e9e78"), "warn": ("rgba(230,160,40,.20)", "#c98a1c"),
         "bad": ("rgba(225,95,85,.18)", "#d0574d")}


def status_tile(col, label: str, value: str, tone: str, detail: str):
    bg, fg = TONES[tone]
    col.html(f"""<div style="background:{bg}; border-radius:12px; padding:.7rem 1rem">
        <div style="font-size:.85rem; opacity:.75">{label}</div>
        <div style="font-size:1.6rem; font-weight:700; color:{fg}; line-height:1.3">{value}</div>
        <div style="font-size:.85rem; opacity:.8">{detail}</div></div>""")


def pct(p: float) -> str:
    return f"{round(100 * p)} mains sur 100"


def page_analysis():
    st.title("Analyse de deck")
    deck_id = deck_selector("analysis_deck", "Deck à analyser")
    if deck_id is None:
        return
    cards = A.deck_cards(con, deck_id)
    main = [c for c in cards if c["zone"] == "main"]
    n = deck_counts(cards)
    issues = A.check(cards)
    errors = [m for lvl, m in issues if lvl == "error"]
    stock = [m for lvl, m in issues if "possèdes" in m]

    # 1. Bilan
    st.header("1. Bilan")
    b1, b2, b3, b4 = st.columns(4)
    b1.metric("Main Deck", f"{n['main']} cartes", help="Entre 40 et 60 ; idéalement 40.")
    b2.metric("Extra Deck", f"{n['extra']} / 15")
    status_tile(b3, "Légal en tournoi", *(("Oui", "good", "Respecte la banlist TCG") if not errors else
                ("Non", "bad", f"{len(errors)} point(s) à corriger")))
    status_tile(b4, "Faisable avec ton stock", *(("Oui", "good", "Tu as toutes les cartes") if not stock else
                ("Pas encore", "warn", f"{len(stock)} carte(s) manquante(s)")))
    kinds = {"Monstres": 0, "Magies": 0, "Pièges": 0}
    for c in main:
        kinds["Magies" if c["frame_type"] == "spell" else "Pièges" if c["frame_type"] == "trap" else "Monstres"] += c["quantity"]
    st.write(" · ".join(f"**{v}** {k.lower()}" for k, v in kinds.items()))

    if issues:
        st.subheader("À corriger")
        for level, msg in issues:
            (st.error if level == "error" else st.warning)(msg)

    if not main:
        st.info("Main Deck vide.")
        return

    # 2. Composition
    st.header("2. Composition du Main Deck")
    by_role = {}
    for c in main:
        by_role[A.role(c)] = by_role.get(A.role(c), 0) + c["quantity"]
    comp = pd.DataFrame([{"Rôle": r, "Cartes": q, "Part du deck": f"{100 * q / n['main']:.0f} %",
                          "À quoi ça sert": A.ROLE_HELP.get(r, "")}
                         for r, q in sorted(by_role.items(), key=lambda x: -x[1])])
    st.dataframe(comp, hide_index=True, width="stretch")

    # 3. Régularité
    st.header("3. Régularité des mains de départ")
    st.caption("Sur 100 parties, combien de fois ta main de départ contient-elle ces cartes ? "
               "Tu as 5 cartes si tu commences et 6 si tu joues en second.")

    def count(r):
        return by_role.get(r, 0)

    # (objectif, cartes, minimum, seuil "bon", seuil "moyen") : repères indicatifs, en jouant en premier
    checks = [
        ("Au moins 1 monstre Mekk-Chevalier", count(A.MEKK), 1, .85, .70),
        ("Au moins 2 monstres Mekk-Chevalier", count(A.MEKK), 2, .55, .40),
        ("Au moins 1 interruption depuis la main", count(A.INTERRUPT), 1, .75, .55),
        ("Au moins 1 carte de destruction du terrain", count(A.BREAKER), 1, .50, .35),
    ]
    reg = []
    for label, hits, k, good, ok in checks:
        p5, p6 = A.p_at_least(hits, n["main"], 5, k), A.p_at_least(hits, n["main"], 6, k)
        verdict = "Bon" if p5 >= good else "Moyen" if p5 >= ok else "Faible"
        reg.append({"Objectif": label, "Cartes concernées": hits, "En premier (5 cartes)": pct(p5),
                    "En second (6 cartes)": pct(p6), "Verdict": verdict})
    tones = {"Bon": TONES["good"], "Moyen": TONES["warn"], "Faible": TONES["bad"]}
    styled = pd.DataFrame(reg).style.map(
        lambda v: f"background-color: {tones[v][0]}; color: {tones[v][1]}; font-weight: 600", subset=["Verdict"])
    st.dataframe(styled, hide_index=True, width="stretch")
    st.caption("Verdicts indicatifs : on ne vise pas le même taux pour « 1 Mekk-Chevalier » "
               "(indispensable) que pour « 1 carte de destruction » (bonus).")

    with st.expander("Calcul personnalisé"):
        names = sorted({c["name_fr"] or c["name_en"] for c in main})
        chosen = st.multiselect("Cartes que tu veux voir en main", names, placeholder="Choisir…")
        k = st.number_input("Combien au minimum", 1, 5, 1)
        hits = sum(c["quantity"] for c in main if (c["name_fr"] or c["name_en"]) in chosen)
        if chosen:
            st.write(f"Avec {hits} carte(s) concernée(s) sur {n['main']} : "
                     f"**{pct(A.p_at_least(hits, n['main'], 5, k))}** en premier, "
                     f"**{pct(A.p_at_least(hits, n['main'], 6, k))}** en second.")

    st.info("Pour opposer ce deck à un autre (KPI, mains en premier et en second, leviers), "
            "va dans la page **Duel de decks**.")

    # 4. Suggestions
    st.header("4. Cartes de ton stock à envisager")
    sug = A.suggestions(con, deck_id)
    if not sug:
        st.caption("Rien à signaler : tes cartes utiles sont déjà dans le deck.")
    for why in dict.fromkeys(s["why"] for s in sug):
        st.markdown(f"**{why}**")
        st.markdown("\n".join(f"- {s['name_fr'] or s['name_en']} (stock : {s['owned']})"
                              + (f" — {tr(BANLIST, s['ban_tcg'])}" if s["ban_tcg"] else "")
                              for s in sug if s["why"] == why))

    notes = con.execute("SELECT notes FROM decks WHERE id = ?", (deck_id,)).fetchone()["notes"]
    if notes:
        st.header("5. Notes du build")
        st.markdown(notes)


# --------------------------------------------------------------------------- duel de decks

# (libellé, attribut Kpis, plus haut = mieux, explication)
DUEL_KPIS = [
    ("Main jouable en premier", "playable_first", True,
     "Tu peux lancer le moteur Mekk avec tes 5 cartes, sans aide du terrain adverse."),
    ("Main forte en premier", "strong_first", True,
     "Jouable, et tu gardes une protection (Piège ou interruption) pour le tour adverse."),
    ("Main jouable en second", "playable_second", True,
     "Au moins un starter dans tes 6 cartes : le terrain adverse fournit les colonnes."),
    ("Main forte en second", "strong_second", True,
     "Jouable, et tu peux couper le combo adverse ou nettoyer son terrain."),
    ("Main bloquée en premier", "brick_first", False,
     "Aucun starter en main : le tour est perdu."),
    ("Cartes hors moteur par main", "offplan_per_hand", False,
     "En moyenne, cartes qui ne servent pas le plan Mekk-Chevalier."),
]


def duel_kpi_table(name_a: str, name_b: str, ka, kb) -> tuple[int, int]:
    """Tableau HTML face à face ; renvoie le nombre de KPI gagnés par A et par B."""
    rows, wins = [], [0, 0]
    for label, attr, higher, help_text in DUEL_KPIS:
        va, vb = getattr(ka, attr), getattr(kb, attr)
        is_rate = attr != "offplan_per_hand"
        fmt = (lambda v: f"{100 * v:.0f} %") if is_rate else (lambda v: f"{v:.1f}")
        tie_margin = S.margin(va, vb) if is_rate else 0.05
        diff = va - vb
        if abs(diff) <= tie_margin:
            winner, tone = "Égalité (écart dans la marge)", None
        else:
            a_wins = (diff > 0) == higher
            wins[0 if a_wins else 1] += 1
            winner, tone = (name_a if a_wins else name_b), ("a" if a_wins else "b")
        gap = f"{abs(diff) * 100:.0f} pts" if is_rate else f"{abs(diff):.1f} carte"
        scale = 1 if is_rate else max(va, vb, 1)
        bar = lambda v, side: (f"<div class='bar'><span class='{side}' style='width:{min(100, 100 * v / scale):.0f}%'></span></div>")
        rows.append(f"""<tr><td><b>{label}</b><div class='help'>{help_text}</div></td>
            <td class='{'win' if tone == 'a' else ''}'>{fmt(va)}{bar(va, 'a')}</td>
            <td class='{'win' if tone == 'b' else ''}'>{fmt(vb)}{bar(vb, 'b')}</td>
            <td>{gap if tone else '—'}</td><td>{escape(winner)}</td></tr>""")
    st.html(f"""<style>
      .duel {{ width: 100%; border-collapse: collapse; font-size: 1rem; }}
      .duel th {{ text-align: left; font-weight: 600; opacity: .7; padding: .5rem; border-bottom: 1px solid rgba(128,128,128,.3); }}
      .duel td {{ padding: .6rem .5rem; border-bottom: 1px solid rgba(128,128,128,.15); vertical-align: top; }}
      .duel td.win {{ font-weight: 700; color: {TONES['good'][1]}; }}
      .duel .help {{ font-size: .85rem; opacity: .65; font-weight: 400; }}
      .duel .bar {{ height: 6px; border-radius: 3px; background: rgba(128,128,128,.15); margin-top: 4px; width: 140px; }}
      .duel .bar span {{ display: block; height: 100%; border-radius: 3px; }}
      .duel .bar .a {{ background: #6c8ebf; }} .duel .bar .b {{ background: #c9853a; }}
    </style>
    <table class='duel'><tr><th>KPI</th><th>{escape(name_a)}</th><th>{escape(name_b)}</th><th>Écart</th><th>Gagnant</th></tr>
    {''.join(rows)}</table>""")
    return wins[0], wins[1]


def composition_counts(deck: list[dict]) -> dict:
    flags = [S.card_flags(c) for c in deck]
    total = len(deck)
    out = {}
    for label, flag in (("Starters (Mekk + Mémoire)", "starter"), ("Interruptions depuis la main", "interrupt"),
                        ("Pièges (protection posée)", "trap"), ("Destruction du terrain", "breaker"),
                        ("Hors moteur Mekk", "offplan")):
        n = sum(f[flag] for f in flags)
        out[label] = (n, n / total if total else 0)
    return out


def verdict_pill(verdict: str) -> str:
    tone = {"Forte": "good", "Jouable": "warn", "Bloquée": "bad"}[verdict]
    bg, fg = TONES[tone]
    return (f"<span style='background:{bg}; color:{fg}; font-weight:700; padding:.2rem .7rem; "
            f"border-radius:999px'>Main {verdict.lower()}</span>")


def page_duel():
    st.title("Duel de decks")
    decks = {r["name"]: r["id"] for r in con.execute("SELECT id, name FROM decks ORDER BY name")}
    if len(decks) < 2:
        st.info("Il faut au moins deux decks pour les opposer.")
        return
    names = list(decks)
    c1, c2 = st.columns(2)
    name_a = c1.selectbox("Deck A", names, index=names.index("deck_mekk_beta") if "deck_mekk_beta" in names else 0)
    rest = [n for n in names if n != name_a]
    name_b = c2.selectbox("Deck B", rest, index=rest.index(builds.NAME) if builds.NAME in rest else 0)
    cards_a, cards_b = A.deck_cards(con, decks[name_a]), A.deck_cards(con, decks[name_b])
    deck_a, deck_b = S.main_deck(cards_a), S.main_deck(cards_b)
    if not deck_a or not deck_b:
        st.info("Un des deux Main Decks est vide.")
        return
    ka, kb = S.simulate(deck_a), S.simulate(deck_b)

    with st.expander("Comment sont calculés ces chiffres ?"):
        n_hands = f"{S.N_HANDS:,}".replace(",", " ")
        st.markdown(f"""
Chaque deck est mélangé **{n_hands} fois** (simulation de Monte-Carlo). On regarde les 5 premières cartes
(tu commences) et les 6 premières (tu joues en second). Un écart n'est déclaré gagnant que s'il dépasse la marge
d'erreur de la simulation (environ ±1 point) : il n'est donc pas dû au hasard.

**Hypothèses de jeu**
- *Starter* : un monstre Mekk-Chevalier, ou *Mémoire de l'Héritage du Monde* qui en invoque un depuis le deck.
- **En premier**, le terrain adverse est vide : un Mekk ne s'invoque que si tu poses toi-même une carte dans sa
  colonne. Main jouable = Mémoire, ou un Mekk + une Magie/Piège à poser, ou deux Mekk.
- **En second**, l'adversaire a rempli son terrain : un seul starter suffit.
- *Main forte* = jouable, plus une protection en premier (Piège ou interruption), ou une interruption /
  destruction en second.

Ce modèle ne joue pas les combos en entier : il mesure la régularité des mains, pas le résultat d'un duel.
""")

    # 1. Verdict
    st.header("1. Verdict")
    st.caption(f"« {name_a} » : {deck_counts(cards_a)['main']} cartes · « {name_b} » : {deck_counts(cards_b)['main']} cartes")
    wins_a, wins_b = duel_kpi_table(name_a, name_b, ka, kb)
    v1, v2, v3 = st.columns(3)
    status_tile(v1, f"KPI gagnés par {name_a}", str(wins_a), "good" if wins_a > wins_b else "bad" if wins_a < wins_b else "warn",
                f"sur {len(DUEL_KPIS)}")
    status_tile(v2, f"KPI gagnés par {name_b}", str(wins_b), "good" if wins_b > wins_a else "bad" if wins_b < wins_a else "warn",
                f"sur {len(DUEL_KPIS)}")
    legal = {n: not [m for lvl, m in A.check(c) if lvl == "error"] for n, c in ((name_a, cards_a), (name_b, cards_b))}
    status_tile(v3, "Légal en tournoi", "Les deux" if all(legal.values()) else "Pas les deux",
                "good" if all(legal.values()) else "bad",
                " · ".join(f"{n} : {'légal' if ok else 'illégal'}" for n, ok in legal.items()))

    # 2. Mains d'exemple
    st.header("2. Mains d'exemple")
    st.caption("Des mains tirées au hasard pour voir concrètement la différence. Relance plusieurs fois : "
               "les pourcentages du verdict résument des milliers de tirages comme ceux-ci.")
    if st.button("Tirer de nouvelles mains", type="primary"):
        st.session_state["duel_seed"] = st.session_state.get("duel_seed", 0) + 1
    seed = st.session_state.get("duel_seed", 0)
    hands = {name_a: S.sample_hands(deck_a, seed), name_b: S.sample_hands(deck_b, seed + 10_000)}
    for idx, (label, first) in enumerate((("Tu commences (5 cartes)", True), ("Tu joues en second (6 cartes)", False))):
        st.subheader(label)
        cols = st.columns(2, gap="large")
        for col, name, k in ((cols[0], name_a, ka), (cols[1], name_b, kb)):
            hand = hands[name][idx]
            verdict, reasons = S.describe_hand(hand, first)
            rate = k.strong_first if first else k.strong_second
            with col:
                st.markdown(f"**{name}**")
                st.html(verdict_pill(verdict) + f"<span style='opacity:.7; margin-left:.6rem'>"
                        f"main forte dans {100 * rate:.0f} % des tirages</span>")
                cards_gallery([(c["id"], "") for c in hand], f"hand_{idx}_{name}", per_row=6 if not first else 5)
                st.markdown("\n".join(f"- {r}" for r in reasons))

    # 3. Pourquoi
    st.header("3. Pourquoi : la composition")
    comp_a, comp_b = composition_counts(deck_a), composition_counts(deck_b)
    rows = []
    for label in comp_a:
        (na, pa), (nb, pb) = comp_a[label], comp_b[label]
        rows.append({"Catégorie": label, f"{name_a}": f"{na} cartes ({100 * pa:.0f} %)",
                     f"{name_b}": f"{nb} cartes ({100 * pb:.0f} %)"})
    st.dataframe(pd.DataFrame(rows), hide_index=True, width="stretch")
    sa, sb = comp_a["Starters (Mekk + Mémoire)"], comp_b["Starters (Mekk + Mémoire)"]
    st.markdown(
        f"Ce qui compte n'est pas le nombre de starters mais leur **densité**. « {name_a} » en a {sa[0]} sur "
        f"{len(deck_a)} cartes ({100 * sa[1]:.0f} %), « {name_b} » {sb[0]} sur {len(deck_b)} ({100 * sb[1]:.0f} %). "
        f"Résultat : une main bloquée en premier dans **{100 * ka.brick_first:.0f} %** des cas contre "
        f"**{100 * kb.brick_first:.0f} %**.")

    # 4. Leviers
    st.header("4. Quels changements rapportent le plus ?")
    st.caption("Chaque ligne simule le deck avec une seule modification. Les valeurs sont des gains en points "
               "de pourcentage par rapport au deck actuel.")
    cols = st.columns(2, gap="large")
    for col, name, deck in ((cols[0], name_a, deck_a), (cols[1], name_b, deck_b)):
        with col:
            st.markdown(f"**{name}**")
            lv = S.levers(deck)
            if not lv:
                st.caption("Plus aucune carte hors moteur : rien à remplacer.")
                continue
            df = pd.DataFrame([{"Modification": l["label"],
                                "Jouable en premier": f"{100 * l['delta_first']:+.1f}",
                                "Forte en premier": f"{100 * l['delta_strong_first']:+.1f}",
                                "Forte en second": f"{100 * l['delta_second']:+.1f}"} for l in lv])
            st.dataframe(df, hide_index=True, width="stretch")
            best_first = max(lv, key=lambda l: l["delta_strong_first"])
            best_second = max(lv, key=lambda l: l["delta_second"])
            st.markdown(f"Meilleur levier en premier : **{best_first['label']}** "
                        f"({100 * best_first['delta_strong_first']:+.1f} pts de mains fortes). "
                        f"En second : **{best_second['label']}** "
                        f"({100 * best_second['delta_second']:+.1f} pts).")

    # 5. Cartes
    st.header("5. Les cartes qui changent")
    mine = {(c["id"], c["zone"]): c["quantity"] for c in cards_a}
    theirs = {(c["id"], c["zone"]): c["quantity"] for c in cards_b}
    plus, minus = [], []
    for key in set(mine) | set(theirs):
        d = theirs.get(key, 0) - mine.get(key, 0)
        if d:
            (plus if d > 0 else minus).append((key[0], f"×{abs(d)} · {ZONES[key[1]]}"))
    card_names = {c["id"]: c["name_fr"] or c["name_en"] for c in cards_a + cards_b}
    plus.sort(key=lambda x: (x[1].split("· ")[1], card_names[x[0]]))
    minus.sort(key=lambda x: (x[1].split("· ")[1], card_names[x[0]]))
    st.subheader(f"En plus dans « {name_b} »")
    cards_gallery(plus, "cmp_plus", per_row=8)
    st.subheader(f"En plus dans « {name_a} »")
    cards_gallery(minus, "cmp_minus", per_row=8)
    with st.expander("Voir les deux decks complets côte à côte"):
        left, right = st.columns(2, gap="large")
        for col, name, cs, key in ((left, name_a, cards_a, "cmp_a"), (right, name_b, cards_b, "cmp_b")):
            with col:
                st.markdown(f"**{name}**")
                for zone, label in ZONES.items():
                    items = [(c["id"], f"×{c['quantity']}") for c in cs if c["zone"] == zone]
                    if items:
                        st.caption(f"{label} ({sum(c['quantity'] for c in cs if c['zone'] == zone)})")
                        cards_gallery(items, f"{key}_{zone}", per_row=5)


def page_corrections():
    st.title("Corrections de reconnaissance")
    st.caption("Lignes de l'Excel non reconnues ou reconnues de façon approximative. "
               "Une correction est enregistrée dans corrections.json et reste valable aux prochains imports.")
    df = catalog()
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
    st.caption("Tu peux revenir sur une correction ici.")
    saved = con.execute("""SELECT o.excel_name, c.name_fr, c.name_en FROM name_overrides o
                           JOIN cards c ON c.id = o.card_id ORDER BY o.excel_name""").fetchall()
    for r in saved:
        with st.expander(f"{r['excel_name']}  →  {r['name_fr'] or r['name_en']}"):
            correction_form(r["excel_name"], None)


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
    st.title("Import / mise à jour")
    st.markdown(f"Source : `{importer.EXCEL_PATH.name}`. Chaque feuille est un **emplacement** "
                "(Arc-v, classeur, boîte A…). Les feuilles `deck_…` sont aussi importées comme decks.")
    st.warning("Le réimport remplace toute la collection et les decks `deck_…` par le contenu de l'Excel. "
               "Les autres decks sont conservés.")
    c1, c2, c3 = st.columns(3)
    if c1.button("Réimporter l'Excel", type="primary"):
        st.session_state["import_report"] = importer.import_excel(con)
        catalog.clear()
    if c2.button("Mettre à jour le catalogue (banlist, nouvelles cartes)"):
        with st.spinner("Téléchargement du catalogue YGOPRODeck…"):
            importer.download_catalog(force=True)
            n = importer.load_catalog(con)
            importer.import_excel(con)
        catalog.clear()
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


PAGES = {"Collection": page_collection, "Constructeur de deck": page_builder, "Analyse": page_analysis,
         "Duel de decks": page_duel,
         "Corrections": page_corrections, "Import": page_import}
page = st.sidebar.radio("Navigation", list(PAGES))
unmatched = con.execute("SELECT COUNT(*) FROM collection WHERE card_id IS NULL").fetchone()[0]
if unmatched:
    st.sidebar.warning(f"{unmatched} carte(s) non reconnue(s) → page Corrections")
PAGES[page]()

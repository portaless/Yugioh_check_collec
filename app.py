"""IHM Yu-Gi-Oh! : collection, constructeur de deck, analyse.   Lancer :  streamlit run app.py"""
import json

import pandas as pd
import streamlit as st

from ygo import analysis as A
from ygo import builds, importer
from ygo.db import connect, is_extra
from ygo.fr import ARCHETYPES, ATTRIBUTES, BANLIST, RACES, ZONES, ZONES_REV, tr
from ygo.images import image_path
from ygo.importer import CORRECTIONS_PATH, normalize

st.set_page_config(page_title="Yu-Gi-Oh! – Ma collection", page_icon="🃏", layout="wide")


@st.cache_resource
def get_con():
    return connect()


con = get_con()

CATEGORY_LABELS = {"spell": "Magie", "trap": "Piège"}
EXTRA_LABELS = {"fusion": "Fusion", "synchro": "Synchro", "xyz": "Xyz", "link": "Lien"}
PAGE_SIZE = 24


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

def show_card(c, image_width: int = 340):
    left, right = st.columns([2, 3])
    path = image_path(int(c["id"]), c["image_url"])
    if path:
        left.image(str(path), width=image_width)
    right.subheader(c["nom"])
    facts = [c["catégorie"], c["type_fr"], c["attribut"]]
    if pd.notna(c["level"]):
        facts.append(f"{'Rang' if 'xyz' in c['frame_type'] else 'Niveau'} {int(c['level'])}")
    if pd.notna(c["linkval"]):
        facts.append(f"Lien {int(c['linkval'])}")
    if pd.notna(c["scale"]):
        facts.append(f"Échelle {int(c['scale'])}")
    if pd.notna(c["atk"]):
        facts.append(f"ATK {int(c['atk'])} / DEF {'-' if pd.isna(c['def']) else int(c['def'])}")
    right.write(" · ".join(str(f) for f in facts if f))
    tags = [f"En stock : **{int(c['owned'])}**"]
    if c["archétype"]:
        tags.append(f"Archétype : {c['archétype']}")
    if c["banlist"]:
        tags.append(f"Banlist TCG : :red[{c['banlist']}]")
    if pd.notna(c["price_cm"]):
        tags.append(f"Cardmarket ≈ {c['price_cm']:.2f} €")
    right.markdown(" · ".join(tags))
    if c["desc_fr"]:
        right.write(c["desc_fr"])
    else:
        right.caption("Pas encore de texte officiel en français pour cette carte, voici le texte anglais :")
        right.write(c["desc_en"])
    right.caption(f"Code : {c['id']}")


@st.dialog("Fiche de la carte", width="large")
def card_dialog():
    ids, pos = st.session_state["dlg_ids"], st.session_state["dlg_pos"]
    df = catalog()
    show_card(df[df["id"] == ids[pos]].iloc[0])
    prev_col, mid, next_col = st.columns([1, 2, 1])
    if prev_col.button("◀ Précédente", disabled=pos == 0, width="stretch"):
        st.session_state["dlg_pos"] -= 1
        st.rerun(scope="fragment")
    mid.markdown(f"<div style='text-align:center'>{pos + 1} / {len(ids)}</div>", unsafe_allow_html=True)
    if next_col.button("Suivante ▶", disabled=pos == len(ids) - 1, width="stretch"):
        st.session_state["dlg_pos"] += 1
        st.rerun(scope="fragment")


def open_card(ids: list[int], pos: int):
    st.session_state["dlg_ids"], st.session_state["dlg_pos"] = ids, pos
    card_dialog()


def gallery(df: pd.DataFrame, key: str, per_row: int = 6, qty_col: str | None = None, paginate: bool = True):
    """Grille d'images ; un clic sur « Voir » ouvre la fiche, navigable avec Précédente/Suivante."""
    if df.empty:
        st.caption("Aucune carte.")
        return
    ids = [int(i) for i in df["id"]]
    start = 0
    if paginate and len(df) > PAGE_SIZE:
        pages = (len(df) - 1) // PAGE_SIZE + 1
        page = st.number_input(f"Page (sur {pages})", 1, pages, 1, key=f"{key}_page")
        start = (page - 1) * PAGE_SIZE
        st.caption(f"Cartes {start + 1} à {min(start + PAGE_SIZE, len(df))} sur {len(df)}")
    rows = df.iloc[start:start + PAGE_SIZE] if paginate else df
    records = rows.to_dict("records")
    for i in range(0, len(records), per_row):
        cols = st.columns(per_row)
        for j, (col, c) in enumerate(zip(cols, records[i:i + per_row])):
            with col:
                path = image_path(int(c["id"]), c["image_url"])
                if path:
                    st.image(str(path), width="stretch")
                qty = f" ×{int(c[qty_col])}" if qty_col else ""
                st.caption(f"**{c['nom']}**{qty}")
                if st.button("Voir", key=f"{key}_{c['id']}_{i + j}", width="stretch"):
                    open_card(ids, start + i + j)


# --------------------------------------------------------------------------- pages

def page_collection():
    st.title("Ma collection")
    df = catalog()
    locations = [r[0] for r in con.execute("SELECT DISTINCT location FROM collection ORDER BY 1")]

    f1, f2, f3, f4 = st.columns([3, 2, 2, 2])
    text = f1.text_input("Recherche", placeholder="ex. mekk, ciel bleu, infini…")
    cats = f2.multiselect("Catégorie", sorted(df["catégorie"].unique()))
    locs = f3.multiselect("Emplacement", locations)
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
    arch = g1.multiselect("Archétype", sorted(a for a in view["archétype"].unique() if a))
    if arch:
        view = view[view["archétype"].isin(arch)]
    per_row = g2.select_slider("Cartes par ligne", [4, 5, 6, 8], value=6)

    m1, m2, m3 = st.columns(3)
    m1.metric("Cartes différentes", len(view))
    m2.metric("Exemplaires", int(view["owned"].sum()))
    m3.metric("Valeur Cardmarket ≈", f"{(view['owned'] * view['price_cm'].fillna(0)).sum():.2f} €")

    tab_gallery, tab_list = st.tabs(["Galerie", "Tableau"])
    with tab_gallery:
        gallery(view, "coll", per_row=per_row, qty_col="owned")
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
            path = image_path(int(card["id"]), card["image_url"])
            if path:
                st.image(str(path), width=260)
            st.write(card["desc_fr"] or card["desc_en"])
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
    order = {c["id"]: i for i, c in enumerate(cards)}
    for zone, label in ZONES.items():
        zone_cards = {c["id"]: c["quantity"] for c in cards if c["zone"] == zone}
        if zone_cards:
            st.markdown(f"**{label}**")
            view = df[df["id"].isin(zone_cards)].copy()
            view["qty"] = view["id"].map(zone_cards)
            view = view.sort_values("id", key=lambda s: s.map(order))
            gallery(view, f"deck_{zone}", per_row=8, qty_col="qty", paginate=False)


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
    b3.metric("Légal en tournoi", "Oui ✅" if not errors else f"Non ❌ ({len(errors)})")
    b4.metric("Faisable avec ton stock", "Oui ✅" if not stock else f"Non ⚠️ ({len(stock)})")
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
        verdict = "🟢 Bon" if p5 >= good else "🟡 Moyen" if p5 >= ok else "🔴 Faible"
        reg.append({"Objectif": label, "Cartes concernées": hits, "En premier (5 cartes)": pct(p5),
                    "En second (6 cartes)": pct(p6), "Verdict": verdict})
    st.dataframe(pd.DataFrame(reg), hide_index=True, width="stretch")
    st.caption("Verdicts indicatifs : on ne vise pas le même taux pour « 1 Mekk-Chevalier » "
               "(indispensable) que pour « 1 carte de destruction » (bonus).")

    with st.expander("Calcul personnalisé"):
        names = sorted({c["name_fr"] or c["name_en"] for c in main})
        chosen = st.multiselect("Cartes que tu veux voir en main", names)
        k = st.number_input("Combien au minimum", 1, 5, 1)
        hits = sum(c["quantity"] for c in main if (c["name_fr"] or c["name_en"]) in chosen)
        if chosen:
            st.write(f"Avec {hits} carte(s) concernée(s) sur {n['main']} : "
                     f"**{pct(A.p_at_least(hits, n['main'], 5, k))}** en premier, "
                     f"**{pct(A.p_at_least(hits, n['main'], 6, k))}** en second.")

    # 4. Comparaison
    st.header("4. Comparer avec un autre deck")
    me = con.execute("SELECT name FROM decks WHERE id = ?", (deck_id,)).fetchone()["name"]
    others = {r["name"]: r["id"] for r in con.execute("SELECT id, name FROM decks WHERE id != ?", (deck_id,))}
    other = st.selectbox("Autre deck", ["—"] + list(others))
    if other != "—":
        mine = {(c["name_fr"] or c["name_en"], c["zone"]): c["quantity"] for c in cards}
        theirs = {(c["name_fr"] or c["name_en"], c["zone"]): c["quantity"] for c in A.deck_cards(con, others[other])}
        plus, minus = [], []
        for key in sorted(set(mine) | set(theirs)):
            d = theirs.get(key, 0) - mine.get(key, 0)
            line = f"{'+' if d > 0 else '−'}{abs(d)} {key[0]} *({ZONES[key[1]]})*"
            if d > 0:
                plus.append(line)
            elif d < 0:
                minus.append(line)
        c1, c2 = st.columns(2)
        c1.markdown(f"**Ajoutées dans « {other} »** (par rapport à « {me} »)")
        c1.markdown("\n".join(f"- {line}" for line in plus) or "_aucune_")
        c2.markdown(f"**Retirées dans « {other} »**")
        c2.markdown("\n".join(f"- {line}" for line in minus) or "_aucune_")

    # 5. Suggestions
    st.header("5. Cartes de ton stock à envisager")
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
        st.header("6. Notes du build")
        st.markdown(notes)


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
    if not rows:
        st.success("Toutes les cartes sont reconnues.")
    for r in rows:
        current = r["name_fr"] or r["name_en"]
        with st.container(border=True):
            st.markdown(f"**{r['excel_name']}** — {r['location']} ×{r['quantity']} → "
                        + (f"reconnue comme *{current}* (score {r['match_score']})" if current else ":red[non reconnue]"))
            text = st.text_input("Chercher la bonne carte", value=r["excel_name"].split()[0], key=f"fix_q_{r['excel_name']}")
            res = search(df, text).head(100)
            if len(res):
                labels = {f"{x.nom} ({x['catégorie']})": int(x.id) for _, x in res.iterrows()}
                choice = st.selectbox("Carte", list(labels), key=f"fix_s_{r['excel_name']}")
                if st.button("Valider", key=f"fix_b_{r['excel_name']}"):
                    save_correction(r["excel_name"], labels[choice])
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
         "Corrections": page_corrections, "Import": page_import}
page = st.sidebar.radio("Navigation", list(PAGES))
unmatched = con.execute("SELECT COUNT(*) FROM collection WHERE card_id IS NULL").fetchone()[0]
if unmatched:
    st.sidebar.warning(f"{unmatched} carte(s) non reconnue(s) → page Corrections")
PAGES[page]()

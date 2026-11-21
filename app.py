"""IHM Yu-Gi-Oh! : collection, deck builder, analyse.   Lancer :  streamlit run app.py"""
import json

import pandas as pd
import streamlit as st

from ygo import analysis as A
from ygo import builds, importer
from ygo.db import connect, is_extra
from ygo.images import image_path
from ygo.importer import CORRECTIONS_PATH, normalize

st.set_page_config(page_title="Yu-Gi-Oh! – Ma collection", page_icon="🃏", layout="wide")


@st.cache_resource
def get_con():
    return connect()


con = get_con()

CATEGORY_LABELS = {"spell": "Magie", "trap": "Piège"}


def category(frame: str) -> str:
    if frame in CATEGORY_LABELS:
        return CATEGORY_LABELS[frame]
    if is_extra(frame):
        return "Extra (" + frame.split("_")[0].capitalize() + ")"
    return "Monstre"


@st.cache_data
def catalog() -> pd.DataFrame:
    df = pd.read_sql("""SELECT c.*, COALESCE(o.owned, 0) AS owned FROM cards c
                        LEFT JOIN owned o ON o.card_id = c.id""", con)
    df["nom"] = df["name_fr"].fillna(df["name_en"])
    df["catégorie"] = df["frame_type"].map(category)
    df["search"] = (df["name_fr"].fillna("") + " " + df["name_en"]).map(normalize)
    return df


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


def show_card(c):
    left, right = st.columns([1, 2])
    path = image_path(int(c["id"]), c["image_url"])
    if path:
        left.image(str(path), width="stretch")
    right.subheader(c["nom"])
    right.caption(f"{c['name_en']} · #{c['id']}")
    facts = [c["catégorie"], c["race"], c["attribute"]]
    if pd.notna(c["level"]):
        facts.append(f"Niv./Rang {int(c['level'])}")
    if pd.notna(c["linkval"]):
        facts.append(f"Lien {int(c['linkval'])}")
    if pd.notna(c["atk"]):
        facts.append(f"ATK {int(c['atk'])} / DEF {'-' if pd.isna(c['def']) else int(c['def'])}")
    right.write(" · ".join(str(f) for f in facts if f and pd.notna(f)))
    tags = [f"En stock : **{int(c['owned'])}**"]
    if c["archetype"]:
        tags.append(f"Archétype : {c['archetype']}")
    if c["ban_tcg"]:
        tags.append(f"Banlist TCG : :red[{c['ban_tcg']}]")
    if pd.notna(c["price_cm"]):
        tags.append(f"Cardmarket ≈ {c['price_cm']:.2f} €")
    right.markdown(" · ".join(tags))
    right.write(c["desc_fr"] or c["desc_en"])
    if c["desc_fr"]:
        with right.expander("Texte anglais"):
            st.write(c["desc_en"])


def gallery(df: pd.DataFrame, per_row: int = 8, qty_col: str | None = None, limit: int = 120):
    rows = df.head(limit).to_dict("records")
    for i in range(0, len(rows), per_row):
        cols = st.columns(per_row)
        for col, c in zip(cols, rows[i:i + per_row]):
            path = image_path(int(c["id"]), c["image_url"])
            label = c["nom"] + (f" ×{int(c[qty_col])}" if qty_col else "")
            if path:
                col.image(str(path), caption=label, width="stretch")
            else:
                col.write(label)
    if len(df) > limit:
        st.caption(f"{len(df) - limit} cartes supplémentaires non affichées. Affine les filtres.")


# --------------------------------------------------------------------------- pages

def page_collection():
    st.title("Ma collection")
    df = catalog()
    locations = [r[0] for r in con.execute("SELECT DISTINCT location FROM collection ORDER BY 1")]

    f1, f2, f3, f4 = st.columns([3, 2, 2, 2])
    text = f1.text_input("Recherche (FR ou EN)", placeholder="ex. mekk, ciel bleu, impermanence…")
    owned_only = f4.toggle("Seulement mes cartes", value=True)
    cats = f2.multiselect("Catégorie", sorted(df["catégorie"].unique()))
    locs = f3.multiselect("Emplacement", locations)

    view = search(df, text)
    if owned_only:
        view = view[view["owned"] > 0]
    if cats:
        view = view[view["catégorie"].isin(cats)]
    if locs:
        ids = [r[0] for r in con.execute(
            f"SELECT card_id FROM collection WHERE location IN ({','.join('?' * len(locs))})", locs)]
        view = view[view["id"].isin(ids)]
    archetypes = sorted(a for a in view["archetype"].dropna().unique())
    arch = st.multiselect("Archétype", archetypes)
    if arch:
        view = view[view["archetype"].isin(arch)]

    m1, m2, m3 = st.columns(3)
    m1.metric("Cartes différentes", len(view))
    m2.metric("Exemplaires", int(view["owned"].sum()))
    m3.metric("Valeur Cardmarket ≈", f"{(view['owned'] * view['price_cm'].fillna(0)).sum():.2f} €")

    tab_list, tab_gallery = st.tabs(["Liste", "Galerie"])
    with tab_list:
        cols = ["nom", "name_en", "catégorie", "race", "attribute", "level", "atk", "def", "archetype", "ban_tcg", "owned"]
        event = st.dataframe(
            view[cols].rename(columns={"nom": "Nom", "name_en": "Nom EN", "race": "Type", "attribute": "Attribut",
                                       "level": "Niv.", "atk": "ATK", "def": "DEF", "archetype": "Archétype",
                                       "ban_tcg": "Banlist", "owned": "Stock"}),
            hide_index=True, width="stretch", height=420, on_select="rerun", selection_mode="single-row")
        if event.selection.rows:
            st.divider()
            show_card(view.iloc[event.selection.rows[0]])
        else:
            st.caption("Clique sur une ligne pour voir la carte.")
    with tab_gallery:
        gallery(view, qty_col="owned")


def deck_selector(key: str) -> int | None:
    decks = {r["name"]: r["id"] for r in con.execute("SELECT id, name FROM decks ORDER BY name")}
    if not decks:
        st.info("Aucun deck. Crée-en un dans le Deck builder.")
        return None
    name = st.selectbox("Deck", list(decks), key=key)
    return decks[name]


def show_issues(cards):
    issues = A.check(cards)
    if not issues:
        st.success("Deck légal (banlist TCG) et constructible avec ton stock.")
    for level, msg in issues:
        (st.error if level == "error" else st.warning)(msg)


def page_builder():
    st.title("Deck builder")
    df = catalog()

    with st.sidebar.expander("Gérer les decks", expanded=False):
        new = st.text_input("Nom du nouveau deck")
        base = st.selectbox("Partir de", ["(vide)"] + [r[0] for r in con.execute("SELECT name FROM decks ORDER BY 1")])
        if st.button("Créer", disabled=not new.strip()):
            con.execute("INSERT INTO decks (name) VALUES (?)", (new.strip(),))
            new_id = con.execute("SELECT id FROM decks WHERE name = ?", (new.strip(),)).fetchone()[0]
            if base != "(vide)":
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
        st.caption("Ce deck vient de l'Excel : un nouvel import l'écrasera. Pour l'éditer durablement, duplique-le (barre latérale).")
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
            zone = st.radio("Zone", ["main", "extra", "side"], index=["main", "extra", "side"].index(default_zone), horizontal=True)
            qty = st.number_input("Quantité", 1, 3, 1)
            if st.button("Ajouter au deck", type="primary"):
                con.execute("""INSERT INTO deck_cards VALUES (?, ?, ?, ?)
                               ON CONFLICT(deck_id, card_id, zone) DO UPDATE SET quantity = MIN(3, quantity + excluded.quantity)""",
                            (deck_id, int(card["id"]), zone, int(qty)))
                con.commit()
                st.rerun()
            path = image_path(int(card["id"]), card["image_url"])
            if path:
                st.image(str(path), width=200)
            st.write(card["desc_fr"] or card["desc_en"])
        else:
            st.caption("Aucun résultat.")

    with deck_col:
        main = sum(c["quantity"] for c in cards if c["zone"] == "main")
        extra = sum(c["quantity"] for c in cards if c["zone"] == "extra")
        side = sum(c["quantity"] for c in cards if c["zone"] == "side")
        st.subheader(f"{deck['name']} — Main {main} · Extra {extra} · Side {side}")
        show_issues(cards)
        if deck["notes"]:
            with st.expander("Notes / justification du build"):
                st.markdown(deck["notes"])

        table = pd.DataFrame([{
            "id": c["id"], "Zone": c["zone"], "Carte": c["name_fr"] or c["name_en"], "Qté": c["quantity"],
            "Stock": c["owned"], "Rôle": A.role(c), "Banlist": c["ban_tcg"] or "",
        } for c in cards])
        if table.empty:
            st.info("Deck vide : ajoute des cartes à gauche.")
            return
        edited = st.data_editor(
            table, hide_index=True, width="stretch", height=min(38 * len(table) + 40, 700),
            disabled=["id", "Carte", "Stock", "Rôle", "Banlist"],
            column_config={"id": None,
                           "Qté": st.column_config.NumberColumn(min_value=0, max_value=3, step=1, help="0 = retirer"),
                           "Zone": st.column_config.SelectboxColumn(options=["main", "extra", "side"])},
            key=f"editor_{deck_id}")
        b1, b2, b3 = st.columns(3)
        if b1.button("Enregistrer les modifications", type="primary"):
            con.execute("DELETE FROM deck_cards WHERE deck_id = ?", (deck_id,))
            merged = edited[edited["Qté"] > 0].groupby(["id", "Zone"], as_index=False)["Qté"].sum()
            con.executemany("INSERT INTO deck_cards VALUES (?, ?, ?, ?)",
                            [(deck_id, int(r.id), r.Zone, min(3, int(r["Qté"]))) for _, r in merged.iterrows()])
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
        for zone, label in (("main", "Main deck"), ("extra", "Extra deck"), ("side", "Side deck")):
            zone_ids = [c["id"] for c in cards if c["zone"] == zone]
            if zone_ids:
                st.markdown(f"**{label}**")
                qty = {c["id"]: c["quantity"] for c in cards if c["zone"] == zone}
                view = df[df["id"].isin(zone_ids)].copy()
                view["qty"] = view["id"].map(qty)
                gallery(view, per_row=10, qty_col="qty")


def page_analysis():
    st.title("Analyse de deck")
    c1, c2 = st.columns(2)
    with c1:
        deck_id = deck_selector("analysis_deck")
    if deck_id is None:
        return
    cards = A.deck_cards(con, deck_id)
    main = [c for c in cards if c["zone"] == "main"]
    n_main = sum(c["quantity"] for c in main)
    show_issues(cards)

    rows = pd.DataFrame([{**c, "Rôle": A.role(c), "Catégorie": category(c["frame_type"])} for c in main])
    if rows.empty:
        st.info("Main deck vide.")
        return
    g1, g2 = st.columns(2)
    g1.markdown("**Répartition par rôle (main deck)**")
    g1.bar_chart(rows.groupby("Rôle")["quantity"].sum(), horizontal=True)
    g2.markdown("**Monstres par niveau**")
    g2.bar_chart(rows[rows["level"].notna()].groupby("level")["quantity"].sum())

    st.subheader("Probabilités de main de départ")
    st.caption("Chance de piocher au moins N des cartes choisies dans ta main de départ (loi hypergéométrique).")
    roles = sorted(rows["Rôle"].unique())
    default = [r for r in roles if r.startswith("Moteur Mekk")]
    p1, p2, p3 = st.columns([3, 1, 1])
    chosen_roles = p1.multiselect("Rôles comptés comme « bonnes cartes »", roles, default=default)
    extra_cards = p1.multiselect("… plus ces cartes", sorted(rows["name_fr"].fillna(rows["name_en"]).unique()))
    k = p2.number_input("Au moins N", 1, 5, 1)
    hits = int(rows[rows["Rôle"].isin(chosen_roles) |
                    rows["name_fr"].fillna(rows["name_en"]).isin(extra_cards)]["quantity"].sum())
    p3.metric("Cartes comptées", f"{hits} / {n_main}")
    m1, m2 = st.columns(2)
    m1.metric("En premier (5 cartes)", f"{100 * A.p_at_least(hits, n_main, 5, k):.1f} %")
    m2.metric("En second (6 cartes)", f"{100 * A.p_at_least(hits, n_main, 6, k):.1f} %")

    with c2:
        others = {r["name"]: r["id"] for r in con.execute("SELECT id, name FROM decks WHERE id != ?", (deck_id,))}
        other = st.selectbox("Comparer avec", ["—"] + list(others))
    if other != "—":
        st.subheader(f"Différences avec {other}")
        mine = {(c["name_fr"] or c["name_en"], c["zone"]): c["quantity"] for c in cards}
        theirs = {(c["name_fr"] or c["name_en"], c["zone"]): c["quantity"] for c in A.deck_cards(con, others[other])}
        diff = [{"Carte": name, "Zone": zone, "Ce deck": mine.get((name, zone), 0), other: theirs.get((name, zone), 0)}
                for name, zone in sorted(set(mine) | set(theirs)) if mine.get((name, zone), 0) != theirs.get((name, zone), 0)]
        st.dataframe(pd.DataFrame(diff), hide_index=True, width="stretch")

    st.subheader("Cartes de ton stock à envisager")
    sug = A.suggestions(con, deck_id)
    if sug:
        st.dataframe(pd.DataFrame([{"Carte": s["name_fr"] or s["name_en"], "Stock": s["owned"], "Banlist": s["ban_tcg"] or "",
                                    "Pourquoi": s["why"]} for s in sug]), hide_index=True, width="stretch")
    else:
        st.caption("Rien à signaler.")
    deck = con.execute("SELECT notes FROM decks WHERE id = ?", (deck_id,)).fetchone()
    if deck["notes"]:
        st.subheader("Notes du build")
        st.markdown(deck["notes"])


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
                labels = {f"{x.nom} — {x.name_en} ({x['catégorie']})": int(x.id) for _, x in res.iterrows()}
                choice = st.selectbox("Carte", list(labels), key=f"fix_s_{r['excel_name']}")
                if st.button("Valider", key=f"fix_b_{r['excel_name']}"):
                    save_correction(r["excel_name"], labels[choice])
                    refresh()


def save_correction(excel_name: str, card_id: int):
    con.execute("INSERT OR REPLACE INTO name_overrides VALUES (?, ?)", (excel_name, card_id))
    con.execute("UPDATE collection SET card_id = ?, match_score = 100 WHERE excel_name = ?", (card_id, excel_name))
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
        report = importer.import_excel(con)
        st.session_state["import_report"] = report
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
        missing = [r for r in report if not r["card_id"]]
        if missing:
            st.dataframe(pd.DataFrame(missing), hide_index=True)


PAGES = {"Collection": page_collection, "Deck builder": page_builder, "Analyse": page_analysis,
         "Corrections": page_corrections, "Import": page_import}
page = st.sidebar.radio("Navigation", list(PAGES))
unmatched = con.execute("SELECT COUNT(*) FROM collection WHERE card_id IS NULL").fetchone()[0]
if unmatched:
    st.sidebar.warning(f"{unmatched} carte(s) non reconnue(s) → page Corrections")
PAGES[page]()

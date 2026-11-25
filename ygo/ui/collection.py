"""Pages Collection et Constructeur de deck."""

import pandas as pd
import streamlit as st

from ygo import analysis as A
from ygo import cardmarket as CM
from ygo import importer
from ygo import plan as P
from ygo.db import is_extra
from ygo.fr import BANLIST, ZONES, ZONES_REV, tr
from ygo.ui.card_sheet import card_img, cards_gallery, effect_text, gallery, open_card
from ygo.ui.core import catalog, con, search_any, search_box
from ygo.ui.decks import deck_counts, deck_kpis, deck_plan, deck_selector, deck_signature, plan_selector, show_issues
from ygo.ui.style import page_header, status_tile


def page_collection():
    page_header(
        "Ma collection",
        "Toutes tes cartes, rangées par emplacement. Clique sur une carte pour la voir en grand.",
        "Collection",
    )
    df = catalog()
    locations = [r[0] for r in con.execute("SELECT DISTINCT location FROM collection ORDER BY 1")]

    f1, f2, f3, f4 = st.columns([3, 2, 2, 2])
    owned_only = f4.toggle("Seulement mes cartes", value=True)
    terms = search_box(f1, "Recherche", (df[df["owned"] > 0] if owned_only else df)["nom"], "collection_search",
                       "ex. mekk, ciel bleu, infini…")
    cats = f2.multiselect("Catégorie", sorted(df["catégorie"].unique()), placeholder="Choisir…")
    locs = f3.multiselect("Emplacement", locations, placeholder="Choisir…")

    view = search_any(df, terms)
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
    values = CM.collection_value(con)
    m3.metric("Valeur Cardmarket", f"{sum(values.get(int(i), 0) for i in view['id']):.2f} €",
              help="Prix tendance Cardmarket de tes raretés (prix le plus bas de la carte si la rareté est inconnue).")

    tab_gallery, tab_list = st.tabs(["Galerie", "Tableau"])
    with tab_gallery:
        gallery(view.assign(badge="×" + view["owned"].astype(str)), "coll", per_row=per_row)
    with tab_list:
        cols = {"nom": "Nom", "catégorie": "Catégorie", "type_fr": "Type", "attribut": "Attribut", "level": "Niv.",
                "atk": "ATK", "def": "DEF", "archétype": "Archétype", "banlist": "Banlist", "owned": "Stock",
                "rarities": "Rareté"}
        event = st.dataframe(view[list(cols)].rename(columns=cols), hide_index=True, width="stretch",
                             height=460, on_select="rerun", selection_mode="single-row")
        st.caption("Clique sur une ligne pour ouvrir la fiche.")
        if event.selection.rows:
            open_card([int(i) for i in view["id"]], event.selection.rows[0])


def kpi_strip(deck_id: int):
    """Régularité du deck en direct : recalculée à chaque modification enregistrée."""
    k = deck_kpis(deck_id, deck_signature(deck_id))
    if k is None:
        return
    cols = st.columns(4)
    tiles = [("Mains fortes en premier", k.strong_first, .80, .60), ("Mains fortes en second", k.strong_second, .80, .60),
             ("Main jouable en premier", k.playable_first, .90, .75), ("Main bloquée en premier", 1 - k.brick_first, .93, .85)]
    for col, (label, v, good, ok) in zip(cols, tiles):
        shown = v if "bloquée" not in label else 1 - v
        status_tile(col, label, f"{100 * shown:.0f} %", "good" if v >= good else "warn" if v >= ok else "bad",
                    "sur 20 000 mains simulées")
    st.caption("Détail et comparaison avec un autre deck : page Duel de decks.")


def page_builder():
    page_header(
        "Constructeur de deck",
        "Compose tes decks à partir de ton stock : la légalité et les quantités sont vérifiées en direct.",
        "Collection",
    )
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
    plan = plan_selector(st, deck_id, "builder_plan")
    cards = A.deck_cards(con, deck_id)

    add_col, deck_col = st.columns([1, 2])
    with add_col:
        st.subheader("Ajouter une carte")
        owned_only = st.toggle("Seulement mes cartes", value=True, key="add_owned")
        terms = search_box(st, "Rechercher", (df[df["owned"] > 0] if owned_only else df)["nom"], "add_search")
        res = search_any(df, terms)
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
        kpi_strip(deck_id)
        if deck["notes"]:
            with st.expander("Notes / justification du build"):
                st.markdown(deck["notes"])

        table = pd.DataFrame([{
            "id": c["id"], "Zone": ZONES[c["zone"]], "Carte": c["name_fr"] or c["name_en"], "Qté": c["quantity"],
            "Stock": c["owned"], "Rôle": P.role(c, plan), "Banlist": tr(BANLIST, c["ban_tcg"]),
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

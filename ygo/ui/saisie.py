"""Page Saisir ma collection : ajouter, modifier et retirer des cartes sans ouvrir l'Excel."""
import pandas as pd
import streamlit as st

from ygo import cardmarket as CM
from ygo import importer
from ygo import install
from ygo import rarity as R
from ygo import stock
from ygo.ui.core import card_img, catalog, con
from ygo.ui.style import page_header

NEW = "＋ Nouveau rangement…"
UNKNOWN = "unknown"


def euros(v) -> str:
    return "prix inconnu" if v is None else f"{v:.2f} €".replace(".", ",")


def _rangement() -> str | None:
    places = stock.sheets()
    default = places.index(st.session_state["saisie_place"]) if st.session_state.get("saisie_place") in places else 0
    choice = st.selectbox("Rangement", places + [NEW], index=default if places else 0,
                          help="Une feuille de ton Excel : classeur, boîte A… Un deck s'écrit dans une feuille deck_…")
    if choice == NEW:
        name = st.text_input("Nom du rangement", placeholder="ex. boîte C").strip()
        return name or None
    return choice


def _add_form(place: str):
    df = catalog()
    names = dict(zip(df["id"].astype(int), df["nom"]))
    card_id = st.selectbox("Carte", list(names), index=None, format_func=names.get, key="saisie_card",
                           placeholder="Tape le nom de la carte (français ou anglais)…")
    if card_id is None:
        return
    card = df[df["id"] == card_id].iloc[0]
    left, right = st.columns([1, 3])
    card_img(left, card, "180px")
    prints = sorted(CM.card_printings(con, card_id), key=lambda p: (p["set_name"], R.rank(p["rarity"] or "")))
    versions = {UNKNOWN: None} | {f"{p['set_code']}|{p['rarity']}": p for p in prints}
    with right:
        key = st.selectbox(
            "Version (extension et rareté)", list(versions),
            format_func=lambda k: "Je ne sais pas" if k == UNKNOWN else
            f"{versions[k]['set_name']} · {versions[k]['set_code']} · {R.label(versions[k]['rarity'])} · "
            f"{euros(versions[k]['trend'])}",
            help="Le code est imprimé sous l'illustration (ex. CRMS-FR020). Il donne le prix exact de ta version.")
        qty = st.number_input("Nombre d'exemplaires", 1, 99, 1)
        if st.button(f"Ajouter à « {place} »", type="primary"):
            p = versions[key]
            name = card["name_fr"] if isinstance(card["name_fr"], str) else card["name_en"]
            try:
                stock.add(place, name, qty, p["rarity"] if p else None, p["set_code"] if p else None)
                stock.refresh(con)
            except PermissionError:
                st.error("L'Excel est ouvert ailleurs : ferme-le puis recommence.")
                return
            st.session_state["saisie_place"] = place
            st.session_state["saisie_done"] = f"{qty} × {name} ajouté(s) à « {place} »."
            st.session_state.pop("saisie_card", None)
            st.cache_data.clear()
            st.rerun()


def _contents(place: str):
    lines = stock.rows(place) if place in stock.sheets() else []
    st.subheader(f"Contenu de « {place} » ({sum(r['nombre'] for r in lines)} cartes)")
    if not lines:
        st.caption("Ce rangement est vide.")
        return
    table = pd.DataFrame(lines).set_index("ligne")
    edited = st.data_editor(
        table, hide_index=True, width="stretch", key=f"saisie_edit_{place}", disabled=["carte", "rareté", "code"],
        column_config={"carte": "Carte", "rareté": "Rareté", "code": "Code",
                       "nombre": st.column_config.NumberColumn("Nombre", min_value=0, max_value=99, step=1,
                                                               help="0 = retirer la carte")})
    changes = {int(i): int(q) for i, q in edited["nombre"].items() if q != table.loc[i, "nombre"]}
    if changes and st.button("Enregistrer les modifications", type="primary"):
        try:
            stock.update(place, changes)
            stock.refresh(con)
        except PermissionError:
            st.error("L'Excel est ouvert ailleurs : ferme-le puis recommence.")
            return
        st.session_state["saisie_done"] = "Modifications enregistrées."
        st.cache_data.clear()
        st.rerun()


def page_saisie():
    page_header("Saisir ma collection",
                "Ajoute tes cartes en tapant leur nom : l'appli propose les cartes au fil de la frappe et remplit "
                "le reste (catégorie, étoiles, prix). Pas besoin d'ouvrir l'Excel.", "Collection")
    if install.USER_DIR != install.PERSONAL_DIR:
        st.info("Tu modifies la collection enregistrée dans le dépôt. Si tu as récupéré le projet d'un ami, crée "
                "d'abord ta propre collection (page **Import** → « Créer ma collection »).")
    if st.session_state.get("saisie_done"):
        st.success(st.session_state.pop("saisie_done"))
    place = _rangement()
    if not place:
        st.caption("Donne un nom au rangement pour commencer.")
        return
    st.subheader("Ajouter une carte")
    _add_form(place)
    _contents(place)
    st.caption(f"Tout est enregistré dans `{importer.EXCEL_PATH.relative_to(importer.ROOT).as_posix()}`, que tu "
               "peux toujours ouvrir si tu préfères.")

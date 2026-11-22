"""Page Saisir ma collection : ajouter, modifier et retirer des cartes sans ouvrir l'Excel."""
import pandas as pd
import streamlit as st

from ygo import cardmarket as CM
from ygo import importer
from ygo import install
from ygo import rarity as R
from ygo import stock
from ygo.ui.core import card_img, card_search, catalog, con
from ygo.ui.style import page_header

UNKNOWN = "unknown"


def euros(v) -> str:
    return "prix inconnu" if v is None else f"{v:.2f} €".replace(".", ",")


def _apply(action, message: str | None, place: str | None = None, remember: dict | None = None):
    """Modifie l'Excel, réimporte la collection et recharge la page avec un message (`remember` : valeurs
    gardées pour le prochain affichage, seulement si tout s'est bien passé)."""
    try:
        with st.spinner("Enregistrement dans l'Excel et mise à jour de la collection…"):
            action()
            stock.refresh(con)
    except PermissionError:
        st.error("L'Excel est ouvert ailleurs : ferme-le puis recommence.")
        return
    except ValueError as e:
        st.error(str(e))
        return
    if place is not None:
        st.session_state["saisie_place"] = place
    if message:
        st.session_state["saisie_done"] = message
    st.session_state.update(remember or {})
    st.rerun()  # pas de st.cache_data.clear() : les caches suivent déjà une empreinte des données


def _manage_zones(places: list[str], current: str | None):
    """Créer, renommer ou supprimer une zone de stock (une feuille de l'Excel)."""
    with st.expander("Gérer mes zones de stock", expanded=not places):
        st.caption("Une zone = un endroit où tu ranges des cartes : classeur, boîte A, étagère… Une zone dont le "
                   "nom commence par deck_ est aussi importée comme deck.")
        c1, c2 = st.columns([3, 1])
        new = c1.text_input("Nouvelle zone", placeholder="ex. boîte C", key="zone_new")
        c2.write("")
        if c2.button("Créer", width="stretch", disabled=not new.strip()):
            _apply(lambda: stock.create(new), f"Zone « {new.strip()} » créée.", new.strip())
        if not current:
            return
        c1, c2 = st.columns([3, 1])
        renamed = c1.text_input(f"Renommer « {current} »", value=current, key=f"zone_rename_{current}")
        c2.write("")
        if c2.button("Renommer", width="stretch", disabled=renamed.strip() in ("", current)):
            def rename():
                stock.rename(current, renamed)
                # un deck_… renommé garde son contenu : le deck suit le nouveau nom
                con.execute("UPDATE decks SET name = ? WHERE name = ?", (renamed.strip(), current))
                con.commit()
            _apply(rename, f"Zone « {current} » renommée en « {renamed.strip()} ».", renamed.strip())
        count = sum(r["nombre"] for r in stock.rows(current))
        c1, c2 = st.columns([3, 1])
        sure = c1.checkbox(f"Supprimer « {current} »" + (f" et ses {count} cartes" if count else " (vide)"),
                           key=f"zone_delete_{current}")
        c2.write("")
        if c2.button("Supprimer", width="stretch", disabled=not sure):
            others = [p for p in places if p != current]
            _apply(lambda: stock.delete(current), f"Zone « {current} » supprimée.", others[0] if others else None)


def _rangement() -> str | None:
    places = stock.sheets()
    current = None
    if places:
        default = places.index(st.session_state["saisie_place"]) if st.session_state.get("saisie_place") in places else 0
        current = st.selectbox("Zone de stock", places, index=default,
                               help="Où ranger les cartes que tu ajoutes : une feuille de ton Excel.")
        st.session_state["saisie_place"] = current
    _manage_zones(places, current)
    return current


def _add_form(place: str):
    df = catalog()
    added = st.session_state.pop("saisie_added", None)
    if added:
        # confirmation juste au-dessus du champ, qui reprend le curseur pour la carte suivante
        st.session_state["saisie_focus"] = st.session_state.get("saisie_focus", 0) + 1
        card = df[df["id"] == added["id"]]
        total = int(card["owned"].iloc[0]) if len(card) else added["qty"]
        st.toast(f"{added['qty']} × {added['name']} ajouté(s)")
        with st.container(border=True):
            left, right = st.columns([1, 9], vertical_alignment="center")
            if len(card):
                card_img(left, card.iloc[0], "70px")
            right.success(f"**{added['qty']} × {added['name']}** ajouté(s) à « {added['place']} » — tu en as "
                          f"maintenant {total} au total. Tape la carte suivante.")
    picked = card_search("saisie_search", "Tape le nom de la carte (français ou anglais)…",
                         focus=st.session_state.get("saisie_focus", 0))
    if picked:
        st.session_state["saisie_card"] = picked
    card_id = st.session_state.get("saisie_card")
    if card_id is None:
        return
    card = df[df["id"] == card_id].iloc[0]
    st.markdown(f"Carte choisie : **{card['nom']}**")
    left, right = st.columns([1, 3])
    card_img(left, card, "180px")
    prints = sorted(CM.card_printings(con, card_id), key=lambda p: (p["set_name"], R.rank(p["rarity"] or "")))
    versions = {UNKNOWN: None} | {f"{p['set_code']}|{p['rarity']}": p for p in prints}
    with right:
        key = st.selectbox(
            "Version (extension et rareté)", list(versions),
            format_func=lambda k: "Je ne sais pas" if k == UNKNOWN else
            f"{versions[k]['set_name']} · {CM.french_code(versions[k]['set_code'])} · {R.label(versions[k]['rarity'])} · "
            f"{euros(versions[k]['trend'])}",
            help="Le code est imprimé sous l'illustration (ex. CRMS-FR020). Il donne le prix exact de ta version.")
        qty = st.number_input("Nombre d'exemplaires", 1, 99, 1)
        if st.button(f"Ajouter à « {place} »", type="primary"):
            try:
                name = stock.add_card(con, place, int(card_id), qty, versions[key])
            except PermissionError:
                st.error("L'Excel est ouvert ailleurs : ferme-le puis recommence.")
                return
            st.session_state.pop("saisie_card", None)
            st.session_state["saisie_added"] = {"id": card_id, "name": name, "qty": qty, "place": place}
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
        _apply(lambda: stock.update(place, changes), "Modifications enregistrées.")


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
        st.caption("Crée ta première zone de stock pour commencer.")
        return
    st.subheader("Ajouter une carte")
    _add_form(place)
    _contents(place)
    st.caption(f"Tout est enregistré dans `{importer.EXCEL_PATH.relative_to(importer.ROOT).as_posix()}`, que tu "
               "peux toujours ouvrir si tu préfères.")

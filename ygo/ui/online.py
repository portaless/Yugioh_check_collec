"""Page Partage en ligne : relier l'appli à son identité en ligne (EX-I2), publier la collection (EX-C1) et les decks
(EX-K1) sur le serveur des duels en ligne."""

import streamlit as st

from ygo import online as O
from ygo.ui.core import catalog, con
from ygo.ui.style import page_header

VISIBILITY = {"private": "Privée (toi seul)", "friends": "Amis (pseudos de ta liste)", "public": "Publique (tout le monde)"}


def page_online():
    page_header("Partage en ligne", "Publie ta collection et tes decks sur l'appli en ligne : tes amis la consultent, "
                "tu joues tes decks contre d'autres joueurs.", "En ligne")
    config = O.load_config()

    with st.expander("Connexion à l'appli en ligne", expanded=not config["key"]):
        st.markdown("1. Lance le serveur : `cd engine && npm run online`.\n"
                    "2. Ouvre l'appli en ligne, choisis un pseudo, puis page **Mon compte**, copie ta clé.\n"
                    "3. Colle-la ici. Elle est gardée dans `data/online.json`, jamais dans le code.")
        with st.form("online_login", border=False):
            c1, c2 = st.columns([2, 3])
            server = c1.text_input("Adresse du serveur", config["server"])
            key = c2.text_input("Ta clé", config["key"], type="password")
            saved = st.form_submit_button("Enregistrer", type="primary")
        if saved:
            try:
                O.account({"server": server.strip().rstrip("/"), "key": key.strip()})
            except O.OnlineError as e:
                st.error(f"{e} Rien n'a été enregistré.")
            else:
                O.save_config(server, key)
                st.rerun()
    if not config["key"]:
        return
    try:
        account = O.account(config)
    except O.OnlineError as e:
        st.error(str(e))
        return

    published = account["collection"]
    st.success(f"Connecté en tant que **{account['player']['pseudo']}**. " + (
        f"Dernière publication le {published['published']} (UTC) : {published['cards']} cartes, {len(account['decks'])} deck(s)."
        if published else "Rien n'est encore publié."))
    st.link_button("Ouvrir ma collection en ligne", f"{config['server']}/c/{account['player']['pseudo']}",
                   disabled=not published)

    st.subheader("Collection")
    c1, c2 = st.columns(2)
    current = published["visibility"] if published else "private"
    visibility = c1.radio("Qui peut la voir ?", list(VISIBILITY), index=list(VISIBILITY).index(current),
                          format_func=VISIBILITY.get)
    locations = c2.checkbox("Publier les emplacements (feuilles de l'Excel : boîtes, classeurs…)", value=False)
    c2.caption(f"Amis autorisés : {', '.join(account['friends']) or 'aucun'} (liste à gérer sur la page Mon compte en ligne).")

    st.subheader("Decks")
    names = [r["name"] for r in con.execute("SELECT name FROM decks ORDER BY name")]
    before = [d["name"] for d in account["decks"]]
    chosen = st.multiselect("Decks à publier (pour jouer en ligne)", names,
                            default=[n for n in before if n in names] if published else names)
    visible = st.multiselect("Parmi eux, decks visibles avec la collection", chosen,
                             default=[d["name"] for d in account["decks"] if d["visible"] and d["name"] in chosen])
    decks = O.decks_payload(con, chosen, visible)
    short = [d["name"] for d in decks if not 40 <= len(d["main"]) <= 60 or len(d["extra"]) > 15]
    if short:
        st.warning("Hors des règles, donc pas jouables en ligne (40 à 60 cartes, Extra 15 au maximum) : " + ", ".join(short))
    st.caption("Une publication remplace la précédente : un deck retiré de la liste disparaît de l'appli en ligne.")

    if st.button("Publier", type="primary"):
        try:
            with st.spinner("Publication…"):
                done = O.publish(config, visibility, O.collection_payload(con, catalog(), locations), decks, locations)
        except O.OnlineError as e:
            st.error(str(e))
        else:
            st.success(f"Publié le {done['published']} (UTC) : {done['cards']} cartes, {done['decks']} deck(s), "
                       f"visibilité {VISIBILITY[done['visibility']].split(' ')[0].lower()}.")

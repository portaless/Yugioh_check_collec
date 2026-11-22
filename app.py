"""IHM Yu-Gi-Oh! : collection, constructeur de deck, analyses.   Lancer :  streamlit run app.py

Ce fichier ne fait que la configuration et la navigation ; les pages sont dans ygo/ui/.
"""
import streamlit as st

from ygo import install

st.set_page_config(page_title="Ma collection Yu-Gi-Oh!", page_icon="🃏", layout="wide")

from ygo.ui.bourse import page_bourse  # noqa: E402  (après set_page_config)
from ygo.ui.collection import page_builder, page_collection  # noqa: E402
from ygo.ui.core import con  # noqa: E402
from ygo.ui.data import page_corrections, page_import  # noqa: E402
from ygo.ui.deck_analysis import page_analysis  # noqa: E402
from ygo.ui.duel import page_duel  # noqa: E402
from ygo.ui.generator import page_generator  # noqa: E402
from ygo.ui.meta_sim import page_meta  # noqa: E402
from ygo.ui.style import apply_style, page_header  # noqa: E402

apply_style()
st.logo("static/logo.svg", size="large")

if install.needs_install(con):  # nouveau clone du dépôt : data/ se construit au premier lancement
    page_header("Première installation", "Téléchargement des cartes, du méta et des prix : quelques minutes, "
                "une seule fois. Ne ferme pas la page.", "Bienvenue")
    with st.status("Installation…", expanded=True) as status:
        def step(i, label):
            status.update(label=f"Étape {i + 1}/{len(install.STEPS)} : {label}…")
            st.write(f"{i + 1}. {label}")
        install.install(con, log=step)
        status.update(label="Installation terminée", state="complete")
    st.cache_data.clear()
    st.rerun()

pages = {
    "Ma collection": [
        st.Page(page_collection, title="Collection", icon=":material/style:", url_path="collection", default=True),
        st.Page(page_builder, title="Constructeur de deck", icon=":material/construction:", url_path="constructeur"),
        st.Page(page_bourse, title="Bourse", icon=":material/trending_up:", url_path="bourse"),
    ],
    "Analyse": [
        st.Page(page_analysis, title="Analyse", icon=":material/insights:", url_path="analyse"),
        st.Page(page_duel, title="Duel de decks", icon=":material/swords:", url_path="duel"),
        st.Page(page_meta, title="Simulation méta", icon=":material/public:", url_path="meta"),
        st.Page(page_generator, title="Générateur de build", icon=":material/auto_awesome:", url_path="generateur"),
    ],
    "Données": [
        st.Page(page_corrections, title="Corrections", icon=":material/rule:", url_path="corrections"),
        st.Page(page_import, title="Import", icon=":material/upload_file:", url_path="import"),
    ],
}
current = st.navigation(pages)

unmatched = con.execute("SELECT COUNT(*) FROM collection WHERE card_id IS NULL").fetchone()[0]
if unmatched:
    st.sidebar.warning(f"{unmatched} carte(s) non reconnue(s) → page Corrections")

current.run()
install.export_decks(con)  # decks.json suit les decks de l'IHM, pour les clones du dépôt

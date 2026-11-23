"""Affiche une seule page de l'IHM (choisie par st.session_state["page"]) pour les tests sans navigateur."""
import streamlit as st

from ygo.ui.bourse import page_bourse
from ygo.ui.collection import page_builder, page_collection
from ygo.ui.data import page_corrections, page_import
from ygo.ui.deck_analysis import page_analysis
from ygo.ui.duel import page_duel
from ygo.ui.duel_meta import page_duel_meta
from ygo.ui.generator import page_generator
from ygo.ui.meta_sim import page_meta
from ygo.ui.saisie import page_saisie
from ygo.ui.style import apply_style

PAGES = {"collection": page_collection, "constructeur": page_builder, "analyse": page_analysis, "duel": page_duel,
         "meta": page_meta, "generateur": page_generator, "corrections": page_corrections, "import": page_import,
         "bourse": page_bourse, "saisie": page_saisie, "duel-meta": page_duel_meta}

apply_style()
PAGES[st.session_state.get("page", "collection")]()

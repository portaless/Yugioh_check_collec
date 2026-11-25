"""Plateau du duel simulé : les étapes calculées par ygo.duel, rejouées dans le navigateur.

Tout le déroulé est envoyé en une fois : avancer, reculer ou lancer la lecture se fait sans aller-retour avec
Python. Flèches gauche/droite du clavier quand le plateau a le focus, clic sur une ligne du journal pour y aller.
"""
from concurrent.futures import ThreadPoolExecutor

import streamlit as st

from ygo.images import thumb_src
from ygo.ui.core import catalog, web

DUEL_BOARD = st.components.v2.component("duel_board", css=web("duel_board.css"), js=web("duel_board.js"))


def duel_board(game: dict, first: str, key: str):
    """Affiche un duel calculé par ygo.duel.play."""
    ids = {c["id"] for s in game["steps"] for side in (s["a"], s["b"])
           for zone in ("hand", "monsters", "backrow", "gy") for c in side[zone]}
    urls = catalog().set_index("id")["image_url"]
    ids = [i for i in ids if i in urls.index]
    with ThreadPoolExecutor(8) as pool:  # miniatures téléchargées en parallèle la première fois
        imgs = dict(zip(ids, pool.map(thumb_src, ids, (urls[i] for i in ids))))
    DUEL_BOARD(data={"steps": game["steps"], "imgs": {str(k): v for k, v in imgs.items() if v},
                     "verdict": game["verdict"], "first": first, "key": key}, key="duel_board")

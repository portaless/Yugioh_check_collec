"""Briques communes de l'IHM : connexion à la base, catalogue des cartes et recherche par nom."""

from pathlib import Path

import pandas as pd
import streamlit as st

from ygo import rarity as R
from ygo.db import connect, is_extra
from ygo.fr import ARCHETYPES, ATTRIBUTES, BANLIST, RACES, tr
from ygo.importer import normalize


WEB_DIR = Path(__file__).parent / "web"


def web(name: str) -> str:
    """JavaScript ou CSS d'un composant de l'IHM (ygo/ui/web/)."""
    return (WEB_DIR / name).read_text(encoding="utf8")


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


def catalog() -> pd.DataFrame:
    """Catalogue complet + ton stock. Les 14 000 fiches ne sont relues qu'après un import ; le stock
    (petit) est relu à chaque fois, donc modifier un deck ne recharge pas tout le catalogue."""
    fingerprint = tuple(con.execute("""SELECT COUNT(*), TOTAL(LENGTH(name_fr)), TOTAL(LENGTH(desc_fr)),
                                       TOTAL(LENGTH(ban_tcg)) FROM cards""").fetchone())
    cards = _cards(fingerprint)
    stock = con.execute("""SELECT card_id, SUM(quantity), GROUP_CONCAT(DISTINCT rarity) FROM collection
                           WHERE card_id IS NOT NULL GROUP BY card_id""").fetchall()
    owned = {r[0]: r[1] for r in stock}
    rarities = {r[0]: ", ".join(R.label(x) for x in (r[2] or "").split(",") if x) for r in stock}
    return cards.assign(owned=cards["id"].map(owned).fillna(0).astype(int),
                        rarities=cards["id"].map(rarities).fillna(""))


@st.cache_data(max_entries=2, show_spinner="Chargement du catalogue…")
def _cards(fingerprint: tuple) -> pd.DataFrame:
    df = pd.read_sql("SELECT * FROM cards", con)
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
    st.rerun()


def search_box(container, label: str, options, key: str, placeholder: str = "Tape un nom…") -> list[str]:
    """Barre de recherche du projet : propose les noms pendant la frappe (auto-complétion), accepte plusieurs choix,
    et un texte libre (« mekk ») pour une recherche partielle."""
    return container.multiselect(label, sorted(set(options), key=normalize), key=key, placeholder=placeholder,
                                 accept_new_options=True)


def search_any(df: pd.DataFrame, terms: list[str]) -> pd.DataFrame:
    """Cartes correspondant à au moins un des termes (tous les mots d'un terme, dans le désordre)."""
    if not terms:
        return df
    return df[pd.concat([df["search"].pipe(lambda s, t=t: _words_in(s, t)) for t in terms], axis=1).any(axis=1)]


def _words_in(texts: pd.Series, term: str) -> pd.Series:
    mask = pd.Series(True, index=texts.index)
    for word in normalize(term).split():
        mask &= texts.str.contains(word, regex=False)
    return mask

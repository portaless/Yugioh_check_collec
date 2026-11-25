"""Decks dans l'IHM : choix d'un deck, contrôles, moteur (archétype) et KPI mis en cache."""

import streamlit as st

from ygo import analysis as A
from ygo import plan as P
from ygo import simulation as S
from ygo.fr import ARCHETYPES, ZONES, tr
from ygo.ui.core import con
from ygo.ui.style import pill


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


# (fond, texte) : teintes douces, lisibles en thème clair comme sombre
def pct(p: float) -> str:
    return f"{round(100 * p)} mains sur 100"


def verdict_pill(verdict: str) -> str:
    return pill(f"Main {verdict.lower()}", {"Forte": "good", "Jouable": "warn", "Bloquée": "bad"}[verdict])


def tone_for(v: float) -> str:
    return "good" if v >= .55 else "warn" if v >= .35 else "bad"


def deck_signature(deck_id: int) -> tuple:
    """Contenu du deck et moteur choisi : tout ce qui change ses KPI."""
    plan = con.execute("SELECT plan FROM decks WHERE id = ?", (deck_id,)).fetchone()
    return tuple(tuple(r) for r in con.execute(
        "SELECT card_id, zone, quantity FROM deck_cards WHERE deck_id = ? ORDER BY 1, 2", (deck_id,))) + (
        plan[0] if plan else None,)


def deck_plan(deck_id: int) -> P.Plan:
    return P.of_deck(con, deck_id, A.deck_cards(con, deck_id))


def plan_name(plan: P.Plan) -> str:
    return " + ".join(tr(ARCHETYPES, a) for a in plan.archetypes) or "aucun moteur"


def plan_selector(container, deck_id: int, key: str) -> P.Plan:
    """Choix du moteur du deck (archétype), enregistré avec le deck ; « automatique » = le plus présent."""
    cards = A.deck_cards(con, deck_id)
    detected = P.detect(cards)
    in_deck = {c["archetype"] for c in cards if c["archetype"]}
    options = [""] + sorted({a for a, _ in P.archetypes_in_stock(con)} | in_deck, key=lambda a: tr(ARCHETYPES, a))
    stored = con.execute("SELECT plan FROM decks WHERE id = ?", (deck_id,)).fetchone()["plan"] or ""
    choice = container.selectbox(
        "Moteur du deck", options, index=options.index(stored) if stored in options else 0, key=f"{key}_{deck_id}",
        format_func=lambda a: tr(ARCHETYPES, a) if a else f"Automatique ({plan_name(detected)})",
        help="L'archétype autour duquel le deck est construit : il définit les starters, le moteur et les cartes "
             "hors moteur dans toutes les analyses.")
    if choice != stored:
        con.execute("UPDATE decks SET plan = ? WHERE id = ?", (choice or None, deck_id))
        con.commit()
    return P.Plan((choice,)) if choice else detected


@st.cache_data(show_spinner=False)
def deck_kpis(deck_id: int, signature: tuple):
    """Régularité des mains d'un deck (20 000 mains), recalculée seulement quand son contenu ou son moteur change."""
    deck = S.main_deck(A.deck_cards(con, deck_id))
    return S.simulate(deck, deck_plan(deck_id)) if deck else None

"""Simulation de mains de départ (Monte-Carlo) pour comparer des decks Mekk-Chevalier.

Hypothèses de jeu (volontairement simples, affichées dans l'IHM) :
- Starter : un monstre Mekk-Chevalier, ou « Mémoire de l'Héritage du Monde » (invoque un Mekk depuis le deck).
- En premier, le terrain adverse est vide : un Mekk ne peut s'invoquer que si tu poses toi-même une carte dans
  sa colonne. Main jouable = Mémoire, ou un Mekk + une Magie/Piège à poser, ou deux Mekk.
- En second, l'adversaire a rempli son terrain : un seul Mekk suffit à démarrer.
- Main forte en premier = jouable + au moins une protection (Piège ou interruption depuis la main).
- Main forte en second = jouable + au moins une interruption depuis la main ou une carte de destruction.
"""
from dataclasses import dataclass

import numpy as np

from . import analysis as A

MEMORY = "World Legacy's Memory"
N_HANDS = 20_000

FLAGS = ("starter", "mekk", "memory", "backrow", "trap", "interrupt", "breaker", "offplan")


def card_flags(c: dict) -> dict:
    role = A.role(c)
    frame = c["frame_type"]
    return {
        "mekk": role == A.MEKK,
        "memory": c["name_en"] == MEMORY,
        "starter": role == A.MEKK or c["name_en"] == MEMORY,
        "backrow": frame in ("spell", "trap"),
        "trap": frame == "trap",
        "interrupt": role == A.INTERRUPT,
        "breaker": role == A.BREAKER,
        "offplan": role in (A.PSYCHIC, A.OTHER),
    }


def main_deck(cards: list[dict]) -> list[dict]:
    """Une entrée par exemplaire du Main Deck."""
    return [c for c in cards if c["zone"] == "main" for _ in range(c["quantity"])]


def _matrix(deck: list[dict]) -> np.ndarray:
    return np.array([[card_flags(c)[f] for f in FLAGS] for c in deck], dtype=np.int8)


def _verdicts(counts: dict, first: bool) -> tuple[np.ndarray, np.ndarray]:
    """counts : nombre de cartes de chaque catégorie dans chaque main (tableaux numpy ou entiers)."""
    if first:
        playable = (counts["memory"] >= 1) | ((counts["mekk"] >= 1) & (counts["backrow"] - counts["memory"] >= 1)) \
                   | (counts["mekk"] >= 2)
        strong = playable & ((counts["trap"] + counts["interrupt"]) >= 1)
    else:
        playable = counts["starter"] >= 1
        strong = playable & ((counts["interrupt"] + counts["breaker"]) >= 1)
    return playable, strong


@dataclass
class Kpis:
    size: int
    playable_first: float
    strong_first: float
    playable_second: float
    strong_second: float
    brick_first: float
    offplan_per_hand: float
    n: int = N_HANDS


def simulate(deck: list[dict], n: int = N_HANDS, seed: int = 0) -> Kpis:
    m = _matrix(deck)
    rng = np.random.default_rng(seed)
    # 6 premières cartes d'un mélange aléatoire ; les 5 premières forment la main en premier
    order = np.argsort(rng.random((n, len(deck))), axis=1)[:, :6]
    drawn = m[order]  # (n, 6, flags)
    res = {}
    for first, k in ((True, 5), (False, 6)):
        counts = {f: drawn[:, :k, i].sum(axis=1) for i, f in enumerate(FLAGS)}
        res[first] = (_verdicts(counts, first), counts)
    (pf, sf), c5 = res[True]
    (ps, ss), _ = res[False]
    return Kpis(len(deck), pf.mean(), sf.mean(), ps.mean(), ss.mean(),
                (c5["starter"] == 0).mean(), c5["offplan"].mean(), n)


def margin(p: float, q: float, n: int = N_HANDS) -> float:
    """Marge d'erreur (2 écarts-types) de la différence entre deux taux simulés."""
    return 2 * np.sqrt(p * (1 - p) / n + q * (1 - q) / n)


def describe_hand(hand: list[dict], first: bool) -> tuple[str, list[str]]:
    """Verdict lisible d'une main d'exemple et les raisons."""
    counts = {f: sum(card_flags(c)[f] for c in hand) for f in FLAGS}
    playable, strong = (bool(v) for v in _verdicts(counts, first))
    reasons = []
    names = lambda flag: ", ".join(sorted({c["name_fr"] or c["name_en"] for c in hand if card_flags(c)[flag]}))
    if counts["memory"]:
        reasons.append(f"{names('memory')} invoque un Mekk-Chevalier depuis le deck.")
    if counts["mekk"]:
        reasons.append(f"Starter(s) : {names('mekk')}.")
        if first and not counts["memory"]:
            if counts["backrow"] - counts["memory"] >= 1:
                reasons.append("Une Magie/Piège à poser crée la colonne nécessaire à l'invocation.")
            elif counts["mekk"] >= 2:
                reasons.append("Deux Mekk : le premier posé ouvre la colonne du second.")
            else:
                reasons.append("Terrain vide et rien à poser : le Mekk ne peut pas s'invoquer.")
    else:
        if not counts["memory"]:
            reasons.append("Aucun starter : la main ne peut pas lancer le moteur Mekk.")
    if first and counts["trap"] + counts["interrupt"]:
        reasons.append("Protection pour le tour adverse : " + ", ".join(
            sorted({c["name_fr"] or c["name_en"] for c in hand if card_flags(c)["trap"] or card_flags(c)["interrupt"]})) + ".")
    if not first and counts["interrupt"] + counts["breaker"]:
        reasons.append("De quoi gêner l'adversaire : " + ", ".join(
            sorted({c["name_fr"] or c["name_en"] for c in hand if card_flags(c)["interrupt"] or card_flags(c)["breaker"]})) + ".")
    if counts["offplan"]:
        reasons.append(f"Hors moteur Mekk : {names('offplan')}.")
    verdict = "Forte" if strong else "Jouable" if playable else "Bloquée"
    return verdict, reasons


def sample_hands(deck: list[dict], seed: int) -> tuple[list[dict], list[dict]]:
    """Une main en premier (5 cartes) et une main en second (6 cartes) tirées de mélanges distincts."""
    rng = np.random.default_rng(seed)
    first = [deck[i] for i in rng.permutation(len(deck))[:5]]
    second = [deck[i] for i in rng.permutation(len(deck))[:6]]
    return first, second


LEVERS = {
    "Retirer 1 carte hors moteur (deck plus fin)": ("offplan", None),
    "Remplacer 1 carte hors moteur par 1 starter Mekk": ("offplan", "starter"),
    "Remplacer 1 carte hors moteur par 1 interruption": ("offplan", "interrupt"),
    "Remplacer 1 carte hors moteur par 1 Piège Héritage": ("offplan", "trap"),
}

_TEMPLATES = {
    "starter": {"frame_type": "effect", "archetype": "Mekk-Knight", "name_en": "_starter", "race": "Psychic"},
    "interrupt": {"frame_type": "effect", "archetype": None, "name_en": "Effect Veiler", "race": "Spellcaster"},
    "trap": {"frame_type": "trap", "archetype": "Mekk-Knight", "name_en": "_trap", "race": "Continuous"},
}


def levers(deck: list[dict], n: int = N_HANDS, seed: int = 0) -> list[dict]:
    """Effet de modifications simples sur les KPI, pour montrer ce qui rapporte le plus."""
    base = simulate(deck, n, seed)
    victim = next((i for i, c in enumerate(deck) if card_flags(c)["offplan"]), None)
    out = []
    for label, (remove, add) in LEVERS.items():
        if victim is None:
            continue
        new = deck[:victim] + deck[victim + 1:]
        if add:
            new.append({"name_fr": None, **_TEMPLATES[add]})
        k = simulate(new, n, seed)
        out.append({"label": label, "kpis": k,
                    "delta_first": k.playable_first - base.playable_first,
                    "delta_strong_first": k.strong_first - base.strong_first,
                    "delta_second": k.strong_second - base.strong_second})
    return out

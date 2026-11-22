"""Simulation de mains de départ (Monte-Carlo) pour comparer des decks, quel que soit leur moteur.

Hypothèses de jeu (volontairement simples, affichées dans l'IHM), rôles définis dans plan.py :
- Starter : carte du moteur qui lance le jeu seule (s'invoque depuis la main, ou va chercher dans le deck).
- En premier, le terrain adverse est vide : un starter « de colonne » (Mekk-Chevalier) ne s'invoque que si tu
  poses toi-même une autre carte dans sa colonne. Main jouable = un starter libre, ou un starter de colonne
  + une Magie/Piège à poser, ou deux starters de colonne.
- En second, l'adversaire a rempli son terrain : un seul starter suffit à démarrer.
- Main forte en premier = jouable + au moins une protection (Piège du moteur, Piège générique efficace
  comme Jugement Solennel, ou interruption depuis la main).
- Main forte en second = jouable + au moins une interruption depuis la main ou une carte de destruction.
"""
from dataclasses import dataclass

import numpy as np

from . import plan as P

N_HANDS = 20_000

FLAGS = ("starter", "free", "column", "backrow", "trap", "interrupt", "protect", "breaker", "offplan", "engine")


def card_flags(c: dict, plan: P.Plan) -> dict:
    return P.flags(c, plan)


def main_deck(cards: list[dict]) -> list[dict]:
    """Une entrée par exemplaire du Main Deck."""
    return [c for c in cards if c["zone"] == "main" for _ in range(c["quantity"])]


def _matrix(deck: list[dict], plan: P.Plan) -> np.ndarray:
    return np.array([[card_flags(c, plan)[f] for f in FLAGS] for c in deck], dtype=np.int8)


def _verdicts(counts: dict, first: bool) -> tuple[np.ndarray, np.ndarray]:
    """counts : nombre de cartes de chaque catégorie dans chaque main (tableaux numpy ou entiers)."""
    if first:
        playable = (counts["free"] >= 1) | ((counts["column"] >= 1) & (counts["backrow"] >= 1)) \
                   | (counts["column"] >= 2)
        strong = playable & (counts["protect"] >= 1)
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


def simulate(deck: list[dict], plan: P.Plan | None = None, n: int = N_HANDS, seed: int = 0) -> Kpis:
    m = _matrix(deck, plan or P.detect(deck))
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


def describe_hand(hand: list[dict], first: bool, plan: P.Plan) -> tuple[str, list[str]]:
    """Verdict lisible d'une main d'exemple et les raisons."""
    flags = [card_flags(c, plan) for c in hand]
    counts = {f: sum(fl[f] for fl in flags) for f in FLAGS}
    playable, strong = (bool(v) for v in _verdicts(counts, first))
    reasons = []

    def names(*keys):
        return ", ".join(sorted({c["name_fr"] or c["name_en"] for c, fl in zip(hand, flags) if any(fl[k] for k in keys)}))

    if counts["starter"]:
        reasons.append(f"Starter(s) : {names('starter')}.")
        if first and not counts["free"]:
            if counts["backrow"] >= 1:
                reasons.append("Une Magie/Piège à poser crée la colonne nécessaire à l'invocation.")
            elif counts["column"] >= 2:
                reasons.append("Deux starters de colonne : le premier posé ouvre la colonne du second.")
            else:
                reasons.append("Terrain vide et rien à poser : le starter ne peut pas s'invoquer.")
    else:
        reasons.append(f"Aucun starter : la main ne peut pas lancer le moteur ({plan.label}).")
    if first and counts["protect"]:
        reasons.append(f"Protection pour le tour adverse : {names('protect')}.")
    if not first and counts["interrupt"] + counts["breaker"]:
        reasons.append(f"De quoi gêner l'adversaire : {names('interrupt', 'breaker')}.")
    if counts["offplan"]:
        reasons.append(f"Hors moteur : {names('offplan')}.")
    verdict = "Forte" if strong else "Jouable" if playable else "Bloquée"
    return verdict, reasons


def sample_hands(deck: list[dict], seed: int) -> tuple[list[dict], list[dict]]:
    """Une main en premier (5 cartes) et une main en second (6 cartes) tirées de mélanges distincts."""
    rng = np.random.default_rng(seed)
    first = [deck[i] for i in rng.permutation(len(deck))[:5]]
    second = [deck[i] for i in rng.permutation(len(deck))[:6]]
    return first, second


@dataclass
class Matchup:
    turn1: float          # en premier : ton tour passe leurs interruptions
    board_holds: float    # en premier : ... et tu gardes de quoi tenir leur tour
    comeback: float       # en second : ton tour passe leurs interruptions
    comeback_strong: float  # en second : ... et tu avais de quoi gêner leur tour 1
    opp_handtraps: float  # interruptions adverses par main (6 cartes)
    opp_breakers: float

    @property
    def index(self) -> float:
        """Indice de matchup : moyenne des deux scénarios « réussis », pas un taux de victoire."""
        return (self.board_holds + self.comeback_strong) / 2


OPP_FLAGS = ("handtrap", "breaker")


def _opp_draws(opp_deck: list[dict], n: int, rng) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    """Interruptions (6 cartes), destructions (6 cartes) et interruptions (5 cartes) de l'adversaire par main."""
    from .meta import opponent_flags
    m = np.array([[opponent_flags(c)[f] for f in OPP_FLAGS] for c in opp_deck], dtype=np.int8)
    d = m[np.argsort(rng.random((n, len(opp_deck))), axis=1)[:, :6]]
    return d[:, :6, 0].sum(axis=1), d[:, :6, 1].sum(axis=1), d[:, :5, 0].sum(axis=1)


def matchups(deck: list[dict], opp_decks: list[list[dict]], plan: P.Plan | None = None, n: int = 10_000,
             seed: int = 0) -> list[Matchup]:
    """Hypothèses (affichées dans l'IHM) :
    - chaque interruption adverse en main coupe une ligne de jeu : il faut un starter de plus qu'elles ;
    - en premier, l'adversaire a 6 cartes ; ton plateau tient si tu gardes au moins une protection,
      et au moins autant que ses cartes de destruction ;
    - en second, l'adversaire a 5 cartes et garde ses interruptions pour ton tour.
    Tes mains sont tirées une seule fois et confrontées à chaque adversaire."""
    rng = np.random.default_rng(seed)
    drawn = _matrix(deck, plan or P.detect(deck))[np.argsort(rng.random((n, len(deck))), axis=1)[:, :6]]
    first = {f: drawn[:, :5, i].sum(axis=1) for i, f in enumerate(FLAGS)}
    second = {f: drawn[:, :6, i].sum(axis=1) for i, f in enumerate(FLAGS)}
    playable_first, _ = _verdicts(first, True)
    playable_second, _ = _verdicts(second, False)
    out = []
    for k, opp in enumerate(opp_decks):
        ht6, br6, ht5 = _opp_draws(opp, n, np.random.default_rng((seed, k)))
        turn1 = playable_first & (first["starter"] >= ht6 + 1)
        holds = turn1 & (first["protect"] >= np.maximum(1, br6))
        comeback = playable_second & (second["starter"] >= ht5 + 1)
        strong = comeback & ((second["interrupt"] + second["breaker"]) >= 1)
        out.append(Matchup(turn1.mean(), holds.mean(), comeback.mean(), strong.mean(), ht6.mean(), br6.mean()))
    return out


def matchup(deck: list[dict], opp_deck: list[dict], plan: P.Plan | None = None, n: int = 10_000,
            seed: int = 0) -> Matchup:
    return matchups(deck, [opp_deck], plan, n, seed)[0]


def example_game(deck: list[dict], opp_deck: list[dict], seed: int) -> dict:
    """Une partie d'exemple : tes mains et celles de l'adversaire, en premier et en second."""
    rng = np.random.default_rng(seed)
    pick = lambda d, k: [d[i] for i in rng.permutation(len(d))[:k]]
    return {"first": (pick(deck, 5), pick(opp_deck, 6)), "second": (pick(deck, 6), pick(opp_deck, 5))}


def describe_game(my_hand: list[dict], opp_hand: list[dict], first: bool, plan: P.Plan) -> tuple[str, list[str]]:
    """Verdict d'une partie d'exemple, avec les mêmes règles que matchup()."""
    from .meta import opponent_flags
    counts = {f: sum(card_flags(c, plan)[f] for c in my_hand) for f in FLAGS}
    nm = lambda c: c["name_fr"] or c["name_en"]
    hts = [nm(c) for c in opp_hand if opponent_flags(c)["handtrap"]]
    brs = [nm(c) for c in opp_hand if opponent_flags(c)["breaker"]]
    playable, _ = (bool(v) for v in _verdicts(counts, first))
    reasons = [f"Tu as {counts['starter']} starter(s) ; l'adversaire tient {len(hts)} interruption(s)"
               + (f" : {', '.join(hts)}." if hts else ".")]
    passes = playable and counts["starter"] >= len(hts) + 1
    if not playable:
        reasons.append(f"Ta main ne permet pas de lancer le moteur ({plan.label}).")
    elif not passes:
        reasons.append("Chaque interruption coupe une ligne : il te manque un starter de secours.")
    if first:
        prot = counts["protect"]
        holds = passes and prot >= max(1, len(brs))
        if passes:
            reasons.append(f"Protections gardées pour son tour : {prot}"
                           + (f" ; il a {len(brs)} carte(s) de destruction ({', '.join(brs)})." if brs else "."))
        verdict = "Plateau qui tient" if holds else "Tour 1 réussi, plateau fragile" if passes else "Tour 1 coupé"
    else:
        disrupt = counts["interrupt"] + counts["breaker"]
        strong = passes and disrupt >= 1
        if passes:
            reasons.append("Tu avais de quoi gêner son tour 1." if disrupt else
                           "Rien pour gêner son tour 1 : tu affrontes son plateau complet.")
        verdict = "Retour fort" if strong else "Retour possible" if passes else "Retour coupé"
    return verdict, reasons


LEVERS = {
    "Retirer 1 carte hors moteur (deck plus fin)": ("offplan", None),
    "Remplacer 1 carte hors moteur par 1 starter du moteur": ("offplan", "starter"),
    "Remplacer 1 carte hors moteur par 1 interruption": ("offplan", "interrupt"),
    "Remplacer 1 carte hors moteur par 1 Piège du moteur": ("offplan", "trap"),
}


def _template(kind: str, plan: P.Plan) -> dict:
    """Carte fictive du rôle voulu ; starter et Piège appartiennent à l'archétype du moteur."""
    arch = plan.archetypes[0] if plan.archetypes else None
    return {
        "starter": {"frame_type": "effect", "archetype": arch, "name_en": "_starter",
                    "desc_en": "Add 1 card from your Deck to your hand."},
        "interrupt": {"frame_type": "effect", "archetype": None, "name_en": "Effect Veiler", "desc_en": ""},
        "trap": {"frame_type": "trap", "archetype": arch, "name_en": "_trap", "desc_en": ""},
    }[kind]


def levers(deck: list[dict], plan: P.Plan | None = None, n: int = N_HANDS, seed: int = 0) -> list[dict]:
    """Effet de modifications simples sur les KPI, pour montrer ce qui rapporte le plus."""
    plan = plan or P.detect(deck)
    base = simulate(deck, plan, n, seed)
    victim = next((i for i, c in enumerate(deck) if card_flags(c, plan)["offplan"]), None)
    out = []
    for label, (remove, add) in LEVERS.items():
        if victim is None or (add in ("starter", "trap") and not plan.archetypes):
            continue
        new = deck[:victim] + deck[victim + 1:]
        if add:
            new.append({"name_fr": None, **_template(add, plan)})
        k = simulate(new, plan, n, seed)
        out.append({"label": label, "kpis": k,
                    "delta_first": k.playable_first - base.playable_first,
                    "delta_strong_first": k.strong_first - base.strong_first,
                    "delta_second": k.strong_second - base.strong_second})
    return out

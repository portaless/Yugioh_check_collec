"""Générateur de build : le meilleur deck d'un moteur (archétype) avec ton stock, sous contrainte de banlist.

Algorithme
1. Réserve : les cartes de Main Deck possédées, plafonnées à min(stock, banlist, 3) exemplaires ; cartes forcées
   (minimum imposé) et exclues gérées par l'utilisateur.
2. Score d'un deck (simulation Monte-Carlo, cf. simulation.py) :
       poids_premier × mains fortes en premier
     + poids_second  × mains fortes en second
     + poids_méta    × indice moyen face aux archétypes du méta (pondéré par leur part)
     − poids_hors_moteur × cartes hors moteur par main / 5
   Les mélanges sont tirés une seule fois (« nombres aléatoires communs ») : deux decks voisins sont jugés sur
   exactement les mêmes tirages, ce qui rend la comparaison stable malgré l'aléa.
3. Départ glouton : les cartes les plus utiles au modèle (starters, interruptions, protections…).
4. Recuit simulé : à chaque itération, on retire 1 exemplaire et on en ajoute 1 autre. Une amélioration est
   toujours gardée ; une dégradation l'est parfois au début (température), pour sortir des optimums locaux.
5. Extra Deck : règles d'invocation (Extra du moteur, puis Extra génériques invocables), dans la limite du stock.
"""
import math
from collections import Counter
from dataclasses import dataclass, field

import numpy as np

from . import analysis as A
from . import plan as P
from . import simulation as S
from .db import is_extra

GREEDY_VALUE = {"starter": 3.0, "interrupt": 1.5, "protect": 1.5, "breaker": 1.5, "backrow": 0.3, "offplan": -2.0}


@dataclass
class Options:
    plan: P.Plan = P.Plan(("Mekk-Knight",))
    size: int = 40
    w_first: float = 1.0
    w_second: float = 1.0
    w_meta: float = 0.0
    w_offplan: float = 0.3
    locked: dict = field(default_factory=dict)   # id -> nombre minimal d'exemplaires
    excluded: set = field(default_factory=set)
    extra_size: int = 15                                  # Extra Deck : 0 à 15 cartes
    extra_locked: dict = field(default_factory=dict)      # id -> nombre minimal d'exemplaires
    extra_excluded: set = field(default_factory=set)
    iterations: int = 3000
    hands: int = 4000
    seed: int = 0


@dataclass
class Result:
    main: dict          # id -> quantité
    extra: dict
    score: float
    parts: dict         # composantes du score
    history: list       # meilleur score au fil des itérations


def pool(con, opts: Options) -> list[dict]:
    rows = con.execute("""SELECT c.*, o.owned FROM owned o JOIN cards c ON c.id = o.card_id""").fetchall()
    out = []
    for r in rows:
        c = dict(r)
        if is_extra(c["frame_type"]) or c["frame_type"] in ("token", "skill") or c["id"] in opts.excluded:
            continue
        c["max"] = min(c["owned"], A.BAN_LIMIT.get(c["ban_tcg"], 3), 3)
        c["min"] = min(opts.locked.get(c["id"], 0), c["max"])
        if c["max"] > 0:
            out.append(c)
    return out


class Evaluator:
    """Évalue des decks de taille fixe sur des tirages communs."""

    def __init__(self, cards: list[dict], opts: Options, opponents: list[tuple[list[dict], float]]):
        self.opts = opts
        self.flags = np.array([[S.card_flags(c, opts.plan)[f] for f in S.FLAGS] for c in cards], dtype=np.int16)
        rng = np.random.default_rng(opts.seed)
        self.order = np.argsort(rng.random((opts.hands, opts.size)), axis=1)[:, :6]
        self.idx = {f: i for i, f in enumerate(S.FLAGS)}
        # côté adversaire, les tirages ne dépendent pas de ton deck : calculés une fois
        from .meta import opponent_flags
        self.opps = []
        for deck, weight in opponents:
            m = np.array([[opponent_flags(c)[f] for f in S.OPP_FLAGS] for c in deck], dtype=np.int16)
            o = np.argsort(rng.random((opts.hands, len(deck))), axis=1)[:, :6]
            d = m[o]
            self.opps.append((d[:, :6, 0].sum(1), d[:, :6, 1].sum(1), d[:, :5, 0].sum(1), weight))

    def score(self, counts: np.ndarray) -> tuple[float, dict]:
        deck = np.repeat(self.flags, counts, axis=0)
        drawn = deck[self.order]
        first = {f: drawn[:, :5, i].sum(1) for f, i in self.idx.items()}
        second = {f: drawn[:, :6, i].sum(1) for f, i in self.idx.items()}
        pf, sf = S._verdicts(first, True)
        ps, ss = S._verdicts(second, False)
        parts = {"strong_first": sf.mean(), "strong_second": ss.mean(), "offplan": first["offplan"].mean()}
        meta = 0.0
        if self.opps:
            total = sum(w for *_, w in self.opps)
            for ht6, br6, ht5, w in self.opps:
                holds = pf & (first["starter"] >= ht6 + 1) & (first["protect"] >= np.maximum(1, br6))
                strong = ps & (second["starter"] >= ht5 + 1) & ((second["interrupt"] + second["breaker"]) >= 1)
                meta += w * (holds.mean() + strong.mean()) / 2
            meta /= total
        parts["meta"] = meta
        o = self.opts
        value = (o.w_first * parts["strong_first"] + o.w_second * parts["strong_second"]
                 + o.w_meta * meta - o.w_offplan * parts["offplan"] / 5)
        return value, parts


def greedy(cards: list[dict], size: int, plan: P.Plan) -> np.ndarray:
    counts = np.array([c["min"] for c in cards])
    if counts.sum() > size:
        raise ValueError(f"Les cartes forcées font déjà {counts.sum()} cartes, plus que les {size} du deck.")
    value = [sum(GREEDY_VALUE.get(f, 0) * v for f, v in S.card_flags(c, plan).items()) for c in cards]
    for i in sorted(range(len(cards)), key=lambda i: -value[i]):
        while counts[i] < cards[i]["max"] and counts.sum() < size:
            counts[i] += 1
    if counts.sum() < size:
        raise ValueError(f"Ton stock ne permet que {counts.sum()} cartes avec ces contraintes (taille demandée : {size}).")
    return counts


def optimize(con, opts: Options, opponents: list[tuple[list[dict], float]] = (), progress=None) -> Result:
    cards = pool(con, opts)
    ev = Evaluator(cards, opts, list(opponents))
    rng = np.random.default_rng(opts.seed + 1)
    current = greedy(cards, opts.size, opts.plan)
    cur_score, cur_parts = ev.score(current)
    best, best_score, best_parts = current.copy(), cur_score, cur_parts
    mins = np.array([c["min"] for c in cards])
    maxs = np.array([c["max"] for c in cards])
    history = []
    t0, t1 = 0.02, 0.0005
    for it in range(opts.iterations):
        temp = t0 * (t1 / t0) ** (it / max(1, opts.iterations - 1))
        removable = np.flatnonzero(current > mins)
        addable = np.flatnonzero(current < maxs)
        if not len(removable) or not len(addable):
            break
        i, j = rng.choice(removable), rng.choice(addable)
        if i == j:
            continue
        cand = current.copy()
        cand[i] -= 1
        cand[j] += 1
        s, parts = ev.score(cand)
        if s >= cur_score or rng.random() < math.exp((s - cur_score) / temp):
            current, cur_score, cur_parts = cand, s, parts
            if s > best_score:
                best, best_score, best_parts = cand.copy(), s, parts
        if it % 50 == 0:
            history.append(best_score)
            if progress:
                progress(it / opts.iterations)
    main = {cards[i]["id"]: int(q) for i, q in enumerate(best) if q}
    return Result(main, build_extra(con, main, opts), best_score, best_parts, history)


def build_extra(con, main: dict, opts: Options | None = None) -> dict:
    """Extra Deck par règles : cartes forcées d'abord, puis Extra du moteur, puis Extra génériques
    (cf. analysis.GENERIC_EXTRA) réellement invocables avec le Main Deck : Synchro s'il contient un Syntoniseur,
    Xyz s'il a au moins 4 monstres du bon niveau. Dans la limite du stock, de la banlist et de la taille choisie
    (15 au plus). Les cartes exclues ne sont jamais prises."""
    opts = opts or Options()
    size = max(0, min(opts.extra_size, 15))
    rows = [dict(r) for r in con.execute("SELECT c.*, o.owned FROM owned o JOIN cards c ON c.id = o.card_id")]
    by_id = {c["id"]: c for c in rows}
    in_main = [by_id[i] for i in main if i in by_id]
    has_tuner = any("Tuner" in (c["type"] or "") for c in in_main)
    levels = Counter()
    for c in in_main:
        if c["level"] and c["frame_type"] not in ("spell", "trap"):
            levels[c["level"]] += main[c["id"]]
    ranked = []
    for c in rows:
        if not is_extra(c["frame_type"]) or c["id"] in opts.extra_excluded:
            continue
        limit = min(c["owned"], A.BAN_LIMIT.get(c["ban_tcg"], 3), 3)
        if c["id"] in opts.extra_locked:
            prio = -1
        elif opts.plan.engine(c):
            prio = 0
        elif c["name_en"] in A.GENERIC_EXTRA:
            if c["frame_type"].startswith("synchro") and not has_tuner:
                continue
            if c["frame_type"].startswith("xyz") and levels[c["level"]] < 4:
                continue
            prio = 1
        else:
            continue
        ranked.append((prio, c["name_en"], c["id"], limit))
    extra, total = {}, 0
    for prio, _, cid, limit in sorted(ranked):
        # forcées : le nombre demandé ; génériques : 2 au plus, la place va d'abord à la variété
        wanted = opts.extra_locked.get(cid, 1) if prio == -1 else 3 if prio == 0 else 2
        take = min(limit, size - total, wanted)
        if take > 0:
            extra[cid] = take
            total += take
    return extra

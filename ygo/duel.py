"""Duel simulé entre deux decks, joué sur un plateau et raconté étape par étape (page Duel).

Mêmes règles que simulation.py, mises en scène : la simulation ne joue pas les combos carte par carte, elle
décide qui passe à partir des rôles des cartes (plan.py).
- Tour 1 : le premier joueur (5 cartes, pas de pioche) invoque ses starters un par un. L'adversaire répond avec
  ses interruptions depuis la main : chacune coupe la ligne d'un starter. Le premier starter qui passe déroule le
  moteur (cartes du moteur sorties du deck, un monstre de l'Extra Deck), puis le joueur pose ses Magies/Pièges.
- Tour 2 : le second joueur pioche (6 cartes), détruit ce qu'il peut avec ses cartes de destruction, puis lance
  ses starters. Chaque Piège posé qui a survécu et chaque interruption restante en main coupe une ligne.
- Le duel s'arrête après le tour 2 : on sait alors si le plateau du premier a tenu ou si le second a fait son
  retour. Pas de points de vie : ce modèle mesure la régularité des mains, pas le résultat final du duel.
"""
from dataclasses import dataclass, field

import numpy as np

from . import plan as P

ZONES = 5


@dataclass
class Card:
    uid: int
    data: dict
    flags: dict
    down: bool = False   # posée face cachée
    off: bool = False    # effet annulé

    @property
    def name(self) -> str:
        return self.data["name_fr"] or self.data["name_en"]


@dataclass
class Side:
    name: str
    plan: P.Plan
    deck: list[Card]
    extra: list[Card]
    hand: list[Card] = field(default_factory=list)
    monsters: list[Card] = field(default_factory=list)
    backrow: list[Card] = field(default_factory=list)
    gy: list[Card] = field(default_factory=list)

    def draw(self, n: int = 1) -> list[Card]:
        drawn, self.deck = self.deck[:n], self.deck[n:]
        self.hand += drawn
        return drawn

    def take(self, card: Card) -> Card:
        for zone in (self.hand, self.monsters, self.backrow, self.deck, self.extra):
            if card in zone:
                zone.remove(card)
        return card

    def view(self) -> dict:
        v = lambda c: {"uid": c.uid, "id": c.data["id"], "name": c.name, "down": c.down, "off": c.off}
        return {"name": self.name, "hand": [v(c) for c in self.hand], "monsters": [v(c) for c in self.monsters],
                "backrow": [v(c) for c in self.backrow], "gy": [v(c) for c in self.gy], "deck": len(self.deck),
                "extra": len(self.extra)}


class Duel:
    def __init__(self, deck_a: list[dict], extra_a: list[dict], deck_b: list[dict], extra_b: list[dict],
                 names: tuple[str, str], plans: tuple[P.Plan, P.Plan], seed: int, a_first: bool):
        rng = np.random.default_rng(seed)
        uid = iter(range(10_000))
        sides = []
        for deck, extra, name, plan in ((deck_a, extra_a, names[0], plans[0]), (deck_b, extra_b, names[1], plans[1])):
            main = [Card(next(uid), deck[i], P.flags(deck[i], plan)) for i in rng.permutation(len(deck))]
            ext = [Card(next(uid), c, {}) for c in extra]
            sides.append(Side(name, plan, main, ext))
        self.a, self.b = sides
        self.first, self.second = (self.a, self.b) if a_first else (self.b, self.a)
        self.steps: list[dict] = []
        self.turn, self.phase = 0, ""

    # ------------------------------------------------------------------ récit
    def log(self, actor: Side | None, text: str, hot: list[Card] = (), tone: str = ""):
        self.steps.append({"turn": self.turn, "phase": self.phase, "actor": actor.name if actor else "",
                           "text": text, "tone": tone, "hot": [c.uid for c in hot],
                           "a": self.a.view(), "b": self.b.view()})

    # ------------------------------------------------------------------ actions
    def summon(self, side: Side, card: Card) -> bool:
        if len(side.monsters) >= ZONES:
            return False
        side.monsters.append(side.take(card))
        return True

    def set_card(self, side: Side, card: Card) -> bool:
        if len(side.backrow) >= ZONES:
            return False
        card.down = True
        side.backrow.append(side.take(card))
        return True

    def to_gy(self, side: Side, card: Card):
        card.down = False
        side.gy.append(side.take(card))

    def interrupt(self, side: Side, foe: Side, starter: Card) -> bool:
        """L'adversaire coupe la ligne du starter : Piège posé d'abord, sinon interruption depuis la main."""
        set_trap = next((c for c in foe.backrow if c.flags.get("protect")), None)
        if set_trap:
            set_trap.down = False
            self.log(foe, f"{foe.name} active « {set_trap.name} », posée face cachée : la ligne de "
                          f"« {starter.name} » est coupée.", [set_trap, starter], "cut")
            starter.off = True
            self.to_gy(foe, set_trap)
            return True
        hand_trap = next((c for c in foe.hand if c.flags.get("interrupt")), None)
        if hand_trap:
            self.to_gy(foe, hand_trap)
            starter.off = True
            self.log(foe, f"{foe.name} défausse « {hand_trap.name} » depuis sa main : la ligne de "
                          f"« {starter.name} » est coupée.", [hand_trap, starter], "cut")
            return True
        return False

    def deploy(self, side: Side, starter: Card):
        """Le starter passe : cartes du moteur sorties du deck, puis un monstre de l'Extra Deck."""
        shown = []
        for c in [c for c in side.hand if c.flags.get("engine") and c.data["frame_type"] not in ("spell", "trap")]:
            if self.summon(side, c):
                shown.append(c)
        pulled = [c for c in side.deck if c.flags.get("engine") and c.data["frame_type"] not in ("spell", "trap")][:2]
        for c in pulled:
            self.summon(side, c)
        shown += pulled
        text = f"« {starter.name} » résout son effet : {side.name} déroule son moteur ({side.plan.label})"
        text += (" et sort " + ", ".join(f"« {c.name} »" for c in pulled) + " du deck.") if pulled else "."
        self.log(side, text, [starter] + shown, "good")
        boss = next((c for c in side.extra if side.plan.engine(c.data)), None) or (side.extra[0] if side.extra else None)
        if boss and len(side.monsters) >= 2:
            # matériels : deux monstres du terrain, le starter en premier s'il en est un
            material = sorted(side.monsters, key=lambda c: c is not starter)[:2]
            for c in material:
                self.to_gy(side, c)
            self.summon(side, boss)
            self.log(side, f"{side.name} invoque « {boss.name} » depuis l'Extra Deck, avec "
                           + " et ".join(f"« {c.name} »" for c in material) + " comme matériels.", [boss], "good")

    def play_starters(self, side: Side, foe: Side, first: bool) -> bool:
        """Starters joués un par un jusqu'à ce qu'un passe. Renvoie True si le moteur a démarré."""
        starters = [c for c in side.hand if c.flags.get("starter")]
        if not starters:
            self.log(side, f"Aucun starter en main : {side.name} ne peut pas lancer son moteur.", [], "cut")
            return False
        if first and not any(c.flags.get("free") for c in starters):
            opener = next((c for c in side.hand if c.flags.get("backrow")), None)
            if opener is None and len(starters) < 2:
                self.log(side, f"« {starters[0].name} » a besoin d'une carte dans sa colonne, et le terrain est "
                               "vide : le starter reste bloqué en main.", starters[:1], "cut")
                return False
            if opener:
                self.set_card(side, opener)
                self.log(side, f"{side.name} pose « {opener.name} » face cachée pour ouvrir une colonne.", [opener])
        for starter in starters:
            spell = starter.data["frame_type"] in ("spell", "trap")
            if spell and len(side.backrow) < ZONES:
                side.backrow.append(side.take(starter))  # Magie activée face recto
            elif spell or not self.summon(side, starter):
                continue
            self.log(side, f"{side.name} joue « {starter.name} » (starter).", [starter])
            if self.interrupt(side, foe, starter):
                continue
            self.deploy(side, starter)
            return True
        self.log(side, f"Toutes les lignes de {side.name} ont été coupées.", [], "cut")
        return False

    def set_backrow(self, side: Side):
        placed = [c for c in list(side.hand) if c.flags.get("trap") and self.set_card(side, c)]
        if placed:
            self.log(side, f"{side.name} pose {len(placed)} carte(s) face cachée pour le tour adverse.", placed)

    def break_board(self, side: Side, foe: Side):
        for breaker in [c for c in side.hand if c.flags.get("breaker")]:
            targets = [c for c in foe.backrow if c.down] or foe.monsters
            if not targets:
                break
            self.to_gy(side, breaker)
            hit = targets[0]
            self.to_gy(foe, hit)
            self.log(side, f"{side.name} active « {breaker.name} » et détruit « {hit.name} ».", [breaker, hit], "cut")

    # ------------------------------------------------------------------ déroulé
    def run(self) -> dict:
        first, second = self.first, self.second
        first.draw(5)
        second.draw(5)
        self.phase = "Préparation"
        self.log(None, f"Pile ou face : {first.name} commence. Chacun pioche 5 cartes.")

        self.turn, self.phase = 1, "Main Phase"
        board = self.play_starters(first, second, True)
        self.set_backrow(first)
        self.phase = "End Phase"
        self.log(first, f"Fin du tour 1 : {len(first.monsters)} monstre(s) et {len(first.backrow)} carte(s) posée(s).")

        self.turn, self.phase = 2, "Draw Phase"
        drawn = second.draw(1)
        self.log(second, f"{second.name} pioche" + (f" « {drawn[0].name} »." if drawn else " : deck vide."), drawn)
        self.phase = "Main Phase"
        self.break_board(second, first)
        comeback = self.play_starters(second, first, False)
        self.phase = "Bilan"
        if board and not comeback:
            verdict, winner = f"Le plateau de {first.name} a tenu : avantage {first.name}.", first
        elif comeback and board:
            verdict, winner = f"{second.name} a passé le plateau adverse : avantage {second.name}.", second
        elif comeback:
            verdict, winner = f"{second.name} profite d'un tour 1 coupé : avantage {second.name}.", second
        else:
            verdict, winner = "Aucun des deux moteurs n'a démarré : duel au point mort.", None
        self.log(winner, verdict, [], "good" if winner else "")
        return {"steps": self.steps, "winner": winner.name if winner else None, "verdict": verdict}


def play(cards_a: list[dict], cards_b: list[dict], names: tuple[str, str], plans: tuple[P.Plan, P.Plan],
         seed: int, a_first: bool) -> dict:
    """cards_* : cartes d'un deck avec zone et quantité (analysis.deck_cards)."""
    split = lambda cards, extra: [c for c in cards if (c["zone"] == "extra") == extra for _ in range(c["quantity"])]
    return Duel(split(cards_a, False), split(cards_a, True), split(cards_b, False), split(cards_b, True),
                names, plans, seed, a_first).run()

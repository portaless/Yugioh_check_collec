"""Plan de jeu d'un deck : son moteur (un ou plusieurs archétypes) et le rôle de chaque carte vis-à-vis de lui.

Les rôles se déduisent du texte anglais des cartes, pour fonctionner avec n'importe quel archétype :
- moteur      carte de l'archétype, ou qui le nomme entre guillemets dans son texte (soutien) ;
- starter     carte du moteur qui lance le jeu seule : elle s'invoque elle-même depuis la main, ou ajoute,
              invoque ou envoie au cimetière une carte depuis le deck ;
- colonne     starter qui ne s'invoque que si 2 cartes sont dans la même colonne (Mekk-Chevalier) : en premier,
              terrain adverse vide, il faut poser soi-même une autre carte ;
- interruption, destruction, protection : cartes génériques (listes + détection par le texte, cf. meta.py).
Le moteur d'un deck se choisit dans le Constructeur ; à défaut, c'est l'archétype le plus présent.
"""
import re
from collections import Counter
from dataclasses import dataclass
from functools import lru_cache

from . import analysis as A
from .db import is_extra

SELF_SUMMON = re.compile(r"special summon this card \(from your hand\)", re.IGNORECASE)
FROM_DECK = re.compile(r"\b(add|special summon|send)\b[^.]{0,120}\bfrom your (hand or )?deck\b", re.IGNORECASE)
COLUMN = re.compile(r"in the same column", re.IGNORECASE)


@dataclass(frozen=True)
class Plan:
    archetypes: tuple[str, ...] = ()

    @property
    def label(self) -> str:
        return " + ".join(self.archetypes) if self.archetypes else "aucun moteur"

    def engine(self, c: dict) -> bool:
        """Carte de l'archétype, ou soutien qui le nomme (« "Mekk-Knight" monster »)."""
        if c.get("archetype") in self.archetypes:
            return True
        desc = c.get("desc_en") or ""
        return any(f'"{a}' in desc for a in self.archetypes)


NONE = Plan()


def detect(cards: list[dict]) -> Plan:
    """Archétype le plus présent dans le Main Deck (en exemplaires), staples génériques exclus."""
    counts = Counter()
    for c in cards:
        if c.get("zone", "main") == "main" and c.get("archetype") and not _staple(c):
            counts[c["archetype"]] += c.get("quantity", 1)
    return Plan((counts.most_common(1)[0][0],)) if counts else NONE


def of_deck(con, deck_id: int, cards: list[dict]) -> Plan:
    """Moteur choisi pour le deck dans le Constructeur, sinon détecté."""
    row = con.execute("SELECT plan FROM decks WHERE id = ?", (deck_id,)).fetchone()
    return Plan(tuple(row["plan"].split("|"))) if row and row["plan"] else detect(cards)


def archetypes_in_stock(con, min_cards: int = 3) -> list[tuple[str, int]]:
    """Archétypes dont tu possèdes au moins min_cards cartes de Main Deck, du plus fourni au moins fourni."""
    rows = con.execute("""SELECT c.archetype, SUM(o.owned) AS n FROM owned o JOIN cards c ON c.id = o.card_id
                          WHERE c.archetype IS NOT NULL GROUP BY c.archetype HAVING n >= ? ORDER BY n DESC""",
                       (min_cards,)).fetchall()
    return [(r["archetype"], r["n"]) for r in rows]


def _staple(c: dict) -> bool:
    name = c["name_en"]
    return name in A.HANDTRAPS or name in A.BOARD_BREAKERS or name in A.PROTECTION_TRAPS


def flags(c: dict, plan: Plan) -> dict:
    return _flags(plan, c["name_en"], c["frame_type"], c.get("archetype"), c.get("desc_en") or "")


@lru_cache(maxsize=None)
def _flags(plan: Plan, name: str, frame: str, archetype: str | None, desc: str) -> dict:
    from .meta import opponent_flags  # détection des interruptions par le texte, partagée avec l'adversaire
    card = {"name_en": name, "frame_type": frame, "archetype": archetype, "desc_en": desc}
    engine = plan.engine(card) and not is_extra(frame)
    spell_trap = frame in ("spell", "trap")
    starter = engine and (bool(SELF_SUMMON.search(desc)) or bool(FROM_DECK.search(desc)))
    column = starter and not spell_trap and bool(COLUMN.search(desc))
    interrupt = name in A.HANDTRAPS or (not engine and opponent_flags(card)["handtrap"])
    protect_trap = frame == "trap" and (engine or name in A.PROTECTION_TRAPS)
    breaker = name in A.BOARD_BREAKERS or opponent_flags(card)["breaker"]
    return {
        "engine": engine,
        "starter": starter,
        "free": starter and not column,      # starter utilisable sur terrain vide
        "column": column,
        "backrow": spell_trap,
        "trap": protect_trap,
        "interrupt": interrupt,
        # protection gardée après ton tour en premier ; les Mulcharmy exigent de ne contrôler aucune carte
        "protect": protect_trap or (interrupt and not name.startswith("Mulcharmy")),
        "breaker": breaker,
        "offplan": not (engine or interrupt or protect_trap or breaker),
    }


# Rôles affichés dans l'IHM
STARTER = "Starter du moteur"
ENGINE = "Moteur (soutien, extender)"
EXTRA_ENGINE = "Extra du moteur"
INTERRUPT = A.INTERRUPT
BREAKER = A.BREAKER
PROTECTION = "Protection (Piège)"
EXTRA_GENERIC = A.EXTRA_GENERIC
OFFPLAN = "Hors moteur"

ROLE_HELP = {
    STARTER: "Lance le jeu seule : s'invoque depuis la main, ou va chercher une carte dans le deck.",
    ENGINE: "Carte de l'archétype (ou qui le soutient) qui prolonge le jeu une fois lancé.",
    EXTRA_ENGINE: "Monstres d'Extra Deck de l'archétype.",
    INTERRUPT: A.ROLE_HELP[A.INTERRUPT],
    BREAKER: A.ROLE_HELP[A.BREAKER],
    PROTECTION: "Pièges qui protègent ton plateau pendant le tour adverse.",
    EXTRA_GENERIC: A.ROLE_HELP[A.EXTRA_GENERIC],
    OFFPLAN: "Ne sert ni le moteur, ni à interrompre, protéger ou détruire.",
}


def role(c: dict, plan: Plan) -> str:
    if is_extra(c["frame_type"]):
        return EXTRA_ENGINE if plan.engine(c) else EXTRA_GENERIC
    f = flags(c, plan)
    if f["starter"]:
        return STARTER
    if f["engine"]:
        return ENGINE
    if f["interrupt"]:
        return INTERRUPT
    if f["breaker"]:
        return BREAKER
    if f["trap"]:
        return PROTECTION
    return OFFPLAN

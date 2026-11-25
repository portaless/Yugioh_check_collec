"""Duel jouable contre un deck méta : données envoyées au plateau (ygo/ui/duel_meta.js).

Les règles et les effets sont appliqués par le moteur YGOPro (engine/, données dans ygo/engine_data.py) ; on ne
lui donne que les codes des cartes. L'appli ajoute ce que le moteur n'a pas : noms et textes français du catalogue
et illustrations.
"""


def from_deck(cards: list[dict], zone: str) -> list[dict]:
    """Cartes d'un deck de l'appli (analysis.deck_cards) : un exemplaire par entrée."""
    return [c for c in cards if c["zone"] == zone for _ in range(c["quantity"])]


def payload(me: tuple[list[dict], list[dict]], bot: tuple[list[dict], list[dict]], imgs: dict[int, str]) -> dict:
    """me / bot : (Main Deck, Extra Deck), un exemplaire par entrée."""
    every = [c for side in (me, bot) for part in side for c in part]
    return {
        "me": {"main": [c["id"] for c in me[0]], "extra": [c["id"] for c in me[1]]},
        "bot": {"main": [c["id"] for c in bot[0]], "extra": [c["id"] for c in bot[1]]},
        "names": {c["id"]: c["name_fr"] or c["name_en"] for c in every},
        "texts": {c["id"]: c["desc_fr"] or c["desc_en"] or "" for c in every},
        "imgs": {i: src for i, src in imgs.items() if src},
    }

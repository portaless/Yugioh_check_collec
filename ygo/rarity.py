"""Raretés : noms anglais de référence (ceux de YGOPRODeck et CardTrader), libellés français, ordre et effet visuel."""
import re

# de la plus commune à la plus rare : sert à attribuer les produits Cardmarket quand une extension
# contient plusieurs raretés d'une même carte (Cardmarket ne donne pas la rareté dans ses fichiers)
RANK = [
    "Common", "Short Print", "Super Short Print", "Rare", "Super Rare", "Ultra Rare", "Gold Rare",
    "Premium Gold Rare", "Secret Rare", "Prismatic Secret Rare", "Platinum Secret Rare", "Ultimate Rare",
    "Ghost Rare", "Collector's Rare", "Starlight Rare", "Quarter Century Secret Rare",
]

FR = {
    "Common": "Commune", "Short Print": "Short Print", "Super Short Print": "Super Short Print", "Rare": "Rare",
    "Super Rare": "Super Rare", "Ultra Rare": "Ultra Rare", "Gold Rare": "Gold Rare",
    "Premium Gold Rare": "Premium Gold Rare", "Secret Rare": "Secret Rare",
    "Prismatic Secret Rare": "Prismatic Secret Rare", "Platinum Secret Rare": "Platinum Secret Rare",
    "Ultimate Rare": "Ultimate Rare", "Ghost Rare": "Ghost Rare", "Collector's Rare": "Collector's Rare",
    "Starlight Rare": "Starlight Rare", "Quarter Century Secret Rare": "Quarter Century Secret Rare",
}

# écritures acceptées dans l'Excel (minuscules, sans accents ni ponctuation) -> nom de référence
ALIASES = {
    "c": "Common", "commune": "Common", "commun": "Common", "common": "Common", "normale": "Common", "normal": "Common",
    "sp": "Short Print", "ssp": "Super Short Print",
    "r": "Rare", "rare": "Rare",
    "sr": "Super Rare", "super": "Super Rare", "super rare": "Super Rare",
    "ur": "Ultra Rare", "ultra": "Ultra Rare", "ultra rare": "Ultra Rare",
    "gur": "Gold Rare", "gold": "Gold Rare", "gold rare": "Gold Rare", "pgr": "Premium Gold Rare",
    "scr": "Secret Rare", "secret": "Secret Rare", "secrete": "Secret Rare", "secret rare": "Secret Rare",
    "pscr": "Prismatic Secret Rare", "plscr": "Platinum Secret Rare",
    "utr": "Ultimate Rare", "ultimate": "Ultimate Rare", "ultimate rare": "Ultimate Rare",
    "gr": "Ghost Rare", "ghost": "Ghost Rare", "ghost rare": "Ghost Rare",
    "cr": "Collector's Rare", "collector": "Collector's Rare", "collectors rare": "Collector's Rare",
    "collector rare": "Collector's Rare",
    "str": "Starlight Rare", "starlight": "Starlight Rare", "starlight rare": "Starlight Rare",
    "qcscr": "Quarter Century Secret Rare", "qcsr": "Quarter Century Secret Rare",
    "quarter century": "Quarter Century Secret Rare", "quarter century secret rare": "Quarter Century Secret Rare",
}

# effet animé de la fiche agrandie : chaque rareté prend l'effet de la famille qui lui ressemble
EFFECT = {
    "Common": "common", "Short Print": "common", "Super Short Print": "common", "Rare": "rare",
    "Super Rare": "super", "Ultra Rare": "ultra", "Gold Rare": "gold", "Premium Gold Rare": "gold",
    "Secret Rare": "secret", "Prismatic Secret Rare": "secret", "Platinum Secret Rare": "secret",
    "Ultimate Rare": "ultimate", "Ghost Rare": "ghost", "Collector's Rare": "starlight",
    "Starlight Rare": "starlight", "Quarter Century Secret Rare": "starlight",
}


def _key(text: str) -> str:
    text = text.lower().replace("é", "e").replace("è", "e").replace("’", "'")
    return re.sub(r"[^a-z ]+", "", text).strip()


def canonical(text) -> str | None:
    """Nom de référence d'une rareté écrite librement (« Commune », « UR », « secret rare »…)."""
    if text is None or not str(text).strip():
        return None
    raw = str(text).strip()
    for name in RANK:
        if raw.lower() == name.lower():
            return name
    key = _key(raw)
    return ALIASES.get(key) or ALIASES.get(key.replace(" ", "")) or raw


def rank(rarity: str) -> int:
    return RANK.index(rarity) if rarity in RANK else len(RANK)


def label(rarity: str | None) -> str:
    return FR.get(rarity, rarity or "")


def effect(rarity: str | None) -> str:
    return EFFECT.get(rarity, "common")

"""Analyse de deck : légalité, stock, rôles des cartes, probabilités d'ouverture, suggestions."""
from math import comb

from .db import is_extra

BAN_LIMIT = {"Forbidden": 0, "Banned": 0, "Limited": 1, "Semi-Limited": 2}

# Cartes génériques classées par rôle (noms anglais, pour ne pas dépendre de la traduction)
HANDTRAPS = {
    "Ash Blossom & Joyous Spring", "Effect Veiler", "Infinite Impermanence", "Nibiru, the Primal Being",
    "Droll & Lock Bird", "Mulcharmy Fuwalos", "Mulcharmy Meowls", "Mulcharmy Purulia",
}
BOARD_BREAKERS = {
    "Raigeki", "Harpie's Feather Duster", "Lava Golem", "Change of Heart", "Triple Tactics Talent",
    "Triple Tactics Thrust", "Dark Ruler No More", "Evenly Matched",
}
GENERIC_EXTRA = {
    "Accesscode Talker", "S:P Little Knight", "I:P Masquerena", "Chaos Angel", "Time Thief Redoer",
    "Psychic End Punisher", "Hyper Psychic Blaster", "Outer Entity Nyarla",
}


def role(card: dict) -> str:
    name, arch, frame = card["name_en"], card["archetype"], card["frame_type"]
    if arch == "Mekk-Knight" and not is_extra(frame) and frame not in ("spell", "trap"):
        return "Moteur Mekk (monstre)"
    if arch == "Mekk-Knight":
        return "Héritage du Monde (magie/piège)" if frame in ("spell", "trap") else "Extra Mekk"
    if name in HANDTRAPS:
        return "Handtrap"
    if name in BOARD_BREAKERS:
        return "Board breaker"
    if is_extra(frame):
        return "Extra générique"
    if card["race"] == "Psychic" or name in ("Emergency Teleport", "Psychic Feel Zone", "Telepathic Power",
                                              "Psychic Overload", "Assault Mode Activate"):
        return "Moteur Psychique"
    return "Autre"


def deck_cards(con, deck_id: int) -> list[dict]:
    return [dict(r) for r in con.execute(
        """SELECT c.*, dc.zone, dc.quantity, COALESCE(o.owned, 0) AS owned
           FROM deck_cards dc JOIN cards c ON c.id = dc.card_id
           LEFT JOIN owned o ON o.card_id = c.id
           WHERE dc.deck_id = ? ORDER BY dc.zone, c.frame_type, c.level DESC, c.name_fr""", (deck_id,))]


def check(cards: list[dict], stock_check: bool = True) -> list[tuple[str, str]]:
    """Liste de (niveau, message) : 'error' rend le deck illégal, 'warning' est un conseil."""
    issues = []
    main = sum(c["quantity"] for c in cards if c["zone"] == "main")
    extra = sum(c["quantity"] for c in cards if c["zone"] == "extra")
    side = sum(c["quantity"] for c in cards if c["zone"] == "side")
    if not 40 <= main <= 60:
        issues.append(("error", f"Main deck : {main} cartes (doit être entre 40 et 60)."))
    elif main > 42:
        issues.append(("warning", f"Main deck : {main} cartes. Au-delà de 40-42, tu pioches moins souvent tes meilleures cartes."))
    if extra > 15:
        issues.append(("error", f"Extra deck : {extra} cartes (max 15)."))
    if side > 15:
        issues.append(("error", f"Side deck : {side} cartes (max 15)."))

    totals = {}
    for c in cards:
        totals.setdefault(c["id"], [c, 0])[1] += c["quantity"]
    for c, qty in totals.values():
        name = c["name_fr"] or c["name_en"]
        limit = BAN_LIMIT.get(c["ban_tcg"], 3)
        if qty > limit:
            label = "interdite" if limit == 0 else f"limitée à {limit}"
            issues.append(("error", f"{name} : {qty} exemplaire(s), carte {label} (banlist TCG)."))
        if stock_check and qty > c["owned"]:
            issues.append(("warning", f"{name} : {qty} dans le deck mais seulement {c['owned']} en stock."))
    return issues


def p_at_least(hits: int, deck_size: int, hand: int = 5, k: int = 1) -> float:
    """Probabilité hypergéométrique de piocher au moins k cartes parmi 'hits' dans une main de 'hand'."""
    if deck_size <= 0 or hits <= 0:
        return 0.0
    miss = sum(comb(hits, i) * comb(deck_size - hits, hand - i) for i in range(k))
    return 1 - miss / comb(deck_size, hand)


def suggestions(con, deck_id: int) -> list[dict]:
    """Cartes du stock absentes du deck qui ont leur place dans un deck Mekk-Chevalier."""
    in_deck = {r["card_id"] for r in con.execute("SELECT card_id FROM deck_cards WHERE deck_id = ?", (deck_id,))}
    out = []
    for r in con.execute("""SELECT c.*, o.owned FROM owned o JOIN cards c ON c.id = o.card_id"""):
        c = dict(r)
        if c["id"] in in_deck or BAN_LIMIT.get(c["ban_tcg"], 3) == 0:
            continue
        if c["archetype"] == "Mekk-Knight":
            why = "Carte de l'archétype"
        elif c["name_en"] in HANDTRAPS:
            why = "Handtrap générique, jouable dans tous les decks"
        elif c["name_en"] in BOARD_BREAKERS:
            why = "Board breaker, utile en jouant second"
        elif c["name_en"] in GENERIC_EXTRA:
            why = "Extra générique accessible avec des monstres Mekk"
        else:
            continue
        c["why"] = why
        out.append(c)
    return sorted(out, key=lambda c: c["why"])


def export_ydk(cards: list[dict], title: str) -> str:
    lines = [f"#created by yugioh-db ({title})", "#main"]
    for zone, header in (("main", None), ("extra", "#extra"), ("side", "!side")):
        if header:
            lines.append(header)
        for c in cards:
            if c["zone"] == zone:
                lines += [str(c["id"])] * c["quantity"]
    return "\n".join(lines) + "\n"

"""Analyse de deck : légalité, stock, rôles des cartes, probabilités d'ouverture, suggestions."""
from math import comb


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
# Pièges qui protègent réellement un plateau (en plus des Pièges « Héritage du Monde » et des interruptions)
PROTECTION_TRAPS = {
    "Solemn Judgment", "Solemn Strike", "Solemn Warning", "Mirror Force", "Torrential Tribute",
    "Dimensional Barrier", "Infinite Impermanence", "Evenly Matched", "Dogmatika Punishment",
}
GENERIC_EXTRA = {
    "Accesscode Talker", "S:P Little Knight", "I:P Masquerena", "Chaos Angel", "Time Thief Redoer",
    "Psychic End Punisher", "Hyper Psychic Blaster", "Outer Entity Nyarla",
}


# Rôles génériques ; ceux liés au moteur du deck (starter, soutien…) sont dans plan.py
INTERRUPT = "Interruption depuis la main"
BREAKER = "Destruction du terrain adverse"
EXTRA_GENERIC = "Extra générique"

ROLE_HELP = {
    INTERRUPT: "Cartes jouées depuis la main pendant le tour adverse pour couper son combo (« handtraps »).",
    BREAKER: "Retirent les cartes adverses : indispensables quand tu joues en second.",
    EXTRA_GENERIC: "Monstres d'Extra Deck invocables avec n'importe quels monstres.",
}


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
        issues.append(("error", f"Main Deck : {main} cartes. Le règlement impose entre 40 et 60."))
    elif main > 42:
        issues.append(("warning", f"Main Deck : {main} cartes. Au-delà de 40-42, tu pioches moins souvent tes meilleures cartes."))
    if extra > 15:
        issues.append(("error", f"Extra Deck : {extra} cartes. Le maximum est 15."))
    if side > 15:
        issues.append(("error", f"Side Deck : {side} cartes. Le maximum est 15."))

    totals = {}
    for c in cards:
        totals.setdefault(c["id"], [c, 0])[1] += c["quantity"]
    for c, qty in totals.values():
        name = c["name_fr"] or c["name_en"]
        limit = BAN_LIMIT.get(c["ban_tcg"], 3)
        if qty > limit:
            label = "interdite" if limit == 0 else f"limitée à {limit} exemplaire(s)"
            issues.append(("error", f"{name} : {qty} exemplaire(s) alors que la carte est {label} (banlist TCG)."))
        if stock_check and qty > c["owned"]:
            issues.append(("warning", f"{name} : {qty} dans le deck mais tu n'en possèdes que {c['owned']}."))
    return issues


def p_at_least(hits: int, deck_size: int, hand: int = 5, k: int = 1) -> float:
    """Probabilité hypergéométrique de piocher au moins k cartes parmi 'hits' dans une main de 'hand'."""
    if deck_size <= 0 or hits <= 0:
        return 0.0
    miss = sum(comb(hits, i) * comb(deck_size - hits, hand - i) for i in range(k))
    return 1 - miss / comb(deck_size, hand)


def suggestions(con, deck_id: int, plan) -> list[dict]:
    """Cartes du stock absentes du deck qui ont leur place dans son moteur (plan.Plan), ou partout."""
    in_deck = {r["card_id"] for r in con.execute("SELECT card_id FROM deck_cards WHERE deck_id = ?", (deck_id,))}
    out = []
    for r in con.execute("""SELECT c.*, o.owned FROM owned o JOIN cards c ON c.id = o.card_id"""):
        c = dict(r)
        if c["id"] in in_deck or BAN_LIMIT.get(c["ban_tcg"], 3) == 0:
            continue
        if plan.engine(c):
            why = f"Carte du moteur ({plan.label})"
        elif c["name_en"] in HANDTRAPS:
            why = "Interruption depuis la main, jouable dans tous les decks"
        elif c["name_en"] in BOARD_BREAKERS:
            why = "Détruit le terrain adverse, utile en jouant second"
        elif c["name_en"] in GENERIC_EXTRA:
            why = "Extra Deck générique"
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

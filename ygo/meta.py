"""Decks du méta (« Tournament Meta Decks » de YGOPRODeck) et classement de leurs cartes.

Usage :  python -m ygo.meta   (télécharge les decks récents dans data/meta_decks.json)
"""
import json
import re
import time
from collections import Counter
from datetime import date
from functools import lru_cache

import requests

from .db import DATA_DIR, connect

API = "https://ygoprodeck.com/api/decks/getDecks.php"
META_PATH = DATA_DIR / "meta_decks.json"
PAGE = 20  # l'API renvoie 20 decks par appel

# Cartes génériques que la détection par texte ne trouve pas ou qui ne sont pas des monstres
EXTRA_HANDTRAPS = {"Infinite Impermanence", "Forbidden Droplet", "Crossout Designator"}
BREAKERS = {
    "Raigeki", "Harpie's Feather Duster", "Lightning Storm", "Dark Ruler No More", "Evenly Matched",
    "Triple Tactics Talent", "Triple Tactics Thrust", "Lava Golem", "Change of Heart", "Super Polymerization",
    "Gameciel, the Sea Turtle Kaiju", "Kumongous, the Sticky String Kaiju", "Radian, the Multidimensional Kaiju",
    "Dogoran, the Mad Flame Kaiju", "Thunder King, the Lightning Strike Kaiju", "Nibiru, the Primal Being",
}
ANTI_HANDTRAP = {"Called by the Grave", "Crossout Designator"}

# Monstre qui s'active depuis la main pendant le tour adverse
HANDTRAP_TEXT = re.compile(
    r"\(Quick Effect\): You can (discard this card|send this card from your hand)|"
    r"You can discard this card; (negate|apply)|"
    r"If .{0,80}(Quick Effect): You can discard this card", re.IGNORECASE)


def download(n_decks: int = 200) -> int:
    decks, seen = [], set()
    for offset in range(0, n_decks, PAGE):
        r = requests.get(API, params={"format": "Tournament Meta Decks", "limit": PAGE, "offset": offset},
                         timeout=60, headers={"User-Agent": "yugioh-collection-local"})
        r.raise_for_status()
        page = r.json()
        if not page:
            break
        for d in page:
            if d["deckNum"] in seen:
                continue
            seen.add(d["deckNum"])
            decks.append({
                "id": d["deckNum"], "name": d["deck_name"].strip(), "tournament": d.get("tournamentName"),
                "placement": d.get("tournamentPlacement"), "players": d.get("tournamentPlayerCount"),
                "age": d.get("submit_date"), "url": f"https://ygoprodeck.com/deck/{d['pretty_url']}",
                "main": [int(x) for x in json.loads(d["main_deck"] or "[]")],
                "extra": [int(x) for x in json.loads(d["extra_deck"] or "[]")],
            })
        time.sleep(0.3)  # limite de l'API : 20 requêtes / seconde
    META_PATH.write_text(json.dumps({"downloaded": date.today().isoformat(), "decks": decks},
                                    ensure_ascii=False), encoding="utf8")
    return len(decks)


def load() -> dict | None:
    if not META_PATH.exists():
        return None
    return json.loads(META_PATH.read_text(encoding="utf8"))


def resolve(con, ids: list[int]) -> list[dict]:
    """Codes -> fiches cartes (illustrations alternatives ramenées à la carte principale)."""
    alias = dict(con.execute("SELECT alias_id, card_id FROM card_alias").fetchall())
    wanted = {alias.get(i, i) for i in ids}
    rows = {r["id"]: dict(r) for r in con.execute(
        f"SELECT * FROM cards WHERE id IN ({','.join('?' * len(wanted))})", list(wanted))} if wanted else {}
    return [rows[alias.get(i, i)] for i in ids if alias.get(i, i) in rows]


def opponent_flags(c: dict) -> dict:
    return _flags(c["name_en"], c["frame_type"], c["desc_en"] or "")


@lru_cache(maxsize=None)
def _flags(name: str, frame: str, desc: str) -> dict:
    """Mémorisé : la recherche dans le texte ne tourne qu'une fois par carte."""
    monster = frame not in ("spell", "trap")
    return {
        "handtrap": name in EXTRA_HANDTRAPS or (monster and bool(HANDTRAP_TEXT.search(desc))),
        "breaker": name in BREAKERS,
        "anti": name in ANTI_HANDTRAP,
    }


def archetypes(meta: dict) -> list[tuple[str, list[dict]]]:
    """Archétypes classés par nombre de tops."""
    groups = {}
    for d in meta["decks"]:
        groups.setdefault(d["name"], []).append(d)
    order = Counter({k: len(v) for k, v in groups.items()})
    return [(name, groups[name]) for name, _ in order.most_common()]


if __name__ == "__main__":
    connect()
    print(f"{download()} decks méta téléchargés dans {META_PATH}")

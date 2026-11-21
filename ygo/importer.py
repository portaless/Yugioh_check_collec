"""Téléchargement du catalogue YGOPRODeck et import du stock depuis l'Excel.

Usage :  python -m ygo.importer [--refresh]
"""
import json
import re
import sys
import unicodedata
from collections import defaultdict
from pathlib import Path

import openpyxl
import requests
from rapidfuzz import fuzz, process

from .db import DATA_DIR, ROOT, connect, is_extra

API = "https://db.ygoprodeck.com/api/v7/cardinfo.php"
EXCEL_PATH = ROOT / "yugioh.xlsx"
CORRECTIONS_PATH = ROOT / "corrections.json"
TRANSLATIONS_PATH = ROOT / "traductions.json"
DECK_SHEET_PREFIX = "deck_"
MIN_SCORE = 95  # en dessous, la carte reste "non reconnue" et se corrige dans l'IHM


def download_catalog(force: bool = False) -> None:
    for lang in ("en", "fr"):
        path = DATA_DIR / f"cards_{lang}.json"
        if path.exists() and not force:
            continue
        params = {"misc": "yes"}
        if lang != "en":
            params["language"] = lang
        r = requests.get(API, params=params, timeout=180)
        r.raise_for_status()
        path.write_bytes(r.content)


def load_catalog(con) -> int:
    en = json.loads((DATA_DIR / "cards_en.json").read_text(encoding="utf8"))["data"]
    fr = {c["id"]: c for c in json.loads((DATA_DIR / "cards_fr.json").read_text(encoding="utf8"))["data"]}
    rows = []
    for c in en:
        f = fr.get(c["id"], {})
        ban = c.get("banlist_info", {})
        price = (c.get("card_prices") or [{}])[0].get("cardmarket_price")
        rows.append((
            c["id"], c["name"], f.get("name"), c.get("type"), c.get("frameType"), c.get("race"),
            c.get("attribute"), c.get("level"), c.get("atk"), c.get("def"), c.get("linkval"),
            ",".join(c.get("linkmarkers", [])) or None, c.get("scale"), c.get("archetype"),
            c.get("desc"), f.get("desc"), ban.get("ban_tcg"), ban.get("ban_ocg"),
            c["card_images"][0]["image_url_small"], float(price) if price else None,
        ))
    con.execute("DELETE FROM cards WHERE id NOT IN (SELECT card_id FROM collection WHERE card_id IS NOT NULL)"
                " AND id NOT IN (SELECT card_id FROM deck_cards) AND id NOT IN (SELECT card_id FROM name_overrides)")
    con.executemany("INSERT OR REPLACE INTO cards VALUES (" + ",".join("?" * 20) + ")", rows)
    con.execute("DELETE FROM card_alias")
    con.executemany("INSERT OR IGNORE INTO card_alias VALUES (?, ?)",
                    [(img["id"], c["id"]) for c in en for img in c["card_images"] if img["id"] != c["id"]])
    con.commit()
    return len(rows)


def normalize(s: str) -> str:
    s = unicodedata.normalize("NFKD", s.lower().replace("œ", "oe"))
    s = "".join(ch for ch in s if not unicodedata.combining(ch))
    s = re.sub(r"[^a-z0-9]+", " ", s)
    return re.sub(r"\s+", " ", s).strip()


def _category(row: dict) -> str | None:
    """Catégorie déduite des colonnes 'x' de l'Excel."""
    if row.get("magie"):
        return "spell"
    if row.get("piège"):
        return "trap"
    if any(row.get(k) for k in ("fusion", "synchro", "xyz", "link")):
        return "extra"
    if row.get("monstre"):
        return "main"
    return None


def _card_category(frame: str) -> str:
    if frame in ("spell", "trap"):
        return frame
    return "extra" if is_extra(frame) else "main"


class Matcher:
    def __init__(self, con):
        self.cards = [dict(r) for r in con.execute("SELECT id, name_en, name_fr, frame_type, level FROM cards")]
        self.overrides = {r["excel_name"]: r["card_id"] for r in con.execute("SELECT * FROM name_overrides")}
        self.choices, self.owner = {}, {}
        for i, c in enumerate(self.cards):
            for name in (c["name_fr"], c["name_en"]):
                if name:
                    key = f"{i}:{name}"
                    self.choices[key] = normalize(name)
                    self.owner[key] = i

    def match(self, name: str, category: str | None, level) -> tuple[int | None, float]:
        if name in self.overrides:
            return self.overrides[name], 100.0
        q = normalize(name)
        best, best_score = None, 0.0
        for norm, score, key in process.extract(q, self.choices, scorer=fuzz.WRatio, limit=15):
            # WRatio sur-note les sous-chaînes : on pondère avec ratio simple
            score = 0.5 * score + 0.5 * fuzz.ratio(q, norm)
            c = self.cards[self.owner[key]]
            if category and _card_category(c["frame_type"]) != category:
                score -= 15
            if level and c["level"] == level:
                score += 5
            if score > best_score:
                best, best_score = c["id"], score
        return best, round(best_score, 1)


def read_excel(path: Path = EXCEL_PATH) -> dict[str, list[dict]]:
    wb = openpyxl.load_workbook(path, data_only=True)
    sheets = {}
    for ws in wb.worksheets:
        rows = list(ws.iter_rows(values_only=True))
        # en-têtes en minuscules, accent de « rareté » facultatif
        header = [str(h).strip().lower().replace("rarete", "rareté") if h else "" for h in rows[0]]
        sheets[ws.title.strip()] = [
            dict(zip(header, r)) for r in rows[1:] if r[0] and str(r[0]).strip()
        ]
    return sheets


def load_corrections(con) -> None:
    if not CORRECTIONS_PATH.exists():
        return
    data = json.loads(CORRECTIONS_PATH.read_text(encoding="utf8"))
    con.executemany("INSERT OR REPLACE INTO name_overrides VALUES (?, ?)",
                    [(k, v) for k, v in data.items() if not k.startswith("_")])


def import_excel(con, path: Path = EXCEL_PATH) -> list[dict]:
    """Remplace la collection par le contenu de l'Excel et recrée les decks 'deck_*'."""
    load_corrections(con)
    matcher = Matcher(con)
    report = []
    con.execute("DELETE FROM collection")
    for sheet, rows in read_excel(path).items():
        qty_by_card = defaultdict(int)
        for row in rows:
            name = str(row["carte"]).strip()
            qty = int(row.get("nombre") or 1)
            level = row.get("étoile")
            card_id, score = matcher.match(name, _category(row), level)
            if score < MIN_SCORE:
                card_id = None
            rarity = str(row.get("rareté") or "").strip() or None
            con.execute("INSERT INTO collection (card_id, excel_name, location, quantity, match_score, rarity)"
                        " VALUES (?, ?, ?, ?, ?, ?)", (card_id, name, sheet, qty, score, rarity))
            report.append({"sheet": sheet, "excel": name, "card_id": card_id, "score": score})
            if card_id:
                qty_by_card[card_id] += qty
        if sheet.startswith(DECK_SHEET_PREFIX) and qty_by_card:
            save_deck_from_counts(con, sheet, qty_by_card)
    fill_missing_french_names(con)
    con.commit()
    return report


def load_translations() -> dict:
    if not TRANSLATIONS_PATH.exists():
        return {"noms": {}, "textes": {}}
    return json.loads(TRANSLATIONS_PATH.read_text(encoding="utf8"))


def fill_missing_french_names(con) -> None:
    """Cartes récentes sans traduction dans l'API : nom et texte de traductions.json,
    sinon nom écrit dans l'Excel."""
    rows = con.execute("""SELECT c.id, MIN(col.excel_name) AS excel_name FROM cards c
                          JOIN collection col ON col.card_id = c.id
                          WHERE c.name_fr IS NULL GROUP BY c.id""").fetchall()
    con.executemany("UPDATE cards SET name_fr = ? WHERE id = ?",
                    [(r["excel_name"][:1].upper() + r["excel_name"][1:], r["id"]) for r in rows])
    tr = load_translations()
    # les noms traduits remplacent ceux de l'Excel, mais jamais un nom officiel (desc_fr présent = carte traduite par Konami)
    con.executemany("UPDATE cards SET name_fr = ? WHERE id = ? AND desc_fr IS NULL",
                    [(name, int(i)) for i, name in tr["noms"].items()])
    con.executemany("UPDATE cards SET desc_fr = ? WHERE id = ? AND desc_fr IS NULL",
                    [(text, int(i)) for i, text in tr["textes"].items()])


def save_deck_from_counts(con, name: str, counts: dict[int, int]) -> int:
    con.execute("INSERT OR IGNORE INTO decks (name) VALUES (?)", (name,))
    deck_id = con.execute("SELECT id FROM decks WHERE name = ?", (name,)).fetchone()["id"]
    con.execute("DELETE FROM deck_cards WHERE deck_id = ?", (deck_id,))
    frames = {r["id"]: r["frame_type"] for r in con.execute(
        f"SELECT id, frame_type FROM cards WHERE id IN ({','.join('?' * len(counts))})", list(counts))}
    for card_id, qty in counts.items():
        zone = "extra" if is_extra(frames[card_id]) else "main"
        con.execute("INSERT INTO deck_cards VALUES (?, ?, ?, ?)", (deck_id, card_id, zone, qty))
    return deck_id


def main():
    con = connect()
    download_catalog(force="--refresh" in sys.argv)
    print(f"{load_catalog(con)} cartes dans le catalogue")
    report = import_excel(con)
    names = {r["id"]: r["name_fr"] or r["name_en"] for r in con.execute("SELECT id, name_fr, name_en FROM cards")}
    for r in sorted(report, key=lambda r: r["score"]):
        flag = "  " if r["card_id"] else "??"
        print(f"{flag} {r['score']:5.1f}  [{r['sheet']}] {r['excel']!r:55} -> {names.get(r['card_id'], '-')}")


if __name__ == "__main__":
    main()

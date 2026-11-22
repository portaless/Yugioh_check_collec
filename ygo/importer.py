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

from . import rarity as R
from .db import DATA_DIR, ROOT, USER_DIR, connect, is_extra

API = "https://db.ygoprodeck.com/api/v7/cardinfo.php"
EXCEL_PATH = USER_DIR / "yugioh.xlsx"
CORRECTIONS_PATH = USER_DIR / "corrections.json"
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


def _header(first_row) -> list[str]:
    # en-têtes en minuscules, accent de « rareté » facultatif
    return [str(h).strip().lower().replace("rarete", "rareté") if h else "" for h in first_row]


def read_excel(path: Path | None = None) -> dict[str, list[dict]]:
    path = path or EXCEL_PATH  # lu à l'appel : ma_collection/ et les tests changent ce chemin
    wb = openpyxl.load_workbook(path, data_only=True)
    sheets = {}
    for ws in wb.worksheets:
        rows = list(ws.iter_rows(values_only=True))
        header = _header(rows[0])
        sheets[ws.title.strip()] = [
            dict(zip(header, r)) for r in rows[1:] if r[0] and str(r[0]).strip()
        ]
    return sheets


def _row_key(row: dict) -> tuple:
    """Même nom et mêmes infos hors quantité (casse, accents et espaces ignorés)."""
    return tuple(normalize(str(v)) if v is not None else "" for k, v in sorted(row.items()) if k and k != "nombre")


def merge_rows(rows: list[dict]) -> list[dict]:
    """Lignes identiques : une seule, quantités additionnées."""
    merged = {}
    for row in rows:
        key = _row_key(row)
        if key in merged:
            merged[key]["nombre"] = int(merged[key].get("nombre") or 1) + int(row.get("nombre") or 1)
        else:
            merged[key] = dict(row)
    return list(merged.values())


def tidy_excel(path: Path | None = None) -> int:
    """Regroupe aussi les lignes identiques dans l'Excel : la première garde la somme, les autres sont supprimées.
    Renvoie le nombre de lignes supprimées (0 si l'Excel est ouvert ailleurs et ne peut pas être enregistré)."""
    path = path or EXCEL_PATH  # lu à l'appel : ma_collection/ et les tests changent ce chemin
    wb = openpyxl.load_workbook(path)
    removed = 0
    for ws in wb.worksheets:
        header = _header(next(ws.iter_rows(max_row=1, values_only=True), ()))
        if "nombre" not in header:
            continue
        qty_col = header.index("nombre") + 1
        first, extra = {}, []
        for i, values in enumerate(ws.iter_rows(min_row=2, values_only=True), 2):
            if not values or not values[0] or not str(values[0]).strip():
                continue
            row = dict(zip(header, values))
            key = _row_key(row)
            if key in first:
                cell = ws.cell(first[key], qty_col)
                cell.value = int(cell.value or 1) + int(row.get("nombre") or 1)
                extra.append(i)
            else:
                first[key] = i
        for i in reversed(extra):
            ws.delete_rows(i)
        removed += len(extra)
    if removed:
        try:
            wb.save(path)
        except PermissionError:
            return 0
    return removed


def add_corrections(names: dict[str, int]) -> None:
    """Ajoute des noms de l'Excel associés à leur carte dans corrections.json."""
    data = json.loads(CORRECTIONS_PATH.read_text(encoding="utf8")) if CORRECTIONS_PATH.exists() else {}
    data.update(names)
    CORRECTIONS_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=4), encoding="utf8")


def load_corrections(con) -> None:
    if not CORRECTIONS_PATH.exists():
        return
    data = json.loads(CORRECTIONS_PATH.read_text(encoding="utf8"))
    con.executemany("INSERT OR REPLACE INTO name_overrides VALUES (?, ?)",
                    [(k, v) for k, v in data.items() if not k.startswith("_")])


def import_excel(con, path: Path | None = None, reuse: bool = False) -> list[dict]:
    """Remplace la collection par le contenu de l'Excel et recrée les decks 'deck_*'.
    `reuse` : les noms déjà importés gardent leur carte (rapide, pour la saisie dans l'appli) ; seuls les
    nouveaux noms passent par la recherche approchée, qui prend ~0,1 s par nom."""
    path = path or EXCEL_PATH
    tidy_excel(path)
    load_corrections(con)
    overrides = {r["excel_name"] for r in con.execute("SELECT excel_name FROM name_overrides")}
    known = {r["excel_name"]: (r["card_id"], r["match_score"])
             for r in con.execute("SELECT excel_name, card_id, match_score FROM collection")
             if r["excel_name"] not in overrides} if reuse else {}
    matcher = None
    report = []
    con.execute("DELETE FROM collection")
    for sheet, rows in read_excel(path).items():
        qty_by_card = defaultdict(int)
        for row in merge_rows(rows):
            name = str(row["carte"]).strip()
            qty = int(row.get("nombre") or 1)
            level = row.get("étoile")
            if name in known:
                card_id, score = known[name]
            else:
                matcher = matcher or Matcher(con)
                card_id, score = matcher.match(name, _category(row), level)
            if score < MIN_SCORE:
                card_id = None
            rarity = R.canonical(row.get("rareté"))
            code = str(row.get("code") or "").strip().upper() or None
            con.execute("INSERT INTO collection (card_id, excel_name, location, quantity, match_score, rarity, set_code)"
                        " VALUES (?, ?, ?, ?, ?, ?, ?)", (card_id, name, sheet, qty, score, rarity, code))
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
    """Cartes récentes sans traduction dans l'API : nom officiel relevé sur Yugipedia (noms_fr.py), sinon nom
    de traductions.json, sinon nom écrit dans l'Excel ; texte de traductions.json."""
    from . import noms_fr
    rows = con.execute("""SELECT c.id, MIN(col.excel_name) AS excel_name FROM cards c
                          JOIN collection col ON col.card_id = c.id
                          WHERE c.name_fr IS NULL GROUP BY c.id""").fetchall()
    con.executemany("UPDATE cards SET name_fr = ? WHERE id = ?",
                    [(r["excel_name"][:1].upper() + r["excel_name"][1:], r["id"]) for r in rows])
    tr = load_translations()
    official = noms_fr.load()
    # ces noms remplacent ceux de l'Excel, mais jamais un nom de l'API (desc_fr présent = carte traduite par Konami)
    names = {int(i): name for i, name in tr["noms"].items()} | official
    con.executemany("UPDATE cards SET name_fr = ? WHERE id = ? AND desc_fr IS NULL",
                    [(name, i) for i, name in names.items()])
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

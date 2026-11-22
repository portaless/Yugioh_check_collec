"""Complète l'Excel à partir du nom de la carte et du code d'extension.

Il suffit de noter le nom, le nombre et le préfixe de l'extension (« CRMS », lu dans la colonne `code`, ou dans
`rareté` quand ce n'est pas une rareté). Pour chaque ligne pas encore complétée (aucune colonne magie / piège /
monstre cochée, ou code d'extension dans `rareté`), on retrouve la carte, en préférant celle qui existe dans
cette extension, puis on remplit :
- magie / piège / monstre, pendule, synchro / xyz / fusion / link et étoile (niveau, rang ou valeur Link) ;
- code : le code complet de l'impression (« CRMS-FR020 ») ;
- rareté : quand l'extension n'a cette carte qu'en une rareté. Sinon la case reste vide, surlignée en jaune,
  avec les raretés possibles en commentaire.

Usage :  python -m ygo.completer
"""
import re
from copy import copy

import openpyxl
from openpyxl.comments import Comment
from openpyxl.styles import PatternFill
from rapidfuzz import fuzz, process

from . import cardmarket as CM
from . import importer
from . import rarity as R
from .db import connect

YELLOW = PatternFill("solid", fgColor="FFF2CC")
AUTHOR = "Yu-Gi-Oh!"  # auteur des commentaires « À choisir »
PREFIX = re.compile(r"^[A-Z0-9]{2,5}$")
KINDS = ("magie", "piège", "monstre", "pendule", "synchro", "xyz", "fusion", "link")
MIN_IN_SET = 60  # nom approchant suffit si la carte existe dans l'extension notée


def _prefix(row: dict) -> str | None:
    """Préfixe d'extension noté dans `code`, ou dans `rareté` quand ce n'est pas une rareté."""
    for value in (row.get("code"), row.get("rareté")):
        text = str(value or "").strip().upper()
        if text and R.canonical(text) not in R.RANK:
            split = CM.split_code(text)
            if split or PREFIX.match(text):
                return split[0] if split else text
    return None


def _set(code: str) -> str:
    """Préfixe d'un code d'impression, même quand le numéro est inhabituel (« LAVD-ENL26 »)."""
    return str(code or "").split("-")[0].strip().upper()


def _french(code: str) -> str:
    """Code d'impression version française ; corrige au passage la lettre O mise pour un zéro."""
    split = CM.split_code(code)
    return f"{split[0]}-FR{split[1]}" if split else code.replace("-EN", "-FR")


def _todo(row: dict) -> bool:
    return bool(row.get("carte")) and (not any(row.get(k) for k in ("magie", "piège", "monstre"))
                                       or (_prefix(row) and not CM.split_code(str(row.get("code") or ""))))


class _Finder:
    def __init__(self, con):
        self.con = con
        self.matcher = importer.Matcher(con)
        self.learned = {}  # noms reconnus grâce à l'extension, trop éloignés pour l'import : vers corrections.json
        self.prints = {}
        for r in con.execute("SELECT card_id, set_code, rarity FROM printings"):
            self.prints.setdefault(r["card_id"], []).append(dict(r))

    def find(self, name: str, prefix: str | None) -> tuple[dict | None, list[dict]]:
        """(carte, impressions dans l'extension). La carte est None si rien n'est assez proche."""
        m = self.matcher
        if name in m.overrides:
            ids = [m.overrides[name]]
        else:
            q = importer.normalize(name)
            scored = []
            for norm, score, key in process.extract(q, m.choices, scorer=fuzz.WRatio, limit=40):
                score = 0.5 * score + 0.5 * fuzz.ratio(q, norm)
                card_id = m.cards[m.owner[key]]["id"]
                in_set = bool(prefix and self._in_set(card_id, prefix))
                scored.append((score + (20 if in_set else 0), score, card_id, in_set))
            best = max(scored, default=None)
            if not best or not (best[1] >= importer.MIN_SCORE or (best[3] and best[1] >= MIN_IN_SET)):
                return None, []
            ids = [best[2]]
            if best[1] < importer.MIN_SCORE:
                self.learned[name] = best[2]
        card = dict(self.con.execute("SELECT * FROM cards WHERE id = ?", ids).fetchone())
        return card, self._in_set(card["id"], prefix) if prefix else []

    def _in_set(self, card_id: int, prefix: str) -> list[dict]:
        return [p for p in self.prints.get(card_id, []) if _set(p["set_code"]) == prefix]


def complete(con, path=None) -> dict:
    """Complète les lignes à compléter de toutes les feuilles. Renvoie {done, choose: [...], unknown: [...]}."""
    path = path or importer.EXCEL_PATH
    wb = openpyxl.load_workbook(path)
    importer.load_corrections(con)  # noms corrigés à la main
    finder = _Finder(con)
    report = {"done": 0, "choose": [], "unknown": []}
    for ws in wb.worksheets:
        header = importer._header(next(ws.iter_rows(max_row=1, values_only=True), ()))
        if "carte" not in header:
            continue
        if "code" not in header:
            ref = ws.cell(1, len(header))
            cell = ws.cell(1, len(header) + 1, "code")
            cell.font, cell.fill, cell.border, cell.alignment = (copy(ref.font), copy(ref.fill), copy(ref.border),
                                                                 copy(ref.alignment))
            header.append("code")
        col = {h: i + 1 for i, h in enumerate(header) if h}
        for i, values in enumerate(ws.iter_rows(min_row=2, max_col=len(header), values_only=True), 2):
            row = dict(zip(header, values))
            if "rareté" in col:
                _clear_choice(ws.cell(i, col["rareté"]))
            if not _todo(row):
                continue
            prefix = _prefix(row)
            card, inset = finder.find(str(row["carte"]).strip(), prefix)
            where = f"{ws.title.strip()} ligne {i}"
            if not card:
                report["unknown"].append(f"{where} : {row['carte']} ({prefix or 'sans code'})")
                continue
            _fill(ws, i, col, card, inset, prefix, report, where, row["carte"],
                  lambda c: finder.prints.get(c["id"], []))
            report["done"] += 1
    wb.save(path)
    if finder.learned:
        importer.add_corrections(finder.learned)
    report["learned"] = finder.learned
    return report


def _clear_choice(cell):
    """Rareté choisie depuis : on enlève le surlignage et le commentaire laissés par le compléteur."""
    if R.canonical(cell.value) in R.RANK and cell.comment and cell.comment.author == AUTHOR:
        cell.fill, cell.comment = PatternFill(), None


def _fill(ws, i, col, card, inset, prefix, report, where, name, finder_prints):
    frame = card["frame_type"]
    marks = {k: None for k in KINDS}
    if frame.startswith("spell"):
        marks["magie"] = "x"
    elif frame.startswith("trap"):
        marks["piège"] = "x"
    else:
        marks["monstre"] = "x"
        marks["pendule"] = "x" if "pendulum" in frame else None
        for kind in ("synchro", "xyz", "fusion", "link"):
            marks[kind] = "x" if kind in frame else None
        if "étoile" in col:
            ws.cell(i, col["étoile"]).value = card["linkval"] if "link" in frame else card["level"]
    for kind, mark in marks.items():
        if kind in col:
            ws.cell(i, col[kind]).value = mark
    code_cell = ws.cell(i, col["code"])
    if inset:
        code_cell.value = _french(inset[0]["set_code"])  # cartes françaises : même numéro
    elif prefix:
        code_cell.value = prefix
    if "rareté" not in col:
        return
    cell = ws.cell(i, col["rareté"])
    current = R.canonical(cell.value)
    if current in R.RANK:
        return  # rareté déjà notée par l'utilisateur
    rarities = sorted({p["rarity"] for p in inset if p["rarity"] in R.RANK}, key=R.rank)
    if len(rarities) == 1:
        cell.value = R.label(rarities[0])
        cell.fill, cell.comment = PatternFill(), None
    else:
        cell.value = None
        if rarities:
            cell.fill = YELLOW
            cell.comment = Comment("À choisir : " + " / ".join(R.label(r) for r in rarities), AUTHOR)
            report["choose"].append(f"{where} : {card['name_fr'] or card['name_en']} ({code_cell.value}) : "
                                    + " / ".join(R.label(r) for r in rarities))
        else:
            sets = sorted({_set(p["set_code"]) for p in finder_prints(card)})
            report["unknown"].append(f"{where} : {name} reconnue comme {card['name_fr'] or card['name_en']}, "
                                     f"mais absente de l'extension {prefix} (existe dans : {', '.join(sets)})")


def main():
    report = complete(connect())
    print(f"{report['done']} ligne(s) complétée(s).")
    for title, key in (("Rareté à choisir (cases jaunes)", "choose"), ("Non trouvées", "unknown")):
        if report[key]:
            print(f"\n{title} :")
            for line in report[key]:
                print("  " + line)


if __name__ == "__main__":
    main()

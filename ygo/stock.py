"""Saisie de la collection depuis l'IHM : l'appli écrit elle-même dans l'Excel, qui reste le stockage.

Une feuille = un rangement (classeur, boîte A…). Chaque ajout écrit une ligne (nom, nombre, rareté, code) ;
le compléteur remplit ensuite les colonnes de catégorie, puis la collection est réimportée. Les lignes
identiques sont regroupées à l'import (importer.tidy_excel).
"""
import openpyxl
from openpyxl.styles import Font, PatternFill

from . import completer, importer
from . import rarity as R

HEADER = ["carte", "nombre", "rareté", "code"] + list(completer.KINDS) + ["étoile"]


def sheets(path=None) -> list[str]:
    path = path or importer.EXCEL_PATH
    if not path.exists():
        return []
    return [ws.title for ws in openpyxl.load_workbook(path, read_only=True).worksheets]


def rows(sheet: str, path=None) -> list[dict]:
    """Lignes d'un rangement : {ligne, carte, nombre, rareté, code}."""
    path = path or importer.EXCEL_PATH
    ws = openpyxl.load_workbook(path, read_only=True)[sheet]
    values = list(ws.iter_rows(values_only=True))
    if not values:
        return []
    header = importer._header(values[0])
    out = []
    for i, v in enumerate(values[1:], 2):
        row = dict(zip(header, v))
        if row.get("carte") and str(row["carte"]).strip():
            out.append({"ligne": i, "carte": str(row["carte"]).strip(), "nombre": int(row.get("nombre") or 1),
                        "rareté": row.get("rareté") or "", "code": row.get("code") or ""})
    return out


def _sheet(wb, name: str):
    """Feuille du rangement, créée avec ses en-têtes si besoin ; colonnes nécessaires ajoutées au besoin."""
    if name not in wb.sheetnames:
        ws = wb.create_sheet(name)
        ws.append(HEADER)
        for cell in ws[1]:
            cell.font = Font(bold=True, color="0D1020")
            cell.fill = PatternFill("solid", fgColor="E3B341")
        ws.column_dimensions["A"].width = 40
    ws = wb[name]
    header = importer._header(next(ws.iter_rows(max_row=1, values_only=True), ()))
    for column in ("carte", "nombre", "rareté", "code"):
        if column not in header:
            ws.cell(1, len(header) + 1, column)
            header.append(column)
    return ws, {h: i + 1 for i, h in enumerate(header) if h}


def _check_name(name: str, existing: list[str]) -> str:
    """Nom de feuille Excel valide : 31 caractères au plus, sans : \\ / ? * [ ], et pas déjà pris."""
    name = name.strip()
    if not name:
        raise ValueError("Donne un nom au rangement.")
    if len(name) > 31 or any(ch in name for ch in ':\\/?*[]'):
        raise ValueError("Nom trop long (31 caractères au plus) ou avec un caractère interdit : \\ / ? * [ ] :")
    if name.lower() in (s.lower() for s in existing):
        raise ValueError(f"Le rangement « {name} » existe déjà.")
    return name


def create(name: str, path=None) -> str:
    """Crée un rangement vide (feuille avec ses en-têtes)."""
    path = path or importer.EXCEL_PATH
    wb = openpyxl.load_workbook(path) if path.exists() else openpyxl.Workbook()
    if not path.exists():
        wb.remove(wb.active)
    name = _check_name(name, wb.sheetnames)
    _sheet(wb, name)
    wb.save(path)
    return name


def rename(old: str, new: str, path=None) -> str:
    path = path or importer.EXCEL_PATH
    wb = openpyxl.load_workbook(path)
    new = _check_name(new, [s for s in wb.sheetnames if s != old])
    wb[old].title = new
    wb.save(path)
    return new


def delete(name: str, path=None) -> None:
    """Supprime un rangement et les cartes qu'il contient (l'Excel garde au moins une feuille)."""
    path = path or importer.EXCEL_PATH
    wb = openpyxl.load_workbook(path)
    if len(wb.sheetnames) == 1:
        raise ValueError("C'est ton seul rangement : crée-en un autre avant de supprimer celui-ci.")
    del wb[name]
    wb.save(path)


def add(sheet: str, name: str, quantity: int, rarity: str | None, code: str | None, path=None) -> None:
    """Ajoute une carte au rangement (rareté canonique ou libre, code d'impression facultatif)."""
    path = path or importer.EXCEL_PATH
    wb = openpyxl.load_workbook(path) if path.exists() else openpyxl.Workbook()
    if not path.exists():
        wb.remove(wb.active)
    ws, col = _sheet(wb, sheet)
    i = ws.max_row + 1
    ws.cell(i, col["carte"], name)
    ws.cell(i, col["nombre"], int(quantity))
    if rarity:
        ws.cell(i, col["rareté"], R.label(rarity) or rarity)
    if code:
        ws.cell(i, col["code"], completer._french(code))
    wb.save(path)


def add_card(con, sheet: str, card_id: int, quantity: int, printing: dict | None, path=None) -> str:
    """Ajout rapide d'une carte choisie dans l'appli : la carte et sa version sont connues, donc la ligne est écrite
    déjà complétée (sans le compléteur) et la collection mise à jour directement (sans réimport).
    Une ligne identique déjà présente voit sa quantité augmenter. Renvoie le nom écrit."""
    path = path or importer.EXCEL_PATH
    card = dict(con.execute("SELECT * FROM cards WHERE id = ?", (card_id,)).fetchone())
    name = card["name_fr"] or card["name_en"]
    rarity = printing["rarity"] if printing else None
    code = completer._french(printing["set_code"]) if printing else None
    wb = openpyxl.load_workbook(path) if path.exists() else openpyxl.Workbook()
    if not path.exists():
        wb.remove(wb.active)
    ws, col = _sheet(wb, sheet)
    same = None
    for i in range(2, ws.max_row + 1):
        if (importer.normalize(str(ws.cell(i, col["carte"]).value or "")) == importer.normalize(name)
                and R.canonical(ws.cell(i, col["rareté"]).value) == R.canonical(rarity)
                and str(ws.cell(i, col["code"]).value or "").strip().upper() == (code or "")):
            same = i
            break
    if same:
        cell = ws.cell(same, col["nombre"])
        cell.value = int(cell.value or 1) + int(quantity)
    else:
        i = ws.max_row + 1
        ws.cell(i, col["carte"], name)
        ws.cell(i, col["nombre"], int(quantity))
        if rarity:
            ws.cell(i, col["rareté"], R.label(rarity) or rarity)
        inset = [printing] if printing else []
        completer._fill(ws, i, col, card, inset, completer._set(code) if code else None, {"choose": [], "unknown": []},
                        "", name, lambda c: [])
    wb.save(path)

    rarity = R.canonical(rarity) if rarity else None
    row = con.execute("SELECT rowid FROM collection WHERE location = ? AND card_id = ? AND excel_name = ? "
                      "AND rarity IS ? AND set_code IS ?", (sheet, card_id, name, rarity, code)).fetchone()
    if row:
        con.execute("UPDATE collection SET quantity = quantity + ? WHERE rowid = ?", (int(quantity), row[0]))
    else:
        con.execute("INSERT INTO collection (card_id, excel_name, location, quantity, match_score, rarity, set_code) "
                    "VALUES (?, ?, ?, ?, 100, ?, ?)", (card_id, name, sheet, int(quantity), rarity, code))
    if sheet.startswith(importer.DECK_SHEET_PREFIX):
        counts = dict(con.execute("SELECT card_id, SUM(quantity) FROM collection WHERE location = ? AND card_id "
                                  "IS NOT NULL GROUP BY card_id", (sheet,)).fetchall())
        importer.save_deck_from_counts(con, sheet, counts)
    con.commit()
    return name


def update(sheet: str, quantities: dict[int, int], path=None) -> None:
    """Nouvelles quantités par numéro de ligne ; 0 supprime la ligne."""
    path = path or importer.EXCEL_PATH
    wb = openpyxl.load_workbook(path)
    ws, col = _sheet(wb, sheet)
    for i, q in quantities.items():
        if q > 0:
            ws.cell(i, col["nombre"], int(q))
    for i in sorted((i for i, q in quantities.items() if q <= 0), reverse=True):
        ws.delete_rows(i)
    wb.save(path)


def refresh(con, path=None) -> dict:
    """Complète les nouvelles lignes puis réimporte toute la collection. Renvoie le rapport du compléteur."""
    report = completer.complete(con, path)
    importer.import_excel(con, path, reuse=True)
    return report

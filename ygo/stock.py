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
    importer.import_excel(con, path)
    return report

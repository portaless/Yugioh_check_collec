import openpyxl

from ygo import completer


def test_excel_rows_are_completed_from_name_and_set_prefix(con, tmp_path, monkeypatch):
    monkeypatch.setattr(completer.importer, "CORRECTIONS_PATH", tmp_path / "aucune.json")
    con.executemany("INSERT INTO printings (card_id, set_name, set_code, rarity) VALUES (?, ?, ?, ?)", [
        (10, "Legend of Blue Eyes", "LOB-EN053", "Ultra Rare"),
        (1, "Set A", "ABC-EN001", "Super Rare"), (1, "Set A", "ABC-EN001", "Secret Rare")])
    path = tmp_path / "c.xlsx"
    wb = openpyxl.Workbook()
    ws = wb.active
    for row in (["carte", "magie", "monstre", "étoile", "nombre", "rareté"], ["raigeki", None, None, None, 1, "LOB"],
                ["Ciel bleu mekk-chevalier", None, None, None, 2, "ABC"], ["Carte inventée", None, None, None, 1, "ZZZ"],
                ["Raigeki", "x", None, None, 1, "Commune"]):  # déjà complète : inchangée
        ws.append(row)
    wb.save(path)
    report = completer.complete(con, path)
    rows = list(openpyxl.load_workbook(path).active.iter_rows(min_row=2, values_only=True))
    assert rows[0] == ("raigeki", "x", None, None, 1, "Ultra Rare", "LOB-FR053")
    assert rows[1] == ("Ciel bleu mekk-chevalier", None, "x", 5, 2, None, "ABC-FR001")  # rareté à choisir
    assert rows[2][-2:] == ("ZZZ", None) and rows[3][-2:] == ("Commune", None)  # non trouvée : laissée telle quelle
    assert report["done"] == 2 and len(report["choose"]) == 1 and len(report["unknown"]) == 1

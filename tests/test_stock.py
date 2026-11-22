from ygo import importer, stock


def test_cards_added_in_the_app_land_in_the_excel_and_are_completed(con, tmp_path, monkeypatch):
    path = tmp_path / "c.xlsx"
    monkeypatch.setattr(importer, "EXCEL_PATH", path)
    monkeypatch.setattr(importer, "CORRECTIONS_PATH", tmp_path / "aucune.json")
    con.execute("INSERT INTO printings (card_id, set_name, set_code, rarity) VALUES (10, 'LOB', 'LOB-EN053', 'Ultra Rare')")
    stock.add("boîte C", "Raigeki", 2, "Ultra Rare", "LOB-EN053", path)   # nouveau fichier, nouvelle feuille
    stock.add("boîte C", "Raigeki", 1, "Ultra Rare", "LOB-EN053", path)   # même version : regroupée à l'import
    stock.add("boîte C", "Krebons", 1, None, None, path)
    assert stock.sheets(path) == ["boîte C"]
    stock.refresh(con, path)
    lines = stock.rows("boîte C", path)
    assert [(r["carte"], r["nombre"], r["rareté"], r["code"]) for r in lines] == [
        ("Raigeki", 3, "Ultra Rare", "LOB-FR053"), ("Krebons", 1, "", "")]
    owned = dict(con.execute("SELECT card_id, SUM(quantity) FROM collection GROUP BY card_id").fetchall())
    assert owned == {10: 3, 11: 1}
    stock.update("boîte C", {lines[0]["ligne"]: 0, lines[1]["ligne"]: 4}, path)  # 0 = retirer
    assert [(r["carte"], r["nombre"]) for r in stock.rows("boîte C", path)] == [("Krebons", 4)]


def test_storage_zones_can_be_created_renamed_and_deleted(tmp_path):
    import pytest
    path = tmp_path / "c.xlsx"
    assert stock.create("boîte A", path) == "boîte A"
    stock.create("classeur", path)
    stock.add("boîte A", "Raigeki", 1, None, None, path)
    with pytest.raises(ValueError):
        stock.create("Boîte A", path)                  # déjà pris (casse ignorée)
    with pytest.raises(ValueError):
        stock.create("boîte/2", path)                  # caractère interdit dans un nom de feuille
    stock.rename("boîte A", "boîte B", path)
    assert stock.sheets(path) == ["boîte B", "classeur"]
    assert [r["carte"] for r in stock.rows("boîte B", path)] == ["Raigeki"]
    stock.delete("boîte B", path)
    assert stock.sheets(path) == ["classeur"]
    with pytest.raises(ValueError):
        stock.delete("classeur", path)                 # l'Excel garde au moins une feuille

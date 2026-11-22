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


def test_quick_add_gives_the_same_excel_and_collection_as_a_full_import(con, tmp_path, monkeypatch):
    path = tmp_path / "c.xlsx"
    monkeypatch.setattr(importer, "EXCEL_PATH", path)
    monkeypatch.setattr(importer, "CORRECTIONS_PATH", tmp_path / "aucune.json")
    lob = {"set_code": "LOB-EN053", "rarity": "Ultra Rare"}
    assert stock.add_card(con, "deck_test", 10, 2, lob, path) == "Raigeki"
    stock.add_card(con, "deck_test", 10, 1, lob, path)        # même version : même ligne, quantité augmentée
    stock.add_card(con, "deck_test", 1, 1, None, path)        # version inconnue
    lines = [(r["carte"], r["nombre"], r["rareté"], r["code"]) for r in stock.rows("deck_test", path)]
    assert lines == [("Raigeki", 3, "Ultra Rare", "LOB-FR053"), ("Ciel Bleu Mekk-Chevalier", 1, "", "")]
    query = "SELECT card_id, excel_name, quantity, rarity, set_code FROM collection WHERE location = 'deck_test' ORDER BY 1"
    quick = [tuple(r) for r in con.execute(query)]
    deck = con.execute("SELECT SUM(quantity) FROM deck_cards JOIN decks ON decks.id = deck_id "
                       "WHERE name = 'deck_test'").fetchone()[0]
    assert stock.refresh(con, path)["done"] == 0               # rien à compléter : la ligne l'était déjà
    assert quick == [tuple(r) for r in con.execute(query)]
    assert deck == 4

import pandas as pd

from ygo import online as O


def test_published_collection_lists_owned_cards_and_locations_only_on_request(con):
    con.execute("UPDATE collection SET rarity = 'UR' WHERE card_id = 10")
    con.execute("INSERT INTO collection (card_id, excel_name, location, quantity) VALUES (10, 'Raigeki', 'classeur ', 2)")
    cards = pd.DataFrame([
        {"id": 10, "nom": "Raigeki", "catégorie": "Magie", "type_fr": "Normale", "archétype": None, "owned": 5},
        {"id": 99, "nom": "Absente", "catégorie": "Monstre", "type_fr": "", "archétype": None, "owned": 0},
    ])
    [raigeki] = O.collection_payload(con, cards, locations=False)
    assert (raigeki["id"], raigeki["qty"], raigeki["rarities"]) == (10, 5, ["Ultra Rare"])
    assert "locations" not in raigeki
    [raigeki] = O.collection_payload(con, cards, locations=True)
    assert raigeki["locations"] == [("classeur", 2), ("test", 3)]


def test_published_decks_split_main_and_extra_and_leave_the_side(con):
    con.execute("INSERT INTO decks (name) VALUES ('mekk')")
    for card_id, zone, qty in [(1, "main", 3), (30, "extra", 2), (7, "side", 1)]:
        con.execute("INSERT INTO deck_cards (deck_id, card_id, zone, quantity) VALUES (1, ?, ?, ?)", (card_id, zone, qty))
    [deck] = O.decks_payload(con, ["mekk"], visible=[])
    assert deck == {"name": "mekk", "main": [1, 1, 1], "extra": [30, 30], "visible": False}


def test_key_is_kept_in_the_data_folder(tmp_path, monkeypatch):
    monkeypatch.setattr(O, "DATA_DIR", tmp_path)
    monkeypatch.setattr(O, "CONFIG", tmp_path / "online.json")
    assert O.load_config() == {"server": O.DEFAULT_SERVER, "key": ""}
    O.save_config("http://exemple:8600/ ", " abc ")
    assert O.load_config() == {"server": "http://exemple:8600", "key": "abc"}

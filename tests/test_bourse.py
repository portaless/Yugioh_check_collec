import pytest

from ygo import bourse as B


@pytest.fixture
def history(con, tmp_path, monkeypatch):
    """Blue Sky (3 exemplaires) en Ultra Rare, produit Cardmarket 500 ; historique dans un dossier temporaire."""
    monkeypatch.setattr(B, "HISTORY_PATH", tmp_path / "prix.csv")
    monkeypatch.setattr(B, "COLLECTION_PATH", tmp_path / "collection.csv")
    con.execute("UPDATE collection SET rarity = 'Ultra Rare' WHERE card_id = 1")
    con.execute("INSERT INTO cm_products (id, trend) VALUES (500, 2.0)")
    con.execute("INSERT INTO printings VALUES (1, 'Set', 'SET-EN001', 'Ultra Rare', 1, 500, 'exact')")
    return con


def test_first_record_adds_estimates_but_never_before_november(history):
    guide = {500: {"trend": 2.0, "avg30": 1.0, "avg7": 1.5, "avg1": 1.8}}
    assert B.record(history, "2026-11-10", guide) == 1
    h = B.load_history()
    assert [(str(d), p, e) for d, p, e in zip(h["jour"], h["prix"], h["estime"])] == [
        ("2026-11-07", 1.5, True), ("2026-11-09", 1.8, True), ("2026-11-10", 2.0, False)]  # avg30 → 26 oct : écarté


def test_market_follows_current_collection_and_interpolates(history):
    B.record(history, "2026-11-20", {500: {"trend": 2.0}})
    B.record(history, "2026-11-22", {500: {"trend": 4.0}})
    B.record(history, "2026-11-22", {500: {"trend": 3.0}})  # même jour : remplace
    m = B.market(history)
    total = m["total"].set_index(m["total"]["jour"].astype(str))
    assert total.loc["2026-11-01", "valeur"] == 6.0 and total.loc["2026-11-01", "estime"]  # 3 × 2 €
    assert total.loc["2026-11-21", "valeur"] == 7.5 and total.loc["2026-11-22", "valeur"] == 9.0
    line = m["versions"].set_index("card_id").loc[1]
    assert (line["début"], line["actuel"], line["gain"]) == (2.0, 3.0, 3.0)

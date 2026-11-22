from ygo import cardmarket as CM
from ygo import rarity as R


# ----------------------------------------------------------------- raretés

def test_rarity_accepts_french_english_and_abbreviations():
    assert R.canonical("Commune") == "Common"
    assert R.canonical("  ultra rare ") == "Ultra Rare"
    assert R.canonical("ScR") == "Secret Rare"
    assert R.canonical("Secrète") == "Secret Rare"
    assert R.canonical("Collector's Rare") == "Collector's Rare"
    assert R.canonical("") is None
    assert R.label("Common") == "Commune"


def test_split_code_ignores_language():
    assert CM.split_code("CRMS-FR042") == CM.split_code("CRMS-EN042") == ("CRMS", "042")
    assert CM.split_code("PSV-E088") == CM.split_code("PSV-088") == ("PSV", "088")
    assert CM.split_code("n'importe quoi") is None


# ----------------------------------------------------------------- produit Cardmarket d'une impression

PRINTS = [("CRMS-EN042", "Ultimate Rare"), ("CRMS-EN042", "Ultra Rare")]


def test_single_product_is_exact():
    assert CM._assign(1, [("LC5D-EN235", "Rare")], [270405], {}, {}, {}) == [(270405, "exact")]


def test_same_rarity_reprints_share_one_product():
    prints = [("PSV-088", "Common"), ("PSV-E088", "Common"), ("PSV-EN088", "Common")]
    assert CM._assign(1, prints, [7], {}, {}, {}) == [(7, "exact")] * 3


def test_several_rarities_follow_product_order_when_prices_agree():
    found = CM._assign(1, PRINTS, [10, 20], {}, {10: 3.3, 20: 14.3}, {})
    assert found == [(20, "deduit"), (10, "deduit")]  # Ultra (plus commune) = premier produit


def test_contradicting_prices_are_flagged():
    found = CM._assign(1, PRINTS, [10, 20], {}, {10: 14.3, 20: 3.3}, {})
    assert {conf for _, conf in found} == {"doute"}


def test_cardtrader_and_manual_choice_win():
    ct = {10: {"rarity": "Ultimate Rare", "number": "CRMS-EN042"}, 20: {"rarity": "Ultra Rare", "number": "CRMS-EN042"}}
    assert CM._assign(1, PRINTS, [10, 20], ct, {}, {}) == [(10, "exact"), (20, "exact")]
    choices = {CM.choice_key(1, "CRMS-EN042", "Ultra Rare"): 10}
    assert CM._assign(1, PRINTS, [10, 20], {}, {}, choices)[1] == (10, "manuel")


# ----------------------------------------------------------------- exemplaires possédés

def test_owned_versions_pick_cheapest_set_unless_code_given():
    prints = [{"set_name": "A", "set_code": "AAA-EN001", "rarity": "Rare", "trend": 2.0},
              {"set_name": "B", "set_code": "BBB-EN001", "rarity": "Rare", "trend": 0.5},
              {"set_name": "C", "set_code": "CCC-EN001", "rarity": "Ultra Rare", "trend": 5.0}]
    rows = [{"rarity": "Rare", "set_code": None, "qty": 2}, {"rarity": "Rare", "set_code": "AAA-FR001", "qty": 1},
            {"rarity": "Common", "set_code": None, "qty": 1}]
    by = {(v["rarity"], v["code"]): v for v in CM._versions(prints, rows)}
    assert by[("Rare", None)]["print"]["set_name"] == "B" and by[("Rare", None)]["sets"] == 2
    assert by[("Rare", "AAA-FR001")]["print"]["set_name"] == "A"
    assert not by[("Common", None)]["known"]

import pytest

from ygo import analysis as A
from ygo import optimizer as O
from ygo import simulation as S
from ygo.importer import Matcher, merge_rows, normalize


# ----------------------------------------------------------------- import / reconnaissance

def test_normalize_ignores_case_accents_and_punctuation():
    assert normalize("Cœur de l'Héritage — du Monde !") == "coeur de l heritage du monde"


def test_identical_rows_are_merged_with_summed_quantity():
    rows = [{"carte": "Raigeki", "nombre": 1, "rareté": "Commune", "code": "LOB"},
            {"carte": "raigeki ", "nombre": 2, "rareté": "commune", "code": "LOB"},
            {"carte": "Raigeki", "nombre": None, "rareté": "Super Rare", "code": "LOB"}]
    merged = merge_rows(rows)
    assert [(r["rareté"], r["nombre"]) for r in merged] == [("Commune", 3), ("Super Rare", None)]


def test_matcher_tolerates_typos_and_uses_french_names(con):
    m = Matcher(con)
    assert m.match("ciel bleu mekk chevalier", "main", 5)[0] == 1
    assert m.match("Mekk-Knight Red Mon", "main", 7)[0] == 2       # faute de frappe
    assert m.match("raigeki", "spell", None)[0] == 10


def test_matcher_prefers_manual_override(con):
    con.execute("INSERT INTO name_overrides VALUES ('nom bizarre', 6)")
    assert Matcher(con).match("nom bizarre", None, None) == (6, 100.0)


# ----------------------------------------------------------------- règles de deck

def deck_rows(by_id, main=None, extra=None, owned=3):
    rows = []
    for zone, content in (("main", main or {}), ("extra", extra or {})):
        for cid, q in content.items():
            rows.append({**by_id[cid], "zone": zone, "quantity": q, "owned": owned})
    return rows


def test_check_flags_size_banlist_and_stock(by_id):
    rows = deck_rows(by_id, main={1: 3, 15: 1, 14: 2}, owned=1)
    issues = A.check(rows)
    errors = [m for lvl, m in issues if lvl == "error"]
    assert any("Main Deck" in m for m in errors)           # 6 cartes < 40
    assert any("interdite" in m for m in errors)           # Rivalité
    assert any("limitée" in m for m in errors)             # 2 Plumeau
    assert any("possèdes" in m for lvl, m in issues)       # stock dépassé


def test_hypergeometric_matches_known_values():
    assert A.p_at_least(3, 40, 5) == pytest.approx(0.3376, abs=1e-4)
    assert A.p_at_least(0, 40, 5) == 0
    assert A.p_at_least(40, 40, 5) == 1


def test_roles(by_id):
    assert A.role(by_id[1]) == A.MEKK
    assert A.role(by_id[6]) == A.LEGACY
    assert A.role(by_id[7]) == A.INTERRUPT
    assert A.role(by_id[10]) == A.BREAKER
    assert A.role(by_id[11]) == A.PSYCHIC


# ----------------------------------------------------------------- simulation

def test_protection_excludes_weak_traps_and_mulcharmy(by_id):
    assert S.card_flags(by_id[6])["protect"]          # Piège Héritage du Monde
    assert S.card_flags(by_id[17])["protect"]         # Jugement Solennel
    assert not S.card_flags(by_id[12])["protect"]     # Pommes d'Or
    assert not S.card_flags(by_id[13])["protect"]     # Mulcharmy : inutilisable après ton tour
    assert S.card_flags(by_id[13])["interrupt"]       # ... mais interruption en second


@pytest.mark.parametrize("hand,first,expected", [
    ([1, 10, 11, 11, 11], True, "Jouable"),     # Mekk + Magie à poser, pas de protection
    ([1, 6, 11, 11, 11], True, "Forte"),        # ... avec un Piège Héritage
    ([1, 11, 11, 11, 11], True, "Bloquée"),     # Mekk seul sur terrain vide
    ([5, 11, 11, 11, 11], True, "Jouable"),     # Mémoire invoque depuis le deck
    ([1, 11, 11, 11, 11, 11], False, "Jouable"),  # en second, un starter suffit
    ([11, 11, 11, 11, 11, 7], False, "Bloquée"),
])
def test_hand_verdicts(by_id, hand, first, expected):
    assert S.describe_hand([by_id[i] for i in hand], first)[0] == expected


def test_simulation_rates_are_consistent(by_id):
    deck = [by_id[i] for i in (1, 2, 3, 4, 5, 6, 7, 8) for _ in range(3)] + [by_id[11]] * 16
    k = S.simulate(deck, n=5000)
    assert 0 <= k.strong_first <= k.playable_first <= 1
    assert k.playable_second >= k.playable_first - 0.05  # une carte de plus en second
    assert k.brick_first == pytest.approx(A.p_at_least(0, 40, 5) + 1 - A.p_at_least(15, 40, 5), abs=0.02)


# ----------------------------------------------------------------- optimiseur

def test_optimizer_respects_stock_banlist_size_and_constraints(con):
    opts = O.Options(size=40, iterations=300, hands=1000, locked={19: 1}, excluded={7})
    r = O.optimize(con, opts)
    assert sum(r.main.values()) == 40
    assert 7 not in r.main and r.main.get(19, 0) >= 1
    assert 15 not in r.main                               # interdite
    assert r.main.get(14, 0) <= 1                         # limitée
    assert all(q <= 3 for q in r.main.values())
    assert sum(r.extra.values()) <= 15 and 33 not in r.extra   # Utopie : ni Mekk ni générique


def test_optimizer_prefers_engine_cards_over_off_plan(con):
    r = O.optimize(con, O.Options(size=40, iterations=500, hands=2000))
    engine = sum(q for cid, q in r.main.items() if cid in (1, 2, 3, 4, 5, 18))
    assert engine >= 15
    assert r.main.get(12, 0) == 0                         # Pommes d'Or ne sert à rien au modèle


def test_optimizer_reports_impossible_constraints(con):
    with pytest.raises(ValueError):
        O.optimize(con, O.Options(size=40, excluded=set(range(1, 21)) - {1}))

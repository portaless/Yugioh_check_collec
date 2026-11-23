import pytest

from ygo import analysis as A
from ygo import plan as P
from ygo import optimizer as O
from ygo import simulation as S
from ygo.importer import Matcher, merge_rows, normalize, tidy_excel


# ----------------------------------------------------------------- import / reconnaissance

def test_normalize_ignores_case_accents_and_punctuation():
    assert normalize("Cœur de l'Héritage — du Monde !") == "coeur de l heritage du monde"


def test_identical_rows_are_merged_with_summed_quantity():
    rows = [{"carte": "Raigeki", "nombre": 1, "rareté": "Commune", "code": "LOB"},
            {"carte": "raigeki ", "nombre": 2, "rareté": "commune", "code": "LOB"},
            {"carte": "Raigeki", "nombre": None, "rareté": "Super Rare", "code": "LOB"}]
    merged = merge_rows(rows)
    assert [(r["rareté"], r["nombre"]) for r in merged] == [("Commune", 3), ("Super Rare", None)]


def test_tidy_excel_merges_identical_rows_in_the_file(tmp_path):
    import openpyxl
    path = tmp_path / "c.xlsx"
    wb = openpyxl.Workbook()
    for row in (["carte", "nombre", "rareté"], ["Raigeki", 1, "Commune"], ["Pot de Cupidité", 2, None],
                ["raigeki", 2, "Commune"], ["Raigeki", 1, "Ultra Rare"]):
        wb.active.append(row)
    wb.save(path)
    assert tidy_excel(path) == 1
    rows = list(openpyxl.load_workbook(path).active.iter_rows(min_row=2, values_only=True))
    assert rows == [("Raigeki", 3, "Commune"), ("Pot de Cupidité", 2, None), ("Raigeki", 1, "Ultra Rare")]


def test_matcher_tolerates_typos_and_uses_french_names(con):
    m = Matcher(con)
    assert m.match("ciel bleu mekk chevalier", "main", 5)[0] == 1
    assert m.match("Mekk-Knight Red Mon", "main", 7)[0] == 2       # faute de frappe
    assert m.match("raigeki", "spell", None)[0] == 10


def test_official_french_names_fill_cards_without_translation(con, tmp_path, monkeypatch):
    import json
    from ygo import importer, noms_fr
    path = tmp_path / "noms.json"
    path.write_text(json.dumps({"noms": {"2": "Lune Rouge Mekk-Chevalier", "3": "Nom à ne pas appliquer"},
                                "absents": []}), encoding="utf8")
    monkeypatch.setattr(noms_fr, "PATH", path)
    monkeypatch.setattr(importer, "TRANSLATIONS_PATH", tmp_path / "absent.json")
    con.execute("UPDATE cards SET desc_fr = 'texte officiel' WHERE id = 3")  # carte déjà traduite par l'API
    importer.fill_missing_french_names(con)
    names = dict(con.execute("SELECT id, name_fr FROM cards WHERE id IN (2, 3)").fetchall())
    assert names[2] == "Lune Rouge Mekk-Chevalier"
    assert names[3] != "Nom à ne pas appliquer"


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


MEKK = P.Plan(("Mekk-Knight",))


def test_roles_come_from_the_deck_engine(by_id):
    assert P.role(by_id[1], MEKK) == P.STARTER
    assert P.flags(by_id[1], MEKK)["column"] and not P.flags(by_id[5], MEKK)["column"]  # Mémoire : starter libre
    assert P.role(by_id[4], MEKK) == P.STARTER            # Girsu envoie depuis le deck
    assert P.role(by_id[6], MEKK) == P.ENGINE             # Piège de l'archétype
    assert P.role(by_id[7], MEKK) == P.INTERRUPT
    assert P.role(by_id[10], MEKK) == P.BREAKER
    assert P.role(by_id[17], MEKK) == P.PROTECTION
    assert P.role(by_id[11], MEKK) == P.OFFPLAN
    assert P.role(by_id[30], MEKK) == P.EXTRA_ENGINE
    # même carte, autre moteur : un Mekk-Chevalier devient hors moteur
    assert P.role(by_id[1], P.Plan(("Lunalight",))) == P.OFFPLAN


def test_engine_is_detected_and_includes_support_naming_it(by_id):
    deck = [{**by_id[i], "zone": "main", "quantity": 3} for i in (1, 2, 7, 10)]
    assert P.detect(deck) == MEKK
    support = {"name_en": "Support", "frame_type": "spell", "archetype": None,
               "desc_en": 'Add 1 "Mekk-Knight" card from your Deck to your hand.'}
    assert P.flags(support, MEKK)["starter"]


# ----------------------------------------------------------------- simulation

def test_protection_excludes_weak_traps_and_mulcharmy(by_id):
    assert S.card_flags(by_id[6], MEKK)["protect"]          # Piège Héritage du Monde
    assert S.card_flags(by_id[17], MEKK)["protect"]         # Jugement Solennel
    assert not S.card_flags(by_id[12], MEKK)["protect"]     # Pommes d'Or
    assert not S.card_flags(by_id[13], MEKK)["protect"]     # Mulcharmy : inutilisable après ton tour
    assert S.card_flags(by_id[13], MEKK)["interrupt"]       # ... mais interruption en second


@pytest.mark.parametrize("hand,first,expected", [
    ([1, 10, 11, 11, 11], True, "Jouable"),     # Mekk + Magie à poser, pas de protection
    ([1, 6, 11, 11, 11], True, "Forte"),        # ... avec un Piège Héritage
    ([1, 11, 11, 11, 11], True, "Bloquée"),     # Mekk seul sur terrain vide
    ([5, 11, 11, 11, 11], True, "Jouable"),     # Mémoire invoque depuis le deck
    ([1, 11, 11, 11, 11, 11], False, "Jouable"),  # en second, un starter suffit
    ([11, 11, 11, 11, 11, 7], False, "Bloquée"),
])
def test_hand_verdicts(by_id, hand, first, expected):
    assert S.describe_hand([by_id[i] for i in hand], first, MEKK)[0] == expected


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


def test_decks_survive_a_fresh_clone(con, tmp_path, monkeypatch):
    from ygo import install
    monkeypatch.setattr(install, "DECKS_PATH", tmp_path / "decks.json")
    deck_id = con.execute("INSERT INTO decks (name, notes) VALUES ('mon deck', 'note')").lastrowid
    con.executemany("INSERT INTO deck_cards VALUES (?, ?, ?, ?)", [(deck_id, 1, "main", 3), (deck_id, 30, "extra", 1)])
    assert install.export_decks(con) and not install.export_decks(con)  # inchangé : fichier non réécrit
    con.execute("DELETE FROM decks")
    path = install.DECKS_PATH  # carte 999 : absente du catalogue du clone
    path.write_text(path.read_text(encoding="utf8").replace("30,", "999,"), encoding="utf8")
    assert install.restore_decks(con) == 1
    assert [tuple(r) for r in con.execute("SELECT card_id, zone, quantity FROM deck_cards")] == [(1, "main", 3)]


def test_personal_collection_starts_from_a_blank_excel(tmp_path, monkeypatch):
    from ygo import importer, install
    monkeypatch.setattr(install, "PERSONAL_DIR", tmp_path / "ma_collection")
    assert install.create_personal() and not install.create_personal()  # jamais écrasé
    sheets = importer.read_excel(tmp_path / "ma_collection" / "yugioh.xlsx")
    assert sheets == {"classeur": [], "deck_mon_deck": []}


def test_optimizer_builds_bigger_main_decks(con):
    r = O.optimize(con, O.Options(size=50, iterations=200, hands=1000))
    assert sum(r.main.values()) == 50 and not [i for i in A.check(_as_cards(con, r)) if i[0] == "error"]


def _as_cards(con, r):
    rows = {c["id"]: dict(c) for c in con.execute("SELECT c.*, o.owned FROM cards c JOIN owned o ON o.card_id = c.id")}
    return ([{**rows[i], "zone": "main", "quantity": q} for i, q in r.main.items()]
            + [{**rows[i], "zone": "extra", "quantity": q} for i, q in r.extra.items()])


def test_extra_deck_respects_size_forced_and_excluded_cards(con):
    main = {1: 3, 4: 1}
    assert O.build_extra(con, main) == {30: 2, 31: 1, 32: 2}  # Lien Mekk, puis génériques (Synchro : Girsu)
    opts = O.Options(extra_size=2, extra_locked={33: 1}, extra_excluded={31})
    assert O.build_extra(con, main, opts) == {33: 1, 30: 1}  # Utopie forcée, puis la place restante


def test_simulated_duel_is_played_turn_by_turn_on_a_legal_board(by_id):
    from ygo import duel as D
    deck = [dict(c, zone="extra" if c["frame_type"] in ("link", "synchro", "xyz") else "main",
                 quantity=3 if c["frame_type"] not in ("link", "synchro", "xyz") else 1) for c in by_id.values()]
    for seed in range(40):
        game = D.play(deck, deck, ("A", "B"), (MEKK, MEKK), seed, seed % 2 == 0)
        steps = game["steps"]
        assert steps[0]["turn"] == 0 and steps[-1]["phase"] == "Bilan"
        assert game["winner"] in ("A", "B", None)
        for s in steps:
            for side in (s["a"], s["b"]):
                assert len(side["monsters"]) <= 5 and len(side["backrow"]) <= 5
                total = sum(len(side[z]) for z in ("hand", "monsters", "backrow", "gy")) + side["deck"] + side["extra"]
                assert total == sum(c["quantity"] for c in deck)   # aucune carte perdue ni dupliquée
                assert all(c["frame_type"] not in ("spell", "trap")
                           for c in side["monsters"] for c in [by_id[c["id"]]])


def test_bot_roles_for_the_playable_duel(by_id):
    from ygo import playtest as T
    deck = [dict(c, zone="main", quantity=2, linkval=None, atk=1000, **{"def": 1000}, desc_fr=None, attribute="LIGHT")
            for c in by_id.values() if c["frame_type"] not in ("link", "synchro", "xyz")]
    side = T.side("Test", T.from_deck(deck, "main"), [], MEKK, {})
    roles = {c["en"]: c["role"] for c in side["main"]}
    assert len(side["main"]) == 2 * len(deck) and side["life"] == 8000
    assert roles["Ash Blossom & Joyous Spring"] == "negate"
    assert roles["Harpie's Feather Duster"] == "spell_wipe" and roles["Raigeki"] == "monster_wipe"
    assert roles["Solemn Judgment"] == "protect"                # Piège posé : annule une activation ou une attaque
    assert roles["Mulcharmy Fuwalos"] == "draw"
    blue_sky = next(c for c in side["main"] if c["en"] == "Mekk-Knight Blue Sky")
    assert blue_sky["starter"] and blue_sky["engine"] and blue_sky["name"] == "Ciel Bleu Mekk-Chevalier"

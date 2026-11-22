"""Base SQLite de test, autonome : pas besoin du catalogue téléchargé ni de l'Excel."""
import pytest

from ygo.db import connect


def card(id, name_en, frame="effect", archetype=None, race="Psychic", level=4, ban=None, desc="", name_fr=None):
    return {"id": id, "name_en": name_en, "name_fr": name_fr, "frame_type": frame, "archetype": archetype,
            "race": race, "level": level, "ban_tcg": ban, "desc_en": desc, "attribute": "LIGHT"}


# Un mini-stock Mekk-Chevalier : de quoi construire un deck de 40 cartes
CARDS = [
    card(1, "Mekk-Knight Blue Sky", archetype="Mekk-Knight", level=5, name_fr="Ciel Bleu Mekk-Chevalier"),
    card(2, "Mekk-Knight Red Moon", archetype="Mekk-Knight", level=7),
    card(3, "Mekk-Knight Purple Nightfall", archetype="Mekk-Knight", level=8),
    card(4, "Girsu, the Orcust Mekk-Knight", archetype="Mekk-Knight", race="Machine"),
    card(5, "World Legacy's Memory", frame="spell", archetype="Mekk-Knight", race="Quick-Play"),
    card(6, "World Legacy's Secret", frame="trap", archetype="Mekk-Knight", race="Continuous"),
    card(7, "Ash Blossom & Joyous Spring", race="Zombie", level=3),
    card(8, "Infinite Impermanence", frame="trap", race="Normal"),
    card(9, "Effect Veiler", race="Spellcaster", level=1),
    card(10, "Raigeki", frame="spell", race="Normal"),
    card(11, "Krebons", level=2),
    card(12, "The Golden Apples", frame="trap", race="Normal"),
    card(13, "Mulcharmy Fuwalos", race="Winged Beast"),
    card(14, "Harpie's Feather Duster", frame="spell", race="Normal", ban="Limited"),
    card(15, "Rivalry of Warlords", frame="trap", race="Continuous", ban="Forbidden"),
    card(16, "Pot of Avarice", frame="spell", race="Normal"),
    card(17, "Solemn Judgment", frame="trap", race="Counter"),
    card(18, "Mekk-Knight Yellow Star", archetype="Mekk-Knight", level=7),
    card(19, "Psychic Commander", level=3),
    card(20, "Telepathic Power", frame="trap", race="Normal"),
    card(30, "Mekk-Knight Crusadia Avramax", frame="link", archetype="Mekk-Knight", race="Cyberse", level=None),
    card(31, "Accesscode Talker", frame="link", race="Cyberse", level=None),
    card(32, "Hyper Psychic Blaster", frame="synchro", level=9),
    card(33, "Number 39: Utopia", frame="xyz", race="Warrior"),
]
OWNED = {i: 3 for i in range(1, 21)} | {14: 1, 15: 1, 30: 2, 31: 1, 32: 2, 33: 1}


@pytest.fixture
def con(tmp_path):
    con = connect(tmp_path / "test.db")
    for c in CARDS:
        con.execute("""INSERT INTO cards (id, name_en, name_fr, type, frame_type, race, attribute, level, archetype,
                       desc_en, ban_tcg, image_url) VALUES (?, ?, ?, '', ?, ?, ?, ?, ?, ?, ?, '')""",
                    (c["id"], c["name_en"], c["name_fr"], c["frame_type"], c["race"], c["attribute"], c["level"],
                     c["archetype"], c["desc_en"], c["ban_tcg"]))
    for cid, q in OWNED.items():
        con.execute("INSERT INTO collection (card_id, excel_name, location, quantity, match_score) VALUES (?, ?, 'test', ?, 100)",
                    (cid, f"carte {cid}", q))
    con.commit()
    return con


@pytest.fixture
def by_id():
    return {c["id"]: c for c in CARDS}

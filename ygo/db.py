"""Base SQLite : catalogue des cartes, collection (stock) et decks."""
import sqlite3
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"
DB_PATH = DATA_DIR / "yugioh.db"
# Collection, decks, corrections et historique : dossier ma_collection/ s'il existe (non versionné, pour qui
# récupère le dépôt et veut sa propre collection), sinon ceux du dépôt.
PERSONAL_DIR = ROOT / "ma_collection"
USER_DIR = PERSONAL_DIR if PERSONAL_DIR.is_dir() else ROOT

SCHEMA = """
CREATE TABLE IF NOT EXISTS cards (
    id           INTEGER PRIMARY KEY,   -- passcode Konami
    name_en      TEXT NOT NULL,
    name_fr      TEXT,
    type         TEXT,                  -- ex. 'Effect Monster', 'Spell Card', 'Link Monster'
    frame_type   TEXT,                  -- normal/effect/fusion/synchro/xyz/link/spell/trap/..._pendulum
    race         TEXT,                  -- type de monstre ou sous-type de magie/piège
    attribute    TEXT,
    level        INTEGER,               -- niveau / rang
    atk          INTEGER,
    def          INTEGER,
    linkval      INTEGER,
    linkmarkers  TEXT,
    scale        INTEGER,
    archetype    TEXT,
    desc_en      TEXT,
    desc_fr      TEXT,
    ban_tcg      TEXT,                  -- Banned / Limited / Semi-Limited / NULL
    ban_ocg      TEXT,
    image_url    TEXT,
    price_cm     REAL
);
CREATE INDEX IF NOT EXISTS idx_cards_archetype ON cards(archetype);

-- Codes d'illustrations alternatives (ex. une autre version de Floraison de Cendres) -> carte principale
CREATE TABLE IF NOT EXISTS card_alias (
    alias_id INTEGER PRIMARY KEY,
    card_id  INTEGER NOT NULL
);

-- Une ligne par carte et par emplacement (feuille Excel : classeur, boîte, deck...)
CREATE TABLE IF NOT EXISTS collection (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    card_id      INTEGER REFERENCES cards(id),   -- NULL si non reconnue
    excel_name   TEXT NOT NULL,
    location     TEXT NOT NULL,
    quantity     INTEGER NOT NULL DEFAULT 1,
    match_score  REAL,
    rarity       TEXT,                           -- colonne « rareté » de l'Excel, libre
    set_code     TEXT                            -- colonne « code » de l'Excel (ex. CRMS-FR042), facultative
);

-- Corrections manuelles de reconnaissance, conservées entre deux imports
CREATE TABLE IF NOT EXISTS name_overrides (
    excel_name TEXT PRIMARY KEY,
    card_id    INTEGER NOT NULL REFERENCES cards(id)
);

CREATE TABLE IF NOT EXISTS decks (
    id     INTEGER PRIMARY KEY AUTOINCREMENT,
    name   TEXT UNIQUE NOT NULL,
    notes  TEXT
);

CREATE TABLE IF NOT EXISTS deck_cards (
    deck_id  INTEGER NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
    card_id  INTEGER NOT NULL REFERENCES cards(id),
    zone     TEXT NOT NULL CHECK (zone IN ('main', 'extra', 'side')),
    quantity INTEGER NOT NULL DEFAULT 1,
    PRIMARY KEY (deck_id, card_id, zone)
);

-- Produits Cardmarket (fichiers publics) avec leur prix ; rareté et numéro venus de CardTrader si disponibles
CREATE TABLE IF NOT EXISTS cm_products (
    id         INTEGER PRIMARY KEY,   -- idProduct Cardmarket
    expansion  INTEGER,
    name       TEXT,                  -- nom anglais normalisé
    trend      REAL,
    low        REAL,
    avg30      REAL,
    ct_rarity  TEXT,
    ct_number  TEXT
);
CREATE INDEX IF NOT EXISTS idx_cm_products_name ON cm_products(expansion, name);

-- Impressions de chaque carte (YGOPRODeck) et produit Cardmarket associé, voir ygo/cardmarket.py
CREATE TABLE IF NOT EXISTS printings (
    card_id     INTEGER NOT NULL,
    set_name    TEXT NOT NULL,
    set_code    TEXT,
    rarity      TEXT,
    expansion   INTEGER,              -- extension Cardmarket
    cm_product  INTEGER,
    confidence  TEXT                  -- manuel / exact / deduit / doute / NULL (pas de prix)
);
CREATE INDEX IF NOT EXISTS idx_printings_card ON printings(card_id);

-- Stock total par carte, toutes localisations confondues
CREATE VIEW IF NOT EXISTS owned AS
    SELECT card_id, SUM(quantity) AS owned
    FROM collection WHERE card_id IS NOT NULL GROUP BY card_id;
"""

EXTRA_FRAMES = ("fusion", "synchro", "xyz", "link")


def connect(path: Path = DB_PATH) -> sqlite3.Connection:
    DATA_DIR.mkdir(exist_ok=True)
    con = sqlite3.connect(path, check_same_thread=False)
    con.row_factory = sqlite3.Row
    con.execute("PRAGMA foreign_keys = ON")
    con.executescript(SCHEMA)
    # bases créées avant l'ajout de la rareté et du code d'impression
    columns = {r["name"] for r in con.execute("PRAGMA table_info(collection)")}
    for column in ("rarity", "set_code"):
        if column not in columns:
            con.execute(f"ALTER TABLE collection ADD COLUMN {column} TEXT")
    return con


def is_extra(frame_type: str | None) -> bool:
    return bool(frame_type) and frame_type.split("_")[0] in EXTRA_FRAMES

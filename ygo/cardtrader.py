"""CardTrader : rareté exacte des produits Cardmarket.

Chaque impression (« blueprint ») CardTrader porte sa rareté, son numéro de collection et les identifiants
Cardmarket correspondants (card_market_ids). On s'en sert uniquement pour savoir quelle rareté se cache
derrière chaque produit Cardmarket ; les prix restent ceux de Cardmarket.

Le jeton personnel se trouve dans les paramètres du profil CardTrader (compte gratuit). Il se met dans
data/cardtrader_token.txt (non versionné) ou dans la variable d'environnement CARDTRADER_TOKEN.
L'index obtenu est aussi copié, compressé, dans cardtrader_index.json.gz (versionné) : un clone du dépôt
a ainsi les raretés exactes sans jeton.
"""
import gzip
import json
import os
import time

import requests

from . import rarity as R
from .db import DATA_DIR, ROOT

API = "https://api.cardtrader.com/api/v2"
TOKEN_PATH = DATA_DIR / "cardtrader_token.txt"
CACHE_DIR = DATA_DIR / "cardtrader"
INDEX_PATH = CACHE_DIR / "cardmarket_index.json"
SHARED_PATH = ROOT / "cardtrader_index.json.gz"


def token() -> str | None:
    if os.environ.get("CARDTRADER_TOKEN"):
        return os.environ["CARDTRADER_TOKEN"].strip()
    if TOKEN_PATH.exists():
        return TOKEN_PATH.read_text(encoding="utf8").strip() or None
    return None


def _get(session: requests.Session, path: str, **params):
    for attempt in range(5):
        r = session.get(f"{API}{path}", params=params, timeout=60)
        if r.status_code == 429:  # 200 requêtes / 10 s : on patiente
            time.sleep(2 + 2 * attempt)
            continue
        r.raise_for_status()
        return r.json()
    r.raise_for_status()


def _fixed(bp: dict, word: str):
    """Valeur d'une propriété fixe dont le nom contient `word` (ex. yugioh_rarity, collector_number)."""
    for key, value in (bp.get("fixed_properties") or {}).items():
        if word in key and value not in (None, ""):
            return value
    return None


def download(refresh: bool = False, log=print) -> dict[int, dict]:
    """Construit {id produit Cardmarket: {rarity, number, expansion}} à partir des blueprints Yu-Gi-Oh!."""
    tok = token()
    if not tok:
        raise RuntimeError(f"Pas de jeton CardTrader : mets-le dans {TOKEN_PATH}")
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    session = requests.Session()
    session.headers["Authorization"] = f"Bearer {tok}"
    games = _get(session, "/games")
    games = games.get("array", games) if isinstance(games, dict) else games
    game_id = next(g["id"] for g in games if "yu-gi-oh" in (g.get("name") or g.get("display_name") or "").lower())
    expansions = [e for e in _get(session, "/expansions") if e["game_id"] == game_id]
    log(f"CardTrader : {len(expansions)} extensions Yu-Gi-Oh!")
    index = {}
    for n, exp in enumerate(expansions, 1):
        path = CACHE_DIR / f"bp_{exp['id']}.json"
        if refresh or not path.exists():
            path.write_text(json.dumps(_get(session, "/blueprints/export", expansion_id=exp["id"])), encoding="utf8")
            time.sleep(0.06)
        for bp in json.loads(path.read_text(encoding="utf8")):
            rarity = R.canonical(_fixed(bp, "rarity"))
            for cm_id in bp.get("card_market_ids") or []:
                # numéro sans préfixe (« 020 », « 020ul ») : le préfixe est le code de l'extension (« crms »)
                index[int(cm_id)] = {"rarity": rarity, "number": _fixed(bp, "collector"), "expansion": exp["name"],
                                     "code": (exp.get("code") or "").upper()}
        if n % 100 == 0:
            log(f"  {n}/{len(expansions)} extensions lues")
    INDEX_PATH.write_text(json.dumps(index), encoding="utf8")
    # mtime=0 : même contenu, même fichier, pas de faux changement pour git
    SHARED_PATH.write_bytes(gzip.compress(json.dumps(index, sort_keys=True).encode("utf8"), 9, mtime=0))
    return index


def load_index() -> dict[int, dict]:
    """Index téléchargé avec le jeton, sinon la copie versionnée du dépôt."""
    if INDEX_PATH.exists():
        data = INDEX_PATH.read_text(encoding="utf8")
    elif SHARED_PATH.exists():
        data = gzip.decompress(SHARED_PATH.read_bytes()).decode("utf8")
    else:
        return {}
    return {int(k): v for k, v in json.loads(data).items()}

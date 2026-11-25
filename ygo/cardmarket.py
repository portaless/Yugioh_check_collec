"""Prix Cardmarket par impression (extension + rareté).

Sources :
- fichiers publics de Cardmarket (mis à jour chaque jour, sans compte) : liste des produits et guide des prix.
  Ils ne donnent ni la rareté ni le nom des extensions, seulement des numéros ;
- catalogue YGOPRODeck : impressions de chaque carte (extension, code, rareté) ;
- CardTrader (facultatif, jeton gratuit) : rareté exacte de chaque produit Cardmarket, voir ygo/cardtrader.py.

Le rapprochement avec les produits et le calcul des prix sont dans ygo/cardmarket_match.py.

Usage :  python -m ygo.cardmarket [--refresh] [--cardtrader]
"""
import json
import re
import sys
from collections import defaultdict

import requests

from . import cardtrader
from . import rarity as R
from .db import DATA_DIR, USER_DIR, connect

FILES = {
    "products": "https://downloads.s3.cardmarket.com/productCatalog/productList/products_singles_3.json",
    "prices": "https://downloads.s3.cardmarket.com/productCatalog/priceGuide/price_guide_3.json",
}
CM_DIR = DATA_DIR / "cardmarket"
CHOICES_PATH = USER_DIR / "versions_cardmarket.json"
SEARCH_URL = "https://www.cardmarket.com/fr/YuGiOh/Products/Search?searchString="


def download(force: bool = False, only: tuple[str, ...] = tuple(FILES)) -> None:
    CM_DIR.mkdir(parents=True, exist_ok=True)
    for name, url in FILES.items():
        if name not in only:
            continue
        path = CM_DIR / f"{name}.json"
        if path.exists() and not force:
            continue
        r = requests.get(url, timeout=300)
        r.raise_for_status()
        path.write_bytes(r.content)


def norm(name: str) -> str:
    return "".join(ch for ch in name.lower() if ch.isalnum())


def split_code(code: str | None) -> tuple[str, str] | None:
    """'CRMS-FR042' -> ('CRMS', '042') : le préfixe et le numéro, sans la langue.
    Tolère la lettre O pour un zéro, coquille du catalogue (« LAVD-ENO04 »)."""
    m = re.match(r"^\s*([A-Z0-9]+)-[A-Z]{0,2}([\dO]*\d[\dO]*)", str(code or "").upper())
    return (m.group(1), m.group(2).replace("O", "0")) if m else None


def french_code(code: str | None) -> str:
    """Code d'impression de la version française (« RA02-EN013 » -> « RA02-FR013 ») : les cartes françaises gardent
    le même numéro. Corrige au passage la lettre O mise pour un zéro."""
    split = split_code(code)
    return f"{split[0]}-FR{split[1]}" if split else str(code or "").replace("-EN", "-FR")


def same_code(printed: str | None, owned: str) -> bool:
    """Le code noté dans l'Excel désigne-t-il cette impression ? Un préfixe seul (« CRMS ») suffit."""
    owned = owned.strip().upper()
    full = split_code(owned)
    if full:
        return split_code(printed) == full
    if "-" in owned:  # numéro inhabituel (« LAVD-FRL26 ») : même code, langue mise à part
        return _without_language(printed) == _without_language(owned)
    return str(printed or "").split("-")[0].upper() == owned


def _without_language(code: str | None) -> str:
    return re.sub(r"^([A-Z0-9]+)-[A-Z]{2}", r"\1-", str(code or "").strip().upper())


def _digits(number) -> str:
    """Numéro CardTrader « 020ul » -> « 20 »."""
    return re.sub(r"\D", "", str(number or "")).lstrip("0")


def load_choices() -> dict[str, int]:
    if not CHOICES_PATH.exists():
        return {}
    return {k: int(v) for k, v in json.loads(CHOICES_PATH.read_text(encoding="utf8")).items() if not k.startswith("_")}


def choice_key(card_id: int, set_code: str, rarity: str) -> str:
    return f"{card_id}|{set_code}|{rarity}"


def save_choice(con, card_id: int, set_code: str, rarity: str, product: int) -> None:
    data = json.loads(CHOICES_PATH.read_text(encoding="utf8")) if CHOICES_PATH.exists() else {
        "_doc": "Produit Cardmarket choisi à la main pour une impression : « code carte|code impression|rareté »."}
    data[choice_key(card_id, set_code, rarity)] = int(product)
    CHOICES_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf8")
    con.execute("UPDATE printings SET cm_product = ?, confidence = 'manuel' WHERE card_id = ? AND set_code = ? AND rarity = ?",
                (int(product), card_id, set_code, rarity))
    con.commit()


def load_guide() -> tuple[str, dict[int, dict]]:
    """Guide des prix téléchargé : (date de publication AAAA-MM-JJ, {idProduct: prix})."""
    data = json.loads((CM_DIR / "prices.json").read_text(encoding="utf8"))
    return data["createdAt"][:10], {g["idProduct"]: g for g in data["priceGuides"]}


def refresh_prices(con) -> str:
    """Retélécharge seulement le guide des prix et met à jour cm_products, sans tout recalculer."""
    download(force=True, only=("prices",))
    day, guide = load_guide()
    con.executemany("UPDATE cm_products SET trend = ?, low = ?, avg30 = ? WHERE id = ?",
                    [(g.get("trend"), g.get("low"), g.get("avg30"), pid) for pid, g in guide.items()])
    con.commit()
    return day


def card_printings(con, card_id: int) -> list[dict]:
    return [dict(r) for r in con.execute("""
        SELECT p.set_name, p.set_code, p.rarity, p.cm_product, p.confidence, m.trend, m.low, m.avg30
        FROM printings p LEFT JOIN cm_products m ON m.id = p.cm_product
        WHERE p.card_id = ? ORDER BY p.set_name""", (card_id,))]


def owned_versions(con, card_id: int, prints: list[dict] | None = None) -> list[dict]:
    """Exemplaires possédés regroupés par rareté (et code si l'Excel le précise), avec l'impression retenue.

    Sans code, la rareté seule peut correspondre à plusieurs extensions : on retient la moins chère et on
    indique le nombre d'extensions possibles."""
    prints = card_printings(con, card_id) if prints is None else prints
    rows = con.execute("""SELECT rarity, set_code, SUM(quantity) AS qty FROM collection
                          WHERE card_id = ? GROUP BY rarity, set_code""", (card_id,)).fetchall()
    return _versions(prints, rows)


def _versions(prints: list[dict], rows) -> list[dict]:
    merged = defaultdict(int)
    for r in rows:
        merged[(R.canonical(r["rarity"]), (r["set_code"] or "").strip().upper() or None)] += r["qty"]
    out = []
    for (rar, code), qty in merged.items():
        matches = [p for p in prints if (rar is None or p["rarity"] == rar)
                   and (code is None or same_code(p["set_code"], code))]
        priced = sorted((p for p in matches if p["trend"] is not None), key=lambda p: p["trend"])
        best = priced[0] if priced else (matches[0] if matches else None)
        out.append({"rarity": rar, "code": code, "qty": qty, "print": best,
                    "sets": len({p["set_name"] for p in matches}), "known": bool(matches)})
    return sorted(out, key=lambda v: R.rank(v["rarity"] or ""))


def owned_by_card(con) -> dict[int, list[dict]]:
    """Exemplaires possédés de chaque carte, regroupés par version (voir _versions), en deux requêtes."""
    prints, rows = defaultdict(list), defaultdict(list)
    for r in con.execute("""SELECT p.card_id, p.set_name, p.set_code, p.rarity, p.cm_product, p.confidence,
                                   m.trend, m.low, m.avg30
                            FROM printings p LEFT JOIN cm_products m ON m.id = p.cm_product
                            WHERE p.card_id IN (SELECT card_id FROM collection)"""):
        prints[r["card_id"]].append(dict(r))
    for r in con.execute("""SELECT card_id, rarity, set_code, SUM(quantity) AS qty FROM collection
                            WHERE card_id IS NOT NULL GROUP BY card_id, rarity, set_code"""):
        rows[r["card_id"]].append(r)
    return {card_id: _versions(prints[card_id], card_rows) for card_id, card_rows in rows.items()}


def collection_value(con) -> dict[int, float]:
    """Valeur de chaque carte possédée, au prix de ses raretés (prix global YGOPRODeck à défaut)."""
    fallback = dict(con.execute("SELECT id, price_cm FROM cards WHERE id IN (SELECT card_id FROM collection)").fetchall())
    values = {}
    for card_id, versions in owned_by_card(con).items():
        total = 0.0
        for v in versions:
            price = v["print"]["trend"] if v["print"] and v["print"]["trend"] is not None else fallback.get(card_id)
            total += v["qty"] * (price or 0)
        values[card_id] = total
    return values


def search_url(name_en: str) -> str:
    return SEARCH_URL + requests.utils.quote(name_en)


def main(argv):
    con = connect()
    if "--cardtrader" in argv:
        cardtrader.download(refresh="--refresh" in argv)
    print("Téléchargement des fichiers Cardmarket…")
    download(force="--refresh" in argv)
    from .cardmarket_match import build  # import ici : cardmarket_match importe ce module
    build(con)


if __name__ == "__main__":
    main(sys.argv[1:])

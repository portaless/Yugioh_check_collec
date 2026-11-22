"""Prix Cardmarket par impression (extension + rareté).

Sources :
- fichiers publics de Cardmarket (mis à jour chaque jour, sans compte) : liste des produits et guide des prix.
  Ils ne donnent ni la rareté ni le nom des extensions, seulement des numéros ;
- catalogue YGOPRODeck : impressions de chaque carte (extension, code, rareté) ;
- CardTrader (facultatif, jeton gratuit) : rareté exacte de chaque produit Cardmarket, voir ygo/cardtrader.py.

Rapprochement d'une impression avec son produit Cardmarket, du plus sûr au moins sûr :
  manuel   choix fait dans la page Corrections (versions_cardmarket.json)
  exact    rareté donnée par CardTrader, ou un seul produit possible
  deduit   plusieurs raretés dans la même extension : attribuées de la plus commune à la plus rare,
           et l'ordre des prix le confirme (affiché « ≈ »)
  doute    l'ordre des prix contredit la déduction, ou nombre de produits différent (affiché « ? »)

Usage :  python -m ygo.cardmarket [--refresh] [--cardtrader]
"""
import json
import re
import sys
from collections import defaultdict

import requests

from . import cardtrader
from . import rarity as R
from .db import DATA_DIR, ROOT, connect

FILES = {
    "products": "https://downloads.s3.cardmarket.com/productCatalog/productList/products_singles_3.json",
    "prices": "https://downloads.s3.cardmarket.com/productCatalog/priceGuide/price_guide_3.json",
}
CM_DIR = DATA_DIR / "cardmarket"
CHOICES_PATH = ROOT / "versions_cardmarket.json"
SEARCH_URL = "https://www.cardmarket.com/fr/YuGiOh/Products/Search?searchString="
MIN_JACCARD = 0.5  # en dessous, l'extension Cardmarket n'est pas reconnue (promos isolées) : pas de prix


def download(force: bool = False) -> None:
    CM_DIR.mkdir(parents=True, exist_ok=True)
    for name, url in FILES.items():
        path = CM_DIR / f"{name}.json"
        if path.exists() and not force:
            continue
        r = requests.get(url, timeout=300)
        r.raise_for_status()
        path.write_bytes(r.content)


def norm(name: str) -> str:
    return "".join(ch for ch in name.lower() if ch.isalnum())


def split_code(code: str | None) -> tuple[str, str] | None:
    """'CRMS-FR042' -> ('CRMS', '042') : le préfixe et le numéro, sans la langue."""
    m = re.match(r"^\s*([A-Z0-9]+)-[A-Z]{0,2}(\d+)", str(code or "").upper())
    return (m.group(1), m.group(2)) if m else None


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


def _expansions(products, sets_by_name, ct_index) -> dict[str, int]:
    """Extension YGOPRODeck -> extension Cardmarket.

    D'abord par CardTrader (numéro de collection d'un produit), sinon par le recouvrement des listes de cartes."""
    mapping = {}
    if ct_index:
        votes = defaultdict(lambda: defaultdict(int))
        prefix_to_set = defaultdict(set)
        for set_name, items in sets_by_name.items():
            for _, code, _ in items:
                if split_code(code):
                    prefix_to_set[split_code(code)[0]].add(set_name)
        for p in products:
            info = ct_index.get(p["idProduct"])
            code = split_code(info and info.get("number"))
            if code and len(prefix_to_set.get(code[0], ())) == 1:
                votes[next(iter(prefix_to_set[code[0]]))][p["idExpansion"]] += 1
        mapping = {s: max(v, key=v.get) for s, v in votes.items()}

    exp_names = defaultdict(set)
    for p in products:
        exp_names[p["idExpansion"]].add(norm(p["name"]))
    by_name = defaultdict(set)
    for e, names in exp_names.items():
        for n in names:
            by_name[n].add(e)
    for set_name, items in sets_by_name.items():
        if set_name in mapping:
            continue
        names = {norm(n) for n, _, _ in items}
        votes = defaultdict(int)
        for n in names:
            for e in by_name.get(n, ()):
                votes[e] += 1
        if not votes:
            continue
        best = max(votes, key=lambda e: votes[e] / len(names | exp_names[e]))
        if votes[best] / len(names | exp_names[best]) >= MIN_JACCARD:
            mapping[set_name] = best
    return mapping


def build(con, log=print) -> dict:
    """Recalcule les tables cm_products et printings."""
    products = json.loads((CM_DIR / "products.json").read_text(encoding="utf8"))["products"]
    guide = {g["idProduct"]: g for g in json.loads((CM_DIR / "prices.json").read_text(encoding="utf8"))["priceGuides"]}
    cards = json.loads((DATA_DIR / "cards_en.json").read_text(encoding="utf8"))["data"]
    ct_index = cardtrader.load_index()
    choices = load_choices()

    con.execute("DELETE FROM cm_products")
    con.executemany("INSERT INTO cm_products VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [
        (p["idProduct"], p["idExpansion"], norm(p["name"]), guide.get(p["idProduct"], {}).get("trend"),
         guide.get(p["idProduct"], {}).get("low"), guide.get(p["idProduct"], {}).get("avg30"),
         (ct_index.get(p["idProduct"]) or {}).get("rarity"), (ct_index.get(p["idProduct"]) or {}).get("number"))
        for p in products])

    sets_by_name = defaultdict(list)
    for c in cards:
        for s in c.get("card_sets") or []:
            sets_by_name[s["set_name"]].append((c["name"], s["set_code"], R.canonical(s["set_rarity"])))
    exp_of = _expansions(products, sets_by_name, ct_index)

    pids = defaultdict(list)
    for p in products:
        pids[(p["idExpansion"], norm(p["name"]))].append(p["idProduct"])
    trend = {pid: (guide.get(pid) or {}).get("trend") for pid in guide}

    rows, stats = [], defaultdict(int)
    for c in cards:
        by_set = defaultdict(list)
        for s in c.get("card_sets") or []:
            by_set[s["set_name"]].append((s["set_code"], R.canonical(s["set_rarity"])))
        for set_name, prints in by_set.items():
            prints = list(dict.fromkeys(prints))  # YGOPRODeck répète parfois une impression
            exp = exp_of.get(set_name)
            cands = sorted(pids.get((exp, norm(c["name"])), [])) if exp else []
            found = _assign(c["id"], prints, cands, ct_index, trend, choices)
            for (code, rar), (pid, conf) in zip(prints, found):
                rows.append((c["id"], set_name, code, rar, exp, pid, conf))
                stats[conf or "sans prix"] += 1
    con.execute("DELETE FROM printings")
    con.executemany("INSERT INTO printings VALUES (?, ?, ?, ?, ?, ?, ?)", rows)
    con.commit()
    log("Impressions : " + ", ".join(f"{k} {v}" for k, v in sorted(stats.items())))
    return dict(stats)


def _assign(card_id, prints, cands, ct_index, trend, choices):
    """[(produit, confiance)] pour chaque impression (code, rareté) d'une carte dans une extension.

    Les impressions de même rareté et même numéro (PSV-088, PSV-E088, PSV-EN088…) sont un seul produit."""
    groups = defaultdict(list)
    for i, (code, rar) in enumerate(prints):
        num = split_code(code)
        groups[(rar, num[1] if num else code)].append(i)
    reps = [idx[0] for idx in groups.values()]
    found = _assign_distinct(card_id, [prints[i] for i in reps], cands, ct_index, trend, choices)
    out = [None] * len(prints)
    for idx, res in zip(groups.values(), found):
        for i in idx:
            out[i] = res
    return out


def _coherent(prices: list) -> bool:
    """L'ordre déduit (rareté croissante) ne contredit pas les prix : corrélation de rang positive ou nulle."""
    pairs = [(i, p) for i, p in enumerate(prices) if p]
    if len(pairs) < 2:
        return True
    concord = sum((b[1] - a[1]) > 0 for k, a in enumerate(pairs) for b in pairs[k + 1:])
    discord = sum((b[1] - a[1]) < 0 for k, a in enumerate(pairs) for b in pairs[k + 1:])
    return concord >= discord


def _assign_distinct(card_id, prints, cands, ct_index, trend, choices):
    out = [None] * len(prints)
    for i, (code, rar) in enumerate(prints):
        if choice_key(card_id, code, rar) in choices:
            out[i] = (choices[choice_key(card_id, code, rar)], "manuel")
    if ct_index and cands:
        for i, (code, rar) in enumerate(prints):
            if out[i]:
                continue
            same = [p for p in cands if (ct_index.get(p) or {}).get("rarity") == rar]
            if len(same) > 1:  # même rareté sous deux numéros : le numéro tranche
                same = [p for p in same if split_code(ct_index[p].get("number")) == split_code(code)] or same[:1]
            if same:
                out[i] = (same[0], "exact")
    todo = [i for i in range(len(prints)) if out[i] is None]
    if not todo:
        return out
    taken = {o[0] for o in out if o}
    free = [p for p in cands if p not in taken]
    if not free:
        return [o or (None, None) for o in out]
    if len(todo) == 1 and len(free) == 1:
        out[todo[0]] = (free[0], "exact")
    elif len(todo) == len(free):
        order = sorted(todo, key=lambda i: R.rank(prints[i][1]))
        coherent = _coherent([trend.get(p) for p in free])
        for i, pid in zip(order, free):
            out[i] = (pid, "deduit" if coherent else "doute")
    else:
        for i in todo:
            out[i] = (None, "doute")
    return out


def candidates(con, card_id: int, set_name: str) -> list[dict]:
    """Produits Cardmarket possibles pour une carte dans une extension (choix manuel)."""
    row = con.execute("SELECT expansion FROM printings WHERE card_id = ? AND set_name = ? LIMIT 1",
                      (card_id, set_name)).fetchone()
    name = con.execute("SELECT name_en FROM cards WHERE id = ?", (card_id,)).fetchone()
    if not row or row["expansion"] is None or not name:
        return []
    return [dict(r) for r in con.execute(
        "SELECT id, trend, low, avg30, ct_rarity FROM cm_products WHERE expansion = ? AND name = ? ORDER BY id",
        (row["expansion"], norm(name["name_en"])))]


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
                   and (code is None or split_code(p["set_code"]) == split_code(code))]
        priced = sorted((p for p in matches if p["trend"] is not None), key=lambda p: p["trend"])
        best = priced[0] if priced else (matches[0] if matches else None)
        out.append({"rarity": rar, "code": code, "qty": qty, "print": best,
                    "sets": len({p["set_name"] for p in matches}), "known": bool(matches)})
    return sorted(out, key=lambda v: R.rank(v["rarity"] or ""))


def collection_value(con) -> dict[int, float]:
    """Valeur de chaque carte possédée, au prix de ses raretés (prix global YGOPRODeck à défaut)."""
    prints, rows = defaultdict(list), defaultdict(list)
    for r in con.execute("""SELECT p.card_id, p.set_name, p.set_code, p.rarity, p.cm_product, p.confidence,
                                   m.trend, m.low, m.avg30
                            FROM printings p LEFT JOIN cm_products m ON m.id = p.cm_product
                            WHERE p.card_id IN (SELECT card_id FROM collection)"""):
        prints[r["card_id"]].append(dict(r))
    for r in con.execute("""SELECT card_id, rarity, set_code, SUM(quantity) AS qty FROM collection
                            WHERE card_id IS NOT NULL GROUP BY card_id, rarity, set_code"""):
        rows[r["card_id"]].append(r)
    fallback = dict(con.execute("SELECT id, price_cm FROM cards WHERE id IN (SELECT card_id FROM collection)").fetchall())
    values = {}
    for card_id, card_rows in rows.items():
        total = 0.0
        for v in _versions(prints[card_id], card_rows):
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
    build(con)


if __name__ == "__main__":
    main(sys.argv[1:])

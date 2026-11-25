"""Rapprochement des impressions du catalogue avec les produits Cardmarket, puis prix de chaque impression.

Rapprochement d'une impression avec son produit Cardmarket, du plus sûr au moins sûr :
  manuel   choix fait dans la page Corrections (versions_cardmarket.json)
  exact    rareté donnée par CardTrader, ou un seul produit possible
  deduit   plusieurs raretés dans la même extension : attribuées de la plus commune à la plus rare,
           et l'ordre des prix le confirme (affiché « ≈ »)
  doute    l'ordre des prix contredit la déduction, ou nombre de produits différent (affiché « ? »)
"""
import json
from collections import defaultdict

from . import cardtrader
from . import rarity as R
from .cardmarket import CM_DIR, _digits, choice_key, load_choices, load_guide, norm, split_code
from .db import DATA_DIR


MIN_JACCARD = 0.5  # en dessous, l'extension Cardmarket n'est pas reconnue (promos isolées) : pas de prix


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
            prefix = (ct_index.get(p["idProduct"]) or {}).get("code")
            if prefix and len(prefix_to_set.get(prefix, ())) == 1:
                votes[next(iter(prefix_to_set[prefix]))][p["idExpansion"]] += 1
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
    _, guide = load_guide()
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
    rows += _missing_prints(cards, products, ct_index, set(exp_of.values()), {r[5] for r in rows})
    stats["exact"] += len(rows) - sum(stats.values())
    con.execute("DELETE FROM printings")
    con.executemany("INSERT INTO printings VALUES (?, ?, ?, ?, ?, ?, ?)", rows)
    con.commit()
    log("Impressions : " + ", ".join(f"{k} {v}" for k, v in sorted(stats.items())))
    return dict(stats)


def _missing_prints(cards, products, ct_index, known_exps: set, used: set) -> list[tuple]:
    """Impressions oubliées par YGOPRODeck (ex. Dark Magician TN23-EN001) : produit Cardmarket d'une extension
    connue, non attribué, dont CardTrader donne la rareté et le numéro."""
    by_name = defaultdict(list)
    for p in products:
        ct = ct_index.get(p["idProduct"])
        if p["idExpansion"] in known_exps and p["idProduct"] not in used and ct and ct.get("rarity") \
                and _digits(ct.get("number")) and ct.get("code"):
            by_name[norm(p["name"])].append((p, ct))
    rows = []
    for c in cards:
        for p, ct in by_name.get(norm(c["name"]), []):
            code = f"{ct['code']}-EN{_digits(ct['number']).zfill(3)}"
            rows.append((c["id"], ct["expansion"], code, ct["rarity"], p["idExpansion"], p["idProduct"], "exact"))
    return rows


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
                num = split_code(code)
                same = [p for p in same if num and _digits(ct_index[p].get("number")) == num[1].lstrip("0")] or same[:1]
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

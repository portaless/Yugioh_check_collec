"""Bourse : évolution du prix Cardmarket des cartes possédées et de la collection.

Chaque jour où les prix sont relevés (ouverture de la page Bourse ou bouton « Mettre à jour les prix »), le prix
tendance de chaque impression possédée est ajouté à historique_prix.csv, et la valeur de la collection du jour à
historique_collection.csv. Ces fichiers sont versionnés : contrairement au reste de data/, ils ne se régénèrent pas.

Pour que la courbe ne parte pas de zéro, le premier relevé d'une impression ajoute trois points estimés à partir
des moyennes Cardmarket sur 30, 7 et 1 jours (placés au milieu de leur période), jamais avant START.
"""
import csv
from datetime import date, timedelta

import pandas as pd

from . import cardmarket as CM
from .db import ROOT

START = date(2026, 11, 1)
HISTORY_PATH = ROOT / "historique_prix.csv"
COLLECTION_PATH = ROOT / "historique_collection.csv"
ESTIMATES = (("avg30", 15), ("avg7", 3), ("avg1", 1))  # moyenne Cardmarket, jours avant la publication


def _read(path) -> list[dict]:
    if not path.exists():
        return []
    with path.open(encoding="utf8", newline="") as f:
        return list(csv.DictReader(f))


def _write(path, fields: list[str], rows: list[dict]) -> None:
    with path.open("w", encoding="utf8", newline="") as f:
        w = csv.DictWriter(f, fields)
        w.writeheader()
        w.writerows(rows)


def load_history() -> pd.DataFrame:
    """Colonnes jour (date), produit (int), prix (float), estime (bool)."""
    rows = _read(HISTORY_PATH)
    df = pd.DataFrame(rows, columns=["jour", "produit", "prix", "estime"])
    return df.astype({"produit": int, "prix": float}).assign(
        jour=pd.to_datetime(df["jour"]).dt.date, estime=df["estime"] == "1")


def tracked(con) -> set[int]:
    """Produits Cardmarket des versions possédées."""
    return {v["print"]["cm_product"] for versions in CM.owned_by_card(con).values() for v in versions
            if v["print"] and v["print"]["cm_product"]}


def record(con, day: str, guide: dict[int, dict], products: set[int] | None = None) -> int:
    """Ajoute le relevé du jour (remplace celui du même jour). Renvoie le nombre de prix relevés."""
    products = tracked(con) if products is None else products
    rows = {(r["jour"], int(r["produit"])): r for r in _read(HISTORY_PATH)}
    known = {p for (_, p), r in rows.items() if r["estime"] == "0"}
    published = date.fromisoformat(day)
    n = 0
    for pid in products:
        g = guide.get(pid) or {}
        if g.get("trend") is None:
            continue
        rows[(day, pid)] = {"jour": day, "produit": pid, "prix": g["trend"], "estime": "0"}
        n += 1
        if pid in known:
            continue
        for field, back in ESTIMATES:
            when = published - timedelta(days=back)
            if g.get(field) is not None and when >= START:
                rows.setdefault((when.isoformat(), pid),
                                {"jour": when.isoformat(), "produit": pid, "prix": g[field], "estime": "1"})
    _write(HISTORY_PATH, ["jour", "produit", "prix", "estime"],
           sorted(rows.values(), key=lambda r: (r["jour"], int(r["produit"]))))

    totals = {r["jour"]: r for r in _read(COLLECTION_PATH)}
    values = CM.collection_value(con)
    totals[day] = {"jour": day, "valeur": round(sum(values.values()), 2),
                   "cartes": con.execute("SELECT COALESCE(SUM(quantity), 0) FROM collection").fetchone()[0]}
    _write(COLLECTION_PATH, ["jour", "valeur", "cartes"], sorted(totals.values(), key=lambda r: r["jour"]))
    return n


def record_current(con) -> int:
    """Relevé à partir du guide des prix déjà téléchargé."""
    day, guide = CM.load_guide()
    return record(con, day, guide)


def ensure_today(con, today: date | None = None) -> str:
    """Relevé du jour s'il manque : retélécharge le guide des prix s'il date d'avant aujourd'hui.
    Renvoie la date du guide relevé."""
    today = today or date.today()
    day, _ = CM.load_guide() if (CM.CM_DIR / "prices.json").exists() else ("", None)
    if day < today.isoformat():
        day = CM.refresh_prices(con)
    if not any(r["jour"] == day and r["estime"] == "0" for r in _read(HISTORY_PATH)):
        record_current(con)
    return day


def market(con) -> dict:
    """Courbes de la collection actuelle aux prix de chaque jour.

    Renvoie {total: DataFrame(jour, valeur, estime), versions: DataFrame (une ligne par version possédée,
    avec sa courbe), prices: DataFrame jour × produit, fixed: valeur des cartes sans cote suivie} ;
    vide s'il n'y a encore aucun relevé."""
    hist = load_history()
    if hist.empty:
        return {}
    prices = hist.pivot_table(index="jour", columns="produit", values="prix", aggfunc="last")
    days = pd.date_range(min(START, min(prices.index)), max(prices.index)).date
    # entre deux relevés le prix est interpolé ; avant le premier et après le dernier, il est supposé inchangé
    prices = prices.reindex(days).interpolate(limit_area="inside").ffill().bfill()
    real_days = set(hist.loc[~hist["estime"], "jour"])
    first_real = min(real_days) if real_days else max(days)

    cards = {r["id"]: r for r in con.execute(
        "SELECT id, name_fr, name_en, price_cm FROM cards WHERE id IN (SELECT card_id FROM collection)")}
    lines, fixed = [], 0.0
    for card_id, versions in CM.owned_by_card(con).items():
        for v in versions:
            pid = v["print"]["cm_product"] if v["print"] else None
            if pid not in prices.columns:
                # sans cote suivie : comptée à son prix actuel, fixe (comme dans la page Collection)
                price = v["print"]["trend"] if v["print"] and v["print"]["trend"] is not None                     else cards[card_id]["price_cm"]
                fixed += v["qty"] * (price or 0)
                continue
            curve = prices[pid]
            lines.append({"card_id": card_id, "carte": cards[card_id]["name_fr"] or cards[card_id]["name_en"], "rareté": v["rarity"],
                          "extension": v["print"]["set_name"], "produit": pid, "qté": v["qty"],
                          "début": curve.iloc[0], "actuel": curve.iloc[-1], "courbe": curve.round(2).tolist()})
    versions = pd.DataFrame(lines)
    total = pd.DataFrame({"jour": days, "valeur": 0.0})
    if not versions.empty:
        qty = versions.groupby("produit")["qté"].sum()
        total["valeur"] = (prices[qty.index] * qty).sum(axis=1).round(2).values
        versions["évolution"] = (versions["actuel"] / versions["début"] - 1) * 100
        versions["gain"] = (versions["actuel"] - versions["début"]) * versions["qté"]
    fixed = round(fixed, 2)
    total["valeur"] += fixed
    total["estime"] = [d < first_real for d in days]
    return {"total": total, "versions": versions, "prices": prices, "fixed": fixed}

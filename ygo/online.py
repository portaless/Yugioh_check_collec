"""Publication en ligne : la collection et les decks partent vers le serveur des duels en ligne (online/server).

L'adresse du serveur et la clé d'identité (copiée depuis la page « Mon compte » de l'appli en ligne) sont gardées dans
data/online.json, dossier non versionné : la clé n'apparaît jamais dans le code.
"""
import json
from collections import defaultdict

import pandas as pd
import requests

from ygo import cardmarket as CM
from ygo import rarity as R
from ygo.db import DATA_DIR, is_extra

CONFIG = DATA_DIR / "online.json"
DEFAULT_SERVER = "http://127.0.0.1:8600"


class OnlineError(Exception):
    """Message à montrer tel quel à l'utilisateur."""


def load_config() -> dict:
    try:
        data = json.loads(CONFIG.read_text(encoding="utf8"))
    except (OSError, ValueError):
        data = {}
    return {"server": data.get("server") or DEFAULT_SERVER, "key": data.get("key") or ""}


def save_config(server: str, key: str) -> None:
    DATA_DIR.mkdir(exist_ok=True)
    CONFIG.write_text(json.dumps({"server": server.strip().rstrip("/"), "key": key.strip()}), encoding="utf8")


def _call(config: dict, method: str, path: str, body: dict | None = None) -> dict:
    if not config["key"]:
        raise OnlineError("Colle d'abord ta clé.")
    try:
        r = requests.request(method, config["server"] + path, json=body, timeout=30,
                             headers={"Authorization": f"Bearer {config['key']}"})
    except requests.RequestException:
        raise OnlineError(f"Serveur injoignable ({config['server']}). Lance-le avec « npm --prefix engine run online ».")
    if r.status_code == 401:
        raise OnlineError("Clé refusée : recopie-la depuis la page « Mon compte » de l'appli en ligne.")
    try:
        data = r.json()
    except ValueError:
        data = {}
    if not r.ok:
        raise OnlineError(data.get("error") or f"Erreur {r.status_code} du serveur.")
    return data


def account(config: dict) -> dict:
    """Pseudo, collection et decks déjà publiés ; lève OnlineError si la clé ou le serveur ne répondent pas."""
    return _call(config, "GET", "/api/mine")


def collection_payload(con, cards: pd.DataFrame, locations: bool) -> list[dict]:
    """Une entrée par carte possédée : nom français, catégorie, raretés, valeur et, si demandé, emplacements."""
    values = CM.collection_value(con)
    rarities, places = defaultdict(set), defaultdict(dict)
    for r in con.execute("""SELECT card_id, location, rarity, SUM(quantity) AS qty FROM collection
                            WHERE card_id IS NOT NULL GROUP BY card_id, location, rarity"""):
        if r["rarity"]:
            rarities[r["card_id"]].add(R.label(R.canonical(r["rarity"]) or r["rarity"]))
        places[r["card_id"]][r["location"].strip()] = places[r["card_id"]].get(r["location"].strip(), 0) + r["qty"]
    out = []
    for c in cards[cards["owned"] > 0].itertuples():
        entry = {"id": int(c.id), "qty": int(c.owned), "name": c.nom, "category": c.catégorie, "type": c.type_fr or "",
                 "archetype": c.archétype or "", "value": round(values.get(int(c.id), 0.0), 2),
                 "rarities": sorted(rarities[c.id])}
        if locations:
            entry["locations"] = sorted(places[c.id].items())
        out.append(entry)
    return out


def decks_payload(con, names: list[str], visible: list[str]) -> list[dict]:
    """Main et Extra Deck des decks choisis, un code de carte par exemplaire (le Side Deck ne sert pas en ligne)."""
    out = []
    for name in names:
        deck = {"name": name, "main": [], "extra": [], "visible": name in visible}
        for r in con.execute("""SELECT dc.card_id, dc.zone, dc.quantity, c.frame_type FROM deck_cards dc
                                JOIN decks d ON d.id = dc.deck_id JOIN cards c ON c.id = dc.card_id
                                WHERE d.name = ? AND dc.zone != 'side'""", (name,)):
            deck["extra" if is_extra(r["frame_type"]) else "main"] += [r["card_id"]] * r["quantity"]
        out.append(deck)
    return out


def publish(config: dict, visibility: str, cards: list[dict], decks: list[dict], locations: bool) -> dict:
    return _call(config, "POST", "/api/publish",
                 {"visibility": visibility, "cards": cards, "decks": decks, "locations": locations})

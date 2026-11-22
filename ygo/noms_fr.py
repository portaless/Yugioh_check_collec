"""Noms français officiels des cartes que YGOPRODeck ne traduit pas (environ 1 carte sur 5, souvent récentes).

Source : Yugipedia (wiki communautaire, licence CC BY-SA), interrogé par code de carte. Le résultat est
gardé dans noms_fr_officiels.json, versionné dans le dépôt : il n'est téléchargé qu'une fois.

Usage :  python -m ygo.noms_fr
"""
import json
import time

import requests

from .db import ROOT, connect

PATH = ROOT / "noms_fr_officiels.json"
API = "https://yugipedia.com/api.php"
HEADERS = {"User-Agent": "yugioh-collection-perso/1.0 (outil local de gestion de collection)"}
BATCH = 15  # au-delà, Yugipedia refuse la requête (taille limitée)


def _read() -> dict:
    return json.loads(PATH.read_text(encoding="utf8")) if PATH.exists() else {"noms": {}, "absents": []}


def load() -> dict[int, str]:
    return {int(k): v for k, v in _read()["noms"].items()}


def _ask(passwords: list[str]) -> dict[int, str]:
    query = "[[Password::" + "||".join(passwords) + "]]|?French name|?Password|limit=500"
    r = requests.get(API, params={"action": "ask", "format": "json", "query": query}, headers=HEADERS, timeout=60)
    r.raise_for_status()
    if "error" in r.json():
        raise RuntimeError(f"Yugipedia a refusé la requête : {str(r.json()['error'])[:200]}")
    found = {}
    # une carte peut avoir plusieurs pages (Master Duel, anime…) : la page principale (sans parenthèse) d'abord
    for title, page in sorted((r.json().get("query") or {}).get("results", {}).items(), key=lambda t: "(" in t[0]):
        names, codes = page["printouts"].get("French name"), page["printouts"].get("Password")
        if names and codes:
            found.setdefault(int(codes[0]), str(names[0]).strip())
    return found


def download(con, log=print) -> int:
    """Cherche les noms officiels des cartes sans texte français ; renvoie le nombre de noms connus.
    Seules les cartes jamais cherchées sont interrogées (les cartes sans nom français, souvent exclusives au
    Japon, sont notées dans « absents »)."""
    known, absent = load(), set(_read().get("absents", []))
    ids = [r[0] for r in con.execute("SELECT id FROM cards WHERE desc_fr IS NULL AND id < 100000000 ORDER BY id")
           if r[0] not in known and r[0] not in absent]
    for start in range(0, len(ids), BATCH):
        known.update(_ask([f"{i:08d}" for i in ids[start:start + BATCH]]))
        log(f"{min(start + BATCH, len(ids))}/{len(ids)} cartes interrogées, {len(known)} noms connus")
        time.sleep(1)  # Yugipedia demande de ne pas enchaîner les requêtes
    absent |= set(ids) - set(known)
    PATH.write_text(json.dumps({"_doc": "Noms français officiels absents de YGOPRODeck, relevés sur Yugipedia "
                                         "(CC BY-SA). Code de la carte -> nom.",
                                "noms": {str(k): v for k, v in sorted(known.items())},
                                "absents": sorted(absent)},
                               ensure_ascii=False, indent=4) + "\n", encoding="utf8")
    return len(known)


if __name__ == "__main__":
    from . import importer
    con = connect()
    print(f"{download(con)} noms français officiels.")
    importer.fill_missing_french_names(con)
    con.commit()

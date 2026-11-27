"""Données du moteur de règles du duel (page Duel contre la méta), téléchargées à l'installation.

- script.zip : les scripts Lua qui programment l'effet de chaque carte (Fluorohydride/ygopro-scripts, licence
  GPL-2.0 : téléchargés, pas versionnés dans le dépôt), rangés sous script/ comme le moteur les cherche ;
- cards.cdb : la base de cartes du moteur en français (mycard/ygopro-database), qui donne aussi les textes des
  effets proposés à l'activation ;
- strings.conf : les messages du moteur en français (« Sélectionnez la carte à ajouter à votre main »…) ;
- lflist.conf : les listes des cartes interdites et limitées (Fluorohydride/ygopro), pour les duels en ligne.

Le moteur lui-même (YGOPro compilé en WebAssembly, licence MIT) est dans static/engine/, construit depuis engine/.

Usage :  python -m ygo.engine_data
"""
import io
import json
import zipfile
from datetime import date

import requests

from .db import ROOT

DATA_DIR = ROOT / "static" / "engine" / "data"
SCRIPTS_URL = "https://codeload.github.com/Fluorohydride/ygopro-scripts/zip/refs/heads/master"
CDB_URL = "https://raw.githubusercontent.com/mycard/ygopro-database/master/locales/fr-FR/cards.cdb"
STRINGS_URL = "https://raw.githubusercontent.com/mycard/ygopro-database/master/locales/fr-FR/strings.conf"
LFLIST_URL = "https://raw.githubusercontent.com/Fluorohydride/ygopro/master/lflist.conf"
HEADERS = {"User-Agent": "yugioh-collection-perso/1.0"}


def ready() -> bool:
    return all((DATA_DIR / f).exists() for f in ("script.zip", "cards.cdb", "strings.conf"))


def version() -> str | None:
    path = DATA_DIR / "version.json"
    return json.loads(path.read_text(encoding="utf8"))["date"] if path.exists() else None


def download(log=print) -> int:
    """Télécharge scripts et base de cartes (environ 25 Mo). Renvoie le nombre de scripts."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    log("Scripts des cartes (ygopro-scripts)…")
    r = requests.get(SCRIPTS_URL, headers=HEADERS, timeout=300)
    r.raise_for_status()
    n = 0
    tmp = DATA_DIR / "script.zip.tmp"
    with zipfile.ZipFile(io.BytesIO(r.content)) as src, \
            zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as out:
        for name in src.namelist():
            if name.endswith(".lua"):
                # « ygopro-scripts-master/c123.lua » -> « script/c123.lua »
                out.writestr("script/" + name.split("/")[-1], src.read(name))
                n += 1
    tmp.replace(DATA_DIR / "script.zip")
    log("Base de cartes du moteur (français)…")
    for url, name in ((CDB_URL, "cards.cdb"), (STRINGS_URL, "strings.conf"), (LFLIST_URL, "lflist.conf")):
        r = requests.get(url, headers=HEADERS, timeout=300)
        r.raise_for_status()
        (DATA_DIR / name).write_bytes(r.content)
    (DATA_DIR / "version.json").write_text(json.dumps({"date": date.today().isoformat(), "scripts": n}),
                                           encoding="utf8")
    return n


if __name__ == "__main__":
    print(f"{download()} scripts de cartes.")

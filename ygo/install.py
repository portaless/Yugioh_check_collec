"""Premier lancement d'un clone du dépôt, et decks partagés.

data/ n'est pas versionné : sur un nouveau PC, install() télécharge le catalogue, le méta et les prix, importe
l'Excel et recrée les decks. Les decks (y compris ceux faits dans l'IHM) sont recopiés dans decks.json, versionné,
à chaque changement : un clone retrouve ainsi les mêmes decks.

Usage :  python -m ygo.install
"""
import json

from . import builds, cardmarket, importer, meta
from .db import ROOT, connect

DECKS_PATH = ROOT / "decks.json"


def needs_install(con) -> bool:
    """Vrai tant qu'une étape manque (nouveau clone, ou installation interrompue)."""
    return (not meta.META_PATH.exists()
            or con.execute("SELECT COUNT(*) FROM cards").fetchone()[0] == 0
            or con.execute("SELECT COUNT(*) FROM cm_products").fetchone()[0] == 0)


def _decks(con) -> list[dict]:
    decks = []
    for d in con.execute("SELECT id, name, notes FROM decks ORDER BY name"):
        cards = [[r["card_id"], r["zone"], r["quantity"]] for r in con.execute(
            "SELECT card_id, zone, quantity FROM deck_cards WHERE deck_id = ? ORDER BY zone, card_id", (d["id"],))]
        decks.append({"name": d["name"], "notes": d["notes"], "cards": cards})
    return decks


def export_decks(con) -> bool:
    """Réécrit decks.json s'il a changé. Renvoie True si le fichier a été modifié."""
    text = json.dumps({"_doc": "Decks de l'IHM, recréés au premier lancement d'un clone (python -m ygo.install).",
                       "decks": _decks(con)}, ensure_ascii=False, indent=1) + "\n"
    if DECKS_PATH.exists() and DECKS_PATH.read_text(encoding="utf8") == text:
        return False
    DECKS_PATH.write_text(text, encoding="utf8")
    return True


def restore_decks(con) -> int:
    """Recrée les decks de decks.json absents de la base (cartes inconnues du catalogue ignorées)."""
    if not DECKS_PATH.exists():
        return 0
    known = {r[0] for r in con.execute("SELECT id FROM cards")}
    existing = {r[0] for r in con.execute("SELECT name FROM decks")}
    n = 0
    for d in json.loads(DECKS_PATH.read_text(encoding="utf8"))["decks"]:
        if d["name"] in existing:
            continue
        deck_id = con.execute("INSERT INTO decks (name, notes) VALUES (?, ?)", (d["name"], d["notes"])).lastrowid
        con.executemany("INSERT INTO deck_cards VALUES (?, ?, ?, ?)",
                        [(deck_id, c, zone, q) for c, zone, q in d["cards"] if c in known])
        n += 1
    con.commit()
    return n


STEPS = ["Catalogue des cartes (YGOPRODeck)", "Ta collection (Excel) et tes decks", "Decks de tournoi récents",
         "Prix Cardmarket"]


def install(con, log=print) -> None:
    """Toutes les données régénérables, dans l'ordre. log(numéro d'étape, libellé) avant chaque étape."""
    log(0, STEPS[0])
    importer.download_catalog()
    importer.load_catalog(con)
    log(1, STEPS[1])
    importer.import_excel(con)
    restore_decks(con)
    if not con.execute("SELECT 1 FROM decks WHERE name = ?", (builds.NAME,)).fetchone():
        builds.create(con)
    log(2, STEPS[2])
    meta.download()
    log(3, STEPS[3])
    cardmarket.download()
    cardmarket.build(con, log=lambda _: None)
    con.commit()


def main():
    con = connect()
    install(con, log=lambda i, step: print(f"{i + 1}/{len(STEPS)} {step}…"))
    print(f"Prêt : {con.execute('SELECT COUNT(*) FROM cards').fetchone()[0]} cartes, "
          f"{con.execute('SELECT COUNT(*) FROM decks').fetchone()[0]} decks.")


if __name__ == "__main__":
    main()

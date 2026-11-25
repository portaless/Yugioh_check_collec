"""Fiche d'une carte (visionneuse, stock, versions et prix) et galeries de cartes cliquables."""
import json
from html import escape
from pathlib import Path

import pandas as pd
import streamlit as st
import streamlit.components.v1 as components

from ygo import cardmarket as CM
from ygo import importer
from ygo import rarity as R
from ygo.images import image_src
from ygo.ui.core import catalog, con


def card_img(container, c, max_width: str = "100%"):
    src = image_src(int(c["id"]), c["image_url"])
    if src:
        container.html(f"<img class='card-img' src='{src}' loading='lazy' alt='{escape(c['nom'])}' "
                       f"style='max-width:{max_width}'>")


def card_facts(c) -> dict:
    facts = {"Catégorie": c["catégorie"], "Type": c["type_fr"], "Attribut": c["attribut"]}
    if pd.notna(c["level"]):
        facts["Rang" if "xyz" in c["frame_type"] else "Niveau"] = "★" * int(c["level"]) + f"  ({int(c['level'])})"
    if pd.notna(c["linkval"]):
        facts["Lien"] = int(c["linkval"])
    if pd.notna(c["scale"]):
        facts["Échelle Pendule"] = int(c["scale"])
    if pd.notna(c["atk"]):
        facts["ATK / DEF"] = f"{int(c['atk'])} / {'-' if pd.isna(c['def']) else int(c['def'])}"
    facts["Archétype"] = c["archétype"]
    facts["Banlist TCG"] = c["banlist"] or "Illimitée"
    facts["En stock"] = int(c["owned"])
    places = storage(int(c["id"]))
    if places:
        facts["Rangement"] = " · ".join(f"{place} ×{qty}" for place, qty in places.items())
    return {k: str(v) for k, v in facts.items() if v not in ("", None)}


def storage(card_id: int, rarity: str | None = None, code: str | None = None, by_version: bool = False) -> dict:
    """Rangement des exemplaires : feuille de l'Excel -> quantité. Avec by_version, limité à une rareté et un code."""
    sql = "SELECT location, SUM(quantity) FROM collection WHERE card_id = ?"
    args = [card_id]
    if by_version:
        sql += " AND COALESCE(rarity, '') = ? AND COALESCE(UPPER(TRIM(set_code)), '') = ?"
        args += [rarity or "", code or ""]
    return dict(con.execute(sql + " GROUP BY location ORDER BY location", args).fetchall())


def effect_text(c) -> str:
    return c["desc_en"] if pd.isna(c["desc_fr"]) else c["desc_fr"]


UNOFFICIAL = {int(i) for i in importer.load_translations()["textes"]}


def text_note(c) -> str:
    """Mention sur l'origine du texte, vide pour un texte officiel français."""
    if pd.isna(c["desc_fr"]):
        return "Pas encore de texte français pour cette carte, voici le texte anglais :"
    if int(c["id"]) in UNOFFICIAL:
        return "Traduction non officielle (pas encore de texte français officiel) :"
    return ""


VIEWER_HTML = (Path(__file__).parent.parent / "viewer.html").read_text(encoding="utf8")


CONF_MARK = {"deduit": "≈", "doute": "?"}


def card_versions(card_id: int, name_en: str) -> dict:
    """Section « Mon stock » de la fiche : une entrée par rareté possédée, puis les autres impressions."""
    prints = CM.card_printings(con, card_id)
    stock, used = [], set()
    for v in CM.owned_versions(con, card_id, prints):
        p = v["print"]
        if p:
            used.add((p["set_name"], p["rarity"]))
        if not v["known"]:
            hint = "Rareté inconnue pour cette carte : à corriger dans l'Excel" if v["rarity"] else "Rareté non précisée"
        elif not v["code"] and v["sets"] > 1:
            hint = f"{v['sets']} extensions possibles, prix de la moins chère (précise le code dans l'Excel)"
        else:
            hint = ""
        stock.append({"rarity": R.label(v["rarity"]) or "Rareté ?", "fx": R.effect(v["rarity"]), "qty": v["qty"],
                      "code": v["code"] or (CM.french_code(p["set_code"]) if p else ""), "set": p["set_name"] if p else "",
                      "price": p["trend"] if p else None, "mark": CONF_MARK.get(p["confidence"], "") if p else "",
                      "hint": hint, "where": " · ".join(f"{place} ×{qty}" for place, qty in
                                                       storage(card_id, v["rarity"], v["code"], True).items())})
    others, seen = [], set(used)
    for p in sorted(prints, key=lambda p: (R.rank(p["rarity"]), p["trend"] if p["trend"] is not None else 1e9)):
        if (p["set_name"], p["rarity"]) in seen:
            continue
        seen.add((p["set_name"], p["rarity"]))
        others.append({"rarity": R.label(p["rarity"]), "fx": R.effect(p["rarity"]), "set": p["set_name"],
                       "code": CM.french_code(p["set_code"]), "price": p["trend"], "mark": CONF_MARK.get(p["confidence"], "")})
    value = sum(s["qty"] * s["price"] for s in stock if s["price"] is not None)
    return {"stock": stock, "others": others, "value": value, "cm": CM.search_url(name_en)}


VIEWER_WINDOW = 300  # cartes envoyées au navigateur autour de celle ouverte


@st.dialog("Fiche de la carte", width="large")
def card_dialog(ids: list[int], pos: int):
    """Visionneuse exécutée dans le navigateur : changer de carte ne repasse pas par le serveur."""
    start = max(0, min(pos - VIEWER_WINDOW // 2, len(ids) - VIEWER_WINDOW))
    window = ids[start:start + VIEWER_WINDOW]
    df = catalog().set_index("id").loc[window].reset_index()
    cards = [{"src": image_src(int(c["id"]), c["image_url"]), "name": c["nom"],
              "facts": list(card_facts(c).items()), "effect": effect_text(c), "note": text_note(c),
              "versions": card_versions(int(c["id"]), c["name_en"])}
             for c in df.to_dict("records")]
    # "</" échappé pour qu'un texte de carte ne puisse pas fermer la balise <script>
    payload = json.dumps(cards, ensure_ascii=False).replace("</", "<\\/")
    components.html(VIEWER_HTML.replace("__CARDS__", payload).replace("__POS__", str(pos - start)), height=620)


def open_card(ids: list[int], pos: int):
    card_dialog(ids, pos)


def cards_gallery(items: list[tuple[int, str]], key: str, per_row: int = 6):
    """Galerie à partir de (code carte, badge), dans l'ordre donné."""
    df = catalog()
    view = df.set_index("id").loc[[i for i, _ in items]].reset_index()
    gallery(view.assign(badge=[b for _, b in items]), key, per_row)


def gallery(df: pd.DataFrame, key: str, per_row: int = 6):
    """Grille d'images ; un clic sur une image ouvre la fiche, navigable avec Précédente/Suivante.
    Colonne optionnelle 'badge' : texte affiché après le nom (×2, +1…)."""
    if df.empty:
        st.caption("Aucune carte.")
        return
    ids = [int(i) for i in df["id"]]
    records = df.to_dict("records")
    for i in range(0, len(records), per_row):
        cols = st.columns(per_row)
        for j, (col, c) in enumerate(zip(cols, records[i:i + per_row])):
            with col, st.container(key=f"tile_{key}_{c['id']}_{i + j}"):
                st.html(tile_html(c))
                if st.button(c["nom"], key=f"open_{key}_{c['id']}_{i + j}"):
                    open_card(ids, i + j)


def tile_html(c) -> str:
    """Colonnes optionnelles : 'badge' (texte après le nom), 'ticker' et 'sub' (HTML déjà échappé : pastille sur
    l'image et ligne sous le nom, utilisés par la page Bourse)."""
    src = image_src(int(c["id"]), c["image_url"]) or ""
    badge = f" <span class='tile-badge'>{escape(str(c['badge']))}</span>" if c.get("badge") else ""
    return (f"<div class='tile-art'><img class='card-img' src='{src}' loading='lazy' alt='{escape(c['nom'])}'>"
            f"{c.get('ticker') or ''}</div>"
            f"<div class='tile-name'><b>{escape(c['nom'])}</b>{badge}</div>{c.get('sub') or ''}")

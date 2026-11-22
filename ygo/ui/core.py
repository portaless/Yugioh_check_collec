"""Briques communes de l'IHM : connexion, catalogue, galerie, visionneuse, tuiles de statut."""

import json
from html import escape
from pathlib import Path

import pandas as pd
import streamlit as st
import streamlit.components.v1 as components

from ygo import analysis as A
from ygo import cardmarket as CM
from ygo import importer
from ygo import plan as P
from ygo import rarity as R
from ygo import simulation as S
from ygo.db import connect, is_extra
from ygo.fr import ARCHETYPES, ATTRIBUTES, BANLIST, RACES, ZONES, tr
from ygo.images import image_src
from ygo.importer import normalize
from ygo.ui.style import pill


@st.cache_resource
def get_con():
    return connect()


con = get_con()


CATEGORY_LABELS = {"spell": "Magie", "trap": "Piège"}


EXTRA_LABELS = {"fusion": "Fusion", "synchro": "Synchro", "xyz": "Xyz", "link": "Lien"}


def category(frame: str) -> str:
    if frame in CATEGORY_LABELS:
        return CATEGORY_LABELS[frame]
    if is_extra(frame):
        return "Extra Deck (" + EXTRA_LABELS[frame.split("_")[0]] + ")"
    return "Monstre"


def catalog() -> pd.DataFrame:
    """Catalogue complet + ton stock. Les 14 000 fiches ne sont relues qu'après un import ; le stock
    (petit) est relu à chaque fois, donc modifier un deck ne recharge pas tout le catalogue."""
    fingerprint = tuple(con.execute("""SELECT COUNT(*), TOTAL(LENGTH(name_fr)), TOTAL(LENGTH(desc_fr)),
                                       TOTAL(LENGTH(ban_tcg)) FROM cards""").fetchone())
    cards = _cards(fingerprint)
    stock = con.execute("""SELECT card_id, SUM(quantity), GROUP_CONCAT(DISTINCT rarity) FROM collection
                           WHERE card_id IS NOT NULL GROUP BY card_id""").fetchall()
    owned = {r[0]: r[1] for r in stock}
    rarities = {r[0]: ", ".join(R.label(x) for x in (r[2] or "").split(",") if x) for r in stock}
    return cards.assign(owned=cards["id"].map(owned).fillna(0).astype(int),
                        rarities=cards["id"].map(rarities).fillna(""))


@st.cache_data(max_entries=2, show_spinner="Chargement du catalogue…")
def _cards(fingerprint: tuple) -> pd.DataFrame:
    df = pd.read_sql("SELECT * FROM cards", con)
    df["nom"] = df["name_fr"].fillna(df["name_en"])
    df["catégorie"] = df["frame_type"].map(category)
    df["type_fr"] = df["race"].map(lambda v: tr(RACES, v))
    df["attribut"] = df["attribute"].map(lambda v: tr(ATTRIBUTES, v))
    df["banlist"] = df["ban_tcg"].map(lambda v: tr(BANLIST, v))
    df["archétype"] = df["archetype"].map(lambda v: tr(ARCHETYPES, v))
    # la recherche accepte aussi le nom anglais, pratique pour les cartes vues en tournoi
    df["search"] = (df["name_fr"].fillna("") + " " + df["name_en"]).map(normalize)
    return df.sort_values("nom").reset_index(drop=True)


def refresh():
    st.rerun()


def search_box(container, label: str, options, key: str, placeholder: str = "Tape un nom…") -> list[str]:
    """Barre de recherche du projet : propose les noms pendant la frappe (auto-complétion), accepte plusieurs choix,
    et un texte libre (« mekk ») pour une recherche partielle."""
    return container.multiselect(label, sorted(set(options), key=normalize), key=key, placeholder=placeholder,
                                 accept_new_options=True)


def search_any(df: pd.DataFrame, terms: list[str]) -> pd.DataFrame:
    """Cartes correspondant à au moins un des termes (tous les mots d'un terme, dans le désordre)."""
    if not terms:
        return df
    return df[pd.concat([df["search"].pipe(lambda s, t=t: _words_in(s, t)) for t in terms], axis=1).any(axis=1)]


def _words_in(texts: pd.Series, term: str) -> pd.Series:
    mask = pd.Series(True, index=texts.index)
    for word in normalize(term).split():
        mask &= texts.str.contains(word, regex=False)
    return mask


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
                      "code": v["code"] or (p["set_code"] if p else ""), "set": p["set_name"] if p else "",
                      "price": p["trend"] if p else None, "mark": CONF_MARK.get(p["confidence"], "") if p else "",
                      "hint": hint, "where": " · ".join(f"{place} ×{qty}" for place, qty in
                                                       storage(card_id, v["rarity"], v["code"], True).items())})
    others, seen = [], set(used)
    for p in sorted(prints, key=lambda p: (R.rank(p["rarity"]), p["trend"] if p["trend"] is not None else 1e9)):
        if (p["set_name"], p["rarity"]) in seen:
            continue
        seen.add((p["set_name"], p["rarity"]))
        others.append({"rarity": R.label(p["rarity"]), "fx": R.effect(p["rarity"]), "set": p["set_name"],
                       "code": p["set_code"], "price": p["trend"], "mark": CONF_MARK.get(p["confidence"], "")})
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


def deck_selector(key: str, label: str = "Deck") -> int | None:
    decks = {r["name"]: r["id"] for r in con.execute("SELECT id, name FROM decks ORDER BY name")}
    if not decks:
        st.info("Aucun deck. Crée-en un dans le constructeur de deck.")
        return None
    name = st.selectbox(label, list(decks), key=key)
    return decks[name]


def show_issues(cards):
    issues = A.check(cards)
    if not issues:
        st.success("Deck légal (banlist TCG) et constructible avec ton stock.")
    for level, msg in issues:
        (st.error if level == "error" else st.warning)(msg)


def deck_counts(cards):
    return {z: sum(c["quantity"] for c in cards if c["zone"] == z) for z in ZONES}


# (fond, texte) : teintes douces, lisibles en thème clair comme sombre
def pct(p: float) -> str:
    return f"{round(100 * p)} mains sur 100"


def verdict_pill(verdict: str) -> str:
    return pill(f"Main {verdict.lower()}", {"Forte": "good", "Jouable": "warn", "Bloquée": "bad"}[verdict])


def tone_for(v: float) -> str:
    return "good" if v >= .55 else "warn" if v >= .35 else "bad"


def deck_signature(deck_id: int) -> tuple:
    """Contenu du deck et moteur choisi : tout ce qui change ses KPI."""
    plan = con.execute("SELECT plan FROM decks WHERE id = ?", (deck_id,)).fetchone()
    return tuple(tuple(r) for r in con.execute(
        "SELECT card_id, zone, quantity FROM deck_cards WHERE deck_id = ? ORDER BY 1, 2", (deck_id,))) + (
        plan[0] if plan else None,)


def deck_plan(deck_id: int) -> P.Plan:
    return P.of_deck(con, deck_id, A.deck_cards(con, deck_id))


def plan_name(plan: P.Plan) -> str:
    return " + ".join(tr(ARCHETYPES, a) for a in plan.archetypes) or "aucun moteur"


def plan_selector(container, deck_id: int, key: str) -> P.Plan:
    """Choix du moteur du deck (archétype), enregistré avec le deck ; « automatique » = le plus présent."""
    cards = A.deck_cards(con, deck_id)
    detected = P.detect(cards)
    in_deck = {c["archetype"] for c in cards if c["archetype"]}
    options = [""] + sorted({a for a, _ in P.archetypes_in_stock(con)} | in_deck, key=lambda a: tr(ARCHETYPES, a))
    stored = con.execute("SELECT plan FROM decks WHERE id = ?", (deck_id,)).fetchone()["plan"] or ""
    choice = container.selectbox(
        "Moteur du deck", options, index=options.index(stored) if stored in options else 0, key=f"{key}_{deck_id}",
        format_func=lambda a: tr(ARCHETYPES, a) if a else f"Automatique ({plan_name(detected)})",
        help="L'archétype autour duquel le deck est construit : il définit les starters, le moteur et les cartes "
             "hors moteur dans toutes les analyses.")
    if choice != stored:
        con.execute("UPDATE decks SET plan = ? WHERE id = ?", (choice or None, deck_id))
        con.commit()
    return P.Plan((choice,)) if choice else detected


@st.cache_data(show_spinner=False)
def deck_kpis(deck_id: int, signature: tuple):
    """Régularité des mains d'un deck (20 000 mains), recalculée seulement quand son contenu ou son moteur change."""
    deck = S.main_deck(A.deck_cards(con, deck_id))
    return S.simulate(deck, deck_plan(deck_id)) if deck else None

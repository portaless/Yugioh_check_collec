"""Briques communes de l'IHM : connexion, catalogue, galerie, visionneuse, tuiles de statut."""

import json
from html import escape
from pathlib import Path

import pandas as pd
import streamlit as st
import streamlit.components.v1 as components

from ygo import analysis as A
from ygo import importer
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
    rarities = {r[0]: (r[2] or "").replace(",", ", ") for r in stock}
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


def search(df: pd.DataFrame, text: str) -> pd.DataFrame:
    q = normalize(text or "")
    if not q:
        return df
    mask = pd.Series(True, index=df.index)
    for word in q.split():
        mask &= df["search"].str.contains(word, regex=False)
    return df[mask]


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
    facts["Rareté"] = c.get("rarities", "")
    if pd.notna(c["price_cm"]):
        facts["Cardmarket"] = f"≈ {c['price_cm']:.2f} €"
    return {k: str(v) for k, v in facts.items() if v not in ("", None)}


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


VIEWER_WINDOW = 300  # cartes envoyées au navigateur autour de celle ouverte


@st.dialog("Fiche de la carte", width="large")
def card_dialog(ids: list[int], pos: int):
    """Visionneuse exécutée dans le navigateur : changer de carte ne repasse pas par le serveur."""
    start = max(0, min(pos - VIEWER_WINDOW // 2, len(ids) - VIEWER_WINDOW))
    window = ids[start:start + VIEWER_WINDOW]
    df = catalog().set_index("id").loc[window].reset_index()
    cards = [{"src": image_src(int(c["id"]), c["image_url"]), "name": c["nom"],
              "facts": list(card_facts(c).items()), "effect": effect_text(c), "note": text_note(c)}
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
    src = image_src(int(c["id"]), c["image_url"]) or ""
    badge = f" <span class='tile-badge'>{escape(str(c['badge']))}</span>" if c.get("badge") else ""
    return (f"<img class='card-img' src='{src}' loading='lazy' alt='{escape(c['nom'])}'>"
            f"<div class='tile-name'><b>{escape(c['nom'])}</b>{badge}</div>")


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
    return tuple(tuple(r) for r in con.execute(
        "SELECT card_id, zone, quantity FROM deck_cards WHERE deck_id = ? ORDER BY 1, 2", (deck_id,)))


@st.cache_data(show_spinner=False)
def deck_kpis(deck_id: int, signature: tuple):
    """Régularité des mains d'un deck (20 000 mains), recalculée seulement quand son contenu change."""
    deck = S.main_deck(A.deck_cards(con, deck_id))
    return S.simulate(deck) if deck else None

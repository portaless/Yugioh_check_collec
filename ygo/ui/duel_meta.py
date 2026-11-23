"""Page Duel contre la méta : tu joues ton deck à la main contre une liste de tournoi jouée par un bot."""
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import streamlit as st

from ygo import analysis as A
from ygo import meta
from ygo import playtest as T
from ygo import plan as P
from ygo.images import thumb_src
from ygo.ui.core import con, deck_plan
from ygo.ui.style import page_header

HERE = Path(__file__).parent
DUEL = st.components.v2.component("duel_meta", css=(HERE / "duel_meta.css").read_text(encoding="utf8"),
                                  js=(HERE / "duel_meta.js").read_text(encoding="utf8"))


@st.cache_data(show_spinner=False)
def _archetypes(downloaded: str) -> list[tuple[str, list[dict]]]:
    """Archétypes du méta dont les listes sont complètes dans le catalogue local (40 cartes au moins)."""
    return [(name, kept) for name, lists in meta.archetypes(meta.load())
            if (kept := [l for l in lists if len(meta.resolve(con, l["main"])) >= 40])]


def _images(cards: list[dict]) -> dict[int, str]:
    unique = {c["id"]: c["image_url"] for c in cards}
    with ThreadPoolExecutor(8) as pool:  # miniatures téléchargées en parallèle la première fois
        return {i: src for i, src in zip(unique, pool.map(thumb_src, unique, unique.values())) if src}


def page_duel_meta():
    page_header("Duel contre la méta",
                "Joue ton deck carte par carte contre une liste qui gagne en tournoi, jouée par un bot.", "Analyse")
    data = meta.load()
    if not data:
        st.info("Aucun deck méta téléchargé : va dans **Simulation méta** et clique sur « Mettre à jour le méta ».")
        return
    decks = {r["name"]: r["id"] for r in con.execute("SELECT id, name FROM decks ORDER BY name")}
    arch = _archetypes(data["downloaded"])
    if not decks or not arch:
        st.info("Il faut un deck dans le Constructeur et des decks méta dont les cartes sont dans le catalogue.")
        return
    c1, c2, c3 = st.columns([2, 2, 1.4])
    mine = c1.selectbox("Ton deck", list(decks), index=list(decks).index("deck_mekk_beta") if "deck_mekk_beta" in decks else 0)
    names = [f"{name} ({len(lists)} liste{'s' if len(lists) > 1 else ''})" for name, lists in arch]
    k = c2.selectbox("Adversaire (deck méta)", range(len(arch)), format_func=names.__getitem__,
                     help="Archétypes classés par nombre de tops en tournoi ; la liste la plus récente est jouée.")
    first = c3.segmented_control("Qui commence ?", ["Pile ou face", "Moi", "Lui"], default="Pile ou face") or "Pile ou face"

    opp_name, lists = arch[k]
    opp = lists[0]
    my_cards = A.deck_cards(con, decks[mine])
    my_main, my_extra = T.from_deck(my_cards, "main"), T.from_deck(my_cards, "extra")
    if len(my_main) < 40:
        st.warning(f"« {mine} » n'a que {len(my_main)} cartes dans son Main Deck : complète-le dans le Constructeur.")
        return
    opp_main, opp_extra = meta.resolve(con, opp["main"]), meta.resolve(con, opp["extra"])
    imgs = _images(my_main + my_extra + opp_main + opp_extra)
    payload = {
        "me": T.side("Toi", my_main, my_extra, deck_plan(decks[mine]), imgs),
        "bot": T.side(opp_name, opp_main, opp_extra, P.detect([dict(c, zone="main") for c in opp_main]), imgs),
        "first": {"Moi": "me", "Lui": "bot"}.get(first, "coin"),
        "seed": st.session_state.get("duel_meta_seed", 0),
    }
    payload["key"] = f"{mine}|{opp['id']}|{first}|{payload['seed']}"
    if opp.get("url"):
        st.caption(f"Liste jouée : [{opp_name}]({opp['url']})"
                   + (f", {opp['placement']} de {opp['tournament']}" if opp.get("tournament") else "") + ".")
    DUEL(data=payload, key="duel_meta")

    with st.expander("Comment jouer et comment joue le bot"):
        st.markdown(f"""
**Toi** : clique sur une carte pour ouvrir ses actions (invoquer, poser, activer, attaquer, envoyer au
cimetière…), ou sur une pile (Deck, Extra, Cimetière, Bannies) pour la voir et y prendre une carte. Les effets ne
sont pas automatisés : tu les appliques toi-même, comme sur un simulateur manuel. Les combats et les points de vie
sont calculés avec les vrais ATK / DEF. Survole une carte pour lire son texte.

**Le bot** joue la liste « {opp_name} » selon le rôle de ses cartes, lu dans leur texte :
- il lance son moteur avec ses starters (des monstres sortent de son deck), puis invoque depuis son Extra Deck ;
- il annule l'activation de tes starters et cartes du moteur avec ses interruptions (Floraison de Cendres…) ou
  ses Pièges posés, pioche à tes Invocations Spéciales (Mulcharmy, Maxx « C »), active Nibiru à ta 5e invocation ;
- il détruit ton terrain avec ses cartes de destruction, pose ses Pièges et attaque ce qu'il peut battre.

**Tes réponses** : à chaque action importante du bot, une fenêtre te propose de répondre avec une interruption en
main, une carte posée ou un effet rapide sur le terrain : la réponse annule son action.

Le bot ne lit pas les effets carte par carte : ses combos sont résumés (moteur lancé ou coupé), comme dans les
simulations de l'appli.
""")

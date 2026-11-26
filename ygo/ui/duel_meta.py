"""Page Duel contre la méta : ton deck contre une liste de tournoi jouée par un bot, arbitré par le moteur de
règles YGOPro (effets, chaînes, combats appliqués automatiquement)."""
from concurrent.futures import ThreadPoolExecutor

import streamlit as st

from ygo import analysis as A
from ygo import engine_data
from ygo import meta
from ygo import playtest as T
from ygo.images import thumb_src
from ygo.ui.core import con, web
from ygo.ui.style import page_header

ENGINE_JS = engine_data.DATA_DIR.parent / "engine.js"
PARTS = ("duel_meta.js", "duel_meta_board.js", "duel_meta_dialogs.js", "duel_meta_input.js")
# le plateau est découpé en plusieurs fichiers, assemblés en un seul module pour le composant
DUEL = st.components.v2.component("duel_meta", css=web("duel_meta.css"), js="\n".join(web(f) for f in PARTS))


@st.cache_data(show_spinner=False)
def _archetypes(downloaded: str) -> list[tuple[str, list[dict]]]:
    """Archétypes du méta dont les listes sont complètes dans le catalogue local (40 cartes au moins)."""
    return [(name, kept) for name, lists in meta.archetypes(meta.load())
            if (kept := [l for l in lists if len(meta.resolve(con, l["main"])) >= 40])]


def _images(cards: list[dict]) -> dict[int, str]:
    unique = {c["id"]: c["image_url"] for c in cards}
    with ThreadPoolExecutor(8) as pool:  # miniatures téléchargées en parallèle la première fois
        return {i: src for i, src in zip(unique, pool.map(thumb_src, unique, unique.values())) if src}


def engine_ready() -> bool:
    """Données du moteur présentes ; sinon propose de les télécharger (renvoie False)."""
    if engine_data.ready():
        return True
    st.info("Le moteur de règles a besoin de ses données : les scripts qui programment l'effet de chaque carte "
            "et sa base de cartes en français (environ 25 Mo, une seule fois).")
    if st.button("Télécharger les données du moteur", type="primary"):
        with st.spinner("Téléchargement des scripts des cartes…"):
            engine_data.download(log=lambda _: None)
        st.rerun()
    return False


def engine_duel(me: tuple[str, list[dict]], bot: tuple[str, list[dict], list[dict]], first: str, key: str,
                component_key: str):
    """Plateau du moteur de règles : `me` = (nom, cartes du deck de l'appli) joué par toi, `bot` = (nom, Main
    Deck, Extra Deck) joué par le bot ; first : "me", "bot" ou "coin"."""
    my_main, my_extra = T.from_deck(me[1], "main"), T.from_deck(me[1], "extra")
    if len(my_main) < 40:
        st.warning(f"« {me[0]} » n'a que {len(my_main)} cartes dans son Main Deck : complète-le dans le Constructeur.")
        return
    bot_name, bot_main, bot_extra = bot
    imgs = _images(my_main + my_extra + bot_main + bot_extra)
    payload = T.payload((my_main, my_extra), (bot_main, bot_extra), imgs) | {
        "botName": bot_name, "first": first, "seed": 0,
        "engine": int(ENGINE_JS.stat().st_mtime),   # version du moteur, pour que le navigateur recharge un moteur mis à jour
    }
    payload["key"] = key
    DUEL(data=payload, key=component_key)


def engine_help(bot_deck: str):
    """Mode d'emploi du plateau du moteur (pages Duel contre la méta et Duel de decks)."""
    with st.expander("Comment jouer et comment joue le bot"):
        st.markdown(f"""
**Les règles sont appliquées par le moteur** (YGOPro, le moteur open source des simulateurs communautaires) : chaque
carte a son script qui programme son effet. Tu ne peux faire que des actions légales, et les effets se résolvent
automatiquement, chaînes comprises.

**Toi** : les cartes qui peuvent agir s'allument en doré. Clique dessus : si une seule action est possible
(activer son effet, attaquer…), elle est jouée tout de suite ; sinon ses actions s'affichent juste au-dessus
d'elle (invoquer, poser). Si la carte a un effet parmi ses choix, une fenêtre détaille chaque effet avec son
texte pour que tu choisisses lequel activer ; le changement de position dit dans quelle position le monstre passe.
Un monstre change de position pendant tes Main Phases, une fois par tour, mais pas le tour où il a été invoqué ou
posé, ni après avoir attaqué : si tu cliques sur un monstre qui ne peut pas, l'appli te dit pourquoi.
Les boutons du haut changent de phase ou finissent le tour. Quand tu peux répondre en chaîne, tes cartes concernées s'allument de la même façon, avec un bouton « Ne rien activer ». Quand
il faut choisir des cartes, une zone ou une position, une fenêtre s'ouvre. Survole une carte pour lire son texte.

**Échap** annule ce qui n'est pas encore joué : il ferme les boutons d'une carte ou une pile ouverte, efface les
zones déjà cliquées, et renonce à un effet tant que le moteur l'autorise (choix des cartes à payer ou à cibler au
moment de l'activation). Une fois l'invocation ou l'activation lancée, le moteur ne permet plus de revenir en
arrière. Le bouton **Plein écran** agrandit le plateau ; Échap ou le même bouton le referme.

Couleurs du terrain : orange pour les Zones Monstre, vert pour les Zones Magie & Piège, bleu pour la Zone Terrain,
violet pour les Zones Monstre Extra et l'Extra Deck.

**Le bot** joue la liste « {bot_deck} » par l'intermédiaire du même moteur : il active ses effets dès qu'il le peut,
utilise ses interruptions dès qu'elles sont possibles, invoque et attaque. Sa stratégie est simple, mais il ne
peut pas tricher.

Scripts des cartes : projet ygopro-scripts (GPL-2.0) ; base de cartes et textes : mycard/ygopro-database.
""")


def page_duel_meta():
    page_header("Duel contre la méta",
                "Joue ton deck contre une liste qui gagne en tournoi, jouée par un bot. Le moteur de règles applique "
                "les effets, les chaînes et les combats comme en duel réel.", "Analyse")
    if not engine_ready():
        return
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
    if opp.get("url"):
        st.caption(f"Liste jouée : [{opp_name}]({opp['url']})"
                   + (f", {opp['placement']} de {opp['tournament']}" if opp.get("tournament") else "") + ".")
    opp_main, opp_extra = meta.resolve(con, opp["main"]), meta.resolve(con, opp["extra"])
    engine_duel((mine, my_cards), (opp_name, opp_main, opp_extra), {"Moi": "me", "Lui": "bot"}.get(first, "coin"),
                f"{mine}|{opp['id']}|{first}", "duel_meta")

    engine_help(opp_name)

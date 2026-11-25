"""Page Simulation face au méta."""

from html import escape

import pandas as pd
import streamlit as st

from ygo import analysis as A
from ygo import meta
from ygo import simulation as S
from ygo.ui.card_sheet import cards_gallery
from ygo.ui.core import con
from ygo.ui.decks import deck_plan, deck_signature, plan_name, tone_for
from ygo.ui.style import TONES, page_header, pill, status_tile


META_LISTS_PER_ARCHETYPE = 3  # listes les plus récentes moyennées par archétype


@st.cache_data(show_spinner=False)
def cached_matchups(deck_id: int, signature: tuple, opp_lists: tuple) -> list[dict]:
    """Tous les matchups d'un deck en une passe. signature : contenu et moteur du deck, pour recalculer s'ils changent."""
    deck = S.main_deck(A.deck_cards(con, deck_id))
    res = S.matchups(deck, [meta.resolve(con, list(ids)) for ids in opp_lists], deck_plan(deck_id))
    return [{**vars(m), "index": m.index} for m in res]


# Matrice des builds : tableau HTML ; un clic droit sur le nom d'un deck le renvoie à Python
MATRIX = st.components.v2.component(
    "meta_matrix",
    css="""
    .wrap { overflow-x: auto; border: 1px solid #2A3050; border-radius: .7rem; }
    table { border-collapse: collapse; width: 100%; font-size: .9rem; color: #E9E6DD; }
    th { background: #1E2340; font-weight: 600; text-align: right; padding: .5rem .7rem; white-space: nowrap; }
    th:first-child { text-align: left; }
    td { text-align: right; padding: .45rem .7rem; font-weight: 600; border-top: 1px solid #2A3050; }
    td.deck { text-align: left; font-weight: 500; color: #E9E6DD; background: #171B30; cursor: context-menu;
              white-space: nowrap; }
    td.deck:hover { color: #E3B341; text-decoration: underline dotted; }
    td.deck.on { color: #E3B341; box-shadow: inset 3px 0 0 #E3B341; }
    """,
    js="""
    export default function(component) {
        const { data, setTriggerValue, parentElement } = component;
        let root = parentElement.querySelector(".wrap");
        if (!root) { root = document.createElement("div"); root.className = "wrap"; parentElement.appendChild(root); }
        root.innerHTML = data;
        root.querySelectorAll("td.deck").forEach((cell) => {
            cell.oncontextmenu = (e) => {
                e.preventDefault();
                root.querySelectorAll("td.deck.on").forEach((c) => c.classList.remove("on"));
                cell.classList.add("on");
                setTriggerValue("deck", cell.dataset.deck);
            };
        });
    }
    """,
)


def matrix_html(ranked: list[str], matrix: dict, weighted: dict, arch) -> str:
    def cell(v: float) -> str:
        bg, fg = TONES[tone_for(v)]
        return f"<td style='background:{bg}; color:{fg}'>{100 * v:.0f}</td>"
    head = "".join(f"<th>{escape(a)}</th>" for a, _ in arch)
    rows = "".join(
        f"<tr><td class='deck' data-deck='{escape(d, quote=True)}' title='Clic droit : afficher le deck'>{escape(d)}</td>"
        + cell(weighted[d]) + "".join(cell(matrix[d][a]["index"]) for a, _ in arch) + "</tr>"
        for d in ranked)
    return f"<table><tr><th>Build</th><th>Méta pondéré</th>{head}</tr>{rows}</table>"


def show_deck(name: str, deck_id: int, score: float | None):
    """Le deck en images (Main puis Extra), sous la matrice ; un clic sur une carte ouvre sa fiche."""
    cards = A.deck_cards(con, deck_id)
    with st.container(border=True):
        h, close = st.columns([6, 1])
        h.subheader(name + (f" — indice {100 * score:.0f}" if score is not None else ""))
        if close.button("Fermer", key="meta_view_close", width="stretch"):
            st.session_state.pop("meta_view", None)
            st.rerun()
        st.caption(f"Moteur : {plan_name(deck_plan(deck_id))}")
        for zone, label, per_row in (("main", "Main Deck", 10), ("extra", "Extra Deck", 10)):
            items = [(c["id"], f"×{c['quantity']}") for c in cards if c["zone"] == zone]
            if items:
                st.markdown(f"**{label}** ({sum(c['quantity'] for c in cards if c['zone'] == zone)} cartes)")
                cards_gallery(items, f"meta_deck_{deck_id}_{zone}", per_row=per_row)


def deck_vs_meta(deck_id: int, arch: list[tuple[str, list[dict]]]) -> dict[str, dict]:
    """Archétype -> matchup moyen sur ses listes les plus récentes."""
    keys = [(name, tuple(l["main"])) for name, lists in arch for l in lists[:META_LISTS_PER_ARCHETYPE]]
    res = cached_matchups(deck_id, deck_signature(deck_id), tuple(ids for _, ids in keys))
    out = {}
    for (name, _), r in zip(keys, res):
        out.setdefault(name, []).append(r)
    return {name: {k: sum(r[k] for r in rs) / len(rs) for k in rs[0]} for name, rs in out.items()}


def page_meta():
    page_header(
        "Simulation face au méta",
        "Tes builds contre les decks qui gagnent actuellement en tournoi.",
        "Analyse",
    )
    data = meta.load()
    top, btn = st.columns([4, 1])
    if btn.button("Mettre à jour le méta", type="primary" if not data else "secondary"):
        with st.spinner("Téléchargement des decks de tournoi…"):
            meta.download()
        cached_matchups.clear()
        st.rerun()
    if not data:
        st.info("Aucun deck méta téléchargé : clique sur « Mettre à jour le méta ».")
        return
    top.caption(f"{len(data['decks'])} decks classés en tournoi (YGOPRODeck, « Tournament Meta Decks »), "
                f"téléchargés le {data['downloaded']}.")

    # listes dont les cartes manquent au catalogue local (catalogue absent ou plus ancien que le méta) : ignorées
    all_arch = [(name, kept) for name, lists in meta.archetypes(data)
                if (kept := [l for l in lists if len(meta.resolve(con, l["main"])) >= 40])]
    if not all_arch:
        st.warning("Les cartes des decks méta sont absentes du catalogue : clique sur « Mettre à jour le catalogue » "
                   "dans la page **Import**.")
        return
    n_arch = st.slider("Archétypes pris en compte (les plus joués)", 3, min(15, len(all_arch)), min(8, len(all_arch)))
    arch = all_arch[:n_arch]
    total = sum(len(lists) for _, lists in arch)
    decks = {r["name"]: r["id"] for r in con.execute("SELECT id, name FROM decks ORDER BY name")}

    with st.expander("Comment est calculé l'indice de matchup ?"):
        st.markdown(f"""
Pour chaque archétype, les {META_LISTS_PER_ARCHETYPE} listes les plus récentes sont simulées 10 000 fois contre ton deck.
On compte les **interruptions depuis la main** de l'adversaire (Floraison de Cendres, Infini Éphémère, Mulcharmy…),
repérées dans le texte des cartes, et ses **cartes de destruction**.

- **En premier** (toi 5 cartes, lui 6) : chaque interruption adverse coupe une ligne de jeu, il te faut donc
  *un starter de plus que ses interruptions*. Ton **plateau tient** si tu gardes au moins une protection
  (Piège ou interruption), et au moins autant que ses cartes de destruction.
- **En second** (toi 6 cartes, lui 5 qu'il garde pour ton tour) : ton **retour passe** si tu as un starter de
  plus que ses interruptions. Il est **fort** si tu avais aussi de quoi gêner son tour 1.
- **Indice de matchup** = moyenne de « plateau qui tient » et « retour fort ».

C'est un **indice de régularité face à ses interruptions, pas un taux de victoire** : le modèle ne joue ni ses
combos ni les tiens.
""")

    # 1. Le méta
    st.header("1. Le méta actuel")
    rows = []
    for name, lists in arch:
        cards = [meta.resolve(con, l["main"]) for l in lists[:META_LISTS_PER_ARCHETYPE]]
        ht = sum(sum(meta.opponent_flags(c)["handtrap"] for c in cs) / len(cs) * 6 for cs in cards) / len(cards)
        rows.append({"Archétype": name, "Tops": len(lists), "Part du méta": f"{100 * len(lists) / total:.0f} %",
                     "Interruptions par main": round(ht, 1),
                     "Dernier top": f"{lists[0]['tournament']} ({lists[0]['placement']})"})
    st.dataframe(pd.DataFrame(rows), hide_index=True, width="stretch")

    # 2. Matrice
    st.header("2. Tes builds face au méta")
    chosen = st.multiselect("Builds à tester", list(decks), default=list(decks), placeholder="Choisir…")
    if not chosen:
        return
    matrix, weighted = {}, {}
    with st.spinner("Simulation des matchups…"):
        for d in chosen:
            if not S.main_deck(A.deck_cards(con, decks[d])):
                continue
            matrix[d] = deck_vs_meta(decks[d], arch)
            weighted[d] = sum(matrix[d][a]["index"] * len(lists) for a, lists in arch) / total
    if not matrix:
        st.info("Les builds choisis ont un Main Deck vide.")
        return
    ranked = sorted(matrix, key=lambda d: -weighted[d])  # du plus performant au moins performant
    cols = st.columns(len(ranked))
    for col, d in zip(cols, ranked):
        status_tile(col, d, f"{100 * weighted[d]:.0f}", tone_for(weighted[d]), "indice face au méta (pondéré par la part)")
    clicked = MATRIX(data=matrix_html(ranked, matrix, weighted, arch), key="meta_matrix",
                     on_deck_change=lambda: None)
    if clicked.deck:
        st.session_state["meta_view"] = clicked.deck
    st.caption("Lecture : 100 = ton plan passe à chaque fois ; 50 = une fois sur deux. Vert ≥ 55, ambre ≥ 35. "
               "Clic droit sur le nom d'un deck pour l'afficher.")
    if st.session_state.get("meta_view") in decks:
        show_deck(st.session_state["meta_view"], decks[st.session_state["meta_view"]], weighted.get(
            st.session_state["meta_view"]))

    # 3. Détail
    st.header("3. Détail d'un matchup")
    c1, c2 = st.columns(2)
    build = c1.selectbox("Ton build", list(matrix), index=list(matrix).index(max(weighted, key=weighted.get)))
    opp_name = c2.selectbox("Adversaire", [a for a, _ in arch])
    lists = dict(arch)[opp_name]
    r = matrix[build][opp_name]
    k1, k2, k3, k4 = st.columns(4)
    status_tile(k1, "En premier : ton tour 1 passe", f"{100 * r['turn1']:.0f} %", tone_for(r["turn1"]),
                "malgré ses interruptions")
    status_tile(k2, "En premier : ton plateau tient", f"{100 * r['board_holds']:.0f} %", tone_for(r["board_holds"]),
                "tu gardes une protection")
    status_tile(k3, "En second : ton retour passe", f"{100 * r['comeback']:.0f} %", tone_for(r["comeback"]),
                "malgré ses interruptions")
    status_tile(k4, "En second : retour fort", f"{100 * r['comeback_strong']:.0f} %", tone_for(r["comeback_strong"]),
                "et tu as gêné son tour 1")
    st.markdown(f"**{opp_name}** tient en moyenne **{r['opp_handtraps']:.1f} interruption(s)** dans une main de 6 cartes. "
                f"Avec une seule ligne de jeu, chacune suffit à couper ton tour : c'est la densité de starters "
                f"qui décide de ce matchup.")
    others = [d for d in matrix if d != build]
    if others:
        st.markdown("Comparé à tes autres builds sur ce matchup : " + " · ".join(
            f"{d} **{100 * matrix[d][opp_name]['index']:.0f}**" for d in others)
                    + f" (contre **{100 * r['index']:.0f}** pour {build}).")

    st.subheader("Une partie d'exemple")
    if st.button("Tirer une nouvelle partie"):
        st.session_state["meta_seed"] = st.session_state.get("meta_seed", 0) + 1
    my_deck = S.main_deck(A.deck_cards(con, decks[build]))
    opp_deck = meta.resolve(con, lists[0]["main"])
    game = S.example_game(my_deck, opp_deck, st.session_state.get("meta_seed", 0))
    for label, key, first in (("Tu commences", "first", True), ("Tu joues en second", "second", False)):
        mine, theirs = game[key]
        verdict, reasons = S.describe_game(mine, theirs, first, deck_plan(decks[build]))
        good = verdict in ("Plateau qui tient", "Retour fort")
        ok = verdict in ("Tour 1 réussi, plateau fragile", "Retour possible")
        st.markdown(f"#### {label}")
        st.html(pill(verdict, "good" if good else "warn" if ok else "bad"))
        left, right = st.columns(2, gap="large")
        with left:
            st.markdown(f"**Ta main ({build})**")
            cards_gallery([(c["id"], "") for c in mine], f"meta_me_{key}", per_row=6)
        with right:
            st.markdown(f"**Sa main ({opp_name})**")
            cards_gallery([(c["id"], "interruption" if meta.opponent_flags(c)["handtrap"] else "")
                           for c in theirs], f"meta_opp_{key}", per_row=6)
        st.markdown("\n".join(f"- {x}" for x in reasons))

    with st.expander(f"Liste type de {opp_name} ({lists[0]['tournament']}, {lists[0]['placement']})"):
        st.markdown(f"[Voir la liste sur YGOPRODeck]({lists[0]['url']})")
        counts = {}
        for c in opp_deck:
            counts[c["id"]] = counts.get(c["id"], 0) + 1
        cards_gallery([(i, f"×{q}") for i, q in counts.items()], "meta_list", per_row=8)

    # 4. Conclusions
    st.header("4. Ce qu'il faut retenir")
    for d in sorted(matrix, key=lambda d: -weighted[d]):
        best = max(arch, key=lambda a: matrix[d][a[0]]["index"])[0]
        worst = min(arch, key=lambda a: matrix[d][a[0]]["index"])[0]
        st.markdown(f"- **{d}** : indice méta **{100 * weighted[d]:.0f}**. Meilleur matchup : {best} "
                    f"({100 * matrix[d][best]['index']:.0f}) ; le plus dur : {worst} "
                    f"({100 * matrix[d][worst]['index']:.0f}, {matrix[d][worst]['opp_handtraps']:.1f} interruptions par main).")
    if len(matrix) > 1:
        ranked = sorted(matrix, key=lambda d: -weighted[d])
        a, b = ranked[0], ranked[-1]
        gains = sorted(((matrix[a][x]["index"] - matrix[b][x]["index"], x) for x, _ in arch), reverse=True)
        st.markdown(f"**{a}** devance **{b}** de {100 * (weighted[a] - weighted[b]):.0f} points sur le méta pondéré. "
                    f"L'écart le plus net : {gains[0][1]} (+{100 * gains[0][0]:.0f}).")

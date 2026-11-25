"""Page Duel de decks : KPI face à face, duel simulé sur un plateau, leviers."""

from html import escape

import numpy as np
import pandas as pd
import streamlit as st

from ygo import analysis as A
from ygo import builds
from ygo import duel as D
from ygo import simulation as S
from ygo.fr import ZONES
from ygo.ui.card_sheet import cards_gallery
from ygo.ui.core import con
from ygo.ui.decks import deck_counts, deck_kpis, deck_plan, deck_signature, plan_selector
from ygo.ui.duel_board import duel_board
from ygo.ui.style import TONES, page_header, status_tile


# (libellé, attribut Kpis, plus haut = mieux, explication)
DUEL_KPIS = [
    ("Main jouable en premier", "playable_first", True,
     "Tu peux lancer ton moteur avec tes 5 cartes, sans aide du terrain adverse."),
    ("Main forte en premier", "strong_first", True,
     "Jouable, et tu gardes une protection (Piège ou interruption) pour le tour adverse."),
    ("Main jouable en second", "playable_second", True,
     "Au moins un starter dans tes 6 cartes."),
    ("Main forte en second", "strong_second", True,
     "Jouable, et tu peux couper le combo adverse ou nettoyer son terrain."),
    ("Main bloquée en premier", "brick_first", False,
     "Aucun starter en main : le tour est perdu."),
    ("Cartes hors moteur par main", "offplan_per_hand", False,
     "En moyenne, cartes qui ne servent ni le moteur, ni à interrompre, protéger ou détruire."),
]


def duel_kpi_table(name_a: str, name_b: str, ka, kb) -> tuple[int, int]:
    """Tableau HTML face à face ; renvoie le nombre de KPI gagnés par A et par B."""
    rows, wins = [], [0, 0]
    for label, attr, higher, help_text in DUEL_KPIS:
        va, vb = getattr(ka, attr), getattr(kb, attr)
        is_rate = attr != "offplan_per_hand"
        fmt = (lambda v: f"{100 * v:.0f} %") if is_rate else (lambda v: f"{v:.1f}")
        tie_margin = S.margin(va, vb) if is_rate else 0.05
        diff = va - vb
        if abs(diff) <= tie_margin:
            winner, tone = "Égalité (écart dans la marge)", None
        else:
            a_wins = (diff > 0) == higher
            wins[0 if a_wins else 1] += 1
            winner, tone = (name_a if a_wins else name_b), ("a" if a_wins else "b")
        gap = f"{abs(diff) * 100:.0f} pts" if is_rate else f"{abs(diff):.1f} carte"
        scale = 1 if is_rate else max(va, vb, 1)
        bar = lambda v, side: (f"<div class='bar'><span class='{side}' style='width:{min(100, 100 * v / scale):.0f}%'></span></div>")
        rows.append(f"""<tr><td><b>{label}</b><div class='help'>{help_text}</div></td>
            <td class='{'win' if tone == 'a' else ''}'>{fmt(va)}{bar(va, 'a')}</td>
            <td class='{'win' if tone == 'b' else ''}'>{fmt(vb)}{bar(vb, 'b')}</td>
            <td>{gap if tone else '—'}</td><td>{escape(winner)}</td></tr>""")
    st.html(f"""<style>
      .duel {{ width: 100%; border-collapse: collapse; font-size: 1rem; }}
      .duel th {{ text-align: left; font-weight: 600; opacity: .7; padding: .5rem; border-bottom: 1px solid rgba(128,128,128,.3); }}
      .duel td {{ padding: .6rem .5rem; border-bottom: 1px solid rgba(128,128,128,.15); vertical-align: top; }}
      .duel td.win {{ font-weight: 700; color: {TONES['good'][1]}; }}
      .duel .help {{ font-size: .85rem; opacity: .65; font-weight: 400; }}
      .duel .bar {{ height: 6px; border-radius: 3px; background: rgba(128,128,128,.15); margin-top: 4px; width: 140px; }}
      .duel .bar span {{ display: block; height: 100%; border-radius: 3px; }}
      .duel .bar .a {{ background: #6c8ebf; }} .duel .bar .b {{ background: #c9853a; }}
    </style>
    <table class='duel'><tr><th>KPI</th><th>{escape(name_a)}</th><th>{escape(name_b)}</th><th>Écart</th><th>Gagnant</th></tr>
    {''.join(rows)}</table>""")
    return wins[0], wins[1]


STARTERS = "Starters du moteur"


def composition_counts(deck: list[dict], plan) -> dict:
    flags = [S.card_flags(c, plan) for c in deck]
    total = len(deck)
    out = {}
    for label, flag in ((STARTERS, "starter"), ("Interruptions depuis la main", "interrupt"),
                        ("Pièges (protection posée)", "trap"), ("Destruction du terrain", "breaker"),
                        ("Hors moteur", "offplan")):
        n = sum(f[flag] for f in flags)
        out[label] = (n, n / total if total else 0)
    return out


@st.cache_data(show_spinner="Simulation des mains…")
def deck_stats(deck_id: int, signature: tuple) -> tuple:
    """KPI et leviers d'un deck, recalculés seulement quand son contenu change (signature)."""
    return deck_kpis(deck_id, signature), S.levers(S.main_deck(A.deck_cards(con, deck_id)), deck_plan(deck_id))


def page_duel():
    page_header(
        "Duel de decks",
        "Deux decks face à face : KPI sur 20 000 mains simulées, un duel joué sur le plateau tour par tour, et les "
        "leviers d'amélioration.",
        "Analyse",
    )
    decks = {r["name"]: r["id"] for r in con.execute("SELECT id, name FROM decks ORDER BY name")}
    if len(decks) < 2:
        st.info("Il faut au moins deux decks pour les opposer.")
        return
    names = list(decks)
    c1, c2 = st.columns(2)
    name_a = c1.selectbox("Deck A", names, index=names.index("deck_mekk_beta") if "deck_mekk_beta" in names else 0)
    rest = [n for n in names if n != name_a]
    name_b = c2.selectbox("Deck B", rest, index=rest.index(builds.NAME) if builds.NAME in rest else 0)
    cards_a, cards_b = A.deck_cards(con, decks[name_a]), A.deck_cards(con, decks[name_b])
    deck_a, deck_b = S.main_deck(cards_a), S.main_deck(cards_b)
    if not deck_a or not deck_b:
        st.info("Un des deux Main Decks est vide.")
        return
    plans = {name_a: plan_selector(c1, decks[name_a], "duel_plan_a"),
             name_b: plan_selector(c2, decks[name_b], "duel_plan_b")}
    (ka, levers_a), (kb, levers_b) = (deck_stats(decks[n], deck_signature(decks[n])) for n in (name_a, name_b))

    with st.expander("Comment sont calculés ces chiffres ?"):
        n_hands = f"{S.N_HANDS:,}".replace(",", " ")
        st.markdown(f"""
Chaque deck est mélangé **{n_hands} fois** (simulation de Monte-Carlo). On regarde les 5 premières cartes
(tu commences) et les 6 premières (tu joues en second). Un écart n'est déclaré gagnant que s'il dépasse la marge
d'erreur de la simulation (environ ±1 point) : il n'est donc pas dû au hasard.

**Hypothèses de jeu**
- *Starter* : carte du moteur du deck (son archétype) qui lance le jeu seule : elle s'invoque depuis la main,
  ou ajoute, invoque ou envoie au cimetière une carte depuis le deck. Rôles lus dans le texte des cartes.
- **En premier**, le terrain adverse est vide. Un starter « de colonne » (Mekk-Chevalier) ne s'invoque que si tu
  poses toi-même une carte dans sa colonne : il lui faut une Magie/Piège à poser ou un second starter.
- **En second**, l'adversaire a rempli son terrain : un seul starter suffit.
- *Main forte* = jouable, plus une protection en premier (Piège ou interruption), ou une interruption /
  destruction en second.

Ce modèle ne joue pas les combos en entier : il mesure la régularité des mains, pas le résultat d'un duel.
""")

    # 1. Verdict
    st.header("1. Verdict")
    st.caption(f"« {name_a} » : {deck_counts(cards_a)['main']} cartes · « {name_b} » : {deck_counts(cards_b)['main']} cartes")
    wins_a, wins_b = duel_kpi_table(name_a, name_b, ka, kb)
    v1, v2, v3 = st.columns(3)
    status_tile(v1, f"KPI gagnés par {name_a}", str(wins_a), "good" if wins_a > wins_b else "bad" if wins_a < wins_b else "warn",
                f"sur {len(DUEL_KPIS)}")
    status_tile(v2, f"KPI gagnés par {name_b}", str(wins_b), "good" if wins_b > wins_a else "bad" if wins_b < wins_a else "warn",
                f"sur {len(DUEL_KPIS)}")
    legal = {n: not [m for lvl, m in A.check(c) if lvl == "error"] for n, c in ((name_a, cards_a), (name_b, cards_b))}
    status_tile(v3, "Légal en tournoi", "Les deux" if all(legal.values()) else "Pas les deux",
                "good" if all(legal.values()) else "bad",
                " · ".join(f"{n} : {'légal' if ok else 'illégal'}" for n, ok in legal.items()))

    # 2. Duel simulé
    st.header("2. Duel simulé")
    st.caption("Un duel tiré au hasard, joué sur le plateau tour par tour : avance avec « Suivant » ou les flèches du "
               "clavier, ou clique sur une ligne du journal. Relance plusieurs duels : les pourcentages du verdict "
               "résument des milliers de parties comme celle-ci.")
    c1, c2 = st.columns([3, 1], vertical_alignment="bottom")
    starts = c1.segmented_control("Qui commence ?", ["Pile ou face", name_a, name_b], default="Pile ou face",
                                  key="duel_starts") or "Pile ou face"
    if c2.button("Nouveau duel", type="primary", width="stretch"):
        st.session_state["duel_seed"] = st.session_state.get("duel_seed", 0) + 1
    seed = st.session_state.get("duel_seed", 0)
    a_first = bool(np.random.default_rng((seed, 7)).integers(2)) if starts == "Pile ou face" else starts == name_a
    game = D.play(cards_a, cards_b, (name_a, name_b), (plans[name_a], plans[name_b]), seed, a_first)
    duel_board(game, name_a if a_first else name_b, key=f"{name_a}|{name_b}|{seed}|{a_first}")
    with st.expander("Règles du duel simulé"):
        st.markdown("""
- **Tour 1** : le joueur qui commence (5 cartes, sans pioche) joue ses starters un par un. L'adversaire répond avec
  ses interruptions depuis la main (Floraison de Cendres, Nibiru…) : chacune coupe la ligne d'un starter.
  Le premier starter qui passe déroule le moteur : les cartes du moteur sortent du deck, puis un monstre de
  l'Extra Deck arrive. Le joueur pose ensuite ses Pièges.
- **Tour 2** : l'autre joueur pioche (6 cartes), détruit des cartes posées avec ses cartes de destruction, puis
  lance ses starters. Chaque Piège posé encore là et chaque interruption gardée en main coupe une ligne.
- **Bilan** après le tour 2 : le plateau du premier a-t-il tenu, ou le second a-t-il fait son retour ?

Le duel ne joue pas les combos carte par carte ni les combats : comme les chiffres du verdict, il mesure si les
mains permettent de lancer le moteur et de gêner l'adversaire. Les deux mains sont visibles, pour l'analyse.
""")

    # 3. Pourquoi
    st.header("3. Pourquoi : la composition")
    comp_a, comp_b = composition_counts(deck_a, plans[name_a]), composition_counts(deck_b, plans[name_b])
    rows = []
    for label in comp_a:
        (na, pa), (nb, pb) = comp_a[label], comp_b[label]
        rows.append({"Catégorie": label, f"{name_a}": f"{na} cartes ({100 * pa:.0f} %)",
                     f"{name_b}": f"{nb} cartes ({100 * pb:.0f} %)"})
    st.dataframe(pd.DataFrame(rows), hide_index=True, width="stretch")
    sa, sb = comp_a[STARTERS], comp_b[STARTERS]
    st.markdown(
        f"Ce qui compte n'est pas le nombre de starters mais leur **densité**. « {name_a} » en a {sa[0]} sur "
        f"{len(deck_a)} cartes ({100 * sa[1]:.0f} %), « {name_b} » {sb[0]} sur {len(deck_b)} ({100 * sb[1]:.0f} %). "
        f"Résultat : une main bloquée en premier dans **{100 * ka.brick_first:.0f} %** des cas contre "
        f"**{100 * kb.brick_first:.0f} %**.")

    # 4. Leviers
    st.header("4. Quels changements rapportent le plus ?")
    st.caption("Chaque ligne simule le deck avec une seule modification. Les valeurs sont des gains en points "
               "de pourcentage par rapport au deck actuel.")
    cols = st.columns(2, gap="large")
    for col, name, lv in ((cols[0], name_a, levers_a), (cols[1], name_b, levers_b)):
        with col:
            st.markdown(f"**{name}**")
            if not lv:
                st.caption("Plus aucune carte hors moteur : rien à remplacer.")
                continue
            df = pd.DataFrame([{"Modification": l["label"],
                                "Jouable en premier": f"{100 * l['delta_first']:+.1f}",
                                "Forte en premier": f"{100 * l['delta_strong_first']:+.1f}",
                                "Forte en second": f"{100 * l['delta_second']:+.1f}"} for l in lv])
            st.dataframe(df, hide_index=True, width="stretch")
            best_first = max(lv, key=lambda l: l["delta_strong_first"])
            best_second = max(lv, key=lambda l: l["delta_second"])
            st.markdown(f"Meilleur levier en premier : **{best_first['label']}** "
                        f"({100 * best_first['delta_strong_first']:+.1f} pts de mains fortes). "
                        f"En second : **{best_second['label']}** "
                        f"({100 * best_second['delta_second']:+.1f} pts).")

    # 5. Cartes
    st.header("5. Les cartes qui changent")
    mine = {(c["id"], c["zone"]): c["quantity"] for c in cards_a}
    theirs = {(c["id"], c["zone"]): c["quantity"] for c in cards_b}
    plus, minus = [], []
    for key in set(mine) | set(theirs):
        d = theirs.get(key, 0) - mine.get(key, 0)
        if d:
            (plus if d > 0 else minus).append((key[0], f"×{abs(d)} · {ZONES[key[1]]}"))
    card_names = {c["id"]: c["name_fr"] or c["name_en"] for c in cards_a + cards_b}
    plus.sort(key=lambda x: (x[1].split("· ")[1], card_names[x[0]]))
    minus.sort(key=lambda x: (x[1].split("· ")[1], card_names[x[0]]))
    st.subheader(f"En plus dans « {name_b} »")
    cards_gallery(plus, "cmp_plus", per_row=8)
    st.subheader(f"En plus dans « {name_a} »")
    cards_gallery(minus, "cmp_minus", per_row=8)
    with st.expander("Voir les deux decks complets côte à côte"):
        left, right = st.columns(2, gap="large")
        for col, name, cs, key in ((left, name_a, cards_a, "cmp_a"), (right, name_b, cards_b, "cmp_b")):
            with col:
                st.markdown(f"**{name}**")
                for zone, label in ZONES.items():
                    items = [(c["id"], f"×{c['quantity']}") for c in cs if c["zone"] == zone]
                    if items:
                        st.caption(f"{label} ({sum(c['quantity'] for c in cs if c['zone'] == zone)})")
                        cards_gallery(items, f"{key}_{zone}", per_row=5)

"""Page Générateur de build (algorithme d'optimisation)."""

from datetime import date

import pandas as pd
import streamlit as st

from ygo import analysis as A
from ygo import builds
from ygo import meta
from ygo import optimizer as O
from ygo import plan as P
from ygo import simulation as S
from ygo.db import is_extra
from ygo.fr import ARCHETYPES, tr
from ygo.ui.core import cards_gallery, catalog, con, plan_name
from ygo.ui.style import TONES, page_header


META_OPPONENTS = 8  # archétypes du méta pris en compte par l'algorithme


def meta_opponents() -> list[tuple[list[dict], float]]:
    """Liste la plus récente de chaque archétype majeur, pondérée par son nombre de tops."""
    data = meta.load()
    if not data:
        return []
    return [(meta.resolve(con, lists[0]["main"]), len(lists)) for _, lists in meta.archetypes(data)[:META_OPPONENTS]]


def evaluate_main(main: dict, opponents, plan: P.Plan) -> dict:
    """Évaluation indépendante (autres tirages que ceux de la recherche) : 20 000 mains + matchups."""
    rows = {r["id"]: dict(r) for r in con.execute(
        f"SELECT * FROM cards WHERE id IN ({','.join('?' * len(main))})", list(main))}
    deck = [rows[i] for i, q in main.items() for _ in range(q)]
    k = S.simulate(deck, plan, seed=123)
    out = {"Mains fortes en premier": k.strong_first, "Mains fortes en second": k.strong_second,
           "Main bloquée en premier": k.brick_first}
    if opponents:
        out["Indice face au méta"] = (sum(S.matchup(deck, o, plan, seed=7).index * w for o, w in opponents)
                                      / sum(w for _, w in opponents))
    return out


def page_generator():
    page_header(
        "Générateur de build",
        "Un algorithme cherche, parmi les combinaisons de ton stock, le Main Deck du moteur choisi qui maximise tes objectifs, dans le respect de la banlist.",
        "Analyse",
    )
    with st.expander("Comment fonctionne l'algorithme ?"):
        st.markdown("""
1. **Réserve de cartes** : toutes tes cartes de Main Deck, chacune plafonnée à min(stock, banlist, 3) exemplaires.
   Tu peux en **forcer** ou en **exclure**.
2. **Score** d'un deck, calculé par simulation de mains (le même modèle que les pages Duel et Méta) :
   - poids *premier* × part de **mains fortes quand tu commences** ;
   - \\+ poids *second* × part de **mains fortes quand tu joues en second** ;
   - \\+ poids *méta* × **indice moyen face aux archétypes du méta**, pondéré par leur part ;
   - − poids *hors moteur* × cartes qui ne servent ni le moteur, ni à interrompre, protéger ou détruire.
3. **Départ glouton** : on remplit le deck avec les cartes les plus utiles au modèle.
4. **Recuit simulé** : des milliers de fois, on retire une carte et on en ajoute une autre. Une amélioration est
   gardée ; une dégradation l'est parfois au début, pour ne pas rester bloqué sur une solution moyenne.
   Tous les essais sont jugés sur **les mêmes mains tirées**, pour que la comparaison soit équitable.
5. **Vérification** : le deck trouvé est réévalué sur 20 000 **nouvelles** mains, pour s'assurer que le gain
   n'est pas un coup de chance des tirages de la recherche.
6. **Extra Deck**, par règles et dans la taille choisie (0 à 15) : tes cartes forcées d'abord, puis l'Extra du
   moteur, puis les Extra génériques réellement invocables (Synchro s'il y a un Syntoniseur dans le Main, Xyz s'il
   y a au moins 4 monstres du bon niveau). Les cartes exclues ne sont jamais prises.

**Limites** : l'algorithme optimise la *régularité des mains*. Il ne joue pas les combos et ne connaît pas la
valeur fine de chaque carte au-delà de son rôle (starter, interruption, protection, destruction).
""")

    df = catalog()
    owned_main = df[(df["owned"] > 0) & ~df["frame_type"].map(is_extra)]
    labels = dict(zip(owned_main["id"].astype(int), owned_main["nom"]))
    owned_extra = df[(df["owned"] > 0) & df["frame_type"].map(is_extra)]
    extra_labels = dict(zip(owned_extra["id"].astype(int), owned_extra["nom"]))
    opponents = meta_opponents()

    st.subheader("Moteur")
    stock = P.archetypes_in_stock(con)
    if not stock:
        st.info("Aucun archétype dans ton stock : importe ta collection d'abord.")
        return
    names = [a for a, _ in stock]
    engine = st.selectbox(
        "Archétype à construire", names, index=names.index("Mekk-Knight") if "Mekk-Knight" in names else 0,
        format_func=lambda a: f"{tr(ARCHETYPES, a)} ({dict(stock)[a]} cartes en stock)",
        help="Les starters et les cartes du moteur se déduisent du texte des cartes de cet archétype.")
    plan = P.Plan((engine,))

    st.subheader("Objectifs")
    w1, w2, w3, w4 = st.columns(4)
    w_first = w1.slider("Jouer en premier", 0.0, 2.0, 1.0, 0.1, help="Poids des mains fortes quand tu commences.")
    w_second = w2.slider("Jouer en second", 0.0, 2.0, 1.0, 0.1, help="Poids des mains fortes quand tu joues en second.")
    w_meta = w3.slider("Face au méta", 0.0, 2.0, 1.0 if opponents else 0.0, 0.1, disabled=not opponents,
                       help="Poids de l'indice de matchup contre les archétypes du méta (page Simulation méta).")
    w_off = w4.slider("Pénalité hors moteur", 0.0, 1.0, 0.3, 0.05,
                      help="Pénalise les cartes qui ne servent ni le moteur, ni à interrompre, protéger ou détruire.")

    st.subheader("Contraintes du Main Deck")
    c1, c2, c3 = st.columns([1, 2, 2])
    size = c1.slider("Taille du Main Deck", 40, 60, 40,
                     help="Le règlement autorise 40 à 60 cartes. Plus le deck est gros, moins tu pioches tes meilleures cartes.")
    locked = c2.multiselect("Cartes forcées (au moins 1 exemplaire)", list(labels), format_func=labels.get,
                            placeholder="Choisir…")
    excluded = c3.multiselect("Cartes exclues", [i for i in labels if i not in locked], format_func=labels.get,
                              placeholder="Choisir…")
    st.subheader("Contraintes de l'Extra Deck")
    e1, e2, e3 = st.columns([1, 2, 2])
    extra_size = e1.slider("Taille de l'Extra Deck", 0, 15, 15, help="15 cartes au plus.")
    extra_locked = e2.multiselect("Extra forcées", list(extra_labels), format_func=extra_labels.get,
                                  placeholder="Choisir…", help="Prises en priorité, même hors du moteur.")
    extra_excluded = e3.multiselect("Extra exclues", [i for i in extra_labels if i not in extra_locked],
                                    format_func=extra_labels.get, placeholder="Choisir…")
    with st.expander("Réglages avancés"):
        a1, a2, a3 = st.columns(3)
        iterations = a1.slider("Itérations", 500, 10_000, 3000, 500, help="Plus d'itérations = recherche plus longue mais plus fine.")
        hands = a2.slider("Mains simulées par essai", 1000, 10_000, 4000, 1000)
        seed = a3.number_input("Graine aléatoire", 0, 10_000, 0, help="Changer la graine relance une autre recherche.")

    if st.button("Lancer l'algorithme", type="primary"):
        opts = O.Options(plan=plan, size=size, w_first=w_first, w_second=w_second, w_meta=w_meta, w_offplan=w_off,
                         locked={i: 1 for i in locked}, excluded=set(excluded), extra_size=extra_size,
                         extra_locked={i: 1 for i in extra_locked}, extra_excluded=set(extra_excluded),
                         iterations=iterations,
                         hands=hands, seed=int(seed))
        bar = st.progress(0.0, text="Recherche en cours…")
        try:
            result = O.optimize(con, opts, opponents if w_meta > 0 else [],
                                progress=lambda p: bar.progress(p, text=f"Recherche en cours… {100 * p:.0f} %"))
        except ValueError as e:
            bar.empty()
            st.error(str(e))
            return
        bar.progress(1.0, text="Vérification sur de nouvelles mains…")
        st.session_state["gen"] = {"result": result, "opts": opts,
                                   "eval": evaluate_main(result.main, opponents, plan)}
        bar.empty()

    gen = st.session_state.get("gen")
    if not gen:
        return
    result, opts, ev = gen["result"], gen["opts"], gen["eval"]

    st.header("Résultat")
    decks = {r["name"]: r["id"] for r in con.execute("SELECT id, name FROM decks ORDER BY name")}
    plan = opts.plan
    st.caption(f"Moteur : **{plan_name(plan)}**.")
    refs = st.multiselect("Comparer avec", list(decks), default=[d for d in (builds.NAME, "deck_mekk_beta") if d in decks
                                                                 and P.of_deck(con, decks[d], A.deck_cards(con, decks[d])) == plan],
                          placeholder="Choisir…")
    rows = {"Algorithme": ev}
    for name in refs:
        main = {c["id"]: c["quantity"] for c in A.deck_cards(con, decks[name]) if c["zone"] == "main"}
        if main:
            rows[name] = evaluate_main(main, opponents, plan)
    table = pd.DataFrame(rows).T
    lower_better = {"Main bloquée en premier"}
    best = {col: (table[col].min() if col in lower_better else table[col].max()) for col in table}
    styled = table.style.format(lambda v: f"{100 * v:.0f} %").apply(
        lambda col: [f"background-color: {TONES['good'][0]}; color: {TONES['good'][1]}; font-weight: 700"
                     if abs(v - best[col.name]) < 1e-9 else "" for v in col])
    st.dataframe(styled, width="stretch")
    st.caption("Évaluation indépendante sur 20 000 nouvelles mains (pas celles de la recherche). En vert : le meilleur.")

    with st.expander("Convergence de la recherche"):
        st.line_chart(pd.DataFrame({"Meilleur score": result.history}))
        st.caption("Le score monte vite au début, puis se stabilise : la recherche a trouvé un optimum.")

    main_items = sorted(result.main.items(), key=lambda x: (df.loc[df["id"] == x[0], "frame_type"].iloc[0] in ("spell", "trap"),
                                                            labels.get(x[0], "")))
    st.subheader(f"Main Deck ({sum(result.main.values())} cartes)")
    cards_gallery([(i, f"×{q}") for i, q in main_items], "gen_main", per_row=8)
    st.subheader(f"Extra Deck ({sum(result.extra.values())} cartes)")
    cards_gallery([(i, f"×{q}") for i, q in result.extra.items()], "gen_extra", per_row=8)

    st.subheader("Enregistrer ce build")
    s1, s2 = st.columns([3, 1])
    name = s1.text_input("Nom du deck", value=f"algo_{date.today().isoformat()}")
    if s2.button("Enregistrer", type="primary", disabled=not name.strip() or name.strip() in decks):
        notes = (f"Généré par l'algorithme (moteur {plan_name(plan)}, taille {opts.size}, poids premier {opts.w_first}, second {opts.w_second}, "
                 f"méta {opts.w_meta}, hors moteur {opts.w_offplan}, {opts.iterations} itérations, graine {opts.seed}).\n\n"
                 + "\n".join(f"- {k} : {100 * v:.0f} %" for k, v in ev.items()))
        con.execute("INSERT INTO decks (name, notes, plan) VALUES (?, ?, ?)",
                    (name.strip(), notes, "|".join(plan.archetypes)))
        deck_id = con.execute("SELECT id FROM decks WHERE name = ?", (name.strip(),)).fetchone()[0]
        con.executemany("INSERT INTO deck_cards VALUES (?, ?, ?, ?)",
                        [(deck_id, i, "main", q) for i, q in result.main.items()]
                        + [(deck_id, i, "extra", q) for i, q in result.extra.items()])
        con.commit()
        st.success(f"Deck « {name.strip()} » enregistré : retrouve-le dans le Constructeur, le Duel et la Simulation méta.")
    elif name.strip() in decks:
        s1.caption("Ce nom existe déjà.")

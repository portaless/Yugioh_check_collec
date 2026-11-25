"""Page Analyse d'un deck."""

import pandas as pd
import streamlit as st

from ygo import analysis as A
from ygo import plan as P
from ygo.fr import BANLIST, tr
from ygo.ui.core import con
from ygo.ui.decks import deck_counts, deck_selector, pct, plan_selector
from ygo.ui.style import TONES, page_header, status_tile


def page_analysis():
    page_header(
        "Analyse de deck",
        "Légalité, composition et régularité des mains de départ d'un deck.",
        "Analyse",
    )
    deck_id = deck_selector("analysis_deck", "Deck à analyser")
    if deck_id is None:
        return
    plan = plan_selector(st, deck_id, "analysis_plan")
    cards = A.deck_cards(con, deck_id)
    main =[c for c in cards if c["zone"] == "main"]
    n = deck_counts(cards)
    issues = A.check(cards)
    errors = [m for lvl, m in issues if lvl == "error"]
    stock = [m for lvl, m in issues if "possèdes" in m]

    # 1. Bilan
    st.header("1. Bilan")
    b1, b2, b3, b4 = st.columns(4)
    b1.metric("Main Deck", f"{n['main']} cartes", help="Entre 40 et 60 ; idéalement 40.")
    b2.metric("Extra Deck", f"{n['extra']} / 15")
    status_tile(b3, "Légal en tournoi", *(("Oui", "good", "Respecte la banlist TCG") if not errors else
                ("Non", "bad", f"{len(errors)} point(s) à corriger")))
    status_tile(b4, "Faisable avec ton stock", *(("Oui", "good", "Tu as toutes les cartes") if not stock else
                ("Pas encore", "warn", f"{len(stock)} carte(s) manquante(s)")))
    kinds = {"Monstres": 0, "Magies": 0, "Pièges": 0}
    for c in main:
        kinds["Magies" if c["frame_type"] == "spell" else "Pièges" if c["frame_type"] == "trap" else "Monstres"] += c["quantity"]
    st.write(" · ".join(f"**{v}** {k.lower()}" for k, v in kinds.items()))

    if issues:
        st.subheader("À corriger")
        for level, msg in issues:
            (st.error if level == "error" else st.warning)(msg)

    if not main:
        st.info("Main Deck vide.")
        return

    # 2. Composition
    st.header("2. Composition du Main Deck")
    by_role = {}
    for c in main:
        by_role[P.role(c, plan)] = by_role.get(P.role(c, plan), 0) + c["quantity"]
    engine = sum(c["quantity"] for c in main if P.flags(c, plan)["engine"])
    comp = pd.DataFrame([{"Rôle": r, "Cartes": q, "Part du deck": f"{100 * q / n['main']:.0f} %",
                          "À quoi ça sert": P.ROLE_HELP.get(r, "")}
                         for r, q in sorted(by_role.items(), key=lambda x: -x[1])])
    st.dataframe(comp, hide_index=True, width="stretch")

    # 3. Régularité
    st.header("3. Régularité des mains de départ")
    st.caption("Sur 100 parties, combien de fois ta main de départ contient-elle ces cartes ? "
               "Tu as 5 cartes si tu commences et 6 si tu joues en second.")

    def count(r):
        return by_role.get(r, 0)

    # (objectif, cartes, minimum, seuil "bon", seuil "moyen") : repères indicatifs, en jouant en premier
    checks = [
        ("Au moins 1 starter du moteur", count(P.STARTER), 1, .85, .70),
        ("Au moins 2 cartes du moteur", engine, 2, .55, .40),
        ("Au moins 1 interruption depuis la main", count(A.INTERRUPT), 1, .75, .55),
        ("Au moins 1 carte de destruction du terrain", count(A.BREAKER), 1, .50, .35),
    ]
    reg = []
    for label, hits, k, good, ok in checks:
        p5, p6 = A.p_at_least(hits, n["main"], 5, k), A.p_at_least(hits, n["main"], 6, k)
        verdict = "Bon" if p5 >= good else "Moyen" if p5 >= ok else "Faible"
        reg.append({"Objectif": label, "Cartes concernées": hits, "En premier (5 cartes)": pct(p5),
                    "En second (6 cartes)": pct(p6), "Verdict": verdict})
    tones = {"Bon": TONES["good"], "Moyen": TONES["warn"], "Faible": TONES["bad"]}
    styled = pd.DataFrame(reg).style.map(
        lambda v: f"background-color: {tones[v][0]}; color: {tones[v][1]}; font-weight: 600", subset=["Verdict"])
    st.dataframe(styled, hide_index=True, width="stretch")
    st.caption("Verdicts indicatifs : on ne vise pas le même taux pour « 1 starter » "
               "(indispensable) que pour « 1 carte de destruction » (bonus).")

    with st.expander("Calcul personnalisé"):
        names = sorted({c["name_fr"] or c["name_en"] for c in main})
        chosen = st.multiselect("Cartes que tu veux voir en main", names, placeholder="Choisir…")
        k = st.number_input("Combien au minimum", 1, 5, 1)
        hits = sum(c["quantity"] for c in main if (c["name_fr"] or c["name_en"]) in chosen)
        if chosen:
            st.write(f"Avec {hits} carte(s) concernée(s) sur {n['main']} : "
                     f"**{pct(A.p_at_least(hits, n['main'], 5, k))}** en premier, "
                     f"**{pct(A.p_at_least(hits, n['main'], 6, k))}** en second.")

    st.info("Pour opposer ce deck à un autre (KPI, mains en premier et en second, leviers), "
            "va dans la page **Duel de decks**.")

    # 4. Suggestions
    st.header("4. Cartes de ton stock à envisager")
    sug = A.suggestions(con, deck_id, plan)
    if not sug:
        st.caption("Rien à signaler : tes cartes utiles sont déjà dans le deck.")
    for why in dict.fromkeys(s["why"] for s in sug):
        st.markdown(f"**{why}**")
        st.markdown("\n".join(f"- {s['name_fr'] or s['name_en']} (stock : {s['owned']})"
                              + (f" — {tr(BANLIST, s['ban_tcg'])}" if s["ban_tcg"] else "")
                              for s in sug if s["why"] == why))

    notes = con.execute("SELECT notes FROM decks WHERE id = ?", (deck_id,)).fetchone()["notes"]
    if notes:
        st.header("5. Notes du build")
        st.markdown(notes)

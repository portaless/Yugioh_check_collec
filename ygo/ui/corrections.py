"""Page Corrections : noms de l'Excel non reconnus et versions Cardmarket à confirmer."""

from rapidfuzz import fuzz, process
import pandas as pd
import streamlit as st

from ygo import cardmarket as CM
from ygo import cardmarket_match as CMM
from ygo import importer
from ygo import rarity as R
from ygo.importer import normalize
from ygo.ui.card_sheet import card_img
from ygo.ui.core import catalog, con, refresh, search_any, search_box
from ygo.ui.style import page_header


def page_corrections():
    page_header(
        "Corrections",
        "Associe à la bonne carte les noms de l'Excel mal reconnus, et à la bonne version Cardmarket "
        "les raretés dont le prix est incertain.",
        "Données",
    )
    tab_names, tab_versions = st.tabs(["Noms de l'Excel", "Versions Cardmarket"])
    with tab_names:
        name_corrections()
    with tab_versions:
        version_corrections()


def name_corrections():
    st.caption("Une correction est enregistrée dans corrections.json et reste valable aux prochains imports.")
    overrides = {r[0] for r in con.execute("SELECT excel_name FROM name_overrides")}
    rows = [dict(r) for r in con.execute("""SELECT col.excel_name, GROUP_CONCAT(DISTINCT col.location) AS location,
            SUM(col.quantity) AS quantity, MIN(col.match_score) AS match_score, c.name_fr, c.name_en
        FROM collection col LEFT JOIN cards c ON c.id = col.card_id
        WHERE col.card_id IS NULL OR col.match_score < 100
        GROUP BY col.excel_name, col.card_id ORDER BY col.card_id IS NOT NULL, match_score""")]
    rows = [r for r in rows if r["excel_name"] not in overrides]
    st.subheader("À vérifier")
    if not rows:
        st.success("Toutes les cartes sont reconnues.")
    for r in rows:
        current = r["name_fr"] or r["name_en"]
        status = f"reconnue comme *{current}* (score {r['match_score']})" if current else ":red[non reconnue]"
        correction_form(r["excel_name"], f"{r['location']} ×{r['quantity']} → {status}")

    st.subheader("Corrections enregistrées")
    saved = con.execute("""SELECT o.excel_name, c.name_fr, c.name_en FROM name_overrides o
                           JOIN cards c ON c.id = o.card_id ORDER BY o.excel_name""").fetchall()
    labels = {r["excel_name"]: f"{r['excel_name']}  →  {r['name_fr'] or r['name_en']}" for r in saved}
    picked = st.selectbox("Correction à revoir", [None, *labels], format_func=lambda k: "—" if k is None else labels[k])
    if picked:
        correction_form(picked, None)


def correction_form(excel_name: str, status: str | None):
    """Cartes candidates les plus proches du nom de l'Excel ; la carte actuelle est présélectionnée,
    son image s'affiche pour vérifier avant de valider."""
    df = catalog()
    current = con.execute("SELECT card_id FROM collection WHERE excel_name = ? AND card_id IS NOT NULL",
                          (excel_name,)).fetchone()
    current_id = current[0] if current else None
    with st.container(border=status is not None):
        if status:
            st.markdown(f"**{excel_name}** — {status}")
        form, preview = st.columns([3, 1])
        terms = search_box(form, "Chercher une autre carte (laisser vide = cartes les plus proches)", df["nom"],
                           f"fix_q_{excel_name}")
        if terms:
            res = search_any(df, terms).head(100)
        else:
            q = normalize(excel_name)
            names = dict(zip(df.index, df["name_fr"].fillna(df["name_en"]).map(normalize)))
            found = process.extract(q, names, scorer=fuzz.WRatio, limit=30)
            # même pondération que l'import : WRatio seul sur-note les sous-chaînes
            found.sort(key=lambda m: -(m[1] + fuzz.ratio(q, m[0])))
            res = df.loc[[i for _, _, i in found[:10]]]
        if current_id is not None and current_id not in set(res["id"]):
            res = pd.concat([df[df["id"] == current_id], res])
        if res.empty:
            form.caption("Aucun résultat.")
            return
        ids = [int(i) for i in res["id"]]
        labels = {int(x.id): f"{x.nom} ({x['catégorie']})" for _, x in res.iterrows()}
        index = ids.index(current_id) if current_id in ids else 0
        choice = form.selectbox("Carte", ids, index=index, format_func=labels.get, key=f"fix_s_{excel_name}")
        card_img(preview, df[df["id"] == choice].iloc[0], max_width="140px")
        if form.button("Valider", key=f"fix_b_{excel_name}", disabled=choice == current_id and status is None):
            save_correction(excel_name, choice)
            refresh()


def version_corrections():
    """Impressions possédées dont le produit Cardmarket est déduit (≈) ou douteux (?) : choix manuel."""
    st.caption("Cardmarket ne dit pas, dans ses fichiers, quelle rareté correspond à quel produit quand une carte a "
               "plusieurs raretés dans la même extension. Ouvre la carte sur Cardmarket, repère le prix de ta rareté, "
               "puis choisis le produit qui a ce prix. Ton choix est enregistré dans versions_cardmarket.json.")
    owned = {}
    for r in con.execute("SELECT card_id, rarity FROM collection WHERE card_id IS NOT NULL"):
        owned.setdefault(r["card_id"], set()).add(r["rarity"])
    rows = [dict(r) for r in con.execute("""
        SELECT p.card_id, p.set_name, p.set_code, p.rarity, p.cm_product, p.confidence, m.trend,
               COALESCE(c.name_fr, c.name_en) AS nom, c.name_en
        FROM printings p JOIN cards c ON c.id = p.card_id LEFT JOIN cm_products m ON m.id = p.cm_product
        WHERE p.confidence IN ('deduit', 'doute') ORDER BY p.confidence DESC, nom""")]
    rows = [r for r in rows if r["card_id"] in owned and (r["rarity"] in owned[r["card_id"]] or None in owned[r["card_id"]])]
    if not rows:
        st.success("Aucune version incertaine parmi les raretés que tu possèdes.")
        return
    only_doubt = st.toggle("Seulement les « ? »", value=True)
    if only_doubt:
        rows = [r for r in rows if r["confidence"] == "doute"]
    st.caption(f"{len(rows)} impression(s) à vérifier.")
    for r in rows[:60]:
        cands = CMM.candidates(con, r["card_id"], r["set_name"])
        mark = "?" if r["confidence"] == "doute" else "≈"
        with st.container(border=True):
            st.markdown(f"**{r['nom']}** — {r['set_name']} ({CM.french_code(r['set_code'])}), **{R.label(r['rarity'])}** {mark}  ·  "
                        f"[Voir sur Cardmarket ↗]({CM.search_url(r['name_en'])})")
            if not cands:
                st.caption("Aucun produit Cardmarket trouvé pour cette extension.")
                continue
            labels = {c["id"]: f"Produit n°{i + 1} : tendance {euros(c['trend'])}, plus bas {euros(c['low'])}"
                      + (f" (CardTrader : {R.label(c['ct_rarity'])})" if c["ct_rarity"] else "")
                      for i, c in enumerate(cands)}
            ids = list(labels)
            key = f"{r['card_id']}_{r['set_code']}_{r['rarity']}"
            a, b = st.columns([4, 1])
            pick = a.selectbox("Produit de ta rareté", ids, format_func=labels.get, key=f"ver_s_{key}",
                               index=ids.index(r["cm_product"]) if r["cm_product"] in ids else 0)
            if b.button("Valider", key=f"ver_b_{key}"):
                CM.save_choice(con, r["card_id"], r["set_code"], r["rarity"], pick)
                refresh()
    if len(rows) > 60:
        st.caption(f"… et {len(rows) - 60} autres : valide celles-ci pour faire apparaître la suite.")


def euros(v) -> str:
    return "?" if v is None else f"{v:.2f} €".replace(".", ",")


def save_correction(excel_name: str, card_id: int):
    con.execute("INSERT OR REPLACE INTO name_overrides VALUES (?, ?)", (excel_name, card_id))
    con.execute("UPDATE collection SET card_id = ?, match_score = 100 WHERE excel_name = ?", (card_id, excel_name))
    importer.fill_missing_french_names(con)
    con.commit()
    importer.add_corrections({excel_name: card_id})

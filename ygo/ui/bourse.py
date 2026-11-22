"""Page Bourse : évolution du prix des cartes possédées et de la collection."""
from datetime import date, timedelta
from html import escape

import altair as alt
import pandas as pd
import streamlit as st

from ygo import bourse as B
from ygo import rarity as R
from ygo.ui.core import catalog, con, gallery, open_card
from ygo.ui.style import GOLD, page_header

PERIODS = {"7 jours": 7, "30 jours": 30, "Tout": None}


def euros(v: float) -> str:
    return f"{v:,.2f} €".replace(",", " ").replace(".", ",")


def signed(v: float, pct: float | None = None) -> str:
    text = ("+" if v >= 0 else "-") + euros(abs(v))  # « - » ASCII : st.metric en déduit la flèche
    return text if pct is None else f"{text} ({pct:+.1f} %)".replace(".", ",")


def _snapshot():
    """Relevé du jour, une fois par jour et par session."""
    today = date.today().isoformat()
    if st.session_state.get("bourse_day") == today:
        return
    try:
        with st.spinner("Relevé des prix Cardmarket du jour…"):
            B.ensure_today(con)
        st.session_state["bourse_day"] = today
    except Exception as e:  # hors ligne : on affiche l'historique déjà relevé
        st.warning(f"Relevé du jour impossible ({e}). Historique affiché tel quel.")


def _change(total: pd.DataFrame, days: int | None) -> tuple[float, float]:
    end = total["valeur"].iloc[-1]
    since = total["jour"].iloc[-1] - timedelta(days=days) if days else total["jour"].iloc[0]
    start = total.loc[total["jour"] >= since, "valeur"].iloc[0]
    return end - start, (end / start - 1) * 100 if start else 0.0


def _chart(total: pd.DataFrame):
    df = total.assign(jour=pd.to_datetime(total["jour"]),
                      type=["Estimé" if e else "Relevé" for e in total["estime"]])
    # le premier jour relevé appartient aux deux segments pour que la courbe reste continue
    first_real = df.index[~df["estime"]].min() if (~df["estime"]).any() else None
    if first_real is not None and first_real > 0:
        df = pd.concat([df, df.loc[[first_real]].assign(type="Estimé")])
    base = alt.Chart(df).encode(
        x=alt.X("jour:T", title=None, axis=alt.Axis(format="%d %b", labelAngle=0)),
        y=alt.Y("valeur:Q", title="Valeur (€)", scale=alt.Scale(zero=False)),
        tooltip=[alt.Tooltip("jour:T", title="Jour", format="%d/%m/%Y"),
                 alt.Tooltip("valeur:Q", title="Valeur", format=",.2f"), alt.Tooltip("type:N", title="Point")])
    real = base.transform_filter(alt.datum.type == "Relevé").mark_line(color=GOLD, strokeWidth=2.5, point=True)
    estimated = base.transform_filter(alt.datum.type == "Estimé").mark_line(
        color=GOLD, strokeDash=[5, 4], strokeWidth=2, opacity=.7)
    st.altair_chart((estimated + real).properties(height=320), use_container_width=True)


def _for_period(versions: pd.DataFrame, days: int | None) -> pd.DataFrame:
    """Prix de départ, évolution et courbe ramenés à la période choisie."""
    curves = versions["courbe"].map(lambda c: c[-(days + 1):] if days else c)
    out = versions.assign(courbe=curves, début=curves.map(lambda c: c[0]))
    out["évolution"] = (out["actuel"] / out["début"] - 1) * 100
    out["gain"] = (out["actuel"] - out["début"]) * out["qté"]
    out["rareté"] = out["rareté"].map(lambda r: R.label(r) if isinstance(r, str) else "Inconnue")
    return out


def _sorted(versions: pd.DataFrame, order: str) -> pd.DataFrame:
    view = versions.sort_values("gain", ascending=(order == "Plus fortes baisses"))
    if order != "Toutes":
        view = view[view["gain"] < 0] if order == "Plus fortes baisses" else view[view["gain"] > 0]
    return view.reset_index(drop=True)


def _trend(v: float) -> str:
    return "up" if v > 0.05 else "down" if v < -0.05 else "flat"


def _cards_visual(view: pd.DataFrame, per_row: int):
    cat = catalog().set_index("id")
    df = cat.loc[view["card_id"]].reset_index()
    tickers, subs = [], []
    for v in view.itertuples():
        trend = _trend(v.évolution)
        arrow = {"up": "▲", "down": "▼", "flat": "="}[trend]
        tickers.append(f"<span class='tile-ticker {trend}'>{arrow} {v.évolution:+.1f} %</span>".replace(".", ","))
        subs.append(f"<div class='tile-sub'>{escape(v.rareté)} · ×{v.qté}<br>{euros(v.actuel)} "
                    f"<span class='{trend}'>{escape(signed(v.gain))}</span></div>")
    gallery(df.assign(ticker=tickers, sub=subs), "bourse", per_row)


def _cards_table(view: pd.DataFrame):
    event = st.dataframe(
        view[["carte", "rareté", "courbe", "qté", "début", "actuel", "évolution", "gain", "extension"]],
        hide_index=True, use_container_width=True, height=420, on_select="rerun", selection_mode="single-row",
        column_config={
            "carte": "Carte",
            "rareté": "Rareté", "extension": "Extension",
            "qté": st.column_config.NumberColumn("Qté", width="small"),
            "début": st.column_config.NumberColumn("Prix au début", format="%.2f €"),
            "actuel": st.column_config.NumberColumn("Prix actuel", format="%.2f €"),
            "évolution": st.column_config.NumberColumn("Évolution", format="%+.1f %%"),
            "gain": st.column_config.NumberColumn("Gain (× qté)", format="%+.2f €"),
            "courbe": st.column_config.LineChartColumn("Courbe", width="small"),
        })
    if event.selection.rows:
        open_card([int(i) for i in view["card_id"]], event.selection.rows[0])


def page_bourse():
    page_header("Bourse",
                "L'évolution du prix de tes cartes et de ta collection, relevée chaque jour sur Cardmarket.",
                "Bourse")
    _snapshot()
    data = B.market(con)
    if not data or data["versions"].empty:
        st.info("Pas encore de relevé : mets à jour les prix depuis la page **Import**.")
        return
    total, versions = data["total"], data["versions"]

    period = st.segmented_control("Période", list(PERIODS), default="Tout", label_visibility="collapsed") or "Tout"
    days = PERIODS[period]
    shown = total if not days else total[total["jour"] >= total["jour"].iloc[-1] - timedelta(days=days)]

    m1, m2, m3, m4 = st.columns(4)
    d1, p1 = _change(total, 1)
    m1.metric("Valeur aujourd'hui", euros(total["valeur"].iloc[-1]), signed(d1, p1) + " sur 1 jour")
    d, p = _change(total, days)
    m2.metric(f"Sur {period.lower()}" if days else "Depuis le 1er novembre", signed(d), f"{p:+.1f} %".replace(".", ","))
    up = int((versions["gain"] > 0).sum())
    down = int((versions["gain"] < 0).sum())
    m3.metric("En hausse / en baisse", f"{up} / {down}", f"{len(versions) - up - down} stables", delta_color="off")
    best = versions.loc[versions["gain"].idxmax()] if up else None
    m4.metric("Meilleure progression", signed(best["gain"]) if best is not None else "—",
              best["carte"] if best is not None else None, delta_color="off", delta_arrow="off")

    st.subheader("Ma collection")
    _chart(shown)
    real = int((~total["estime"]).sum())
    st.caption(f"Ta collection actuelle, au prix de chaque jour. {real} jour(s) relevé(s) ; la partie en pointillés "
               "est estimée à partir des moyennes Cardmarket sur 30, 7 et 1 jours. Un relevé est fait chaque jour "
               "où tu ouvres cette page."
               + (f" Les cartes sans cote Cardmarket suivie ({euros(data['fixed'])}) sont comptées à prix fixe."
                  if data["fixed"] > 0.01 else ""))

    st.subheader("Mes cartes")
    o1, o2 = st.columns([3, 1])
    order = o1.segmented_control("Tri", ["Plus fortes hausses", "Plus fortes baisses", "Toutes"],
                                 default="Plus fortes hausses", label_visibility="collapsed") or "Toutes"
    per_row = o2.select_slider("Cartes par ligne", [4, 5, 6, 8], value=6)
    view = _sorted(_for_period(versions, days), order)
    st.caption(f"Prix tendance Cardmarket de la version possédée (extension + rareté), évolution "
               f"{'sur ' + period.lower() if days else 'depuis le 1er novembre'}. Clique sur une carte pour ouvrir sa fiche.")
    if view.empty:
        st.caption("Aucune carte dans cette catégorie pour l'instant.")
        return
    tab_visual, tab_table = st.tabs(["Visuel", "Tableau"])
    with tab_visual:
        _cards_visual(view, per_row)
    with tab_table:
        _cards_table(view)

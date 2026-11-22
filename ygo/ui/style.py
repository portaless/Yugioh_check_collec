"""Direction artistique : CSS commun et en-tête de page. Les couleurs de base sont dans .streamlit/config.toml."""
from html import escape

import streamlit as st

GOLD = "#E3B341"

# (fond, texte) des pastilles de statut, lisibles sur le fond bleu nuit
TONES = {"good": ("rgba(61,190,139,.16)", "#3DBE8B"), "warn": ("rgba(227,169,58,.16)", "#E3A93A"),
         "bad": ("rgba(232,119,109,.16)", "#E8776D")}

CSS = """<style>
/* ---------- galerie : un bouton transparent recouvre chaque vignette, le clic sur l'image ouvre la fiche */
div[class*="st-key-tile_"] { position: relative; }
div[class*="st-key-tile_"] .stElementContainer:has(.stButton) { position: absolute; inset: 0; z-index: 2; margin: 0; }
div[class*="st-key-tile_"] .stButton, div[class*="st-key-tile_"] .stButton button {
    width: 100%; height: 100%; opacity: 0; cursor: zoom-in; }
.card-img { width: 100%; display: block; border-radius: 6px; }
div[class*="st-key-tile_"] img { transition: transform .18s ease, box-shadow .18s ease; border-radius: 5px;
    box-shadow: 0 4px 12px rgba(0,0,0,.35); }
div[class*="st-key-tile_"]:hover img { transform: translateY(-4px);
    box-shadow: 0 0 0 2px #E3B341, 0 10px 24px rgba(227,179,65,.25); }
.tile-name { font-size: .84rem; margin-top: .45rem; line-height: 1.3; }
.tile-badge { color: #E3B341; font-weight: 600; }
.tile-art { position: relative; }
.tile-ticker { position: absolute; top: 6px; right: 6px; padding: .12rem .45rem; border-radius: 999px;
    font-size: .78rem; font-weight: 700; backdrop-filter: blur(3px); box-shadow: 0 2px 6px rgba(0,0,0,.45); }
.tile-ticker.up { background: rgba(20,60,45,.92); color: #3DBE8B; border: 1px solid #3DBE8B; }
.tile-ticker.down { background: rgba(70,25,25,.92); color: #E8776D; border: 1px solid #E8776D; }
.tile-ticker.flat { background: rgba(23,27,48,.92); color: #A8A49A; border: 1px solid #2A3050; }
.tile-sub { font-size: .76rem; color: #A8A49A; line-height: 1.35; }
.tile-sub .up { color: #3DBE8B; font-weight: 600; } .tile-sub .down { color: #E8776D; font-weight: 600; }

/* ---------- fiche agrandie : large, et adaptée à la hauteur de la fenêtre (boutons toujours visibles) */
[role="dialog"] { width: min(1200px, 94vw) !important; max-width: none !important; }
[role="dialog"] .stElementContainer:has(> iframe) { height: min(640px, calc(100vh - 170px)) !important;
    flex: 0 0 auto !important; }
[role="dialog"] iframe { height: 100% !important; }

/* ---------- en-tête de page */
.page-hero { padding: .2rem 0 1.1rem; margin-bottom: 1.2rem; border-bottom: 1px solid #2A3050; position: relative; }
.page-hero::after { content: ""; position: absolute; left: 0; bottom: -1px; width: 120px; height: 2px;
    background: linear-gradient(90deg, #E3B341, transparent); }
.page-hero .kicker { font-size: .78rem; letter-spacing: .22em; text-transform: uppercase; color: #E3B341;
    font-weight: 600; margin-bottom: .35rem; }
.page-hero h1 { font-family: Cinzel, Georgia, serif; font-size: 2.3rem; margin: 0; padding: 0; line-height: 1.15; }
.page-hero p { margin: .5rem 0 0; color: #A8A49A; font-size: 1.02rem; max-width: 60rem; }

/* ---------- titres de section */
[data-testid="stMain"] h2 { border-left: 3px solid #E3B341; padding-left: .7rem !important; margin-top: 1.4rem !important; }

/* ---------- métriques natives en cartes */
[data-testid="stMetric"] { background: #171B30; border: 1px solid #2A3050; border-radius: .7rem; padding: .7rem 1rem; }
[data-testid="stMetricValue"] { color: #F3D27A; }

/* ---------- pastilles de statut */
.status-tile { border-radius: .8rem; padding: .75rem 1rem; height: 100%; }
.status-tile .label { font-size: .82rem; opacity: .8; }
.status-tile .value { font-size: 1.7rem; font-weight: 700; line-height: 1.3; font-family: Cinzel, Georgia, serif; }
.status-tile .detail { font-size: .82rem; opacity: .75; }
.pill { font-weight: 700; padding: .22rem .8rem; border-radius: 999px; display: inline-block; }
</style>"""


def apply_style():
    st.html(CSS)


def page_header(title: str, subtitle: str = "", kicker: str = ""):
    st.html(f"""<div class="page-hero">
        {f'<div class="kicker">{escape(kicker)}</div>' if kicker else ''}
        <h1>{escape(title)}</h1>
        {f'<p>{escape(subtitle)}</p>' if subtitle else ''}
    </div>""")


def status_tile(col, label: str, value: str, tone: str, detail: str):
    bg, fg = TONES[tone]
    col.html(f"""<div class="status-tile" style="background:{bg}; border:1px solid {fg}33">
        <div class="label">{escape(label)}</div>
        <div class="value" style="color:{fg}">{escape(value)}</div>
        <div class="detail">{escape(detail)}</div></div>""")


def pill(text: str, tone: str) -> str:
    bg, fg = TONES[tone]
    return f"<span class='pill' style='background:{bg}; color:{fg}'>{escape(text)}</span>"

"""Plateau du duel simulé : les étapes calculées par ygo.duel, rejouées dans le navigateur.

Tout le déroulé est envoyé en une fois : avancer, reculer ou lancer la lecture se fait sans aller-retour avec
Python. Flèches gauche/droite du clavier quand le plateau a le focus, clic sur une ligne du journal pour y aller.
"""
from concurrent.futures import ThreadPoolExecutor

import streamlit as st

from ygo.images import thumb_src
from ygo.ui.core import catalog

DUEL_BOARD = st.components.v2.component(
    "duel_board",
    css="""
    .db { --gold: #E3B341; --ink: #E9E6DD; --mute: #A8A49A; --line: #2A3050; --panel: #171B30; --deep: #0D1020;
          --good: #3DBE8B; --bad: #E8776D; color: var(--ink); font-family: inherit; outline: none; }
    .db .top { display: flex; flex-wrap: wrap; gap: .6rem; align-items: center; justify-content: space-between;
               margin-bottom: .6rem; }
    .db .turn { font-size: .78rem; letter-spacing: .18em; text-transform: uppercase; color: var(--gold); }
    .db .ctrl { display: flex; gap: .35rem; flex-wrap: wrap; }
    .db button { background: var(--panel); color: var(--ink); border: 1px solid var(--line); border-radius: .45rem;
                 padding: .3rem .7rem; font: inherit; font-size: .85rem; cursor: pointer; }
    .db button:hover { border-color: var(--gold); }
    .db button.main { background: var(--gold); color: var(--deep); border-color: var(--gold); font-weight: 600; }
    .db .layout { display: grid; grid-template-columns: minmax(0, 640px) minmax(260px, 1fr); gap: 1rem; }
    @media (max-width: 900px) { .db .layout { grid-template-columns: minmax(0, 1fr); } }
    .db .field { background: radial-gradient(ellipse at center, #1B2140 0%, #10142A 70%); border: 1px solid var(--line);
                 border-radius: .8rem; padding: .7rem; }
    .db .side { display: grid; gap: .35rem; }
    .db .who { display: flex; align-items: center; gap: .5rem; font-weight: 600; font-size: .9rem; }
    .db .who .tag { font-size: .7rem; font-weight: 600; padding: .05rem .45rem; border-radius: 1rem;
                    border: 1px solid var(--gold); color: var(--gold); }
    .db .row { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: .35rem; }
    .db .slot { aspect-ratio: 168 / 246; border: 1px dashed rgba(227,179,65,.25); border-radius: .3rem;
                position: relative; display: flex; align-items: center; justify-content: center; }
    .db .slot.pile { border-style: solid; border-color: var(--line); background: rgba(13,16,32,.6); }
    .db .pile .lbl { position: absolute; bottom: .2rem; left: 0; right: 0; text-align: center; font-size: .62rem;
                     color: var(--mute); text-transform: uppercase; letter-spacing: .06em; z-index: 2; }
    .db .pile .num { position: absolute; top: .15rem; right: .25rem; font-size: .8rem; font-weight: 700;
                     color: var(--gold); z-index: 2; text-shadow: 0 1px 2px #000; }
    .db .card { position: absolute; inset: 0; border-radius: .3rem; overflow: hidden; transition: transform .25s,
                box-shadow .25s, filter .25s; background: var(--deep); }
    .db .card img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .db .card.down { background: repeating-linear-gradient(45deg, #1A2148 0 6px, #141A3A 6px 12px);
                     border: 2px solid var(--gold); }
    .db .card.down::after { content: ""; position: absolute; inset: 28% 22%; border: 2px solid rgba(227,179,65,.7);
                            transform: rotate(45deg); }
    .db .card.down img { opacity: .28; }
    .db .card.off { filter: grayscale(1) brightness(.6); }
    .db .card.off::before { content: "Annulé"; position: absolute; left: 0; right: 0; top: 42%; text-align: center;
                            font-size: .62rem; font-weight: 700; color: var(--bad); background: rgba(13,16,32,.85);
                            z-index: 2; letter-spacing: .05em; }
    .db .card.hot { box-shadow: 0 0 0 2px var(--gold), 0 0 16px rgba(227,179,65,.7); transform: translateY(-3px); z-index: 3; }
    .db .pile .card { opacity: .9; }
    .db .hand { display: flex; gap: .3rem; min-height: 2rem; }
    .db .hand .slot { flex: 0 0 calc((100% - 6 * .35rem) / 7.6); border: none; }
    .db .mid { margin: .6rem 0; padding: .55rem .8rem; border-radius: .5rem; background: rgba(13,16,32,.75);
               border-left: 3px solid var(--gold); font-size: .95rem; min-height: 2.8rem; }
    .db .mid.cut { border-left-color: var(--bad); }
    .db .mid.good { border-left-color: var(--good); }
    .db .mid .meta { font-size: .72rem; color: var(--mute); text-transform: uppercase; letter-spacing: .12em; }
    .db .log { background: var(--panel); border: 1px solid var(--line); border-radius: .8rem; padding: .5rem;
               max-height: 760px; overflow-y: auto; font-size: .82rem; }
    .db .log .it { padding: .35rem .45rem; border-radius: .35rem; cursor: pointer; border-left: 2px solid transparent;
                   color: var(--mute); line-height: 1.3; }
    .db .log .it:hover { background: rgba(227,179,65,.08); }
    .db .log .it.now { color: var(--ink); background: rgba(227,179,65,.12); border-left-color: var(--gold); }
    .db .log .it.future { opacity: .45; }
    .db .log .it.cut b { color: var(--bad); } .db .log .it.good b { color: var(--good); }
    .db .log .t { font-size: .68rem; text-transform: uppercase; letter-spacing: .08em; color: var(--gold); }
    .db .verdict { margin-top: .6rem; padding: .6rem .8rem; border-radius: .5rem; border: 1px solid var(--gold);
                   background: rgba(227,179,65,.08); font-weight: 600; }
    """,
    js="""
    export default function(component) {
        const { data, parentElement } = component;
        let root = parentElement.querySelector(".db");
        if (!root) {
            root = document.createElement("div");
            root.className = "db";
            root.tabIndex = 0;
            parentElement.appendChild(root);
            root.addEventListener("keydown", (e) => {
                if (e.key === "ArrowRight") { root.go(root.idx + 1); e.preventDefault(); }
                if (e.key === "ArrowLeft") { root.go(root.idx - 1); e.preventDefault(); }
            });
        }
        if (root.dataset.key !== data.key) {   // nouveau duel : retour au début
            root.dataset.key = data.key;
            root.idx = 0;
            clearInterval(root.timer);
            root.timer = null;
        }
        const steps = data.steps, imgs = data.imgs;
        const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]));
        const card = (c, hot) => '<div class="card' + (c.down ? " down" : "") + (c.off ? " off" : "")
            + (hot.has(c.uid) ? " hot" : "") + '" title="' + esc(c.name + (c.down ? " (face cachée)" : "")) + '">'
            + (imgs[c.id] ? '<img src="' + imgs[c.id] + '" alt="">' : "") + "</div>";
        const zones = (cards, hot) => {
            let out = "";
            for (let i = 0; i < 5; i++) out += '<div class="slot">' + (cards[i] ? card(cards[i], hot) : "") + "</div>";
            return out;
        };
        const pile = (label, n, top, hot) => '<div class="slot pile">' + (top ? card(top, hot) : "")
            + '<span class="num">' + n + '</span><span class="lbl">' + label + "</span></div>";
        const hand = (cards, hot) => '<div class="hand">' + cards.map((c) => '<div class="slot">' + card(c, hot) + "</div>").join("") + "</div>";
        const side = (s, hot, mirror) => {
            const gy = s.gy.length ? s.gy[s.gy.length - 1] : null;
            const st = '<div class="row">' + pile("Extra", s.extra, null, hot) + zones(s.backrow, hot) + pile("Deck", s.deck, null, hot) + "</div>";
            const mo = '<div class="row">' + pile("Cimet.", s.gy.length, gy, hot) + zones(s.monsters, hot) + '<div></div></div>';
            const who = '<div class="who">' + esc(s.name) + (s.name === data.first ? '<span class="tag">commence</span>' : "")
                + '<span style="font-weight:400;color:var(--mute);font-size:.78rem">' + s.hand.length + " en main</span></div>";
            return '<div class="side">' + (mirror ? who + hand(s.hand, hot) + st + mo : mo + st + hand(s.hand, hot) + who) + "</div>";
        };
        root.go = (i) => {
            root.idx = Math.max(0, Math.min(steps.length - 1, i));
            const s = steps[root.idx], hot = new Set(s.hot);
            const phase = s.turn ? "Tour " + s.turn + " · " + s.phase : s.phase;
            const log = steps.map((x, k) => '<div class="it ' + x.tone + (k === root.idx ? " now" : k > root.idx ? " future" : "")
                + '" data-k="' + k + '"><div class="t">' + (x.turn ? "Tour " + x.turn + " · " : "") + esc(x.phase)
                + "</div><b>" + esc(x.actor || "Duel") + "</b> " + esc(x.text) + "</div>").join("");
            root.innerHTML = '<div class="top"><div><div class="turn">' + esc(phase) + "</div>"
                + "<div>Étape " + (root.idx + 1) + " / " + steps.length + "</div></div>"
                + '<div class="ctrl"><button data-a="first">Début</button><button data-a="prev">‹ Précédent</button>'
                + '<button class="main" data-a="next">Suivant ›</button><button data-a="play">'
                + (root.timer ? "Pause" : "Lecture") + '</button><button data-a="last">Fin</button></div></div>'
                + '<div class="layout"><div><div class="field">' + side(s.b, hot, true)
                + '<div class="mid ' + s.tone + '"><div class="meta">' + esc(s.actor || "Duel") + "</div>" + esc(s.text) + "</div>"
                + side(s.a, hot, false) + "</div>"
                + (root.idx === steps.length - 1 ? '<div class="verdict">' + esc(data.verdict) + "</div>" : "")
                + '</div><div class="log">' + log + "</div></div>";
            const now = root.querySelector(".log .now");
            if (now) now.scrollIntoView({ block: "nearest" });
            root.querySelectorAll(".log .it").forEach((el) => el.addEventListener("click", () => root.go(+el.dataset.k)));
            root.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => {
                const a = b.dataset.a;
                if (a === "first") root.go(0);
                if (a === "prev") root.go(root.idx - 1);
                if (a === "next") root.go(root.idx + 1);
                if (a === "last") root.go(steps.length - 1);
                if (a === "play") {
                    if (root.timer) { clearInterval(root.timer); root.timer = null; root.go(root.idx); return; }
                    if (root.idx >= steps.length - 1) root.idx = -1;
                    root.timer = setInterval(() => {
                        if (root.idx >= steps.length - 1) { clearInterval(root.timer); root.timer = null; root.go(root.idx); return; }
                        root.go(root.idx + 1);
                    }, 1600);
                    root.go(root.idx + 1);
                }
                root.focus();
            }));
        };
        root.go(root.idx || 0);
    }
    """,
)


def duel_board(game: dict, first: str, key: str):
    """Affiche un duel calculé par ygo.duel.play."""
    ids = {c["id"] for s in game["steps"] for side in (s["a"], s["b"])
           for zone in ("hand", "monsters", "backrow", "gy") for c in side[zone]}
    urls = catalog().set_index("id")["image_url"]
    ids = [i for i in ids if i in urls.index]
    with ThreadPoolExecutor(8) as pool:  # miniatures téléchargées en parallèle la première fois
        imgs = dict(zip(ids, pool.map(thumb_src, ids, (urls[i] for i in ids))))
    DUEL_BOARD(data={"steps": game["steps"], "imgs": {str(k): v for k, v in imgs.items() if v},
                     "verdict": game["verdict"], "first": first, "key": key}, key="duel_board")

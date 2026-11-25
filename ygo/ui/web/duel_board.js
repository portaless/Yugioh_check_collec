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

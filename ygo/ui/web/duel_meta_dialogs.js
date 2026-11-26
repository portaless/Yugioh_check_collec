// Duel contre la méta, partie fenêtres : fiche de carte, questions du moteur, piles, mise en page (assemblée avec les autres fichiers duel_meta_*.js par ygo/ui/duel_meta.py).

function detailHTML(root) {
    const code = root.ui.detail;
    if (!code) return `<div class="detail empty">Survole une carte pour lire son texte ici.</div>`;
    const i = info(root, code);
    return `<div class="detail">${i.img ? `<img src="${i.img}" alt="">` : ""}<div class="dn">${esc(i.name)}</div><div class="tx">${esc(i.text)}</div></div>`;
}

function promptHTML(root) {
    const P = root.ui.prompt;
    if (!P || P.kind === "actions") return "";
    const opt = (o, k) => `<button class="opt" data-opt="${k}">${o.code ? `<div class="card" data-code="${o.code}">${info(root, o.code).img ? `<img src="${info(root, o.code).img}" alt="">` : ""}</div>` : ""}<span>${o.code ? `<b>${esc(info(root, o.code).name)}</b>` : ""}${esc(o.label)}</span></button>`;
    if (P.kind === "place") {
        return `<div class="banner">${esc(P.title)} <i>(${root.ui.picked.length}/${P.count}) : clique une zone dorée.</i></div>`;
    }
    let body = "";
    if (P.kind === "choose") body = `<div class="opts">${P.options.map(opt).join("")}</div>` + (P.cancel ? `<div class="mb"><button data-cancel="1">${esc(P.cancel.label)}</button></div>` : "");
    if (P.kind === "yesno") body = `${P.code ? `<div class="yn">${info(root, P.code).img ? `<img src="${info(root, P.code).img}" alt="">` : ""}<div>${esc(P.text)}</div></div>` : `<div>${esc(P.text)}</div>`}<div class="mb"><button class="main" data-yes="1">Oui</button><button data-yes="0">Non</button></div>`;
    if (P.kind === "cards") {
        const n = root.ui.picked.length;
        const ok = P.step ? false : n >= P.min && n <= P.max;
        body = (P.chosen && P.chosen.length ? `<div class="ms">Déjà choisies : ${esc(P.chosen.join(", "))}</div>` : "")
            + (P.sum ? `<div class="ms">Total à atteindre : ${P.sum}${P.must && P.must.length ? " · imposées : " + esc(P.must.join(", ")) : ""}</div>` : "")
            + `<div class="ms">${P.step ? "Clique une carte." : `Choisis ${P.min === P.max ? P.min : P.min + " à " + P.max} carte(s) (${n} choisie(s)).`}</div>`
            + `<div class="grid">${P.cards.map((c, k) => `<button class="pickc${root.ui.picked.includes(k) ? " on" : ""}" data-card="${k}"><div class="card" data-code="${c.code}">${info(root, c.code).img ? `<img src="${info(root, c.code).img}" alt="">` : ""}</div><span>${esc(info(root, c.code).name)}<i>${esc(where(root, c))}</i></span></button>`).join("")}</div>`
            + `<div class="mb">${P.step ? "" : `<button class="main" data-confirm="1" ${ok ? "" : "disabled"}>Valider</button>`}${P.cancel ? `<button data-cancel="1">${esc(P.cancelLabel || "Annuler")}</button>` : ""}</div>`;
    }
    if (P.kind === "announce") {
        const q = root.ui.query.toLowerCase();
        const hits = q.length >= 2 ? P.names.filter(([, n]) => String(n).toLowerCase().includes(q)).slice(0, 30) : [];
        body = `<input class="ann" placeholder="Tape un nom de carte…" value="${esc(root.ui.query)}"><div class="opts">${hits.map(([code, n]) => `<button class="opt" data-ann="${code}"><span>${esc(n)}</span></button>`).join("")}</div>`;
    }
    return `<div class="modal"><div class="box"><div class="mt">${esc(P.title)}</div>${body}</div></div>`;
}
function where(root, c) {
    const mine = c.controller === root.game.me;
    const loc = { 1: "deck", 2: "main", 4: "terrain", 8: "terrain", 16: "cimetière", 32: "bannie", 64: "Extra Deck", 128: "matériel" }[c.location] || "";
    return `${mine ? "à toi" : "adverse"} · ${loc}`;
}

// Carte qui a plusieurs effets (ou un effet et d'autres actions) : chaque choix avec le texte de l'effet.
function effectsHTML(root, acts) {
    const i = info(root, acts[0].code);
    const missing = acts.some((a) => a.effect && !a.effect.text);   // effet non retrouvé : texte complet affiché
    const items = acts.map((a, k) => `<button class="eff" data-act="${k}"><b>${esc(a.effect ? a.effect.name : a.label)}</b>`
        + `${a.effect && a.effect.text ? `<span>${esc(a.effect.text)}</span>` : ""}</button>`).join("");
    return `<div class="modal"><div class="box effbox"><div class="yn">${i.img ? `<img src="${i.img}" alt="">` : ""}<div>`
        + `<div class="mt">${esc(i.name)} : que veux-tu faire ?</div>${missing ? `<div class="ms">${esc(i.text)}</div>` : ""}</div></div>`
        + `<div class="effs">${items}</div><div class="mb"><button data-close="1">Annuler (Échap)</button></div></div></div>`;
}

function viewerHTML(root) {
    const V = root.ui.viewer;
    if (!V) return "";
    const [who, loc] = V.split(":");
    const S = root.state[who];
    const list = ({ 16: S.grave, 32: S.removed, 64: S.extra, 2: S.hand })[+loc] || [];
    const visible = who === "me" || +loc === LOC.GRAVE || +loc === LOC.REMOVED;
    const cards = list.filter(Boolean).filter((c) => visible || (c.position & 5));
    // exemplaires identiques regroupés en une seule carte « ×N » (celle qui peut agir, s'il y en a une)
    const P = root.ui.prompt;
    const can = (c) => P && P.kind === "actions" && P.actions.some((a) => a.key === c.key);
    const groups = new Map();
    for (const c of cards) {
        const g = groups.get(c.code);
        if (!g) groups.set(c.code, { card: c, n: 1 });
        else { g.n += 1; if (!can(g.card) && can(c)) g.card = c; }
    }
    const tiles = [...groups.values()].map(({ card, n }) => `<div class="slot">${cardHTML(root, card)}${n > 1 ? `<span class="cnt">×${n}</span>` : ""}</div>`);
    return `<div class="modal"><div class="box wide"><div class="mt">${who === "me" ? "Ton" : "Son"} ${PILES[loc] || ""} (${list.filter(Boolean).length})</div>`
        + `<div class="grid">${tiles.length ? tiles.join("") : "<i>Cartes cachées.</i>"}</div>`
        + `<div class="mb"><button data-close="1">Fermer</button></div></div></div>`;
}

function render(root) {
    const g = root.game, S = root.state, U = root.ui;
    if (!g || !S) return;
    const P = U.prompt;
    const myTurn = S.turnPlayer === "me";
    const buttons = P && P.kind === "actions" ? P.buttons.map((b, k) => `<button class="${b.main ? "main" : ""}" data-btn="${k}">${esc(b.label)}</button>`).join("") : "";
    const status = S.over ? esc(S.over) : `Tour ${S.turn || 1} · ${myTurn ? "à toi" : esc(root.data.botName)} · ${esc(S.phase || "")}`
        + (P ? (P.kind === "actions" ? (P.chain ? " · tu peux répondre en chaîne : clique une carte dorée" : " · à toi d'agir") : " · choix demandé") : !myTurn ? " · l'adversaire joue…" : "");
    const log = S.log.map((l) => `<div class="it ${l.tone}"><b>${l.who === "me" ? "Toi" : l.who === "bot" ? esc(root.data.botName) : "Duel"}</b> ${esc(l.text)}</div>`).join("");
    let menu = "";
    if (U.menu) {
        const acts = P && P.kind === "actions" ? P.actions.filter((a) => a.key === U.menu.key) : [];
        root.menuActs = acts;
        if (acts.length) menu = U.menu.effects ? effectsHTML(root, acts)
            : `<div class="menu" style="left:${U.menu.x}px;top:${U.menu.y}px">${acts.map((a, k) => `<button data-act="${k}">${esc(a.label)}</button>`).join("")}</div>`;
    }
    const notice = U.notice ? `<div class="notice">${esc(U.notice)}</div>` : "";
    U.notice = null;   // affiché une fois, jusqu'au prochain affichage
    root.innerHTML = `<div class="top"><div class="status">${status}</div><div class="ctrl">${buttons}`
        + `<label class="peek"><input type="checkbox" data-peek="1" ${U.peek ? "checked" : ""}> Voir sa main</label>`
        + `<button data-full="1">${document.fullscreenElement === root || root.classList.contains("full") ? "Quitter le plein écran" : "Plein écran"}</button>`
        + `<button data-again="1">${S.over ? "Rejouer" : "Recommencer"}</button></div></div>`
        + notice + `<div class="layout">${detailHTML(root)}<div class="fieldwrap"><div class="field">${sideHTML(root, "bot")}${emzHTML(root)}${sideHTML(root, "me")}</div>${promptHTML(root)}</div>`
        + `<div class="log">${log}</div></div>${viewerHTML(root)}${menu}`;
    if (P && P.kind === "actions") {
        // effet d'une carte qui n'est pas affichée (matériel Xyz…) : proposé en bouton dans la barre du haut
        const shown = new Set([...root.querySelectorAll(".card[data-key]")].map((el) => el.dataset.key));
        const piles = [...root.querySelectorAll("[data-pile]")].map((el) => el.dataset.pile.split(":")[1]).filter((loc) => +loc !== LOC.DECK);
        root.orphans = P.actions.filter((a) => !shown.has(a.key) && !piles.includes(a.key.split(":")[1]));
        root.querySelector(".ctrl").insertAdjacentHTML("afterbegin",
            root.orphans.map((a, k) => `<button class="main" data-orphan="${k}">${esc(info(root, a.code).name)} : ${esc(a.label)}</button>`).join(""));
    }
    const logEl = root.querySelector(".log");
    logEl.scrollTop = logEl.scrollHeight;
    bind(root);
}

// Duel jouable contre un deck méta : le moteur de règles YGOPro (static/engine/engine.js) arbitre tout ;
// cette page affiche son terrain et te pose ses questions. Seules les actions légales sont proposées.

export default function (component) {
    const { data, parentElement } = component;
    let root = parentElement.querySelector(".dm");
    if (!root) {
        root = document.createElement("div");
        root.className = "dm";
        parentElement.appendChild(root);
        root.addEventListener("click", (e) => {   // clic hors d'un menu : on le ferme
            if (root.ui && root.ui.menu && !e.target.closest(".menu")) { root.ui.menu = null; render(root); }
        });
    }
    root.data = data;
    if (root.dataset.key !== data.key) {
        root.dataset.key = data.key;
        root.seed = data.seed;
        start(root);
    } else if (root.game) {
        render(root);
    }
}

// ------------------------------------------------------------------ chargement du moteur (une fois par page)
const ENGINE_BASE = new URL("app/static/engine/", document.baseURI).href;
function engineModule() {
    if (!window.__ygoEngineModule) window.__ygoEngineModule = import(ENGINE_BASE + "engine.js");
    return window.__ygoEngineModule;
}
function engineData(mod) {
    if (!window.__ygoEngineData) window.__ygoEngineData = mod.loadEngine(ENGINE_BASE);
    return window.__ygoEngineData;
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const LOC = { DECK: 1, HAND: 2, MZONE: 4, SZONE: 8, GRAVE: 16, REMOVED: 32, EXTRA: 64 };
const PILES = { 1: "Deck", 16: "Cimetière", 32: "Bannies", 64: "Extra Deck", 2: "Main" };

async function start(root) {
    const data = root.data;
    if (root.game) root.game.stopped = true;
    root.game = null;
    root.ui = { menu: null, viewer: null, prompt: null, picked: [], detail: null, peek: false, query: "" };
    root.innerHTML = `<div class="loading">Chargement du moteur de règles… (environ 25 Mo la première fois, ensuite en cache)</div>`;
    let mod, engine;
    try {
        mod = await engineModule();
        engine = await engineData(mod);
    } catch (e) {
        root.innerHTML = `<div class="loading err">Impossible de charger le moteur de règles : ${esc(e.message || e)}</div>`;
        return;
    }
    if (root.data !== data) return;   // la page a changé pendant le chargement
    const meFirst = data.first === "coin" ? (root.seed % 2 === 0) : data.first === "me";
    const game = new mod.Game(engine, { me: data.me, bot: data.bot, seed: root.seed * 7919 + 17, meFirst, names: data.names, botName: data.botName });
    root.game = game;
    root.state = null;
    game.say(null, `Pile ou face : ${meFirst ? "tu commences" : data.botName + " commence"}.`, "turn");
    const ui = {
        update: (state) => { if (root.game === game) { root.state = state; render(root); } },
        pause: () => wait(450),
        prompt: (q, state) => new Promise((resolve) => {
            if (root.game !== game) return;
            root.state = state;
            root.ui.prompt = { ...q, resolve: (r) => { root.ui.prompt = null; root.ui.picked = []; root.ui.menu = null; resolve(r); } };
            root.ui.picked = [];
            render(root);
        }),
    };
    root.state = game.field();
    render(root);
    try {
        await game.run(ui);
    } catch (e) {
        game.say(null, "Erreur du moteur : " + (e.message || e), "cut");
        render(root);
    }
}

// ------------------------------------------------------------------ affichage
function info(root, code) {
    const d = root.data;
    const t = root.game && root.game.engine.texts.get(code);
    return { name: d.names[code] || (t && t[1]) || "Carte", img: d.imgs[code] || null, text: d.texts[code] || (t && t[2]) || "" };
}

function cardHTML(root, c, opts = {}) {
    if (!c) return "";
    const P = root.ui.prompt;
    const pos = c.position || 0;
    const down = opts.field && (pos & 10) !== 0;   // face verso (sur le terrain seulement)
    const def = (pos & 12) !== 0;                  // défense
    const hidden = opts.hidden || (down && opts.foe);
    const i = info(root, c.code);
    const can = P && P.kind === "actions" && P.actions.some((a) => a.key === c.key);
    const cls = ["card", hidden || down ? "down" : "", def && opts.loc === LOC.MZONE ? "def" : "", can ? "can" : ""].join(" ");
    const stat = opts.field && opts.loc === LOC.MZONE && !hidden
        ? `<span class="stat">${(c.type & 0x4000000) ? "LINK " + (c.link || "") + " · " + c.attack : def ? "DEF " + c.defense : "ATK " + c.attack}</span>` : "";
    const xyz = c.overlayCards && c.overlayCards.length ? `<span class="ov">${c.overlayCards.length}</span>` : "";
    return `<div class="${cls}" data-key="${hidden ? "" : c.key}" data-code="${hidden ? "" : c.code}" title="${hidden ? "" : esc(i.name)}">`
        + `${!hidden && i.img ? `<img src="${i.img}" alt="">` : ""}${stat}${xyz}</div>`;
}

function zoneHTML(root, who, loc, seq, c, foe) {
    const P = root.ui.prompt;
    const p = who === "me" ? root.game.me : root.game.bot;
    const pickable = P && P.kind === "place" && P.places.some((z) => z.player === p && z.location === loc && z.sequence === seq);
    const picked = root.ui.picked.some((z) => z.player === p && z.location === loc && z.sequence === seq);
    return `<div class="slot${pickable ? " pick" : ""}${picked ? " picked" : ""}" data-zone="${p}:${loc}:${seq}">${cardHTML(root, c, { field: true, foe, loc })}</div>`;
}

function pileHTML(root, who, loc, list, label) {
    const P = root.ui.prompt;
    const p = who === "me" ? root.game.me : root.game.bot;
    const n = typeof list === "number" ? list : list.filter(Boolean).length;
    const top = Array.isArray(list) && (loc === LOC.GRAVE || loc === LOC.REMOVED) ? list.filter(Boolean).slice(-1)[0] : null;
    const back = (loc === LOC.DECK || loc === LOC.EXTRA) && n ? '<div class="card down"></div>' : "";
    const can = P && P.kind === "actions" && P.actions.some((a) => a.key.startsWith(`${p}:${loc}:`));
    return `<div class="slot pile${can ? " can" : ""}" data-pile="${who}:${loc}">${top ? cardHTML(root, top) : back}<span class="num">${n}</span><span class="lbl">${label}</span></div>`;
}

function sideHTML(root, who) {
    const S = root.state[who], foe = who === "bot";
    const order = foe ? [4, 3, 2, 1, 0] : [0, 1, 2, 3, 4];    // terrain adverse vu en miroir (colonnes respectées)
    const mz = order.map((i) => zoneHTML(root, who, LOC.MZONE, i, S.mzone[i], foe)).join("");
    const sz = order.map((i) => zoneHTML(root, who, LOC.SZONE, i, S.szone[i], foe)).join("");
    const rowM = `<div class="row">${zoneHTML(root, who, LOC.SZONE, 5, S.szone[5], foe).replace('class="slot', 'class="slot fieldz')}${mz}${pileHTML(root, who, LOC.GRAVE, S.grave, "Cimetière")}</div>`;
    const rowS = `<div class="row">${pileHTML(root, who, LOC.EXTRA, S.extra, "Extra")}${sz}${pileHTML(root, who, LOC.DECK, S.deck, "Deck")}</div>`;
    const hidden = foe && !root.ui.peek;
    const hand = `<div class="hand">${S.hand.filter(Boolean).map((c) => `<div class="slot">${cardHTML(root, c, { hidden, foe })}</div>`).join("")}</div>`;
    const ban = S.removed.filter(Boolean).length;
    const head = `<div class="who"><span class="name">${esc(foe ? root.data.botName : "Toi")}</span>`
        + `<span class="lp"><span class="bar"><span style="width:${Math.max(0, Math.min(100, 100 * S.lp / 8000)).toFixed(1)}%"></span></span>${Math.max(0, S.lp)} PV</span>`
        + `<span class="sub">${S.hand.filter(Boolean).length} en main</span>`
        + `<button class="chip" data-pile="${who}:${LOC.REMOVED}">Bannies : ${ban}</button></div>`;
    return `<div class="side ${who}">${foe ? head + hand + rowS + rowM : rowM + rowS + hand + head}</div>`;
}

function emzHTML(root) {
    // zones Extra Monstre : la gauche est la 5e de chez toi ou la 6e de l'adversaire (et inversement)
    const me = root.state.me.mzone, bot = root.state.bot.mzone;
    const left = me[5] ? zoneHTML(root, "me", LOC.MZONE, 5, me[5]) : bot[6] ? zoneHTML(root, "bot", LOC.MZONE, 6, bot[6], true) : emptyEmz(root, 5, 6);
    const right = me[6] ? zoneHTML(root, "me", LOC.MZONE, 6, me[6]) : bot[5] ? zoneHTML(root, "bot", LOC.MZONE, 5, bot[5], true) : emptyEmz(root, 6, 5);
    return `<div class="row emz"><div></div><div></div>${left}<div class="mid-cell"></div>${right}<div></div><div></div></div>`;
}
function emptyEmz(root, mySeq, foeSeq) {
    const P = root.ui.prompt;
    const g = root.game;
    if (P && P.kind === "place" && P.places.some((z) => z.player === g.bot && z.location === LOC.MZONE && z.sequence === foeSeq)) return zoneHTML(root, "bot", LOC.MZONE, foeSeq, null, true);
    return zoneHTML(root, "me", LOC.MZONE, mySeq, null);
}

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

function viewerHTML(root) {
    const V = root.ui.viewer;
    if (!V) return "";
    const [who, loc] = V.split(":");
    const S = root.state[who];
    const list = ({ 16: S.grave, 32: S.removed, 64: S.extra, 2: S.hand })[+loc] || [];
    const visible = who === "me" || +loc === LOC.GRAVE || +loc === LOC.REMOVED;
    const cards = list.filter(Boolean).filter((c) => visible || (c.position & 5));
    return `<div class="modal"><div class="box wide"><div class="mt">${who === "me" ? "Ton" : "Son"} ${PILES[loc] || ""} (${list.filter(Boolean).length})</div>`
        + `<div class="grid">${cards.length ? cards.map((c) => `<div class="slot">${cardHTML(root, c)}</div>`).join("") : "<i>Cartes cachées.</i>"}</div>`
        + `<div class="mb"><button data-close="1">Fermer</button></div></div></div>`;
}

function render(root) {
    const g = root.game, S = root.state, U = root.ui;
    if (!g || !S) return;
    const P = U.prompt;
    const myTurn = S.turnPlayer === "me";
    const buttons = P && P.kind === "actions" ? P.buttons.map((b, k) => `<button class="${b.main ? "main" : ""}" data-btn="${k}">${esc(b.label)}</button>`).join("") : "";
    const status = S.over ? esc(S.over) : `Tour ${S.turn || 1} · ${myTurn ? "à toi" : esc(root.data.botName)} · ${esc(S.phase || "")}`
        + (P ? (P.kind === "actions" ? " · à toi d'agir" : " · choix demandé") : !myTurn ? " · l'adversaire joue…" : "");
    const log = S.log.map((l) => `<div class="it ${l.tone}"><b>${l.who === "me" ? "Toi" : l.who === "bot" ? esc(root.data.botName) : "Duel"}</b> ${esc(l.text)}</div>`).join("");
    let menu = "";
    if (U.menu) {
        const acts = P && P.kind === "actions" ? P.actions.filter((a) => a.key === U.menu.key) : [];
        root.menuActs = acts;
        if (acts.length) menu = `<div class="menu" style="left:${U.menu.x}px;top:${U.menu.y}px"><div class="mh">${esc(info(root, acts[0].code).name)}</div>${acts.map((a, k) => `<button data-act="${k}">${esc(a.label)}</button>`).join("")}</div>`;
    }
    root.innerHTML = `<div class="top"><div class="status">${status}</div><div class="ctrl">${buttons}`
        + `<label class="peek"><input type="checkbox" data-peek="1" ${U.peek ? "checked" : ""}> Voir sa main</label>`
        + `<button data-again="1">${S.over ? "Rejouer" : "Recommencer"}</button></div></div>`
        + `<div class="layout">${detailHTML(root)}<div class="fieldwrap"><div class="field">${sideHTML(root, "bot")}${emzHTML(root)}${sideHTML(root, "me")}</div>${promptHTML(root)}</div>`
        + `<div class="log">${log}</div></div>${viewerHTML(root)}${menu}`;
    const logEl = root.querySelector(".log");
    logEl.scrollTop = logEl.scrollHeight;
    bind(root);
}

// ------------------------------------------------------------------ interactions
function bind(root) {
    const U = root.ui, P = U.prompt;
    const box = root.getBoundingClientRect();
    const answer = (r) => P && P.resolve(r);
    root.querySelectorAll(".card[data-code]").forEach((el) => {
        const code = +el.dataset.code;
        if (!code) return;
        el.addEventListener("mouseenter", () => {
            if (U.detail === code) return;
            U.detail = code;
            const d = root.querySelector(".detail");
            if (d) d.outerHTML = detailHTML(root);
        });
    });
    root.querySelectorAll(".card.can[data-key]").forEach((el) => el.addEventListener("click", (e) => {
        e.stopPropagation();
        const r = el.getBoundingClientRect();
        U.menu = { key: el.dataset.key, x: Math.max(0, Math.min(r.left - box.left, box.width - 260)), y: r.bottom - box.top + 4 };
        U.detail = +el.dataset.code || U.detail;
        render(root);
    }));
    root.querySelectorAll("[data-pile]").forEach((el) => el.addEventListener("click", (e) => {
        e.stopPropagation();
        const [who, loc] = el.dataset.pile.split(":");
        if (+loc === LOC.DECK) return;
        U.viewer = `${who}:${loc}`; render(root);
    }));
    root.querySelectorAll("[data-act]").forEach((el) => el.addEventListener("click", (e) => {
        e.stopPropagation();
        const a = root.menuActs[+el.dataset.act];
        U.menu = null; U.viewer = null;
        answer(a.response);
    }));
    root.querySelectorAll("[data-btn]").forEach((el) => el.addEventListener("click", (e) => {
        e.stopPropagation();
        answer(P.buttons[+el.dataset.btn].response);
    }));
    root.querySelectorAll("[data-opt]").forEach((el) => el.addEventListener("click", () => answer(P.options[+el.dataset.opt].response)));
    root.querySelectorAll("[data-cancel]").forEach((el) => el.addEventListener("click", () => answer(P.cancel.response || P.cancel)));
    root.querySelectorAll("[data-yes]").forEach((el) => el.addEventListener("click", () => answer(el.dataset.yes === "1" ? P.yes : P.no)));
    root.querySelectorAll("[data-card]").forEach((el) => el.addEventListener("click", () => {
        const k = +el.dataset.card;
        if (P.step) return answer(P.build([k]));
        U.picked = U.picked.includes(k) ? U.picked.filter((x) => x !== k) : U.picked.length < P.max ? [...U.picked, k] : U.picked;
        render(root);
    }));
    root.querySelectorAll("[data-confirm]").forEach((el) => el.addEventListener("click", () => answer(P.build(U.picked))));
    root.querySelectorAll(".slot.pick").forEach((el) => el.addEventListener("click", (e) => {
        e.stopPropagation();
        const [player, location, sequence] = el.dataset.zone.split(":").map(Number);
        if (U.picked.some((z) => z.player === player && z.location === location && z.sequence === sequence)) return;
        U.picked = [...U.picked, { player, location, sequence }];
        if (U.picked.length >= P.count) return answer(P.build(U.picked));
        render(root);
    }));
    const ann = root.querySelector(".ann");
    if (ann) {
        ann.focus();
        ann.setSelectionRange(ann.value.length, ann.value.length);
        ann.addEventListener("input", () => { U.query = ann.value; render(root); });
    }
    root.querySelectorAll("[data-ann]").forEach((el) => el.addEventListener("click", () => { U.query = ""; answer(P.build(+el.dataset.ann)); }));
    root.querySelectorAll("[data-close]").forEach((el) => el.addEventListener("click", () => { U.viewer = null; render(root); }));
    root.querySelectorAll("[data-peek]").forEach((el) => el.addEventListener("change", () => { U.peek = el.checked; render(root); }));
    root.querySelectorAll("[data-again]").forEach((el) => el.addEventListener("click", () => { root.seed += 1; start(root); }));
}

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

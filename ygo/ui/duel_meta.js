// Duel jouable contre un deck méta : moteur, bot et plateau, entièrement dans le navigateur.
// Données reçues de Python (ygo/playtest.py) : les deux decks, carte par carte, avec le rôle de chaque carte.
// Tu joues à la main (rien n'est automatisé de ton côté, sauf les combats et les points de vie) ;
// le bot joue sa liste selon le rôle de ses cartes et réagit à tes activations, invocations et attaques.

export default function (component) {
    const { data, parentElement } = component;
    let root = parentElement.querySelector(".dm");
    if (!root) {
        root = document.createElement("div");
        root.className = "dm";
        parentElement.appendChild(root);
        document.addEventListener("click", (e) => {     // clic hors du menu : on le ferme
            if (root.ui && root.ui.menu && !e.composedPath().some((el) => el.classList && el.classList.contains("menu"))) {
                root.ui.menu = null;
                root.render();
            }
        });
    }
    root.dataInit = data;
    if (root.dataset.key !== data.key) {
        root.dataset.key = data.key;
        root.seed = data.seed;
        start(root, data);
    } else {
        root.render();
    }
}

// ------------------------------------------------------------------ outils
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
function rng(seed) {   // mulberry32 : même graine, même mélange
    let a = seed >>> 0;
    return () => {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
const SPEED = 750;
const ZONE_NAMES = { hand: "main", deck: "deck", extra: "Extra Deck", gy: "cimetière", ban: "bannies", mz: "terrain", sz: "terrain" };
const STAYS = ["Continuous", "Field", "Equip"];   // Magies/Pièges qui restent sur le terrain après activation

function start(root, data) {
    const rand = rng(root.seed);
    let uid = 0;
    const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
    const make = (side, who) => ({
        who, name: side.name, plan: side.plan, life: side.life,
        deck: shuffle(side.main.map((c) => ({ ...c, uid: uid++, owner: who }))),
        extra: side.extra.map((c) => ({ ...c, uid: uid++, owner: who })),
        hand: [], mz: [null, null, null, null, null], sz: [null, null, null, null, null], gy: [], ban: [],
    });
    const first = data.first === "coin" ? (rand() < 0.5 ? "me" : "bot") : data.first;
    const G = root.game = {
        p: { me: make(data.me, "me"), bot: make(data.bot, "bot") },
        turn: 0, active: null, phase: "", first, over: null, log: [], hot: new Set(),
        summons: 0, normal: false, attacked: new Set(), drawOn: 0, busy: false, rand, shuffle,
    };
    root.ui = { menu: null, viewer: null, modal: null, detail: null, peek: false };
    root.render = () => render(root);
    for (const w of ["me", "bot"]) draw(G, w, 5, false);
    say(G, null, `Pile ou face : ${first === "me" ? "tu commences" : G.p.bot.name + " commence"}. Chacun pioche 5 cartes.`);
    root.render();
    nextTurn(root, first);
}

// ------------------------------------------------------------------ état
function say(G, who, text, tone = "", hot = []) {
    G.log.push({ who, text, tone, turn: G.turn });
    G.hot = new Set(hot.map((c) => c.uid));
}
function find(G, uid) {
    for (const w of ["me", "bot"]) {
        const P = G.p[w];
        for (const z of ["hand", "deck", "extra", "gy", "ban"]) {
            const i = P[z].findIndex((c) => c && c.uid === uid);
            if (i >= 0) return { c: P[z][i], w, z, i };
        }
        for (const z of ["mz", "sz"]) {
            const i = P[z].findIndex((c) => c && c.uid === uid);
            if (i >= 0) return { c: P[z][i], w, z, i };
        }
    }
    return null;
}
function lift(G, c) {   // retire la carte de l'endroit où elle est
    const at = find(G, c.uid);
    if (!at) return c;
    const P = G.p[at.w];
    if (at.z === "mz" || at.z === "sz") P[at.z][at.i] = null; else P[at.z].splice(at.i, 1);
    return c;
}
const reset = (c) => { c.down = false; c.off = false; c.pos = "atk"; c.used = false; return c; };
function toZone(G, c, who, z) {
    lift(G, c);
    reset(c);
    const P = G.p[c.owner];
    if (z === "deck") { P.deck.push(c); G.shuffle(P.deck); }
    else if (z === "hand" && c.extra) P.extra.push(c);    // un monstre de l'Extra Deck y retourne
    else P[z].push(c);
}
function place(G, c, who, z, opts = {}) {
    const P = G.p[who];
    const i = P[z].findIndex((x) => x === null);
    if (i < 0) return false;
    lift(G, c);
    c.down = !!opts.down; c.pos = c.link ? "atk" : (opts.pos || "atk"); c.off = false; c.used = false;
    P[z][i] = c;
    return true;
}
function draw(G, who, n = 1, log = true) {
    const P = G.p[who];
    const got = [];
    for (let k = 0; k < n; k++) {
        if (!P.deck.length) { lose(G, who, "ne peut plus piocher : deck vide"); return got; }
        const c = P.deck.shift();
        P.hand.push(c);
        got.push(c);
    }
    if (log) say(G, who, who === "me" ? `Tu pioches « ${got.map((c) => c.name).join(" », « ")} ».` : `${P.name} pioche ${n} carte(s).`, "", who === "me" ? got : []);
    return got;
}
function lose(G, who, why) {
    if (G.over) return;
    G.over = who === "me" ? `Défaite : tu ${why.replace("ne peut", "ne peux")}.` : `Victoire : ${G.p.bot.name} ${why}.`;
    say(G, null, G.over, who === "me" ? "cut" : "good");
}
function damage(G, who, n) {
    if (n <= 0) return;
    const P = G.p[who];
    P.life = Math.max(0, P.life - n);
    say(G, who, `${who === "me" ? "Tu perds" : P.name + " perd"} ${n} points de vie (${P.life}).`, "cut");
    if (!P.life) lose(G, who, "tombe à 0 point de vie".replace("tombe", who === "me" ? "tombes" : "tombe"));
}
const monsters = (G, who) => G.p[who].mz.filter(Boolean);
const foe = (w) => (w === "me" ? "bot" : "me");
const nm = (c) => `« ${c.name} »`;

// ------------------------------------------------------------------ déroulé des tours
async function nextTurn(root, who) {
    const G = root.game;
    if (G.over) return root.render();
    G.turn += 1;
    G.active = who;
    G.summons = 0; G.normal = false; G.attacked = new Set(); G.drawOn = 0;
    for (const w of ["me", "bot"]) for (const c of G.p[w].mz.concat(G.p[w].sz)) if (c) { c.off = false; c.used = false; }
    G.phase = "Draw Phase";
    say(G, null, `Tour ${G.turn} : ${who === "me" ? "à toi de jouer" : "tour de " + G.p.bot.name}.`, "turn");
    if (G.turn > 1) draw(G, who);
    G.phase = "Main Phase 1";
    root.render();
    if (who === "bot" && !G.over) await botTurn(root);
}

async function endTurn(root) {
    const G = root.game;
    if (G.busy || G.over) return;
    G.phase = "End Phase";
    const P = G.p[G.active];
    if (G.active === "me" && P.hand.length > 6) say(G, "me", `Tu as ${P.hand.length} cartes en main : défausse-en jusqu'à 6 (règle de fin de tour).`, "warn");
    root.ui.menu = null;
    await nextTurn(root, foe(G.active));
}

// ------------------------------------------------------------------ tes actions
// Réaction du bot à l'activation d'une de tes cartes : il annule tes starters et cartes du moteur.
async function myActivation(root, c, from) {
    const G = root.game;
    say(G, "me", `Tu actives ${nm(c)}${from ? " (" + from + ")" : ""}.`, "", [c]);
    root.render();
    if (c.starter || c.engine) {
        const bot = G.p.bot;
        const hand = bot.hand.find((x) => x.role === "negate");
        const set = !hand && bot.sz.find((x) => x && x.down && (x.role === "protect" || x.role === "negate"));
        const answer = hand || set;
        if (answer) {
            await wait(SPEED / 2);
            if (hand) toZone(G, hand, "bot", "gy"); else { answer.down = false; }
            say(G, "bot", `${bot.name} répond avec ${nm(answer)}${hand ? " depuis sa main" : ", posée face cachée"} : l'effet de ${nm(c)} est annulé.`, "cut", [answer, c]);
            root.render();
            const back = await respond(root, `${bot.name} annule l'effet de ${nm(c)} avec ${nm(answer)}.`, answer);
            if (set) toZone(G, answer, "bot", "gy");
            if (back) say(G, "me", `L'annulation est contrée : ${nm(c)} résout son effet.`, "good", [c]);
            else c.off = true;
        }
    }
    if (c.kind === "spell" && !STAYS.includes(c.race) || c.kind === "trap" && !STAYS.includes(c.race)) {
        const at = find(G, c.uid);
        if (at && at.z === "sz") { await wait(SPEED / 2); toZone(G, c, "me", "gy"); }
    }
    root.render();
}

// Tes invocations : Mulcharmy / Maxx « C » font piocher le bot, Nibiru tribute tout le terrain à la 5e.
async function mySummon(root, c, special) {
    const G = root.game;
    const bot = G.p.bot;
    G.summons += 1;
    if (special) {
        const drawer = !G.drawOn && bot.hand.find((x) => x.role === "draw");
        if (drawer) {
            toZone(G, drawer, "bot", "gy");
            say(G, "bot", `${bot.name} défausse ${nm(drawer)} : il piochera une carte à chacune de tes Invocations Spéciales ce tour.`, "cut", [drawer]);
            root.render();
            if (await respond(root, `${bot.name} active ${nm(drawer)}.`, drawer)) say(G, "me", `${nm(drawer)} est annulée.`, "good");
            else G.drawOn = 5;
        } else if (G.drawOn > 0) {
            G.drawOn -= 1;
            draw(G, "bot", 1, false);
            say(G, "bot", `${bot.name} pioche 1 carte grâce à ton Invocation Spéciale.`, "cut");
        }
    }
    const nibiru = G.summons >= 5 && bot.hand.find((x) => x.role === "nibiru");
    if (nibiru) {
        await wait(SPEED / 2);
        say(G, "bot", `${bot.name} active ${nm(nibiru)} depuis sa main après ta 5e invocation.`, "cut", [nibiru]);
        root.render();
        if (await respond(root, `${bot.name} active ${nm(nibiru)} : tous les monstres face recto vont être envoyés au cimetière.`, nibiru)) {
            toZone(G, nibiru, "bot", "gy");
            say(G, "me", `${nm(nibiru)} est annulée.`, "good");
        } else {
            let atk = 0, def = 0;
            for (const w of ["me", "bot"]) for (const m of monsters(G, w)) if (!m.down) { atk += m.atk || 0; def += m.def || 0; toZone(G, m, w, "gy"); }
            place(G, nibiru, "bot", "mz");
            const token = { uid: 100000 + G.turn * 10 + G.summons, id: 0, name: "Jeton Primitif", kind: "monster", frame: "token", atk, def, level: 11, text: "Jeton donné par Nibiru, l'Être Primitif.", owner: "me", token: true };
            place(G, token, "me", "mz", { pos: "def" });
            say(G, "bot", `Tous les monstres face recto sont envoyés au cimetière ; tu reçois un Jeton Primitif (ATK ${atk} / DEF ${def}).`, "cut", [nibiru, token]);
        }
    }
    root.render();
}

// Fenêtre de réponse : tu peux répondre à une action du bot avec une carte (interruption, Piège posé, effet rapide).
function responders(G) {
    const P = G.p.me;
    return [
        // depuis la main : interruptions et Magies Jeu-Rapide (un Piège doit d'abord être posé)
        ...P.hand.filter((c) => c.quick && (c.kind !== "trap" || c.role === "negate")).map((c) => ({ c, from: "main" })),
        ...P.sz.filter((c) => c && (c.down || c.quick)).map((c) => ({ c, from: c.down ? "posée" : "terrain" })),
        ...P.mz.filter((c) => c && !c.down && c.quick && !c.used).map((c) => ({ c, from: "terrain" })),
    ];
}
async function respond(root, text, against) {
    const G = root.game;
    const options = responders(G);
    if (!options.length || G.over) return null;
    const pick = await new Promise((resolve) => {
        root.ui.modal = { text, against, options, resolve };
        root.render();
    });
    root.ui.modal = null;
    if (!pick) { root.render(); return null; }
    const { c, from } = pick;
    if (from === "main") toZone(G, c, "me", "gy");
    else if (c.kind === "monster") c.used = true;
    else { c.down = false; if (!STAYS.includes(c.race)) toZone(G, c, "me", "gy"); }
    say(G, "me", `Tu réponds avec ${nm(c)} (${from}).`, "good", [c]);
    root.render();
    await wait(SPEED / 2);
    return c;
}

function battle(G, att, target, announced = false) {
    const a = att.owner, d = foe(a);
    G.attacked.add(att.uid);
    if (!target) {
        if (!announced) say(G, a, `${nm(att)} attaque directement.`, "", [att]);
        damage(G, d, att.atk || 0);
        return;
    }
    if (target.down) { target.down = false; say(G, d, `${nm(target)} est retourné face recto (ATK ${target.atk} / DEF ${target.def}).`, "", [target]); }
    if (!announced) say(G, a, `${nm(att)} (ATK ${att.atk}) attaque ${nm(target)} (${target.pos === "atk" ? "ATK " + target.atk : "DEF " + target.def}).`, "", [att, target]);
    if (target.pos === "atk") {
        const diff = (att.atk || 0) - (target.atk || 0);
        if (diff > 0) { toZone(G, target, d, "gy"); say(G, d, `${nm(target)} est détruit.`, "cut"); damage(G, d, diff); }
        else if (diff < 0) { toZone(G, att, a, "gy"); say(G, a, `${nm(att)} est détruit.`, "cut"); damage(G, a, -diff); }
        else if (att.atk) { toZone(G, att, a, "gy"); toZone(G, target, d, "gy"); say(G, null, "Égalité d'ATK : les deux monstres sont détruits.", "cut"); }
    } else {
        const diff = (att.atk || 0) - (target.def || 0);
        if (diff > 0) { toZone(G, target, d, "gy"); say(G, d, `${nm(target)} est détruit.`, "cut"); }
        else if (diff < 0) damage(G, a, -diff);
    }
}

async function myAttack(root, att) {
    const G = root.game;
    const bot = G.p.bot;
    const targets = monsters(G, "bot");
    const pick = await new Promise((resolve) => {
        root.ui.modal = {
            text: `Cible de l'attaque de ${nm(att)} (ATK ${att.atk}) :`, choose: true, resolve,
            options: targets.length ? targets.map((c) => ({ c, from: c.down ? "face cachée" : c.pos === "atk" ? "ATK " + c.atk : "DEF " + c.def }))
                : [{ c: null, from: "attaque directe" }],
        };
        root.render();
    });
    root.ui.modal = null;
    if (pick === undefined || pick === null && targets.length) return root.render();
    const target = pick ? pick.c : null;
    // le bot ne gaspille pas un Piège : il bloque une attaque directe, ou une attaque qui détruirait son monstre
    const hurts = !target || (target.pos === "atk" ? (att.atk || 0) >= (target.atk || 0) : (att.atk || 0) > (target.def || 0));
    const set = bot.sz.find((x) => x && x.down && (x.role === "protect" || x.role === "negate"));
    if (set && hurts) {
        set.down = false;
        say(G, "bot", `${bot.name} active ${nm(set)} : l'attaque de ${nm(att)} est annulée.`, "cut", [set, att]);
        root.render();
        const back = await respond(root, `${bot.name} annule ton attaque avec ${nm(set)}.`, set);
        toZone(G, set, "bot", "gy");
        if (!back) { G.attacked.add(att.uid); return root.render(); }
    }
    battle(G, att, target);
    root.render();
}

// ------------------------------------------------------------------ le bot
async function botTurn(root) {
    const G = root.game;
    const bot = G.p.bot;
    G.busy = true;
    const step = async () => { root.render(); await wait(SPEED); return !G.over; };
    await step();
    // 1. destruction de ton terrain
    for (const c of [...bot.hand].filter((x) => ["spell_wipe", "monster_wipe", "kaiju", "destroy"].includes(x.role))) {
        const mySz = G.p.me.sz.filter(Boolean), myMz = monsters(G, "me");
        const useful = c.role === "spell_wipe" ? mySz.length : myMz.length;
        if (!useful) continue;
        lift(G, c);
        say(G, "bot", `${bot.name} active ${nm(c)}.`, "", [c]);
        if (!(await step())) break;
        const no = await respond(root, `${bot.name} active ${nm(c)}.`, c);
        if (no) { say(G, "bot", `${nm(c)} est annulée.`, "good"); toZone(G, c, "bot", "gy"); continue; }
        if (c.role === "spell_wipe") {
            for (const x of mySz) toZone(G, x, "me", "gy");
            say(G, "bot", `Tes ${mySz.length} Magie(s)/Piège(s) sont détruites.`, "cut", [c]);
            toZone(G, c, "bot", "gy");
        } else if (c.role === "monster_wipe") {
            for (const x of myMz) toZone(G, x, "me", "gy");
            say(G, "bot", `Tes ${myMz.length} monstre(s) sont détruits.`, "cut", [c]);
            toZone(G, c, "bot", "gy");
        } else if (c.role === "kaiju") {
            const best = myMz.sort((x, y) => (y.atk || 0) - (x.atk || 0))[0];
            toZone(G, best, "me", "gy");
            c.owner = "me";
            place(G, c, "me", "mz");
            say(G, "bot", `${nm(best)} est envoyé au cimetière et ${nm(c)} arrive sur ton terrain.`, "cut", [c, best]);
        } else {
            const best = myMz.sort((x, y) => (y.atk || 0) - (x.atk || 0))[0];
            toZone(G, best, "me", "gy");
            say(G, "bot", `${nm(best)} est détruit.`, "cut", [best]);
            toZone(G, c, "bot", "gy");
        }
        if (!(await step())) break;
    }
    // 2. moteur : les starters un par un jusqu'à ce que l'un passe
    let launched = false;
    for (const s of bot.hand.filter((x) => x.starter)) {
        if (G.over) break;
        const ok = s.kind === "monster" ? place(G, s, "bot", "mz") : place(G, s, "bot", "sz");
        if (!ok) continue;
        say(G, "bot", `${bot.name} joue ${nm(s)} (starter de son moteur ${bot.plan}).`, "", [s]);
        if (!(await step())) break;
        const no = await respond(root, `${bot.name} active ${nm(s)}, un starter de son moteur.`, s);
        if (no) {
            s.off = true;
            say(G, "bot", `La ligne de ${nm(s)} est coupée.`, "good", [s]);
            if (s.kind !== "monster") toZone(G, s, "bot", "gy");
            if (!(await step())) break;
            continue;
        }
        const pulled = bot.deck.filter((x) => x.engine && x.kind === "monster" && !x.extra).slice(0, 2);
        for (const x of pulled) place(G, x, "bot", "mz");
        if (s.kind !== "monster") toZone(G, s, "bot", "gy");
        bot.deck = G.shuffle(bot.deck);
        launched = true;
        if (pulled.length) {
            say(G, "bot", `${nm(s)} résout son effet : ${pulled.map(nm).join(" et ")} ${pulled.length > 1 ? "arrivent" : "arrive"} depuis le deck.`, "", pulled);
            if (!(await step())) break;
            break;
        }
        // moteur sans monstres dans le Main Deck (Magies qui invoquent depuis l'Extra) : le combo amène ses boss
        const bosses = [...bot.extra].sort((x, y) => (y.engine - x.engine) || ((y.atk || 0) - (x.atk || 0))).slice(0, 2);
        for (const x of bosses) place(G, x, "bot", "mz");
        say(G, "bot", `${nm(s)} résout son effet : son combo amène ${bosses.length ? bosses.map(nm).join(" et ") + " depuis l'Extra Deck" : "aucun monstre"}.`, "", bosses);
        if (!(await step())) break;
        break;
    }
    // 3. sans moteur : Invocation Normale du monstre le plus fort
    if (!launched && !G.over) {
        const m = bot.hand.filter((x) => x.kind === "monster" && !x.extra && (x.level || 0) <= 4 && x.role !== "negate" && x.role !== "draw" && x.role !== "nibiru")
            .sort((x, y) => (y.atk || 0) - (x.atk || 0))[0];
        if (m && place(G, m, "bot", "mz")) {
            say(G, "bot", `${bot.name} invoque normalement ${nm(m)} (ATK ${m.atk}).`, "", [m]);
            await step();
        }
    }
    // 4. Extra Deck : jusqu'à deux invocations, avec deux matériels chacune
    for (let k = 0; k < 2 && !G.over; k++) {
        const field = monsters(G, "bot").filter((x) => !x.extra);   // les boss déjà sortis restent sur le terrain
        if (field.length < 2 || !bot.extra.length) break;
        const boss = [...bot.extra].sort((x, y) => (y.engine - x.engine) || ((y.atk || 0) - (x.atk || 0)))[0];
        const mats = field.sort((x, y) => (x.atk || 0) - (y.atk || 0)).slice(0, 2);
        for (const x of mats) toZone(G, x, "bot", "gy");
        place(G, boss, "bot", "mz");
        say(G, "bot", `${bot.name} invoque ${nm(boss)} (ATK ${boss.atk}) depuis l'Extra Deck, avec ${mats.map(nm).join(" et ")}.`, "", [boss]);
        if (!(await step())) break;
        if (await respond(root, `${bot.name} invoque ${nm(boss)} depuis l'Extra Deck.`, boss)) {
            boss.off = true;
            say(G, "bot", `L'effet de ${nm(boss)} est annulé.`, "good", [boss]);
            await step();
        }
    }
    // 5. Pièges posés
    const traps = bot.hand.filter((x) => x.kind === "trap" || x.kind === "spell" && x.role === "protect");
    let n = 0;
    for (const t of traps) if (place(G, t, "bot", "sz", { down: true })) n += 1;
    if (n) { say(G, "bot", `${bot.name} pose ${n} carte(s) face cachée.`); await step(); }
    // 6. combat
    if (G.turn > 1 && !G.over) {
        G.phase = "Battle Phase";
        await step();
        const attackers = monsters(G, "bot").filter((x) => x.pos === "atk" && !x.down).sort((x, y) => (y.atk || 0) - (x.atk || 0));
        for (const att of attackers) {
            if (G.over || !find(G, att.uid) || find(G, att.uid).z !== "mz") continue;
            const mine = monsters(G, "me");
            let target = null;
            if (mine.length) {
                const beatable = mine.filter((m) => m.down ? (att.atk || 0) >= 1500 : m.pos === "atk" ? (att.atk || 0) > (m.atk || 0) : (att.atk || 0) > (m.def || 0))
                    .sort((x, y) => (y.atk || 0) - (x.atk || 0));
                if (!beatable.length) continue;
                target = beatable[0];
            }
            say(G, "bot", `${nm(att)} (ATK ${att.atk}) attaque ${target ? nm(target) : "directement"}.`, "", target ? [att, target] : [att]);
            if (!(await step())) break;
            if (await respond(root, `${nm(att)} attaque ${target ? nm(target) : "directement"}.`, att)) {
                say(G, "me", `L'attaque de ${nm(att)} est arrêtée.`, "good");
                continue;
            }
            battle(G, att, target, true);
            if (!(await step())) break;
        }
    }
    // 7. fin du tour : limite de 6 cartes en main
    while (bot.hand.length > 6) toZone(G, bot.hand.sort((x, y) => (x.atk || 0) - (y.atk || 0))[0], "bot", "gy");
    G.busy = false;
    if (G.over) return root.render();
    G.phase = "End Phase";
    await step();
    await nextTurn(root, "me");
}

// ------------------------------------------------------------------ menus d'actions
function actions(root, c, z) {
    const G = root.game;
    const me = c.owner === "me";
    const battle = G.phase === "Battle Phase" && G.active === "me";
    const free = (zone) => G.p.me[zone].some((x) => x === null);
    const A = [];
    const add = (label, fn, ok = true) => ok && A.push({ label, fn });
    const summon = (pos, special, down = false) => async () => {
        if (!place(G, c, "me", "mz", { pos, down })) return;
        say(G, "me", `${down ? "Tu poses" : special ? "Tu invoques spécialement" : "Tu invoques normalement"} ${down ? "un monstre" : nm(c)}${down ? "" : pos === "def" ? " en Défense" : ""}.`, "", [c]);
        if (!special) G.normal = true;
        root.render();
        if (!down) await mySummon(root, c, special);
    };
    const move = (zone, verb) => () => { toZone(G, c, c.owner, zone); say(G, "me", `${nm(c)} ${verb}.`, "", [c]); root.render(); };
    if (!me) {
        if (z === "mz" || z === "sz") {
            add("Détruire (par ton effet)", move("gy", "est détruit"));
            add("Bannir", move("ban", "est banni"));
            add("Renvoyer dans sa main", move("hand", "retourne dans la main adverse"));
            add("Retourner face recto", () => { c.down = false; say(G, "me", `${nm(c)} est retourné face recto.`, "", [c]); root.render(); }, c.down);
            add("Changer de position", () => { c.pos = c.pos === "atk" ? "def" : "atk"; root.render(); }, z === "mz" && !c.link);
        }
        return A;
    }
    if (z === "hand") {
        if (c.kind === "monster" && !c.extra) {
            add("Invocation Normale", summon("atk", false), free("mz") && !G.normal && G.active === "me" && (c.level || 0) <= 4);
            add("Invocation Normale avec Tribut", summon("atk", false), free("mz") && !G.normal && G.active === "me" && (c.level || 0) > 4);
            add("Poser face cachée", summon("def", false, true), free("mz") && !G.normal && G.active === "me");
            add("Invocation Spéciale en Attaque", summon("atk", true), free("mz"));
            add("Invocation Spéciale en Défense", summon("def", true), free("mz"));
            add("Activer l'effet depuis la main", () => myActivation(root, c, "depuis la main"));
        } else {
            add(c.kind === "spell" ? "Activer" : "Activer depuis la main", async () => { place(G, c, "me", "sz"); root.render(); await myActivation(root, c); }, free("sz"));
            add("Poser face cachée", () => { place(G, c, "me", "sz", { down: true }); say(G, "me", "Tu poses une carte face cachée.", "", [c]); root.render(); }, free("sz"));
        }
        add("Défausser", move("gy", "est défaussée"));
        add("Bannir", move("ban", "est bannie"));
        add("Remettre dans le deck", move("deck", "retourne dans le deck"));
    } else if (z === "mz") {
        add("Attaquer", () => myAttack(root, c), battle && G.turn > 1 && c.pos === "atk" && !c.down && !G.attacked.has(c.uid));
        add("Activer l'effet", () => myActivation(root, c, "sur le terrain"), !c.down);
        add("Retourner face recto", async () => { c.down = false; c.pos = "atk"; say(G, "me", `Tu retournes ${nm(c)}.`, "", [c]); root.render(); await mySummon(root, c, false); }, c.down);
        add(c.pos === "atk" ? "Passer en Défense" : "Passer en Attaque", () => { c.pos = c.pos === "atk" ? "def" : "atk"; root.render(); }, !c.link && !c.down);
        add("Utiliser comme matériel / envoyer au cimetière", move("gy", "est envoyé au cimetière"));
        add("Bannir", move("ban", "est banni"));
        add(c.extra ? "Renvoyer dans l'Extra Deck" : "Renvoyer en main", move("hand", c.extra ? "retourne dans l'Extra Deck" : "retourne dans ta main"), !c.token);
    } else if (z === "sz") {
        add("Activer", async () => { c.down = false; root.render(); await myActivation(root, c); }, c.down);
        add("Activer l'effet", () => myActivation(root, c, "sur le terrain"), !c.down);
        add("Envoyer au cimetière", move("gy", "est envoyée au cimetière"));
        add("Renvoyer en main", move("hand", "retourne dans ta main"));
        add("Bannir", move("ban", "est bannie"));
    } else if (["deck", "extra", "gy", "ban"].includes(z)) {
        if (c.kind === "monster") {
            add("Invocation Spéciale en Attaque", summon("atk", true), free("mz"));
            add("Invocation Spéciale en Défense", summon("def", true), free("mz") && !c.link);
        }
        add("Ajouter à la main", move("hand", z === "deck" ? "est ajoutée à ta main depuis le deck" : "retourne dans ta main"), !c.extra);
        add("Activer l'effet", () => myActivation(root, c, "depuis le " + ZONE_NAMES[z]), z === "gy" || z === "ban");
        add("Envoyer au cimetière", move("gy", "est envoyée au cimetière"), z !== "gy");
        add("Bannir", move("ban", "est bannie"), z !== "ban");
        add("Remettre dans le deck", move("deck", "retourne dans le deck"), z !== "deck" && !c.extra);
    }
    return A;
}

// ------------------------------------------------------------------ affichage
function cardHTML(G, c, opts = {}) {
    if (!c) return "";
    const hidden = opts.hidden || (c.down && c.owner === "bot");
    const cls = ["card", c.down || hidden ? "down" : "", c.off ? "off" : "", c.pos === "def" && opts.field ? "def" : "", G.hot.has(c.uid) ? "hot" : "", c.used ? "used" : ""].join(" ");
    const img = !hidden && c.img ? `<img src="${c.img}" alt="">` : "";
    const stat = opts.field && c.kind === "monster" && !hidden ? `<span class="stat">${c.link ? "L" + c.linkval + " · " + c.atk : c.pos === "def" ? "DEF " + c.def : "ATK " + c.atk}</span>` : "";
    return `<div class="${cls}" data-uid="${hidden ? "" : c.uid}" title="${hidden ? "" : esc(c.name)}">${img}${stat}</div>`;
}
function pile(G, who, z, label) {
    const P = G.p[who];
    const list = P[z];
    const top = z === "gy" || z === "ban" ? list[list.length - 1] : null;
    const back = (z === "deck" || z === "extra") && list.length ? '<div class="card down"></div>' : "";
    return `<div class="slot pile" data-pile="${who}:${z}">${top ? cardHTML(G, top) : back}<span class="num">${list.length}</span><span class="lbl">${label}</span></div>`;
}
function sideHTML(root, who) {
    const G = root.game, P = G.p[who];
    const slots = (z) => P[z].map((c) => `<div class="slot">${cardHTML(G, c, { field: z === "mz" })}</div>`).join("");
    const st = `<div class="row">${pile(G, who, "extra", "Extra")}${slots("sz")}${pile(G, who, "deck", "Deck")}</div>`;
    const mo = `<div class="row">${pile(G, who, "gy", "Cimet.")}${slots("mz")}${pile(G, who, "ban", "Bannies")}</div>`;
    const hidden = who === "bot" && !root.ui.peek;
    const hand = `<div class="hand">${P.hand.map((c) => `<div class="slot">${cardHTML(G, c, { hidden })}</div>`).join("")}</div>`;
    const life = `<div class="who"><span class="name">${esc(who === "me" ? "Toi" : P.name)}</span>`
        + `<span class="lp"><span class="bar"><span style="width:${(100 * P.life / 8000).toFixed(1)}%"></span></span>${P.life} PV</span>`
        + `<span class="sub">${who === "bot" ? esc(P.plan) + " · " : ""}${P.hand.length} en main</span></div>`;
    return `<div class="side ${who}">${who === "bot" ? life + hand + st + mo : mo + st + hand + life}</div>`;
}
function detailHTML(root) {
    const G = root.game;
    const at = root.ui.detail != null && find(G, root.ui.detail);
    if (!at) return `<div class="detail empty">Survole ou touche une carte pour la lire ici.</div>`;
    const c = at.c;
    const stats = c.kind === "monster" ? `<div class="stats">${c.link ? "Link-" + c.linkval : "Niveau " + (c.level ?? "?")} · ATK ${c.atk ?? "?"}${c.link ? "" : " / DEF " + (c.def ?? "?")}</div>` : "";
    return `<div class="detail">${c.img ? `<img src="${c.img}" alt="">` : ""}<div class="dn">${esc(c.name)}</div>`
        + `<div class="dt">${esc([c.attribute, c.race, c.frame].filter(Boolean).join(" · "))}</div>${stats}<div class="tx">${esc(c.text)}</div></div>`;
}
function render(root) {
    const G = root.game, U = root.ui;
    if (!G) return;
    const mine = G.active === "me" && !G.busy && !G.over;
    const phaseBtns = mine ? (G.phase === "Main Phase 1" && G.turn > 1 ? `<button data-do="battle">Battle Phase</button>` : "")
        + (G.phase === "Battle Phase" ? `<button data-do="main2">Main Phase 2</button>` : "")
        + `<button class="main" data-do="end">Fin du tour</button>` : "";
    const status = G.over ? esc(G.over) : `Tour ${G.turn} · ${G.active === "me" ? "à toi" : esc(G.p.bot.name)} · ${esc(G.phase)}`;
    const log = G.log.map((l) => `<div class="it ${l.tone}"><b>${l.who === "me" ? "Toi" : l.who === "bot" ? esc(G.p.bot.name) : "Duel"}</b> ${esc(l.text)}</div>`).join("");
    let overlay = "";
    if (U.modal) {
        const M = U.modal;
        overlay = `<div class="modal"><div class="box"><div class="mt">${esc(M.text)}</div>`
            + (M.choose ? "" : `<div class="ms">Réponds avec une de tes cartes, ou laisse faire.</div>`)
            + `<div class="opts">${M.options.map((o, k) => `<button class="opt" data-opt="${k}">${o.c ? cardHTML(G, o.c, { hidden: o.c.down && o.c.owner === "bot" }) : ""}<span>${o.c && !(o.c.down && o.c.owner === "bot") ? esc(o.c.name) : o.c ? "Monstre face cachée" : ""}<i>${esc(o.from)}</i></span></button>`).join("")}</div>`
            + `<div class="mb"><button data-opt="-1">${M.choose ? "Annuler l'attaque" : "Laisser faire"}</button></div></div></div>`;
    } else if (U.viewer) {
        const [who, z] = U.viewer.split(":");
        const list = G.p[who][z];
        const visible = who === "me" || z === "gy" || z === "ban";
        overlay = `<div class="modal"><div class="box wide"><div class="mt">${who === "me" ? "Ton" : "Son"} ${ZONE_NAMES[z]} (${list.length})</div>`
            + (who === "me" && z === "deck" ? `<div class="mb left"><button data-do="draw">Piocher 1 carte</button><button data-do="shuffle">Mélanger</button></div>` : "")
            + `<div class="grid">${visible ? [...list].sort((a, b) => z === "deck" ? a.name.localeCompare(b.name) : 0).map((c) => `<div class="slot">${cardHTML(G, c)}</div>`).join("") : "<i>Cartes cachées.</i>"}</div>`
            + `<div class="mb"><button data-do="close">Fermer</button></div></div></div>`;
    }
    let menu = "";
    if (U.menu) {
        const at = find(G, U.menu.uid);
        const acts = at ? actions(root, at.c, at.z) : [];
        root.menuActs = acts;
        if (acts.length) menu = `<div class="menu" style="left:${U.menu.x}px;top:${U.menu.y}px"><div class="mh">${esc(at.c.name)}</div>${acts.map((a, k) => `<button data-act="${k}">${esc(a.label)}</button>`).join("")}</div>`;
    }
    root.innerHTML = `<div class="top"><div class="status">${status}</div><div class="ctrl">${phaseBtns}`
        + `<label class="peek"><input type="checkbox" data-do="peek" ${U.peek ? "checked" : ""}> Voir sa main</label>`
        + `<button data-do="again">${G.over ? "Rejouer" : "Recommencer"}</button></div></div>`
        + `<div class="layout">${detailHTML(root)}<div class="field">${sideHTML(root, "bot")}<div class="mid">${esc(G.log.length ? G.log[G.log.length - 1].text : "")}</div>${sideHTML(root, "me")}</div>`
        + `<div class="log">${log}</div></div>${overlay}${menu}`;
    const logEl = root.querySelector(".log");
    logEl.scrollTop = logEl.scrollHeight;
    bind(root);
}

function bind(root) {
    const G = root.game, U = root.ui;
    const box = root.getBoundingClientRect();
    root.querySelectorAll(".card[data-uid]").forEach((el) => {
        const uid = el.dataset.uid === "" ? null : +el.dataset.uid;
        if (uid == null) return;
        el.addEventListener("mouseenter", () => { if (U.detail !== uid) { U.detail = uid; const d = root.querySelector(".detail"); if (d) d.outerHTML = detailHTML(root); } });
        el.addEventListener("click", (e) => {
            e.stopPropagation();
            if (U.modal || G.busy || G.over) return;
            if (el.closest(".pile") && !U.viewer) return el.closest(".pile").click();
            const r = el.getBoundingClientRect();
            U.detail = uid;
            U.menu = { uid, x: Math.min(r.left - box.left, box.width - 250), y: r.bottom - box.top + 4 };
            render(root);
        });
    });
    root.querySelectorAll(".pile").forEach((el) => el.addEventListener("click", (e) => {
        e.stopPropagation();
        if (U.modal || G.busy) return;
        U.viewer = el.dataset.pile; U.menu = null; render(root);
    }));
    root.querySelectorAll("[data-act]").forEach((el) => el.addEventListener("click", async (e) => {
        e.stopPropagation();
        const act = root.menuActs[+el.dataset.act];
        U.menu = null;
        if (U.viewer && !["Piocher"].includes(act.label)) U.viewer = null;
        render(root);
        await act.fn();
    }));
    root.querySelectorAll("[data-opt]").forEach((el) => el.addEventListener("click", (e) => {
        e.stopPropagation();
        const k = +el.dataset.opt;
        const M = U.modal;
        if (M) M.resolve(k < 0 ? null : M.options[k]);
    }));
    root.querySelectorAll("[data-do]").forEach((el) => el.addEventListener(el.type === "checkbox" ? "change" : "click", async (e) => {
        e.stopPropagation();
        const d = el.dataset.do;
        if (d === "peek") { U.peek = el.checked; return render(root); }
        if (d === "close") { U.viewer = null; return render(root); }
        if (d === "draw") { draw(G, "me"); return render(root); }
        if (d === "shuffle") { G.shuffle(G.p.me.deck); say(G, "me", "Tu mélanges ton deck."); return render(root); }
        if (d === "again") { root.seed += 1; root.game = null; return start(root, root.dataInit); }
        if (d === "battle") { G.phase = "Battle Phase"; say(G, "me", "Tu entres en Battle Phase."); return render(root); }
        if (d === "main2") { G.phase = "Main Phase 2"; return render(root); }
        if (d === "end") return endTurn(root);
    }));
}

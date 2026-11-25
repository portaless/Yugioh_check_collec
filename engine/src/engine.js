// Moteur de règles du duel (page Duel contre la méta) : YGOPro compilé en WebAssembly (koishipro-core.js).
// Le moteur applique toutes les règles et les effets des cartes (scripts Lua) ; il pose des questions aux
// joueurs (que faire, activer en chaîne, quelles cartes, quelle zone…). Ce fichier fait tourner la partie,
// répond aux questions du bot, transmet les tiennes à l'interface et tient le journal en français.
// Construit par `npm run build` dans static/engine/engine.js.
import {
    createOcgcoreWrapper, ZipScriptReader, SqljsCardReader, _OcgcoreConstants,
} from "koishipro-core.js";
import initSqlJs from "sql.js/dist/sql-wasm-browser.js";
import { IndexResponse, YGOProMsgResponseBase } from "ygopro-msg-encode";

export const K = _OcgcoreConstants.OcgcoreScriptConstants;
export const C = _OcgcoreConstants.OcgcoreCommonConstants;
const LOC = { DECK: 1, HAND: 2, MZONE: 4, SZONE: 8, GRAVE: 16, REMOVED: 32, EXTRA: 64, OVERLAY: 128 };
const POS = { FU_ATK: 1, FD_ATK: 2, FU_DEF: 4, FD_DEF: 8 };
const QUERY = C.QUERY_CODE | C.QUERY_POSITION | C.QUERY_ATTACK | C.QUERY_DEFENSE | C.QUERY_TYPE | C.QUERY_LEVEL
    | C.QUERY_RANK | C.QUERY_LINK | C.QUERY_OVERLAY_CARD;
const PHASES = { 1: "Draw Phase", 2: "Standby Phase", 4: "Main Phase 1", 8: "Battle Phase", 16: "Battle Phase",
    32: "Battle Phase", 64: "Battle Phase", 128: "Battle Phase", 256: "Main Phase 2", 512: "End Phase" };
export { LOC, POS };

// ------------------------------------------------------------------ chargement
export async function loadEngine(base) {
    const get = async (file, type) => {
        const r = await fetch(base + file);
        if (!r.ok) throw new Error(`${file} : ${r.status}`);
        return r[type]();
    };
    const [wasm, sqlWasm, scripts, cdb, strings] = await Promise.all([
        get("libocgcore.wasm", "arrayBuffer"), get("sql-wasm-browser.wasm", "arrayBuffer"),
        get("data/script.zip", "arrayBuffer"), get("data/cards.cdb", "arrayBuffer"), get("data/strings.conf", "text"),
    ]);
    const wrapper = await createOcgcoreWrapper({ wasmBinary: new Uint8Array(wasm) });
    wrapper.setScriptReader(await ZipScriptReader(new Uint8Array(scripts)), true);
    const SQL = await initSqlJs({ wasmBinary: new Uint8Array(sqlWasm) });
    const db = new SQL.Database(new Uint8Array(cdb));
    wrapper.setCardReader(SqljsCardReader(db));
    const errors = [];
    wrapper.setMessageHandler((_d, msg, type) => { if (type === 1) errors.push(msg); }, true);
    const texts = new Map();
    for (const row of db.exec("SELECT * FROM texts")[0].values) texts.set(row[0], row);
    const system = new Map();
    for (const line of strings.split(/\r?\n/)) {
        const m = line.match(/^!system (\d+) (.*)$/);
        if (m) system.set(+m[1], m[2]);
    }
    const names = db.exec("SELECT id, name FROM texts")[0].values;
    const stats = new Map(db.exec("SELECT id, atk FROM datas")[0].values);
    return { wrapper, texts, system, errors, names, stats };
}

// ------------------------------------------------------------------ textes
export function makeTexts(engine, myNames = {}) {
    const name = (code) => myNames[code] || (engine.texts.get(code) || [])[1] || `#${code}`;
    // desc : texte d'effet d'une carte (code * 16 + numéro) ou message du moteur (strings.conf)
    const desc = (d, code) => {
        if (engine.texts.has(d)) return `« ${name(d)} »`;   // certains indices donnent directement un code de carte
        if (d >= 10000) {
            const row = engine.texts.get(Math.floor(d / 16));
            const s = row && row[3 + (d % 16)];
            if (s) return s;
            return code ? `Effet de ${name(Math.floor(d / 16))}` : "Effet";
        }
        return engine.system.get(d) || (d ? `Option ${d}` : "Activer l'effet");
    };
    return { name, desc };
}

// ------------------------------------------------------------------ partie
export class Game {
    constructor(engine, { me, bot, seed, meFirst, names, botName }) {
        this.engine = engine;
        this.botName = botName || "L'adversaire";
        this.T = makeTexts(engine, names);
        this.me = meFirst ? 0 : 1;            // le joueur 0 commence
        this.bot = 1 - this.me;
        this.log = [];
        this.over = null;
        this.turn = 0;
        this.turnPlayer = 0;
        this.phase = "";
        this.hint = "";
        this.stopped = false;
        let a = seed >>> 0 || 1;               // mélange des decks (le moteur ne mélange pas lui-même)
        const rand = () => { a = (a * 1664525 + 1013904223) >>> 0; return a / 4294967296; };
        const shuffle = (l) => { l = [...l]; for (let i = l.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [l[i], l[j]] = [l[j], l[i]]; } return l; };
        const duel = this.duel = engine.wrapper.createDuel(seed >>> 0);
        for (const p of [0, 1]) duel.setPlayerInfo({ player: p, lp: 8000, startHand: 5, drawCount: 1 });
        for (const [p, d] of [[this.me, me], [this.bot, bot]]) {
            for (const code of shuffle(d.main)) duel.newCard({ code, owner: p, player: p, location: LOC.DECK, sequence: 0, position: POS.FD_DEF });
            for (const code of d.extra) duel.newCard({ code, owner: p, player: p, location: LOC.EXTRA, sequence: 0, position: POS.FD_DEF });
        }
        this.botBrain = new Bot(this);
    }

    who(p) { return p === this.me ? "me" : "bot"; }
    say(p, text, tone = "") { this.log.push({ who: p === undefined || p === null ? null : this.who(p), text, tone, turn: this.turn }); }

    // État complet du terrain, interrogé auprès du moteur (rien n'est déduit des messages).
    field() {
        const d = this.duel;
        const side = (p) => {
            const q = (loc) => d.queryFieldCard({ player: p, location: loc, queryFlag: QUERY }).cards
                .map((c, i) => (c && !c.empty ? { ...c, sequence: c.sequence ?? i, key: `${p}:${loc}:${c.sequence ?? i}` } : null));
            const info = d.queryFieldInfo().field.players[p];
            return {
                lp: info.lp, hand: q(LOC.HAND), mzone: q(LOC.MZONE), szone: q(LOC.SZONE), grave: q(LOC.GRAVE),
                removed: q(LOC.REMOVED), extra: q(LOC.EXTRA), deck: info.deckCount,
            };
        };
        return { me: side(this.me), bot: side(this.bot), turn: this.turn, phase: this.phase,
            turnPlayer: this.who(this.turnPlayer), over: this.over, log: this.log };
    }

    // Boucle principale : ui.prompt(question) -> Promise<réponse> ; ui.update(état) après chaque étape.
    async run(ui) {
        this.duel.startDuel({ rule: 5 });
        let last = null;
        while (!this.over && !this.stopped) {
            const res = this.duel.process();
            const messages = res.messages || (res.message ? [res.message] : []);
            let botActed = false;
            for (const m of messages) {
                const kind = m.constructor.name.replace("YGOProMsg", "");
                if (kind === "Retry") {
                    this.say(this.me, "Choix refusé par les règles : recommence.", "warn");
                    if (last) await this.answer(last, ui);
                    continue;
                }
                this.event(kind, m);
                if (m instanceof YGOProMsgResponseBase) {
                    last = m;
                    botActed = m.responsePlayer() === this.bot;
                    await this.answer(m, ui);
                }
            }
            if (res.status === 2) break;
            ui.update(this.field(), botActed);
            if (botActed) await ui.pause();
        }
        ui.update(this.field(), false);
    }

    async answer(m, ui) {
        const p = m.responsePlayer();
        let response;
        if (p === this.bot) {
            response = this.botBrain.respond(m);
        } else {
            const q = this.question(m);
            response = q ? await ui.prompt(q, this.field()) : undefined;
        }
        if (!response) response = m.defaultResponse ? m.defaultResponse() : m.prepareResponse(null);
        this.duel.setResponse(response);
    }

    // ------------------------------------------------------------------ journal
    event(kind, m) {
        const T = this.T, me = this.me;
        const who = (p) => (p === me ? "Tu" : this.botName);
        switch (kind) {
            case "NewTurn":
                this.turn += 1; this.turnPlayer = m.player;
                this.say(null, `Tour ${this.turn} : ${m.player === me ? "à toi de jouer" : "au tour de l'adversaire (" + this.botName + ")"}.`, "turn");
                break;
            case "NewPhase": this.phase = PHASES[m.phase] || this.phase; break;
            case "Hint": if (m.type === 3) this.hint = T.desc(m.desc); break;
            case "Draw":
                if (m.player === me) this.say(me, `Tu pioches ${(m.cards || []).map((c) => `« ${T.name(c & 0x7fffffff)} »`).join(", ") || m.count + " carte(s)"}.`);
                else this.say(m.player, `${this.botName} pioche ${m.count} carte(s).`);
                break;
            case "Summoning": this.say(m.controller, `${m.controller === me ? "Tu invoques" : this.botName + " invoque"} normalement « ${T.name(m.code)} ».`); break;
            case "SpSummoning": this.say(m.controller, `Invocation Spéciale de « ${T.name(m.code)} ».`); break;
            case "FlipSummoning": this.say(m.controller, `Invocation Flip de « ${T.name(m.code)} ».`); break;
            case "Set": break;
            case "Move": this.move(m); break;
            case "Chaining":
                this.say(m.controller, `${who(m.controller)} ${m.controller === me ? "actives" : "active"} « ${T.name(m.code)} »${m.chainCount > 1 ? ` (maillon ${m.chainCount})` : ""}.`, m.controller === me ? "" : "bot");
                break;
            case "ChainNegated": case "ChainDisabled":
                this.say(null, `Le maillon ${m.chainCount} est annulé.`, "cut"); break;
            case "Damage": this.say(m.player, `${m.player === me ? "Tu perds" : this.botName + " perd"} ${m.value} PV.`, "cut"); break;
            case "PayLpCost": this.say(m.player, `${m.player === me ? "Tu paies" : this.botName + " paie"} ${m.cost} PV.`); break;
            case "Recover": this.say(m.player, `${m.player === me ? "Tu gagnes" : this.botName + " gagne"} ${m.value} PV.`, "good"); break;
            case "Attack": {
                const a = m.attacker || {}, t = m.defender || {};
                const code = (x) => this.codeAt(x);
                this.say(a.controller, `« ${T.name(code(a))} » attaque ${t && t.location ? "« " + T.name(code(t)) + " »" : "directement"}.`);
                break;
            }
            case "Win":
                this.over = m.player === me ? "Victoire !" : `Défaite : ${this.botName} gagne.`;
                this.say(null, this.over, m.player === me ? "good" : "cut");
                break;
            default: break;
        }
    }

    // Journal des déplacements qui comptent : destructions, envois au Cimetière, bannissements, recherches.
    move(m) {
        const T = this.T, from = m.previous || {}, to = m.current || {}, me = this.me;
        if (!m.code || from.location === to.location) return;
        const name = `« ${T.name(m.code)} »`;
        const field = (l) => l === LOC.MZONE || l === LOC.SZONE;
        const r = m.reason || 0;
        if (field(from.location) && to.location === LOC.GRAVE) {
            if (r & 1) this.say(from.controller, `${name} est détruit${r & 32 ? " au combat" : ""}.`, "cut");
            else if (!(r & 8)) this.say(from.controller, `${name} est envoyé au Cimetière.`);
        } else if (to.location === LOC.REMOVED && from.location !== LOC.OVERLAY) {
            this.say(from.controller, `${name} est banni.`);
        } else if (from.location === LOC.DECK && to.location === LOC.HAND) {
            this.say(to.controller, `${to.controller === me ? "Tu ajoutes" : this.botName + " ajoute"} ${to.controller === me ? name : "une carte"} à ${to.controller === me ? "ta" : "sa"} main depuis le Deck.`);
        } else if (from.location === LOC.DECK && to.location === LOC.GRAVE && !(r & 128)) {
            this.say(from.controller, `${name} est envoyé du Deck au Cimetière.`);
        } else if (field(from.location) && to.location === LOC.HAND) {
            this.say(from.controller, `${name} retourne dans la main.`);
        }
    }

    codeAt(x) {
        try {
            const r = this.duel.queryCard({ player: x.controller, location: x.location, sequence: x.sequence, queryFlag: C.QUERY_CODE });
            return r.card ? r.card.code : 0;
        } catch { return 0; }
    }

    // ------------------------------------------------------------------ tes questions
    // Traduit une question du moteur en question pour l'interface ; la réponse est préparée ici.
    question(m) {
        const T = this.T;
        const kind = m.constructor.name.replace("YGOProMsg", "");
        const key = (c) => `${c.controller}:${c.location}:${c.sequence}`;
        const hint = this.hint; this.hint = "";
        switch (kind) {
            case "SelectIdleCmd": case "SelectBattleCmd": {
                const acts = [];
                const add = (list, label, type) => (list || []).forEach((c, i) => acts.push({
                    key: key(c), code: c.code, label: typeof label === "function" ? label(c) : label,
                    response: m.prepareResponse(type, IndexResponse(i)),
                }));
                const effect = (c) => `Activer : ${T.desc(c.desc, c.code)}`;
                if (kind === "SelectIdleCmd") {
                    add(m.summonableCards, "Invocation Normale", 0);
                    add(m.spSummonableCards, "Invocation Spéciale", 1);
                    add(m.reposableCards, "Changer de position", 2);
                    add(m.msetableCards, "Poser face verso", 3);
                    add(m.ssetableCards, "Poser", 4);
                    add(m.activatableCards, effect, 5);
                } else {
                    add(m.activatableCards, effect, 0);
                    add(m.attackableCards, (c) => (c.directAttack ? "Attaquer (attaque directe possible)" : "Attaquer"), 1);
                }
                const buttons = [];
                if (kind === "SelectIdleCmd" && m.canBp) buttons.push({ label: "Battle Phase", response: m.prepareResponse(6) });
                if (kind === "SelectBattleCmd" && m.canM2) buttons.push({ label: "Main Phase 2", response: m.prepareResponse(2) });
                if (m.canEp) buttons.push({ label: "Fin du tour", main: true, response: m.prepareResponse(kind === "SelectIdleCmd" ? 7 : 3) });
                return { kind: "actions", actions: acts, buttons };
            }
            case "SelectChain": {
                if (!m.chains.length) return null;   // rien à enchaîner : le moteur passe tout seul
                const forced = m.chains.some((c) => c.forced);
                return {
                    kind: "choose", title: "Activer un effet en chaîne ?",
                    options: m.chains.map((c, i) => ({ key: key(c), code: c.code, label: T.desc(c.desc, c.code), response: m.prepareResponse(IndexResponse(i)) })),
                    cancel: forced ? null : { label: "Ne rien activer", response: m.prepareResponse(null) },
                };
            }
            case "SelectEffectYn":
                return { kind: "yesno", title: `Activer l'effet de « ${T.name(m.code)} » ?`, text: m.desc && !T.desc(m.desc, m.code).includes("%ls") ? T.desc(m.desc, m.code) : "", code: m.code,
                    yes: m.prepareResponse(true), no: m.prepareResponse(false) };
            case "SelectYesNo":
                return { kind: "yesno", title: T.desc(m.desc).replace(/[%ls]/g, "cette carte"), text: "", yes: m.prepareResponse(true), no: m.prepareResponse(false) };
            case "SelectOption":
                return { kind: "choose", title: hint || "Choisis une option", options: m.options.map((d, i) => ({ label: T.desc(d), response: m.prepareResponse(i) })), cancel: null };
            case "SelectPosition": {
                const opts = [[POS.FU_ATK, "Attaque, face recto"], [POS.FD_ATK, "Attaque, face verso"], [POS.FU_DEF, "Défense, face recto"], [POS.FD_DEF, "Défense, face verso"]]
                    .filter(([bit]) => m.positions & bit).map(([bit, label]) => ({ label, response: m.prepareResponse(bit) }));
                return { kind: "choose", title: `Position de « ${T.name(m.code)} »`, code: m.code, options: opts, cancel: null };
            }
            case "SelectCard": case "SelectTribute": case "SelectSum": {
                const cards = m.cards.map((c) => ({ key: key(c), code: c.code, controller: c.controller, location: c.location }));
                const must = kind === "SelectSum" ? (m.mustSelectCards || []).map((c) => T.name(c.code)) : [];
                return {
                    kind: "cards", title: hint || (kind === "SelectTribute" ? T.desc(500) : "Sélectionne des cartes"),
                    min: m.min, max: m.max, cards, sum: kind === "SelectSum" ? m.sumVal : null, must,
                    build: (idx) => m.prepareResponse(idx.map((i) => IndexResponse(i))),
                    cancel: m.cancelable ? m.prepareResponse(null) : null,
                };
            }
            case "SelectUnselectCard": {
                const cards = m.selectableCards.map((c) => ({ key: key(c), code: c.code, controller: c.controller, location: c.location }));
                return {
                    kind: "cards", title: hint || "Sélectionne une carte", min: 1, max: 1, cards, step: true,
                    chosen: m.unselectableCards.map((c) => T.name(c.code)),
                    build: (idx) => m.prepareResponse(IndexResponse(idx[0])),
                    cancel: m.finishable || m.cancelable ? m.prepareResponse(null) : null,
                    cancelLabel: m.finishable ? "Terminer la sélection" : "Annuler",
                };
            }
            case "SelectPlace": case "SelectDisfield": {
                const places = m.getSelectablePlaces();
                const title = kind === "SelectPlace" ? T.desc(569).replace("[%ls]", hint.startsWith("«") ? hint : "la carte") : T.desc(570);
                return { kind: "place", title,
                    count: m.count || 1, places, build: (list) => m.prepareResponse(list) };
            }
            case "AnnounceRace": case "AnnounceAttrib": {
                const bits = kind === "AnnounceRace" ? m.availableRaces : m.availableAttributes;
                const base = kind === "AnnounceRace" ? 1020 : 1010;   // noms des Types / Attributs dans strings.conf
                const opts = [];
                for (let i = 0; i < 26; i++) if (bits & (1 << i)) opts.push({ label: T.desc(base + i), response: m.prepareResponse(1 << i) });
                return { kind: "choose", title: hint || T.desc(kind === "AnnounceRace" ? 563 : 562), options: opts, cancel: null };
            }
            case "AnnounceNumber":
                return { kind: "choose", title: hint || T.desc(565), options: m.numbers.map((n, i) => ({ label: String(n), response: m.prepareResponse(i) })), cancel: null };
            case "AnnounceCard":
                return { kind: "announce", title: hint || T.desc(564), names: this.engine.names, build: (code) => m.prepareResponse(code) };
            default:
                return null;   // tri de cartes, compteurs, pierre-feuille-ciseaux… : réponse par défaut
        }
    }
}

// ------------------------------------------------------------------ le bot
// Il répond aux mêmes questions que toi : il ne peut donc jouer que des actions légales.
class Bot {
    constructor(game) { this.g = game; this.tried = new Set(); this.actions = 0; this.turn = -1; }

    respond(m) {
        const g = this.g, kind = m.constructor.name.replace("YGOProMsg", "");
        if (g.turn !== this.turn) { this.turn = g.turn; this.actions = 0; }
        const mine = (c) => c.controller === g.bot;
        switch (kind) {
            case "SelectIdleCmd": {
                this.actions++;
                const busy = this.actions > 40;
                const fresh = m.activatableCards.findIndex((c) => !this.tried.has(`${g.turn}:${c.code}:${c.desc}`));
                if (fresh >= 0 && !busy) {
                    const c = m.activatableCards[fresh];
                    this.tried.add(`${g.turn}:${c.code}:${c.desc}`);
                    return m.prepareResponse(5, IndexResponse(fresh));
                }
                if (m.spSummonableCards.length && !busy) return m.prepareResponse(1, IndexResponse(0));
                // Invocation Normale du monstre le plus fort ; les monstres sans ATK (souvent des interruptions de main)
                // restent en main
                const atk = (c) => g.engine.stats.get(c.code) ?? 0;
                const best = m.summonableCards.map((c, i) => ({ i, a: atk(c) })).filter((x) => x.a >= 1000).sort((x, y) => y.a - x.a)[0];
                if (best && !busy) return m.prepareResponse(0, IndexResponse(best.i));
                const trap = m.ssetableCards.findIndex(() => true);
                if (trap >= 0 && !busy && this.actions < 30) return m.prepareResponse(4, IndexResponse(trap));
                if (m.canBp && g.turn > 1) return m.prepareResponse(6);
                return m.prepareResponse(7);
            }
            case "SelectBattleCmd":
                if (m.attackableCards.length && this.actions++ < 60) return m.prepareResponse(1, IndexResponse(0));
                return m.prepareResponse(m.canM2 ? 2 : 3);
            case "SelectChain":
                return m.prepareResponse(m.chains.length ? IndexResponse(0) : null);   // interruptions dès que possible
            case "SelectEffectYn": case "SelectYesNo": return m.prepareResponse(true);
            case "SelectOption": return m.prepareResponse(0);
            case "SelectPosition": return m.prepareResponse(m.positions & POS.FU_ATK ? POS.FU_ATK : m.positions & POS.FU_DEF ? POS.FU_DEF : m.positions & -m.positions);
            case "SelectCard": case "SelectTribute": {
                // cartes adverses : les plus fortes d'abord ; les siennes : les plus faibles d'abord
                const order = m.cards.map((c, i) => ({ i, c, v: mine(c) ? -this.power(c) : this.power(c) })).sort((a, b) => b.v - a.v);
                return m.prepareResponse(order.slice(0, Math.max(1, m.min)).map((o) => IndexResponse(o.i)));
            }
            case "SelectSum": {
                const total = m.sumVal, pick = [];
                let s = 0;
                for (let i = 0; i < m.cards.length && s < total; i++) { pick.push(i); s += m.cards[i].opParam & 0xffff; }
                return m.prepareResponse(pick.map((i) => IndexResponse(i)));
            }
            case "SelectUnselectCard":
                if (m.finishable) return m.prepareResponse(null);
                return m.prepareResponse(IndexResponse(0));
            case "SelectPlace": case "SelectDisfield": {
                const places = m.getSelectablePlaces();
                const own = places.filter((p) => p.player === g.bot);
                const list = (kind === "SelectPlace" && own.length ? own : places).slice(0, m.count || 1);
                return m.prepareResponse(list);
            }
            case "SelectCounter":
                return m.prepareResponse([{ card: IndexResponse(0), count: m.counterCount }]);
            case "AnnounceRace": return m.prepareResponse(m.availableRaces & -m.availableRaces);
            case "AnnounceAttrib": return m.prepareResponse(m.availableAttributes & -m.availableAttributes);
            case "AnnounceNumber": return m.prepareResponse(0);
            case "AnnounceCard": return m.prepareResponse(14558127);   // Floraison de Cendres : nom souvent pertinent
            case "RockPaperScissors": return m.prepareResponse(1 + Math.floor(Math.random() * 3));
            default:
                return m.defaultResponse ? m.defaultResponse() : undefined;
        }
    }

    power(c) {
        try {
            const r = this.g.duel.queryCard({ player: c.controller, location: c.location, sequence: c.sequence, queryFlag: C.QUERY_ATTACK });
            return r.card ? r.card.attack || 0 : 0;
        } catch { return 0; }
    }
}

// Une partie : fait tourner le moteur, transmet tes questions à l'interface, fait jouer le bot, tient le journal.
import { YGOProMsgResponseBase } from "ygopro-msg-encode";
import { Bot } from "./bot.js";
import { C, LOC, PHASES, POS, QUERY } from "./constants.js";
import { question } from "./questions.js";
import { makeTexts } from "./texts.js";

export class Game {
    // replay : tes réponses d'une partie précédente, rejouées sans rien te demander (retour arrière : le moteur et le
    // bot étant déterministes, la même graine et les mêmes réponses redonnent exactement la même partie)
    constructor(engine, { me, bot, seed, meFirst, names, botName, replay = [] }) {
        this.replay = [...replay];
        this.fast = replay.length > 0;          // rejeu sans pauses jusqu'à la prochaine question
        this.answers = [];                     // tes réponses : { response, action } (action = choix fait en phase)
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
            if (this.fast) continue;   // rejeu : on va directement au point demandé
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
            const q = question(this, m);
            if (q) {
                if (this.replay.length) response = this.replay.shift();
                else { this.fast = false; response = await ui.prompt(q, this.field()); }
                this.answers.push({ response, action: q.kind === "actions" });
            }
        }
        if (!response) response = m.defaultResponse ? m.defaultResponse() : m.prepareResponse(null);
        this.duel.setResponse(response);
    }

    // Réponses à rejouer pour revenir juste avant ta dernière action en phase (invocation, activation, attaque…) ;
    // null s'il n'y en a pas encore.
    undoPoint() {
        for (let i = this.answers.length - 1; i >= 0; i--) if (this.answers[i].action) return this.answers.slice(0, i).map((a) => a.response);
        return null;
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
            case "Chaining": {
                // nom de l'effet quand la carte en a un (« Effet de bannissement »…), pas les libellés génériques
                const what = T.desc(m.desc, m.code);
                const named = m.desc >= 10000 && !what.startsWith("«") && !["Effet", "Activer", "Activer l'effet"].includes(what)
                    && what !== `Effet de ${T.name(Math.floor(m.desc / 16))}` ? ` : ${what}` : "";
                this.say(m.controller, `${who(m.controller)} ${m.controller === me ? "actives" : "active"} « ${T.name(m.code)} »${named}${m.chainCount > 1 ? ` (maillon ${m.chainCount})` : ""}${m.controller !== me && this.turnPlayer === me ? ` pendant ton tour (${this.phase})` : ""}.`, m.controller === me ? "" : "bot");
                break;
            }
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
        } else if (to.location === LOC.SZONE && from.location !== LOC.HAND && !field(from.location)) {
            // carte posée par un effet (ex. monstre de l'Extra Deck placé en Magie Continue)
            this.say(to.controller, `${name} est placé${from.location === LOC.EXTRA ? " depuis l'Extra Deck" : ""} dans la Zone Magie & Piège${to.sequence === 5 ? " (Terrain)" : ""}.`);
        }
    }

    codeAt(x) {
        try {
            const r = this.duel.queryCard({ player: x.controller, location: x.location, sequence: x.sequence, queryFlag: C.QUERY_CODE });
            return r.card ? r.card.code : 0;
        } catch { return 0; }
    }
}

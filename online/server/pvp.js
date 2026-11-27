// Duel entre deux joueurs humains, arbitré par le moteur sur le serveur (EX-D4). Il réutilise la partie du duel
// local (engine/src/game.js) : chaque question du moteur va au joueur concerné, le journal est écrit pour chacun de
// son point de vue, et ce que l'un ne doit pas voir (main, cartes face verso, Extra Deck adverses) n'est pas envoyé.
import { Game } from "../../engine/src/game.js";
import { question } from "../../engine/src/questions.js";
import { HttpError } from "./http.js";

const FACE_DOWN = 0xA, FACE_UP = 0x5;
const ANSWER_MS = 3 * 60 * 1000;     // sans réponse dans ce délai quand c'est à lui d'agir, le joueur perd (EX-D6)
const SHARED = ["turn", "turnPlayer", "phase", "hint", "over", "winner"];

export class PvpGame extends Game {
    // decks[siège] = { main, extra } ; pseudos[siège] ; le siège 0 est le joueur « me » de la partie de base
    constructor(engine, { decks, pseudos, seed, firstSeat, answerMs = ANSWER_MS }) {
        super(engine, { me: decks[0], bot: decks[1], seed, meFirst: firstSeat === 0, botName: pseudos[1] });
        this.pseudos = pseudos;
        this.logs = [[], []];
        this.overs = [null, null];
        this.pending = null;                 // question en attente : { seat, q, table, resolve, until }
        this.answerMs = answerMs;
        this.timer = null;
        this.hooks = { update() {}, prompt() {} };
        const who = (seat) => (seat === firstSeat ? "tu commences" : `${pseudos[firstSeat]} commence`);
        this.logs.forEach((log, seat) => log.push({ who: null, text: `Pile ou face : ${who(seat)}.`, tone: "turn", turn: 0 }));
    }

    seatOf(player) { return player === this.me ? 0 : 1; }

    // Chaque événement est raconté deux fois, une fois du point de vue de chaque joueur.
    event(kind, m) {
        const before = pick(this, SHARED);
        this.log = this.logs[0]; this.botName = this.pseudos[1]; this.over = this.overs[0];
        super.event(kind, m);
        const after = pick(this, SHARED);
        this.overs[0] = this.over;
        Object.assign(this, before);
        this.swap();
        this.log = this.logs[1]; this.botName = this.pseudos[0]; this.over = this.overs[1];
        super.event(kind, m);
        this.overs[1] = this.over;
        this.swap();
        Object.assign(this, after);
        this.botName = this.pseudos[1];
        this.log = this.logs[0];
    }

    swap() { [this.me, this.bot] = [this.bot, this.me]; }

    async answer(m) {
        if (this.stopped) return;           // duel arrêté (abandon, temps écoulé) : plus aucune question
        const seat = this.seatOf(m.responsePlayer());
        const q = question(this, m);
        let response = q ? await this.ask(seat, q) : undefined;
        if (this.stopped) return;
        if (!response) response = m.defaultResponse ? m.defaultResponse() : m.prepareResponse(null);
        this.duel.setResponse(response);
    }

    ask(seat, q) {
        return new Promise((resolve) => {
            const table = [];
            this.asked = (this.asked || 0) + 1;   // numéro de la question : une réponse ne sert qu'une fois
            this.pending = { seat, q, table, resolve, sent: { ...encode(q, table), id: this.asked }, until: Date.now() + this.answerMs };
            this.timer = setTimeout(() => this.forfeit(seat, "time"), this.answerMs);
            this.timer.unref?.();
            this.hooks.prompt(seat);
        });
    }

    // Réponse d'un navigateur : un jeton « #n » (réponse préparée) ou { build: … } pour un choix de cartes ou de zones.
    reply(seat, answer) {
        const P = this.pending;
        if (!P || P.seat !== seat) throw new HttpError(409, "Ce n'est pas à toi de répondre.");
        let response;
        if (typeof answer === "string" && /^#\d+$/.test(answer)) response = P.table[+answer.slice(1)];
        else if (answer && typeof answer === "object" && "build" in answer && typeof P.q.build === "function") {
            try { response = P.q.build(answer.build); } catch { throw new HttpError(400, "Choix refusé par les règles."); }
        }
        if (!response) throw new HttpError(400, "Réponse inconnue.");
        this.pending = null;
        clearTimeout(this.timer);
        P.resolve(response);
    }

    // Fin du duel sans le moteur : abandon volontaire ou temps de réponse écoulé (EX-D6).
    forfeit(seat, why) {
        if (this.overs[0] || this.stopped) return;
        const loser = this.pseudos[seat];
        this.overs[seat] = why === "time" ? "Défaite : temps de réponse écoulé." : "Défaite : tu as abandonné.";
        this.overs[1 - seat] = why === "time" ? `Victoire ! ${loser} n'a pas répondu à temps.` : `Victoire ! ${loser} abandonne.`;
        this.logs.forEach((log, i) => log.push({ who: null, text: this.overs[i], tone: i === seat ? "cut" : "good", turn: this.turn }));
        this.over = this.overs[0];
        this.stopped = true;
        clearTimeout(this.timer);
        const P = this.pending;
        this.pending = null;
        if (P) P.resolve(null);
        this.hooks.update();
    }

    // Ce qu'un joueur voit : le terrain de son point de vue, sans les cartes cachées de l'adversaire.
    view(seat) {
        if (seat === 1) this.swap();
        const f = this.field();
        if (seat === 1) this.swap();
        f.log = this.logs[seat];
        f.over = this.overs[seat];
        hide(f.bot);
        return f;
    }

    promptFor(seat) { return this.pending && this.pending.seat === seat ? this.pending.sent : null; }
}

function pick(o, keys) { return Object.fromEntries(keys.map((k) => [k, o[k]])); }

function hide(side) {
    const mask = (c) => (c ? { ...c, code: 0, attack: 0, defense: 0, overlayCards: [] } : c);
    side.hand = side.hand.map(mask);
    side.extra = side.extra.map((c) => (c && !(c.position & FACE_UP) ? mask(c) : c));
    for (const loc of ["mzone", "szone", "removed"]) side[loc] = side[loc].map((c) => (c && c.position & FACE_DOWN ? mask(c) : c));
}

// Question envoyée au navigateur : chaque réponse préparée devient un jeton, les fonctions restent sur le serveur,
// et la liste des noms de cartes (annonce d'un nom) est chargée à part par le navigateur.
function encode(q, table) {
    const walk = (v) => {
        if (v instanceof ArrayBuffer || ArrayBuffer.isView(v)) { table.push(v); return `#${table.length - 1}`; }
        if (Array.isArray(v)) return v.map(walk);
        if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).filter(([, x]) => typeof x !== "function").map(([k, x]) => [k, walk(x)]));
        return v;
    };
    const out = walk({ ...q, names: undefined });
    out.hasBuild = typeof q.build === "function";
    if (q.kind === "announce") out.names = true;
    return out;
}


// Salons de duel : création avec un code (EX-D1), file d'attente pour un adversaire au hasard (EX-D2), invitation
// d'un joueur précis (EX-D3), envoi du terrain et des questions à chaque joueur, reconnexion et abandon (EX-D6).
import { randomBytes, randomInt } from "crypto";
import { HttpError } from "./http.js";
import { PvpGame } from "./pvp.js";

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";   // sans 0/O ni 1/I, faciles à confondre
const WAIT_MS = 30 * 60 * 1000, INVITE_MS = 5 * 60 * 1000, KEEP_OVER_MS = 60 * 60 * 1000;
const NO_ROOM = () => new HttpError(404, "Aucun duel n'attend avec ce code.");

export class Rooms {
    constructor(engine, { answerMs } = {}) {
        this.engine = engine;
        this.answerMs = answerMs;
        this.rooms = new Map();
        this.queue = null;                     // code du salon qui attend un adversaire au hasard
        this.listeners = new Map();            // id du joueur -> flux ouverts (pour les invitations)
        setInterval(() => this.expire(), 30 * 1000).unref();
    }

    roomOf(player) {
        for (const r of this.rooms.values()) if (r.status !== "over" && r.seats.some((s) => s && s.player.id === player.id)) return r;
        return null;
    }

    seat(room, player) { return room.seats.findIndex((s) => s && s.player.id === player.id); }

    // Un joueur n'a qu'un salon à la fois : un salon en attente est remplacé, un duel en cours bloque.
    free(player) {
        const r = this.roomOf(player);
        if (r && r.status === "playing") throw new HttpError(409, "Tu as déjà un duel en cours.");
        if (r) this.close(r);
    }

    create(player, deck, { random = false, invited = null } = {}) {
        this.free(player);
        let code;
        do code = Array.from({ length: 6 }, () => CODE_CHARS[randomInt(CODE_CHARS.length)]).join(""); while (this.rooms.has(code));
        const room = { code, random, invited, status: "waiting", created: Date.now(), seats: [this.newSeat(player, deck), null], game: null };
        this.rooms.set(code, room);
        this.sendRoom(room, 0);
        if (invited) this.sendInvites(invited.id);
        return room;
    }

    invite(player, deck, target) {
        if (!target) throw new HttpError(404, "Aucun joueur avec ce pseudo.");
        if (target.id === player.id) throw new HttpError(400, "Tu ne peux pas te défier toi-même.");
        return this.create(player, deck, { invited: target });
    }

    join(code, player, deck) {
        const room = this.rooms.get(String(code || "").trim().toUpperCase());
        if (!room || room.status !== "waiting" || (room.invited && room.invited.id !== player.id)) throw NO_ROOM();
        if (room.seats[0].player.id === player.id) throw new HttpError(400, "Tu ne peux pas rejoindre ton propre duel.");
        this.free(player);
        room.seats[1] = this.newSeat(player, deck);
        if (this.queue === room.code) this.queue = null;
        if (room.invited) this.sendInvites(room.invited.id);
        this.start(room);
        return room;
    }

    random(player, deck) {
        const waiting = this.queue && this.rooms.get(this.queue);
        if (waiting && waiting.status === "waiting" && waiting.seats[0].player.id !== player.id) return this.join(waiting.code, player, deck);
        const room = this.create(player, deck, { random: true });
        this.queue = room.code;
        return room;
    }

    cancel(player) {
        const r = this.roomOf(player);
        if (r && r.status === "waiting") this.close(r);
    }

    decline(player, code) {
        const room = this.rooms.get(String(code || "").toUpperCase());
        if (!room || room.status !== "waiting" || !room.invited || room.invited.id !== player.id) throw NO_ROOM();
        this.close(room, `${player.pseudo} a refusé ton invitation.`);
    }

    forfeit(player) {
        const room = this.roomOf(player);
        if (!room || room.status !== "playing") throw new HttpError(404, "Aucun duel en cours.");
        room.game.forfeit(this.seat(room, player), "quit");
    }

    close(room, reason = "") {
        this.rooms.delete(room.code);
        if (this.queue === room.code) this.queue = null;
        for (const s of room.seats) if (s) for (const st of s.streams) st.send("room", { status: "closed", reason });
        if (room.invited) this.sendInvites(room.invited.id);
    }

    // les flux déjà ouverts par ce joueur suivent son nouveau salon
    newSeat(player, deck) { return { player, deck, streams: new Set(this.listeners.get(player.id) || []), sent: new Set() }; }

    start(room) {
        const pseudos = room.seats.map((s) => s.player.pseudo);
        const game = new PvpGame(this.engine, { decks: room.seats.map((s) => s.deck), pseudos, answerMs: this.answerMs,
            seed: randomBytes(4).readUInt32LE() >>> 1, firstSeat: randomInt(2) });
        room.game = game;
        room.status = "playing";
        game.hooks = { update: () => room.seats.forEach((_, i) => this.push(room, i)), prompt: () => game.hooks.update() };
        room.seats.forEach((_, i) => this.sendRoom(room, i));
        const ui = { update: () => game.hooks.update(), pause: async () => {}, prompt: async () => null };
        game.run(ui).catch((e) => game.logs.forEach((l) => l.push({ who: null, text: `Erreur du moteur : ${e.message || e}`, tone: "cut" })))
            .finally(() => { room.status = "over"; room.ended = Date.now(); room.seats.forEach((_, i) => this.push(room, i)); });
    }

    // Un navigateur se connecte (ou se reconnecte) : il reçoit ses invitations, l'état du salon, le terrain et sa question.
    connect(player, stream) {
        if (!this.listeners.has(player.id)) this.listeners.set(player.id, new Set());
        this.listeners.get(player.id).add(stream);
        stream.send("invites", this.invitesFor(player.id));
        const mine = [...this.rooms.values()].filter((r) => r.seats.some((s) => s && s.player.id === player.id));
        const room = mine.find((r) => r.status !== "over") || mine.sort((a, b) => b.created - a.created)[0];
        if (!room) return stream.send("room", { status: "none" });
        const i = this.seat(room, player);
        room.seats[i].streams.add(stream);
        room.seats[i].sent.clear();
        this.sendRoom(room, i, stream);
        if (room.game) this.push(room, i, stream);
    }

    disconnect(player, stream) {
        this.listeners.get(player.id)?.delete(stream);
        for (const r of this.rooms.values()) for (const s of r.seats) if (s && s.player.id === player.id) s.streams.delete(stream);
    }

    invitesFor(playerId) {
        return [...this.rooms.values()].filter((r) => r.status === "waiting" && r.invited && r.invited.id === playerId)
            .map((r) => ({ code: r.code, from: r.seats[0].player.pseudo, deck: r.seats[0].deck.name, until: r.created + INVITE_MS }));
    }

    sendInvites(playerId) {
        const list = this.invitesFor(playerId);
        for (const st of this.listeners.get(playerId) || []) st.send("invites", list);
    }

    reply(player, answer) {
        const room = this.roomOf(player);
        if (!room || !room.game) throw new HttpError(404, "Aucun duel en cours.");
        room.game.reply(this.seat(room, player), answer);
    }

    sendRoom(room, i, only = null) {
        const seat = room.seats[i], other = room.seats[1 - i];
        // player : numéro du joueur dans le moteur (les clés des cartes en dépendent), connu une fois le duel lancé
        const player = room.game ? (i === 0 ? room.game.me : room.game.bot) : i;
        const data = { status: room.status, code: room.code, random: room.random, invited: room.invited?.pseudo || null,
            until: room.created + (room.invited ? INVITE_MS : WAIT_MS), seat: i, player, me: seat.player.pseudo,
            opponent: other ? other.player.pseudo : null, deck: seat.deck.name, myExtra: seat.deck.extra, warning: seat.deck.warning || "" };
        for (const st of only ? [only] : seat.streams) st.send("room", data);
    }

    // Terrain (et question éventuelle) d'un joueur, avec les textes des cartes qu'il découvre et le délai de réponse.
    push(room, i, only = null) {
        const seat = room.seats[i], game = room.game;
        const state = game.view(i);
        const prompt = game.promptFor(i);
        const cards = {};
        const visit = (v) => {
            if (Array.isArray(v)) return v.forEach(visit);
            if (!v || typeof v !== "object") return;
            if (typeof v.code === "number" && v.code && !seat.sent.has(v.code)) {
                const row = this.engine.texts.get(v.code);
                if (row) { cards[v.code] = [row[1], row[2]]; seat.sent.add(v.code); }
            }
            Object.values(v).forEach(visit);
        };
        visit(state); visit(prompt);
        const P = game.pending;
        const wait = P && room.status !== "over" ? { mine: P.seat === i, until: P.until } : null;
        for (const st of only ? [only] : seat.streams) st.send("state", { state, prompt, cards, wait, over: room.status === "over" });
    }

    expire() {
        const now = Date.now();
        for (const r of [...this.rooms.values()]) {
            const limit = r.invited ? INVITE_MS : WAIT_MS;
            if (r.status === "waiting" && now - r.created > limit) this.close(r, r.invited ? "Invitation expirée." : "Code expiré.");
            else if (r.status === "over" && now - r.ended > KEEP_OVER_MS) this.close(r);
        }
    }
}

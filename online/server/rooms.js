// Salons de duel : création avec un code (EX-D1), file d'attente pour un adversaire au hasard (EX-D2), envoi du
// terrain et des questions à chaque joueur, reconnexion à un duel en cours.
import { randomBytes, randomInt } from "crypto";
import { HttpError } from "./http.js";
import { PvpGame } from "./pvp.js";

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";   // sans 0/O ni 1/I, faciles à confondre
const WAIT_MS = 30 * 60 * 1000, KEEP_OVER_MS = 60 * 60 * 1000;

export class Rooms {
    constructor(engine) {
        this.engine = engine;
        this.rooms = new Map();
        this.queue = null;                     // code du salon qui attend un adversaire au hasard
        setInterval(() => this.expire(), 60 * 1000).unref();
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

    create(player, deck, random = false) {
        this.free(player);
        let code;
        do code = Array.from({ length: 6 }, () => CODE_CHARS[randomInt(CODE_CHARS.length)]).join(""); while (this.rooms.has(code));
        const room = { code, random, status: "waiting", created: Date.now(), seats: [this.newSeat(player, deck), null], game: null };
        this.rooms.set(code, room);
        return room;
    }

    join(code, player, deck) {
        const room = this.rooms.get(String(code || "").trim().toUpperCase());
        if (!room || room.status !== "waiting") throw new HttpError(404, "Aucun duel n'attend avec ce code.");
        if (room.seats[0].player.id === player.id) throw new HttpError(400, "Tu ne peux pas rejoindre ton propre duel.");
        this.free(player);
        room.seats[1] = this.newSeat(player, deck);
        if (this.queue === room.code) this.queue = null;
        this.start(room);
        return room;
    }

    random(player, deck) {
        const waiting = this.queue && this.rooms.get(this.queue);
        if (waiting && waiting.status === "waiting" && waiting.seats[0].player.id !== player.id) return this.join(waiting.code, player, deck);
        const room = this.create(player, deck, true);
        this.queue = room.code;
        return room;
    }

    cancel(player) {
        const r = this.roomOf(player);
        if (r && r.status === "waiting") this.close(r);
    }

    close(room) {
        this.rooms.delete(room.code);
        if (this.queue === room.code) this.queue = null;
        for (const s of room.seats) if (s) for (const st of s.streams) st.send("room", { status: "closed" });
    }

    newSeat(player, deck) { return { player, deck, streams: new Set(), sent: new Set() }; }

    start(room) {
        const pseudos = room.seats.map((s) => s.player.pseudo);
        const game = new PvpGame(this.engine, {
            decks: room.seats.map((s) => s.deck), pseudos, seed: randomBytes(4).readUInt32LE() >>> 1, firstSeat: randomInt(2),
        });
        room.game = game;
        room.status = "playing";
        game.hooks = { update: () => room.seats.forEach((_, i) => this.push(room, i)), prompt: (i) => this.push(room, i) };
        room.seats.forEach((_, i) => this.sendRoom(room, i));
        const ui = { update: () => game.hooks.update(), pause: async () => {}, prompt: async () => null };
        game.run(ui).catch((e) => game.logs.forEach((l) => l.push({ who: null, text: `Erreur du moteur : ${e.message || e}`, tone: "cut" })))
            .finally(() => { room.status = "over"; room.ended = Date.now(); room.seats.forEach((_, i) => this.push(room, i)); });
    }

    // Un navigateur se connecte (ou se reconnecte) : il reçoit l'état du salon, le terrain et sa question en cours.
    connect(player, stream) {
        const room = [...this.rooms.values()].find((r) => r.seats.some((s) => s && s.player.id === player.id) && r.status !== "over")
            || [...this.rooms.values()].filter((r) => r.seats.some((s) => s && s.player.id === player.id)).sort((a, b) => b.created - a.created)[0];
        if (!room) return stream.send("room", { status: "none" });
        const i = this.seat(room, player);
        room.seats[i].streams.add(stream);
        room.seats[i].sent.clear();
        this.sendRoom(room, i, stream);
        if (room.game) this.push(room, i, stream);
    }

    disconnect(player, stream) {
        for (const r of this.rooms.values()) for (const s of r.seats) if (s && s.player.id === player.id) s.streams.delete(stream);
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
        const data = { status: room.status, code: room.code, random: room.random, seat: i, player,
            me: seat.player.pseudo, opponent: other ? other.player.pseudo : null, deck: seat.deck.name, myExtra: seat.deck.extra };
        for (const st of only ? [only] : seat.streams) st.send("room", data);
    }

    // Terrain (et question éventuelle) d'un joueur, avec les textes des cartes qu'il découvre.
    push(room, i, only = null) {
        const seat = room.seats[i];
        const state = room.game.view(i);
        const prompt = room.game.promptFor(i);
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
        for (const st of only ? [only] : seat.streams) st.send("state", { state, prompt, cards, over: room.status === "over" });
    }

    expire() {
        const now = Date.now();
        for (const r of [...this.rooms.values()]) {
            if ((r.status === "waiting" && now - r.created > WAIT_MS) || (r.status === "over" && now - r.ended > KEEP_OVER_MS)) this.close(r);
        }
    }
}

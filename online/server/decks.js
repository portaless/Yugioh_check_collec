// Decks jouables en ligne : ceux de l'appli locale de ce PC (jalon J1, avant la publication du jalon J2) et ceux
// collés au format .ydk, le format des simulateurs (#main, #extra, !side, un code de carte par ligne).
import { existsSync } from "fs";
import { DatabaseSync } from "node:sqlite";
import { HttpError } from "./http.js";

export function localDecks(dbPath) {
    if (!existsSync(dbPath)) return [];
    const db = new DatabaseSync(dbPath, { readOnly: true });
    try {
        const rows = db.prepare(`SELECT d.name, dc.card_id, dc.zone, dc.quantity FROM decks d
                                 JOIN deck_cards dc ON dc.deck_id = d.id ORDER BY d.name`).all();
        const decks = new Map();
        for (const r of rows) {
            if (!decks.has(r.name)) decks.set(r.name, { name: r.name, main: [], extra: [] });
            const d = decks.get(r.name);
            if (r.zone === "main" || r.zone === "extra") for (let i = 0; i < r.quantity; i++) d[r.zone].push(Number(r.card_id));
        }
        return [...decks.values()];
    } finally { db.close(); }
}

export function parseYdk(text) {
    const deck = { name: "Deck importé", main: [], extra: [] };
    let zone = null;
    for (const raw of String(text || "").split(/\r?\n/)) {
        const line = raw.trim();
        if (line === "#main") zone = "main";
        else if (line === "#extra") zone = "extra";
        else if (line.startsWith("!side")) zone = null;   // le Side Deck ne sert pas en duel simple
        else if (zone && /^\d+$/.test(line)) deck[zone].push(Number(line));   // les autres lignes sont des commentaires
    }
    return deck;
}

// Règles de construction de base (EX-K3) et cartes inconnues du moteur.
export function checkDeck(deck, knows) {
    const { main, extra } = deck;
    if (main.length < 40 || main.length > 60) throw new HttpError(400, `Main Deck : ${main.length} cartes (40 à 60).`);
    if (extra.length > 15) throw new HttpError(400, `Extra Deck : ${extra.length} cartes (15 au maximum).`);
    const count = new Map();
    for (const c of [...main, ...extra]) count.set(c, (count.get(c) || 0) + 1);
    const over = [...count].filter(([, n]) => n > 3);
    if (over.length) throw new HttpError(400, `Plus de 3 exemplaires : ${over.map(([c]) => c).join(", ")}.`);
    const unknown = [...count.keys()].filter((c) => !knows(c));
    if (unknown.length) throw new HttpError(400, `Cartes inconnues du moteur : ${unknown.slice(0, 10).join(", ")}.`);
    return { name: String(deck.name || "Deck").slice(0, 60), main: [...main], extra: [...extra] };
}

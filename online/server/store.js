// Stockage du serveur (SQLite intégré à Node) : identités des joueurs. Les collections, decks et amis sont dans
// library.js, sur la même base.
import { createHash, randomBytes } from "crypto";
import { mkdirSync } from "fs";
import { dirname } from "path";
import { DatabaseSync } from "node:sqlite";
import { HttpError } from "./http.js";

const PSEUDO = /^[\p{L}\p{N} _-]{3,24}$/u;
const hash = (key) => createHash("sha256").update(key).digest("hex");

export function openStore(path) {
    mkdirSync(dirname(path), { recursive: true });
    const db = new DatabaseSync(path);
    db.exec(`CREATE TABLE IF NOT EXISTS players (
        id INTEGER PRIMARY KEY,
        pseudo TEXT NOT NULL UNIQUE COLLATE NOCASE,
        key_hash TEXT NOT NULL UNIQUE,
        created TEXT NOT NULL DEFAULT (datetime('now'))
    )`);
    return {
        // Nouvelle identité : la clé n'est rendue qu'une fois, le serveur n'en garde que l'empreinte.
        createPlayer(pseudo) {
            pseudo = String(pseudo || "").trim();
            if (!PSEUDO.test(pseudo)) throw new HttpError(400, "Pseudo : 3 à 24 caractères (lettres, chiffres, espace, tiret).");
            if (db.prepare("SELECT 1 FROM players WHERE pseudo = ?").get(pseudo)) throw new HttpError(409, "Ce pseudo est déjà pris.");
            const key = randomBytes(24).toString("base64url");
            const { lastInsertRowid } = db.prepare("INSERT INTO players (pseudo, key_hash) VALUES (?, ?)").run(pseudo, hash(key));
            return { player: { id: Number(lastInsertRowid), pseudo }, key };
        },
        db,
        playerByKey(key) {
            if (!key) return null;
            const row = db.prepare("SELECT id, pseudo FROM players WHERE key_hash = ?").get(hash(key));
            return row ? { id: Number(row.id), pseudo: row.pseudo } : null;
        },
        playerByPseudo(pseudo) {
            const row = db.prepare("SELECT id, pseudo FROM players WHERE pseudo = ?").get(String(pseudo || "").trim());
            return row ? { id: Number(row.id), pseudo: row.pseudo } : null;
        },
        close() { db.close(); },
    };
}

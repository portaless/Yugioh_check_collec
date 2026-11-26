// Client en ligne, partie échanges avec le serveur. Ce fichier, duel_online.js, le plateau partagé
// (ygo/ui/web/duel_meta_*.js) et lobby.js sont assemblés en un seul script par le serveur (/app.js).

async function api(method, path, body) {
    const r = await fetch(path, {
        method, credentials: "same-origin",
        headers: body ? { "Content-Type": "application/json" } : {},
        body: body ? JSON.stringify(body) : undefined,
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data.error || `Erreur ${r.status}`);
    return data;
}

const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const LOC = { DECK: 1, HAND: 2, MZONE: 4, SZONE: 8, GRAVE: 16, REMOVED: 32, EXTRA: 64 };
const PILES = { 1: "Deck", 16: "Cimetière", 32: "Bannies", 64: "Extra Deck", 2: "Main" };

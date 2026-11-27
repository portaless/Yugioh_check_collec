// Briques HTTP sans dépendance : lecture du JSON, réponses, flux d'événements (SSE), fichiers statiques, cookies.
import { readFileSync, statSync } from "fs";
import { extname } from "path";

const MAX_BODY = 256 * 1024;   // requêtes ordinaires ; la publication d'une collection a droit à plus (EX-T3)
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "application/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml" };

export class HttpError extends Error {
    constructor(status, message) { super(message); this.status = status; }
}

export function readJson(req, max = MAX_BODY) {
    return new Promise((resolve, reject) => {
        let size = 0;
        const chunks = [];
        req.on("data", (c) => {
            size += c.length;
            if (size > max) { reject(new HttpError(413, "Requête trop grande.")); req.destroy(); return; }
            chunks.push(c);
        });
        req.on("end", () => {
            if (!chunks.length) return resolve({});
            try { resolve(JSON.parse(Buffer.concat(chunks).toString("utf8"))); }
            catch { reject(new HttpError(400, "JSON invalide.")); }
        });
        req.on("error", reject);
    });
}

export function sendJson(res, status, data, headers = {}) {
    res.writeHead(status, { "Content-Type": TYPES[".json"], "Cache-Control": "no-store", ...headers });
    res.end(JSON.stringify(data));
}

export function sendText(res, status, type, body) {
    res.writeHead(status, { "Content-Type": TYPES[type] || "text/plain; charset=utf-8", "Cache-Control": "no-cache" });
    res.end(body);
}

export function sendFile(res, path) {
    try {
        if (!statSync(path).isFile()) throw new Error();
    } catch { return sendJson(res, 404, { error: "Introuvable." }); }
    sendText(res, 200, extname(path), readFileSync(path));
}

// Flux d'événements vers un navigateur : send(type, données) ; un commentaire régulier garde la connexion ouverte.
export function openStream(req, res) {
    res.writeHead(200, { "Content-Type": "text/event-stream", "Cache-Control": "no-store", Connection: "keep-alive" });
    res.write(": ouvert\n\n");
    const ping = setInterval(() => res.write(": ping\n\n"), 25000);
    const stream = {
        closed: false,
        send(type, data) { if (!stream.closed) res.write(`event: ${type}\ndata: ${JSON.stringify(data)}\n\n`); },
    };
    req.on("close", () => { stream.closed = true; clearInterval(ping); });
    return stream;
}

// Clé d'identité : cookie du navigateur, ou en-tête « Authorization: Bearer » pour l'appli locale (EX-I2).
export function identityKey(req) {
    const auth = /^Bearer\s+(\S+)$/.exec(req.headers.authorization || "");
    return auth ? auth[1] : cookies(req).ygo_key;
}

export function cookies(req) {
    const out = {};
    for (const part of (req.headers.cookie || "").split(";")) {
        const i = part.indexOf("=");
        if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
    }
    return out;
}

// Cookie d'identité : illisible par le JavaScript de la page, envoyé seulement par ce site (EX-I1).
export function identityCookie(key) {
    return `ygo_key=${encodeURIComponent(key)}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${60 * 60 * 24 * 400}`;
}

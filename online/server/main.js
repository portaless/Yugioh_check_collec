// Serveur en ligne (jalon J1) : identité, decks, salons de duel et pages du client web.
// Lancement : `cd engine && npm run online` (http://127.0.0.1:8600 ; variables PORT et HOST pour changer).
import { readFileSync } from "fs";
import { createServer } from "http";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { loadEngine } from "../../engine/src/loader.js";
import { checkDeck, localDecks, parseYdk } from "./decks.js";
import { HttpError, cookies, identityCookie, openStream, readJson, sendFile, sendJson, sendText } from "./http.js";
import { Rooms } from "./rooms.js";
import { openStore } from "./store.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const WEB = join(ROOT, "online", "web"), SHARED = join(ROOT, "ygo", "ui", "web");
const APP_DB = join(ROOT, "data", "yugioh.db");
// client : utilitaires et connexion, puis le plateau partagé avec le duel local, puis l'accueil
const CLIENT = [join(WEB, "api.js"), join(WEB, "duel_online.js"), join(SHARED, "duel_meta_board.js"),
    join(SHARED, "duel_meta_dialogs.js"), join(SHARED, "duel_meta_input.js"), join(WEB, "lobby.js")];

async function main() {
    const base = join(ROOT, "static", "engine") + "/";
    const engine = await loadEngine(base, async (file, type) => {
        const b = readFileSync(base + file);
        return type === "text" ? b.toString("utf8") : b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
    });
    const store = openStore(join(ROOT, "online", "data", "online.sqlite"));
    const rooms = new Rooms(engine);
    const knows = (code) => engine.texts.has(code);

    const me = (req) => store.playerByKey(cookies(req).ygo_key);
    const need = (req) => {
        const p = me(req);
        if (!p) throw new HttpError(401, "Choisis d'abord un pseudo.");
        return p;
    };
    const pickDeck = (body) => {
        if (body.ydk) return checkDeck(parseYdk(body.ydk), knows);
        const d = localDecks(APP_DB).find((x) => x.name === body.deck);
        if (!d) throw new HttpError(400, "Choisis un deck.");
        return checkDeck(d, knows);
    };

    const routes = {
        "GET /": (req, res) => sendFile(res, join(WEB, "index.html")),
        "GET /app.js": (req, res) => sendText(res, 200, ".js", CLIENT.map((f) => readFileSync(f, "utf8")).join("\n")),
        "GET /style.css": (req, res) => sendFile(res, join(WEB, "style.css")),
        "GET /duel.css": (req, res) => sendFile(res, join(SHARED, "duel_meta.css")),
        "GET /api/me": (req, res) => sendJson(res, 200, { player: me(req) }),
        "POST /api/me": async (req, res) => {
            const { player, key } = store.createPlayer((await readJson(req)).pseudo);
            sendJson(res, 201, { player }, { "Set-Cookie": identityCookie(key) });
        },
        "GET /api/decks": (req, res) => sendJson(res, 200, { decks: localDecks(APP_DB)
            .map((d) => ({ name: d.name, main: d.main.length, extra: d.extra.length,
                ok: d.main.length >= 40 && d.main.length <= 60 && d.extra.length <= 15 })) }),
        "GET /api/cardnames": (req, res) => sendJson(res, 200, { names: engine.names }),
        "POST /api/duel": async (req, res) => {
            const player = need(req), body = await readJson(req), deck = pickDeck(body);
            const room = body.mode === "join" ? rooms.join(body.code, player, deck)
                : body.mode === "random" ? rooms.random(player, deck) : rooms.create(player, deck);
            sendJson(res, 200, { code: room.code, status: room.status });
        },
        "POST /api/duel/cancel": (req, res) => { rooms.cancel(need(req)); sendJson(res, 200, { ok: true }); },
        "POST /api/duel/answer": async (req, res) => {
            rooms.reply(need(req), (await readJson(req)).answer);
            sendJson(res, 200, { ok: true });
        },
        "GET /api/duel/events": (req, res) => {
            const player = need(req), stream = openStream(req, res);
            rooms.connect(player, stream);
            req.on("close", () => rooms.disconnect(player, stream));
        },
    };

    const server = createServer(async (req, res) => {
        const route = routes[`${req.method} ${req.url.split("?")[0]}`];
        try {
            if (!route) throw new HttpError(404, "Introuvable.");
            await route(req, res);
        } catch (e) {
            if (!res.headersSent) sendJson(res, e.status || 500, { error: e.status ? e.message : "Erreur du serveur." });
            if (!e.status) console.error(e);
        }
    });
    const port = +(process.env.PORT || 8600), host = process.env.HOST || "127.0.0.1";
    server.listen(port, host, () => console.log(`Serveur en ligne prêt : http://${host}:${port}`));
}

main();

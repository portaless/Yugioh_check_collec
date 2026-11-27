// Serveur en ligne : identité, collections et decks publiés, amis, salons de duel et pages du client web.
// Lancement : `cd engine && npm run online` (http://127.0.0.1:8600 ; variables PORT et HOST pour changer).
import { readFileSync } from "fs";
import { createServer } from "http";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { loadEngine } from "../../engine/src/loader.js";
import { checkDeck, parseYdk, playable } from "./decks.js";
import { HttpError, cookies, identityCookie, identityKey, openStream, readJson, sendFile, sendJson, sendText } from "./http.js";
import { openLibrary } from "./library.js";
import { Rooms } from "./rooms.js";
import { openStore } from "./store.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const WEB = join(ROOT, "online", "web"), SHARED = join(ROOT, "ygo", "ui", "web");
// client : utilitaires et connexion, puis le plateau partagé avec le duel local, puis les pages
const CLIENT = [join(WEB, "api.js"), join(WEB, "duel_online.js"), join(SHARED, "duel_meta_board.js"),
    join(SHARED, "duel_meta_dialogs.js"), join(SHARED, "duel_meta_input.js"), join(WEB, "lobby.js"),
    join(WEB, "collections.js"), join(WEB, "account.js"), join(WEB, "pages.js")];
// pages du client : toutes servies par index.html, le script choisit selon l'adresse
const PAGES = /^\/(collections|compte|c\/[^/]+)?$/;
const MAX_PUBLISH = 8 * 1024 * 1024;

async function main() {
    const base = join(ROOT, "static", "engine") + "/";
    const engine = await loadEngine(base, async (file, type) => {
        const b = readFileSync(base + file);
        return type === "text" ? b.toString("utf8") : b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
    });
    const store = openStore(join(ROOT, "online", "data", "online.sqlite"));
    const names = new Map(engine.names);
    const library = openLibrary(store.db, store, (code) => names.get(code) || "");
    const rooms = new Rooms(engine);
    const knows = (code) => engine.texts.has(code);

    const me = (req) => store.playerByKey(identityKey(req));
    const need = (req) => {
        const p = me(req);
        if (!p) throw new HttpError(401, "Choisis d'abord un pseudo.");
        return p;
    };
    const pickDeck = (player, body) => {
        if (body.ydk) return checkDeck(parseYdk(body.ydk), knows);
        const d = library.myDecks(player).find((x) => x.name === body.deck);
        if (!d) throw new HttpError(400, "Choisis un deck (publie tes decks depuis l'appli, page Partage en ligne).");
        return checkDeck(d, knows);
    };

    const routes = {
        "GET /app.js": (req, res) => sendText(res, 200, ".js", CLIENT.map((f) => readFileSync(f, "utf8")).join("\n")),
        "GET /style.css": (req, res) => sendFile(res, join(WEB, "style.css")),
        "GET /duel.css": (req, res) => sendFile(res, join(SHARED, "duel_meta.css")),
        "GET /api/me": (req, res) => sendJson(res, 200, { player: me(req) }),
        "POST /api/me": async (req, res) => {
            const { player, key } = store.createPlayer((await readJson(req)).pseudo);
            sendJson(res, 201, { player }, { "Set-Cookie": identityCookie(key) });
        },
        // la clé n'est rendue qu'au navigateur qui la possède déjà, pour la copier dans l'appli locale
        "GET /api/key": (req, res) => { need(req); sendJson(res, 200, { key: cookies(req).ygo_key || null }); },
        "GET /api/decks": (req, res) => sendJson(res, 200, { decks: library.myDecks(need(req))
            .map((d) => ({ name: d.name, main: d.main.length, extra: d.extra.length, ok: playable(d, knows) })) }),
        "GET /api/mine": (req, res) => {
            const player = need(req);
            sendJson(res, 200, { player, ...library.mine(player), friends: library.friends(player) });
        },
        "POST /api/publish": async (req, res) => sendJson(res, 200, library.publish(need(req), await readJson(req, MAX_PUBLISH))),
        "POST /api/visibility": async (req, res) => {
            library.setVisibility(need(req), (await readJson(req)).visibility);
            sendJson(res, 200, { ok: true });
        },
        "POST /api/friends": async (req, res) => {
            const player = need(req), body = await readJson(req);
            if (body.remove) library.removeFriend(player, body.pseudo); else library.addFriend(player, body.pseudo);
            sendJson(res, 200, { friends: library.friends(player) });
        },
        "GET /api/collections": (req, res) => sendJson(res, 200, { collections: library.directory(me(req)) }),
        "GET /api/collection": (req, res) => {
            const pseudo = new URL(req.url, "http://x").searchParams.get("pseudo");
            sendJson(res, 200, library.collection(me(req), pseudo));
        },
        "GET /api/cardnames": (req, res) => sendJson(res, 200, { names: engine.names }),
        "POST /api/duel": async (req, res) => {
            const player = need(req), body = await readJson(req), deck = pickDeck(player, body);
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
        const path = req.url.split("?")[0];
        const route = routes[`${req.method} ${path}`] || (req.method === "GET" && PAGES.test(path)
            ? (rq, rs) => sendFile(rs, join(WEB, "index.html")) : null);
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

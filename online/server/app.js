// Routes du serveur en ligne : pages du client web, identité, collections et decks publiés, amis, salons de duel.
// Sans réseau ni moteur chargé ici : main.js fournit le moteur et écoute ; les tests créent leur propre serveur.
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { checkDeck, importYdk, playable } from "./decks.js";
import { HttpError, cookies, identityCookie, identityKey, openStream, readJson, sendFile, sendJson, sendText } from "./http.js";
import { openLibrary } from "./library.js";
import { limiter } from "./limits.js";
import { Rooms } from "./rooms.js";
import { openStore } from "./store.js";

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const WEB = join(ROOT, "online", "web"), SHARED = join(ROOT, "ygo", "ui", "web");
// client : utilitaires et connexion, puis le plateau partagé avec le duel local, puis les pages
const CLIENT = [join(WEB, "api.js"), join(WEB, "duel_online.js"), join(SHARED, "duel_meta_board.js"),
    join(SHARED, "duel_meta_dialogs.js"), join(SHARED, "duel_meta_input.js"), join(WEB, "lobby.js"),
    join(WEB, "collections.js"), join(WEB, "account.js"), join(WEB, "pages.js")];
// pages du client : toutes servies par index.html, le script choisit selon l'adresse
const PAGES = /^\/(collections|compte|a-propos|c\/[^/]+)?$/;
const MAX_PUBLISH = 8 * 1024 * 1024;
const MIN = 60e3, HOUR = 3600e3;

// options : dbPath (base SQLite), secure (HTTPS), answerMs (délai de réponse en duel)
export function createApp(engine, { dbPath, secure = false, answerMs } = {}) {
    const store = openStore(dbPath);
    const names = new Map(engine.names);
    const library = openLibrary(store.db, store, (code) => names.get(code) || "");
    const rooms = new Rooms(engine, { answerMs });
    const knows = (code) => engine.texts.has(code);
    const limit = limiter();
    const ip = (req) => req.socket.remoteAddress || "?";

    const me = (req) => store.playerByKey(identityKey(req));
    const need = (req) => {
        const p = me(req);
        if (!p) throw new HttpError(401, "Choisis d'abord un pseudo.");
        return p;
    };
    const pickDeck = (player, body) => {
        if (body.ydk) return importYdk(body.ydk, knows);
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
            limit("pseudo", ip(req), 10, HOUR);
            const { player, key } = store.createPlayer((await readJson(req)).pseudo);
            sendJson(res, 201, { player }, { "Set-Cookie": identityCookie(key, secure) });
        },
        // identité récupérée sur un autre appareil avec sa clé (EX-I3)
        "POST /api/login": async (req, res) => {
            limit("login", ip(req), 10, 10 * MIN);
            const key = String((await readJson(req)).key || "").trim();
            const player = store.playerByKey(key);
            if (!player) throw new HttpError(404, "Clé inconnue : vérifie qu'elle est copiée en entier.");
            sendJson(res, 200, { player }, { "Set-Cookie": identityCookie(key, secure) });
        },
        // la clé n'est rendue qu'au navigateur qui la possède déjà, pour la copier dans l'appli locale
        "GET /api/key": (req, res) => { need(req); sendJson(res, 200, { key: cookies(req).ygo_key || null }); },
        "GET /api/decks": (req, res) => sendJson(res, 200, { decks: library.myDecks(need(req))
            .map((d) => ({ name: d.name, main: d.main.length, extra: d.extra.length, ok: playable(d, knows) })) }),
        "GET /api/mine": (req, res) => {
            const player = need(req);
            sendJson(res, 200, { player, ...library.mine(player), friends: library.friends(player) });
        },
        "POST /api/publish": async (req, res) => {
            const player = need(req);
            limit("publish", player.id, 20, HOUR);
            sendJson(res, 200, library.publish(player, await readJson(req, MAX_PUBLISH)));
        },
        "POST /api/visibility": async (req, res) => {
            library.setVisibility(need(req), (await readJson(req)).visibility);
            sendJson(res, 200, { ok: true });
        },
        "POST /api/friends": async (req, res) => {
            const player = need(req), body = await readJson(req);
            limit("friends", player.id, 60, HOUR);
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
            const player = need(req), body = await readJson(req);
            limit("duel", player.id, 30, 10 * MIN);
            const deck = pickDeck(player, body);
            const room = body.mode === "join" ? rooms.join(body.code, player, deck)
                : body.mode === "random" ? rooms.random(player, deck)
                : body.mode === "invite" ? rooms.invite(player, deck, store.playerByPseudo(body.pseudo))
                : rooms.create(player, deck);
            sendJson(res, 200, { code: room.code, status: room.status, warning: deck.warning || "" });
        },
        "POST /api/duel/cancel": (req, res) => { rooms.cancel(need(req)); sendJson(res, 200, { ok: true }); },
        "POST /api/duel/decline": async (req, res) => {
            rooms.decline(need(req), (await readJson(req)).code);
            sendJson(res, 200, { ok: true });
        },
        "POST /api/duel/forfeit": (req, res) => { rooms.forfeit(need(req)); sendJson(res, 200, { ok: true }); },
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

    const handle = async (req, res) => {
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
    };
    return { handle, store, rooms };
}

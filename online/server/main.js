// Démarrage du serveur en ligne : charge le moteur, puis écoute en HTTP sur ce PC, ou en HTTPS (EX-T3).
// Lancement : `npm --prefix engine run online` (http://127.0.0.1:8600). Hébergement : voir online/DEPLOIEMENT.md.
// Variables :
// - PORT, HOST (adresse d'écoute), ONLINE_DB (base SQLite) ;
// - TLS_CERT et TLS_KEY (fichiers PEM) : le serveur fait lui-même le HTTPS ;
// - BEHIND_PROXY=1 : l'hébergeur fait le HTTPS devant le serveur (Render, Fly.io…) ;
// - BACKUP_DIR : sauvegarde de la base au démarrage puis chaque jour (par défaut online/data/sauvegardes).
// Hors de ce PC (HOST autre que 127.0.0.1, localhost ou ::1), le serveur refuse de démarrer sans HTTPS.
import { readFileSync } from "fs";
import { createServer } from "http";
import { createServer as createTlsServer } from "https";
import { dirname, join } from "path";
import { loadEngine } from "../../engine/src/loader.js";
import { ROOT, createApp } from "./app.js";
import { loadBanlists } from "./banlist.js";

const LOCAL = ["127.0.0.1", "localhost", "::1"];
const DAY = 24 * 3600e3;

async function main() {
    const env = process.env;
    const port = +(env.PORT || 8600), host = env.HOST || "127.0.0.1", proxy = env.BEHIND_PROXY === "1";
    const tls = env.TLS_CERT && env.TLS_KEY ? { cert: readFileSync(env.TLS_CERT), key: readFileSync(env.TLS_KEY) } : null;
    if (!tls && !proxy && !LOCAL.includes(host)) {
        console.error(`HTTPS obligatoire pour écouter sur ${host} : indique TLS_CERT et TLS_KEY (fichiers PEM), `
            + "ou BEHIND_PROXY=1 si l'hébergeur fait le HTTPS.");
        process.exit(1);
    }
    const base = join(ROOT, "static", "engine") + "/";
    const engine = await loadEngine(base, async (file, type) => {
        const b = readFileSync(base + file);
        return type === "text" ? b.toString("utf8") : b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
    });
    const dbPath = env.ONLINE_DB || join(ROOT, "online", "data", "online.sqlite");
    const banlists = loadBanlists(join(base, "data", "lflist.conf"));
    const { handle, store } = createApp(engine, { dbPath, secure: !!tls || proxy, proxy, banlists,
        answerMs: env.ANSWER_MS ? +env.ANSWER_MS : undefined });
    if (env.BACKUP_DIR !== "") {
        const dir = env.BACKUP_DIR || join(dirname(dbPath), "sauvegardes");
        const save = () => { try { console.log(`Sauvegarde : ${store.backup(dir)}`); } catch (e) { console.error("Sauvegarde impossible :", e.message); } };
        save();
        setInterval(save, DAY).unref();
    }
    const server = tls ? createTlsServer(tls, handle) : createServer(handle);
    server.listen(port, host, () => {
        const { port: real } = server.address();
        console.log(`Listes de cartes interdites : ${Object.values(banlists).map((l) => l.name).join(", ") || "aucune (lflist.conf absent)"}`);
        console.log(`Serveur en ligne prêt : ${tls ? "https" : "http"}://${host}:${real}`);
    });
}

main();

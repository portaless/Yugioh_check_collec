// Démarrage du serveur en ligne : charge le moteur, puis écoute en HTTP sur ce PC, ou en HTTPS (EX-T3).
// Lancement : `npm --prefix engine run online` (http://127.0.0.1:8600).
// Variables : PORT, HOST (adresse d'écoute), ONLINE_DB (base SQLite), TLS_CERT et TLS_KEY (fichiers PEM du certificat).
// Hors de ce PC (HOST autre que 127.0.0.1, localhost ou ::1), le serveur refuse de démarrer sans certificat.
import { readFileSync } from "fs";
import { createServer } from "http";
import { createServer as createTlsServer } from "https";
import { join } from "path";
import { loadEngine } from "../../engine/src/loader.js";
import { ROOT, createApp } from "./app.js";

const LOCAL = ["127.0.0.1", "localhost", "::1"];

async function main() {
    const port = +(process.env.PORT || 8600), host = process.env.HOST || "127.0.0.1";
    const tls = process.env.TLS_CERT && process.env.TLS_KEY
        ? { cert: readFileSync(process.env.TLS_CERT), key: readFileSync(process.env.TLS_KEY) } : null;
    if (!tls && !LOCAL.includes(host)) {
        console.error(`HTTPS obligatoire pour écouter sur ${host} : indique TLS_CERT et TLS_KEY (fichiers PEM).`);
        process.exit(1);
    }
    const base = join(ROOT, "static", "engine") + "/";
    const engine = await loadEngine(base, async (file, type) => {
        const b = readFileSync(base + file);
        return type === "text" ? b.toString("utf8") : b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
    });
    const { handle } = createApp(engine, {
        dbPath: process.env.ONLINE_DB || join(ROOT, "online", "data", "online.sqlite"),
        secure: !!tls, answerMs: process.env.ANSWER_MS ? +process.env.ANSWER_MS : undefined,
    });
    const server = tls ? createTlsServer(tls, handle) : createServer(handle);
    server.listen(port, host, () => {
        const { port: real } = server.address();
        console.log(`Serveur en ligne prêt : ${tls ? "https" : "http"}://${host}:${real}`);
    });
}

main();

// Outils des tests du serveur en ligne : lancement d'un serveur compilé sur une base neuve, appels à l'API avec la clé
// en en-tête, flux d'événements, et un joueur automatique qui répond à toutes les questions du duel.
import { spawn } from "child_process";
import { mkdtempSync, rmSync } from "fs";
import { tmpdir } from "os";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const SERVER = join(dirname(fileURLToPath(import.meta.url)), "..", "server", "out.cjs");

// Serveur sur un port libre, base SQLite temporaire ; stop() l'arrête et efface la base.
export async function startServer(env = {}) {
    const dir = mkdtempSync(join(tmpdir(), "ygo-online-"));
    const proc = spawn(process.execPath, [SERVER], { env: { ...process.env, PORT: "0", ONLINE_DB: join(dir, "t.sqlite"), BACKUP_DIR: join(dir, "b"), ...env } });
    const url = await new Promise((resolve, reject) => {
        let out = "";
        proc.stdout.on("data", (d) => { out += d; const m = /(http:\/\/[^\s]+)/.exec(out); if (m) resolve(m[1]); });
        proc.stderr.on("data", (d) => { out += d; });
        proc.on("exit", (code) => reject(new Error(`serveur arrêté (${code}) : ${out}`)));
    });
    return { url, stop: () => { proc.kill(); setTimeout(() => rmSync(dir, { recursive: true, force: true }), 500); } };
}

export function client(url, key = null) {
    const call = async (method, path, body) => {
        const r = await fetch(url + path, { method, headers: { ...(key ? { Authorization: `Bearer ${key}` } : {}),
            ...(body ? { "Content-Type": "application/json" } : {}) }, body: body ? JSON.stringify(body) : undefined });
        return { status: r.status, data: await r.json().catch(() => ({})), headers: r.headers };
    };
    return { call, get: (p) => call("GET", p), post: (p, b = {}) => call("POST", p, b) };
}

export async function newPlayer(url, pseudo) {
    const r = await client(url).post("/api/me", { pseudo });
    if (r.status !== 201) throw new Error(`pseudo ${pseudo} : ${r.status} ${JSON.stringify(r.data)}`);
    const key = decodeURIComponent(/ygo_key=([^;]+)/.exec(r.headers.get("set-cookie"))[1]);
    return { pseudo, key, api: client(url, key) };
}

// Flux d'événements d'un joueur : events[type] = dernière donnée reçue, next(type, test) attend un événement.
export function stream(url, key, path = "/api/duel/events") {
    const ctrl = new AbortController();
    const last = {}, waiters = [];
    const emit = (type, data) => {
        last[type] = data;
        for (const w of [...waiters]) if (w.type === type && w.test(data)) { waiters.splice(waiters.indexOf(w), 1); w.resolve(data); }
        s.on?.(type, data);
    };
    const s = {
        last, on: null, close: () => ctrl.abort(),
        next: (type, test = () => true, ms = 10000) => new Promise((resolve, reject) => {
            if (last[type] !== undefined && test(last[type])) return resolve(last[type]);
            const w = { type, test, resolve };
            waiters.push(w);
            setTimeout(() => { if (waiters.includes(w)) reject(new Error(`pas d'événement ${type} attendu`)); }, ms).unref();
        }),
    };
    fetch(url + path, { headers: key ? { Authorization: `Bearer ${key}` } : {}, signal: ctrl.signal }).then(async (r) => {
        const decoder = new TextDecoder();
        let buf = "";
        for await (const chunk of r.body) {
            buf += decoder.decode(chunk, { stream: true });
            let i;
            while ((i = buf.indexOf("\n\n")) >= 0) {
                const block = buf.slice(0, i); buf = buf.slice(i + 2);
                const type = /^event: (.*)$/m.exec(block)?.[1], data = /^data: (.*)$/m.exec(block)?.[1];
                if (type && data) emit(type, JSON.parse(data));
            }
        }
    }).catch(() => {});
    return s;
}

// Réponse la plus passive possible : fin du tour, ne rien activer, refuser, première option, premières cartes.
export function passiveAnswer(q) {
    if (q.kind === "actions") {
        const b = q.buttons.find((x) => /Fin du tour|Ne rien activer/.test(x.label)) || q.buttons[0];
        return b ? b.response : q.actions[0].response;
    }
    if (q.kind === "yesno") return q.no;
    if (q.kind === "choose") return q.options[0].response;
    if (q.kind === "cards") return { build: Array.from({ length: Math.max(1, q.min) }, (_, i) => i) };
    if (q.kind === "place") return { build: q.places.slice(0, q.count) };
    if (q.kind === "announce") return { build: 89631139 };
    throw new Error(`question inconnue : ${q.kind}`);
}

// Joueur automatique : répond une seule fois à chaque question qui lui est posée, jusqu'à la fin du duel.
export function autoPlay(player, events, answer = passiveAnswer) {
    let done = 0;
    events.on = (type, msg) => {
        if (type !== "state" || !msg.prompt || msg.prompt.id <= done || msg.over) return;
        done = msg.prompt.id;
        player.api.post("/api/duel/answer", { answer: answer(msg.prompt) });
    };
    if (events.last.state) events.on("state", events.last.state);
}

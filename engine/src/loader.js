// Chargement du moteur dans le navigateur : WebAssembly, scripts des cartes, base de cartes et messages français.
import { createOcgcoreWrapper, SqljsCardReader, ZipScriptReader } from "koishipro-core.js";
import initSqlJs from "sql.js/dist/sql-wasm-browser.js";

export async function loadEngine(base) {
    const get = async (file, type) => {
        const r = await fetch(base + file);
        if (!r.ok) throw new Error(`${file} : ${r.status}`);
        return r[type]();
    };
    const [wasm, sqlWasm, scripts, cdb, strings] = await Promise.all([
        get("libocgcore.wasm", "arrayBuffer"), get("sql-wasm-browser.wasm", "arrayBuffer"),
        get("data/script.zip", "arrayBuffer"), get("data/cards.cdb", "arrayBuffer"), get("data/strings.conf", "text"),
    ]);
    const wrapper = await createOcgcoreWrapper({ wasmBinary: new Uint8Array(wasm) });
    wrapper.setScriptReader(await ZipScriptReader(new Uint8Array(scripts)), true);
    const SQL = await initSqlJs({ wasmBinary: new Uint8Array(sqlWasm) });
    const db = new SQL.Database(new Uint8Array(cdb));
    wrapper.setCardReader(SqljsCardReader(db));
    const errors = [];
    wrapper.setMessageHandler((_d, msg, type) => { if (type === 1) errors.push(msg); }, true);
    const texts = new Map();
    for (const row of db.exec("SELECT * FROM texts")[0].values) texts.set(row[0], row);
    const system = new Map();
    for (const line of strings.split(/\r?\n/)) {
        const m = line.match(/^!system (\d+) (.*)$/);
        if (m) system.set(+m[1], m[2]);
    }
    const names = db.exec("SELECT id, name FROM texts")[0].values;
    const stats = new Map(db.exec("SELECT id, atk FROM datas")[0].values);
    return { wrapper, texts, system, errors, names, stats };
}

// Télécharge les données du moteur dans static/engine/data, comme `python -m ygo.engine_data`, mais sans Python :
// pour construire le serveur en ligne chez un hébergeur (Dockerfile). Scripts des cartes sous GPL-2.0.
const fs = require("node:fs");
const path = require("node:path");
const JSZip = require("jszip");

const DATA = process.env.ENGINE_DATA || path.join(__dirname, "..", "static", "engine", "data");
const RAW = "https://raw.githubusercontent.com";
const FILES = {
    "cards.cdb": `${RAW}/mycard/ygopro-database/master/locales/fr-FR/cards.cdb`,
    "strings.conf": `${RAW}/mycard/ygopro-database/master/locales/fr-FR/strings.conf`,
    "lflist.conf": `${RAW}/Fluorohydride/ygopro/master/lflist.conf`,
};
const SCRIPTS = "https://codeload.github.com/Fluorohydride/ygopro-scripts/zip/refs/heads/master";

async function get(url) {
    const r = await fetch(url, { headers: { "User-Agent": "yugioh-collection-perso/1.0" } });
    if (!r.ok) throw new Error(`${url} : ${r.status}`);
    return Buffer.from(await r.arrayBuffer());
}

(async () => {
    fs.mkdirSync(DATA, { recursive: true });
    for (const [name, url] of Object.entries(FILES)) {
        console.log(`${name}…`);
        fs.writeFileSync(path.join(DATA, name), await get(url));
    }
    console.log("Scripts des cartes…");
    const src = await JSZip.loadAsync(await get(SCRIPTS)), out = new JSZip();
    let n = 0;
    for (const entry of Object.values(src.files)) {
        if (entry.dir || !entry.name.endsWith(".lua")) continue;
        out.file(`script/${entry.name.split("/").pop()}`, await entry.async("uint8array"));   // rangés sous script/
        n += 1;
    }
    fs.writeFileSync(path.join(DATA, "script.zip"), await out.generateAsync({ type: "nodebuffer", compression: "DEFLATE" }));
    fs.writeFileSync(path.join(DATA, "version.json"), JSON.stringify({ date: new Date().toISOString().slice(0, 10), scripts: n }));
    console.log(`${n} scripts de cartes.`);
})().catch((e) => { console.error(e.message); process.exit(1); });

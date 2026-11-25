// Copie les fichiers WebAssembly du moteur et de sql.js à côté du bundle (static/engine/).
const fs = require("node:fs");
const path = require("node:path");
const out = path.join(__dirname, "..", "static", "engine");
for (const file of ["koishipro-core.js/dist/vendor/wasm_esm/libocgcore.wasm", "sql.js/dist/sql-wasm-browser.wasm"]) {
    fs.copyFileSync(path.join(__dirname, "node_modules", file), path.join(out, path.basename(file)));
}
console.log("wasm copiés dans", out);

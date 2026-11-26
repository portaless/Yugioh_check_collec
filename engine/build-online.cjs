// Compile le serveur en ligne (online/server/main.js) en un seul fichier pour Node, avec le moteur de engine/src.
// import.meta.url est remplacé par le chemin du fichier compilé (le moteur WebAssembly s'en sert).
const path = require("path");
require("esbuild").buildSync({
    entryPoints: [path.join(__dirname, "..", "online", "server", "main.js")],
    outfile: path.join(__dirname, "..", "online", "server", "out.cjs"),
    bundle: true, platform: "node", format: "cjs", logLevel: "warning",
    banner: { js: 'const __importMetaUrl = require("url").pathToFileURL(__filename).href;' },
    define: { "import.meta.url": "__importMetaUrl" },
});

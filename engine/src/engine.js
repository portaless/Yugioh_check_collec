// Moteur de règles du duel (page Duel contre la méta) : YGOPro compilé en WebAssembly (koishipro-core.js).
// Le moteur applique toutes les règles et les effets des cartes (scripts Lua) et pose des questions aux joueurs ;
// game.js fait tourner la partie, questions.js traduit les questions pour l'interface, bot.js joue l'adversaire.
// Construit par `npm run build` dans static/engine/engine.js.
export { C, K, LOC, POS } from "./constants.js";
export { Game } from "./game.js";
export { loadEngine } from "./loader.js";
export { makeTexts } from "./texts.js";

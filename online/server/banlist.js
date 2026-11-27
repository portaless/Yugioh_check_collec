// Listes des cartes interdites et limitées (EX-K3), lues dans lflist.conf (Fluorohydride/ygopro), téléchargé avec les
// données du moteur. Chaque section commence par « !nom » ; la plus récente est en tête : « 2026.10 TCG » pour le TCG,
// la première sans « TCG » pour l'OCG. Fichier absent : aucune liste proposée.
import { existsSync, readFileSync } from "fs";
import { HttpError } from "./http.js";

export function loadBanlists(path) {
    if (!existsSync(path)) return {};
    const sections = [];
    for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
        if (line.startsWith("!")) sections.push({ name: line.slice(1).trim(), limits: new Map() });
        else if (sections.length && /^\d+ [0-2]\b/.test(line)) {
            const [code, n] = line.split(" ");
            sections[sections.length - 1].limits.set(Number(code), Number(n));
        }
    }
    const tcg = sections.find((s) => / TCG$/.test(s.name)), ocg = sections.find((s) => !/TCG/.test(s.name));
    return Object.fromEntries([["tcg", tcg], ["ocg", ocg]].filter(([, s]) => s).map(([k, s]) => [k, s]));
}

// Le deck respecte-t-il la liste ? Les cartes en trop sont nommées dans l'erreur.
export function checkBanlist(deck, list, nameOf) {
    if (!list) return;
    const count = new Map();
    for (const c of [...deck.main, ...deck.extra]) count.set(c, (count.get(c) || 0) + 1);
    const over = [...count].filter(([c, n]) => list.limits.has(c) && n > list.limits.get(c));
    if (over.length) {
        const label = (c) => `${nameOf(c) || c} (${["interdite", "limitée à 1", "limitée à 2"][list.limits.get(c)]})`;
        throw new HttpError(400, `Deck hors de la liste ${list.name} : ${over.slice(0, 6).map(([c]) => label(c)).join(", ")}${over.length > 6 ? "…" : ""}.`);
    }
}

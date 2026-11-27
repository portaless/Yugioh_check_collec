// Decks jouables en ligne : ceux publiés depuis l'appli locale (library.js) et ceux collés au format .ydk, le format
// des simulateurs (#main, #extra, !side, un code de carte par ligne).
import { HttpError } from "./http.js";

export function parseYdk(text) {
    const deck = { name: "Deck importé", main: [], extra: [] };
    let zone = null;
    for (const raw of String(text || "").split(/\r?\n/)) {
        const line = raw.trim();
        if (line === "#main") zone = "main";
        else if (line === "#extra") zone = "extra";
        else if (line.startsWith("!side")) zone = null;   // le Side Deck ne sert pas en duel simple
        else if (zone && /^\d+$/.test(line)) deck[zone].push(Number(line));   // les autres lignes sont des commentaires
    }
    return deck;
}

// Règles de construction de base (EX-K3) et cartes inconnues du moteur.
export function checkDeck(deck, knows) {
    const { main, extra } = deck;
    if (main.length < 40 || main.length > 60) throw new HttpError(400, `Main Deck : ${main.length} cartes (40 à 60).`);
    if (extra.length > 15) throw new HttpError(400, `Extra Deck : ${extra.length} cartes (15 au maximum).`);
    const count = new Map();
    for (const c of [...main, ...extra]) count.set(c, (count.get(c) || 0) + 1);
    const over = [...count].filter(([, n]) => n > 3);
    if (over.length) throw new HttpError(400, `Plus de 3 exemplaires : ${over.map(([c]) => c).join(", ")}.`);
    const unknown = [...count.keys()].filter((c) => !knows(c));
    if (unknown.length) throw new HttpError(400, `Cartes inconnues du moteur : ${unknown.slice(0, 10).join(", ")}.`);
    return { name: String(deck.name || "Deck").slice(0, 60), main: [...main], extra: [...extra] };
}

// Deck importé (EX-K2) : les cartes inconnues du moteur sont retirées et signalées ; le deck n'est refusé que s'il
// ne respecte plus les règles sans elles.
export function importYdk(text, knows) {
    const deck = parseYdk(text);
    const unknown = [...new Set([...deck.main, ...deck.extra].filter((c) => !knows(c)))];
    deck.main = deck.main.filter(knows);
    deck.extra = deck.extra.filter(knows);
    if (!deck.main.length && !deck.extra.length) throw new HttpError(400, "Aucune carte reconnue : est-ce bien un fichier .ydk ?");
    const checked = checkDeck(deck, knows);
    if (unknown.length) checked.warning = `Cartes inconnues du moteur, retirées du deck : ${unknown.slice(0, 10).join(", ")}${unknown.length > 10 ? "…" : ""}.`;
    return checked;
}

// Le deck respecte-t-il les règles de base, sans lever d'erreur (liste des decks jouables) ?
export function playable(deck, knows) {
    try { checkDeck(deck, knows); return true; } catch { return false; }
}

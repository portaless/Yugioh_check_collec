// Textes en français : noms des cartes (catalogue de l'appli d'abord), textes d'effets et messages du moteur.

export function makeTexts(engine, myNames = {}) {
    const name = (code) => myNames[code] || (engine.texts.get(code) || [])[1] || `#${code}`;
    // desc : texte d'effet d'une carte (code * 16 + numéro) ou message du moteur (strings.conf)
    const desc = (d, code) => {
        if (engine.texts.has(d)) return `« ${name(d)} »`;   // certains indices donnent directement un code de carte
        if (d >= 10000) {
            const row = engine.texts.get(Math.floor(d / 16));
            const s = row && row[3 + (d % 16)];
            if (s) return s;
            return code ? `Effet de ${name(Math.floor(d / 16))}` : "Effet";
        }
        return engine.system.get(d) || (d ? `Option ${d}` : "Activer l'effet");
    };
    return { name, desc };
}

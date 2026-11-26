// Textes en français : noms des cartes (catalogue de l'appli d'abord), textes d'effets et messages du moteur.

const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const stems = (s) => (norm(s).match(/[a-z]{4,}/g) || []).map((w) => w.slice(0, 5));

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
    // Paragraphes d'effet du texte de la carte : sans la ligne des matériels, les limites « une fois par tour »
    // rattachées à l'effet qui les précède.
    const effects = (code) => {
        const text = (engine.texts.get(code) || [])[2] || "";
        const out = [];
        text.split(/\r?\n/).forEach((line, i) => {
            const t = line.trim();
            if (!t || (i === 0 && line.includes("\t"))) return;
            if (out.length && /^Vous ne pouvez (utiliser|activer)/.test(t)) out[out.length - 1] += " " + t;
            else out.push(t);
        });
        return out;
    };
    // Paragraphe qui correspond à un effet activable : celui qui partage le plus de mots avec son nom court
    // (« Effet de bannissement » -> « …bannissez-le… ») ; sans nom court, le n-ième effet activable (les scripts
    // numérotent leurs effets dans l'ordre du texte) ; une carte à un seul paragraphe n'a pas d'ambiguïté.
    const effectText = (d, code) => {
        const list = effects(code);
        if (list.length === 1) return list[0];
        if (d < 10000 || Math.floor(d / 16) !== code) return null;
        const n = d % 16, label = (engine.texts.get(code) || [])[3 + n] || "";
        const keys = stems(label).filter((w) => !["effet", "activ"].includes(w));
        // effets activables : ceux qui ont une condition ou un coût (« : » ou « ; »), pas les effets continus
        const active = list.filter((p) => /[:;]/.test(p));
        if (!keys.length) return active[n] || null;
        const scores = list.map((p) => { const ws = new Set(stems(p)); return keys.filter((k) => ws.has(k)).length; });
        const best = Math.max(...scores);
        return best > 0 && scores.filter((s) => s === best).length === 1 ? list[scores.indexOf(best)] : active[n] || null;
    };
    return { name, desc, effects, effectText };
}

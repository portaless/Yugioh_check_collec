// Limites contre les abus (EX-T3) : nombre d'actions par fenêtre de temps, par identité ou par adresse.
import { HttpError } from "./http.js";

export function limiter() {
    const hits = new Map();   // "action|qui" -> instants des dernières actions
    setInterval(() => {
        const now = Date.now();
        for (const [k, list] of hits) if (!list.length || now - list[list.length - 1] > 3600e3) hits.delete(k);
    }, 600e3).unref();
    // lève une erreur 429 si « qui » a déjà fait « max » fois cette action dans les « windowMs » dernières millisecondes
    return function check(action, who, max, windowMs) {
        const k = `${action}|${who}`, now = Date.now();
        const list = (hits.get(k) || []).filter((t) => now - t < windowMs);
        if (list.length >= max) throw new HttpError(429, "Trop de demandes : attends un peu avant de recommencer.");
        list.push(now);
        hits.set(k, list);
    };
}

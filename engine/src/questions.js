// Questions du moteur au joueur humain, traduites pour l'interface : chaque option porte sa réponse déjà préparée.
import { IndexResponse } from "ygopro-msg-encode";
import { POS } from "./constants.js";

// Traduit une question du moteur en question pour l'interface ; la réponse est préparée ici.
export function question(game, m) {
    const T = game.T;
    const kind = m.constructor.name.replace("YGOProMsg", "");
    const key = (c) => `${c.controller}:${c.location}:${c.sequence}`;
    const hint = game.hint; game.hint = "";
    switch (kind) {
        case "SelectIdleCmd": case "SelectBattleCmd": {
            const acts = [];
            const add = (list, label, type) => (list || []).forEach((c, i) => acts.push({
                key: key(c), code: c.code, label: typeof label === "function" ? label(c) : label,
                response: m.prepareResponse(type, IndexResponse(i)),
            }));
            const effect = (c) => `Activer : ${T.desc(c.desc, c.code)}`;
            if (kind === "SelectIdleCmd") {
                add(m.summonableCards, "Invocation Normale", 0);
                add(m.spSummonableCards, "Invocation Spéciale", 1);
                add(m.reposableCards, "Changer de position", 2);
                add(m.msetableCards, "Poser face verso", 3);
                add(m.ssetableCards, "Poser", 4);
                add(m.activatableCards, effect, 5);
            } else {
                add(m.activatableCards, effect, 0);
                add(m.attackableCards, (c) => (c.directAttack ? "Attaquer (attaque directe possible)" : "Attaquer"), 1);
            }
            const buttons = [];
            if (kind === "SelectIdleCmd" && m.canBp) buttons.push({ label: "Battle Phase", response: m.prepareResponse(6) });
            if (kind === "SelectBattleCmd" && m.canM2) buttons.push({ label: "Main Phase 2", response: m.prepareResponse(2) });
            if (m.canEp) buttons.push({ label: "Fin du tour", main: true, response: m.prepareResponse(kind === "SelectIdleCmd" ? 7 : 3) });
            return { kind: "actions", actions: acts, buttons };
        }
        case "SelectChain": {
            if (!m.chains.length) return null;   // rien à enchaîner : le moteur passe tout seul
            // comme une phase de jeu : les cartes qui peuvent répondre s'allument, un clic active leur effet
            const forced = m.chains.some((c) => c.forced);
            return {
                kind: "actions", chain: true,
                actions: m.chains.map((c, i) => ({ key: key(c), code: c.code, label: `Activer : ${T.desc(c.desc, c.code)}`, response: m.prepareResponse(IndexResponse(i)) })),
                buttons: forced ? [] : [{ label: "Ne rien activer", main: true, response: m.prepareResponse(null) }],
            };
        }
        case "SelectEffectYn":
            return { kind: "yesno", title: `Activer l'effet de « ${T.name(m.code)} » ?`, text: m.desc && !T.desc(m.desc, m.code).includes("%ls") ? T.desc(m.desc, m.code) : "", code: m.code,
                yes: m.prepareResponse(true), no: m.prepareResponse(false) };
        case "SelectYesNo":
            return { kind: "yesno", title: T.desc(m.desc).replace(/[%ls]/g, "cette carte"), text: "", yes: m.prepareResponse(true), no: m.prepareResponse(false) };
        case "SelectOption":
            return { kind: "choose", title: hint || "Choisis une option", options: m.options.map((d, i) => ({ label: T.desc(d), response: m.prepareResponse(i) })), cancel: null };
        case "SelectPosition": {
            const opts = [[POS.FU_ATK, "Attaque, face recto"], [POS.FD_ATK, "Attaque, face verso"], [POS.FU_DEF, "Défense, face recto"], [POS.FD_DEF, "Défense, face verso"]]
                .filter(([bit]) => m.positions & bit).map(([bit, label]) => ({ label, response: m.prepareResponse(bit) }));
            return { kind: "choose", title: `Position de « ${T.name(m.code)} »`, code: m.code, options: opts, cancel: null };
        }
        case "SelectCard": case "SelectTribute": case "SelectSum": {
            const cards = m.cards.map((c) => ({ key: key(c), code: c.code, controller: c.controller, location: c.location }));
            const must = kind === "SelectSum" ? (m.mustSelectCards || []).map((c) => T.name(c.code)) : [];
            return {
                kind: "cards", title: hint || (kind === "SelectTribute" ? T.desc(500) : "Sélectionne des cartes"),
                min: m.min, max: m.max, cards, sum: kind === "SelectSum" ? m.sumVal : null, must,
                build: (idx) => m.prepareResponse(idx.map((i) => IndexResponse(i))),
                cancel: m.cancelable ? m.prepareResponse(null) : null,
                escape: m.cancelable ? m.prepareResponse(null) : null,   // Échap : renoncer à jouer la carte
            };
        }
        case "SelectUnselectCard": {
            const cards = m.selectableCards.map((c) => ({ key: key(c), code: c.code, controller: c.controller, location: c.location }));
            return {
                kind: "cards", title: hint || "Sélectionne une carte", min: 1, max: 1, cards, step: true,
                chosen: m.unselectableCards.map((c) => T.name(c.code)),
                build: (idx) => m.prepareResponse(IndexResponse(idx[0])),
                cancel: m.finishable || m.cancelable ? m.prepareResponse(null) : null,
                cancelLabel: m.finishable ? "Terminer la sélection" : "Annuler",
                escape: m.cancelable && !m.finishable ? m.prepareResponse(null) : null,   // jamais « terminer » par Échap
            };
        }
        case "SelectPlace": case "SelectDisfield": {
            const places = m.getSelectablePlaces();
            const title = kind === "SelectPlace" ? T.desc(569).replace("[%ls]", hint.startsWith("«") ? hint : "la carte") : T.desc(570);
            return { kind: "place", title,
                count: m.count || 1, places, build: (list) => m.prepareResponse(list) };
        }
        case "AnnounceRace": case "AnnounceAttrib": {
            const bits = kind === "AnnounceRace" ? m.availableRaces : m.availableAttributes;
            const base = kind === "AnnounceRace" ? 1020 : 1010;   // noms des Types / Attributs dans strings.conf
            const opts = [];
            for (let i = 0; i < 26; i++) if (bits & (1 << i)) opts.push({ label: T.desc(base + i), response: m.prepareResponse(1 << i) });
            return { kind: "choose", title: hint || T.desc(kind === "AnnounceRace" ? 563 : 562), options: opts, cancel: null };
        }
        case "AnnounceNumber":
            return { kind: "choose", title: hint || T.desc(565), options: m.numbers.map((n, i) => ({ label: String(n), response: m.prepareResponse(i) })), cancel: null };
        case "AnnounceCard":
            return { kind: "announce", title: hint || T.desc(564), names: game.engine.names, build: (code) => m.prepareResponse(code) };
        default:
            return null;   // tri de cartes, compteurs, pierre-feuille-ciseaux… : réponse par défaut
    }
}

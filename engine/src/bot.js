// Le bot : il répond aux mêmes questions que toi, il ne peut donc jouer que des actions légales.
import { IndexResponse } from "ygopro-msg-encode";
import { C, POS } from "./constants.js";

export class Bot {
    constructor(game) { this.g = game; this.tried = new Set(); this.actions = 0; this.turn = -1; }

    respond(m) {
        const g = this.g, kind = m.constructor.name.replace("YGOProMsg", "");
        if (g.turn !== this.turn) { this.turn = g.turn; this.actions = 0; }
        const mine = (c) => c.controller === g.bot;
        switch (kind) {
            case "SelectIdleCmd": {
                this.actions++;
                const busy = this.actions > 40;
                const fresh = m.activatableCards.findIndex((c) => !this.tried.has(`${g.turn}:${c.code}:${c.desc}`));
                if (fresh >= 0 && !busy) {
                    const c = m.activatableCards[fresh];
                    this.tried.add(`${g.turn}:${c.code}:${c.desc}`);
                    return m.prepareResponse(5, IndexResponse(fresh));
                }
                if (m.spSummonableCards.length && !busy) return m.prepareResponse(1, IndexResponse(0));
                // Invocation Normale du monstre le plus fort ; les monstres sans ATK (souvent des interruptions de main)
                // restent en main
                const atk = (c) => g.engine.stats.get(c.code) ?? 0;
                const best = m.summonableCards.map((c, i) => ({ i, a: atk(c) })).filter((x) => x.a >= 1000).sort((x, y) => y.a - x.a)[0];
                if (best && !busy) return m.prepareResponse(0, IndexResponse(best.i));
                const trap = m.ssetableCards.findIndex(() => true);
                if (trap >= 0 && !busy && this.actions < 30) return m.prepareResponse(4, IndexResponse(trap));
                if (m.canBp && g.turn > 1) return m.prepareResponse(6);
                return m.prepareResponse(7);
            }
            case "SelectBattleCmd":
                if (m.attackableCards.length && this.actions++ < 60) return m.prepareResponse(1, IndexResponse(0));
                return m.prepareResponse(m.canM2 ? 2 : 3);
            case "SelectChain":
                return m.prepareResponse(m.chains.length ? IndexResponse(0) : null);   // interruptions dès que possible
            case "SelectEffectYn": case "SelectYesNo": return m.prepareResponse(true);
            case "SelectOption": return m.prepareResponse(0);
            case "SelectPosition": return m.prepareResponse(m.positions & POS.FU_ATK ? POS.FU_ATK : m.positions & POS.FU_DEF ? POS.FU_DEF : m.positions & -m.positions);
            case "SelectCard": case "SelectTribute": {
                // cartes adverses : les plus fortes d'abord ; les siennes : les plus faibles d'abord
                const order = m.cards.map((c, i) => ({ i, c, v: mine(c) ? -this.power(c) : this.power(c) })).sort((a, b) => b.v - a.v);
                return m.prepareResponse(order.slice(0, Math.max(1, m.min)).map((o) => IndexResponse(o.i)));
            }
            case "SelectSum": {
                const total = m.sumVal, pick = [];
                let s = 0;
                for (let i = 0; i < m.cards.length && s < total; i++) { pick.push(i); s += m.cards[i].opParam & 0xffff; }
                return m.prepareResponse(pick.map((i) => IndexResponse(i)));
            }
            case "SelectUnselectCard":
                if (m.finishable) return m.prepareResponse(null);
                return m.prepareResponse(IndexResponse(0));
            case "SelectPlace": case "SelectDisfield": {
                const places = m.getSelectablePlaces();
                const own = places.filter((p) => p.player === g.bot);
                const list = (kind === "SelectPlace" && own.length ? own : places).slice(0, m.count || 1);
                return m.prepareResponse(list);
            }
            case "SelectCounter":
                return m.prepareResponse([{ card: IndexResponse(0), count: m.counterCount }]);
            case "AnnounceRace": return m.prepareResponse(m.availableRaces & -m.availableRaces);
            case "AnnounceAttrib": return m.prepareResponse(m.availableAttributes & -m.availableAttributes);
            case "AnnounceNumber": return m.prepareResponse(0);
            case "AnnounceCard": return m.prepareResponse(14558127);   // Floraison de Cendres : nom souvent pertinent
            case "RockPaperScissors": return m.prepareResponse(1 + Math.floor(Math.random() * 3));
            default:
                return m.defaultResponse ? m.defaultResponse() : undefined;
        }
    }

    power(c) {
        try {
            const r = this.g.duel.queryCard({ player: c.controller, location: c.location, sequence: c.sequence, queryFlag: C.QUERY_ATTACK });
            return r.card ? r.card.attack || 0 : 0;
        } catch { return 0; }
    }
}

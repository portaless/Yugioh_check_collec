// Duel contre la méta, partie terrain : cartes, zones, piles, zones Extra Monstre (assemblée avec les autres fichiers duel_meta_*.js par ygo/ui/duel_meta.py).

function info(root, code) {
    const d = root.data;
    const t = root.game && root.game.engine.texts.get(code);
    return { name: d.names[code] || (t && t[1]) || "Carte", img: d.imgs[code] || null, text: d.texts[code] || (t && t[2]) || "" };
}

function cardHTML(root, c, opts = {}) {
    if (!c) return "";
    const P = root.ui.prompt;
    const pos = c.position || 0;
    const down = opts.field && (pos & 10) !== 0;   // face verso (sur le terrain seulement)
    const def = (pos & 12) !== 0;                  // défense
    const hidden = opts.hidden || (down && opts.foe);
    const i = info(root, c.code);
    const can = P && P.kind === "actions" && P.actions.some((a) => a.key === c.key);
    const cls = ["card", hidden || down ? "down" : "", def && opts.loc === LOC.MZONE ? "def" : "", can ? "can" : ""].join(" ");
    const stat = opts.field && opts.loc === LOC.MZONE && !hidden
        ? `<span class="stat">${(c.type & 0x4000000) ? "LINK " + (c.link || "") + " · " + c.attack : def ? "DEF " + c.defense : "ATK " + c.attack}</span>` : "";
    // monstre posé dans la Zone Magie & Piège par un effet (ex. Angetélité) : il y est une Magie Continue
    const extras = [...root.data.me.extra, ...root.data.bot.extra];
    const asSpell = opts.field && opts.loc === LOC.SZONE && !hidden && !down && extras.includes(c.code)
        ? `<span class="stat">Magie Continue</span>` : "";
    const xyz = c.overlayCards && c.overlayCards.length ? `<span class="ov">${c.overlayCards.length}</span>` : "";
    return `<div class="${cls}" data-key="${hidden ? "" : c.key}" data-code="${hidden ? "" : c.code}" title="${hidden ? "" : esc(i.name)}">`
        + `${hidden ? "" : i.img ? `<img src="${i.img}" alt="">` : `<span class="nm">${esc(i.name)}</span>`}${stat}${asSpell}${xyz}</div>`;
}

function zoneHTML(root, who, loc, seq, c, foe) {
    const P = root.ui.prompt;
    const p = who === "me" ? root.game.me : root.game.bot;
    const pickable = P && P.kind === "place" && P.places.some((z) => z.player === p && z.location === loc && z.sequence === seq);
    const picked = root.ui.picked.some((z) => z.player === p && z.location === loc && z.sequence === seq);
    // chaque type de zone a sa teinte et son nom (affiché quand elle est vide)
    const [zone, label] = loc === LOC.MZONE ? (seq >= 5 ? ["zx", "Zone Extra"] : ["zm", "Monstre"])
        : seq === 5 ? ["zf fieldz", "Terrain"] : ["zs", "Magie / Piège"];
    return `<div class="slot ${zone}${pickable ? " pick" : ""}${picked ? " picked" : ""}" data-zone="${p}:${loc}:${seq}" data-label="${label}">${cardHTML(root, c, { field: true, foe, loc })}</div>`;
}

function pileHTML(root, who, loc, list, label) {
    const P = root.ui.prompt;
    const p = who === "me" ? root.game.me : root.game.bot;
    const n = typeof list === "number" ? list : list.filter(Boolean).length;
    const top = Array.isArray(list) && (loc === LOC.GRAVE || loc === LOC.REMOVED) ? list.filter(Boolean).slice(-1)[0] : null;
    const back = (loc === LOC.DECK || loc === LOC.EXTRA) && n ? '<div class="card down"></div>' : "";
    const can = P && P.kind === "actions" && P.actions.some((a) => a.key.startsWith(`${p}:${loc}:`));
    return `<div class="slot pile${loc === LOC.EXTRA ? " zx" : ""}${can ? " can" : ""}" data-pile="${who}:${loc}">${top ? cardHTML(root, top) : back}<span class="num">${n}</span><span class="lbl">${label}</span></div>`;
}

function sideHTML(root, who) {
    const S = root.state[who], foe = who === "bot";
    const order = foe ? [4, 3, 2, 1, 0] : [0, 1, 2, 3, 4];    // terrain adverse vu en miroir (colonnes respectées)
    const mz = order.map((i) => zoneHTML(root, who, LOC.MZONE, i, S.mzone[i], foe)).join("");
    const sz = order.map((i) => zoneHTML(root, who, LOC.SZONE, i, S.szone[i], foe)).join("");
    const rowM = `<div class="row">${zoneHTML(root, who, LOC.SZONE, 5, S.szone[5], foe)}${mz}${pileHTML(root, who, LOC.GRAVE, S.grave, "Cimetière")}</div>`;
    const rowS = `<div class="row">${pileHTML(root, who, LOC.EXTRA, S.extra, "Extra")}${sz}${pileHTML(root, who, LOC.DECK, S.deck, "Deck")}</div>`;
    const hidden = foe && !root.ui.peek;
    const hand = `<div class="hand">${S.hand.filter(Boolean).map((c) => `<div class="slot">${cardHTML(root, c, { hidden, foe })}</div>`).join("")}</div>`;
    const ban = S.removed.filter(Boolean).length;
    const head = `<div class="who"><span class="name">${esc(foe ? root.data.botName : "Toi")}</span>`
        + `<span class="lp"><span class="bar"><span style="width:${Math.max(0, Math.min(100, 100 * S.lp / 8000)).toFixed(1)}%"></span></span>${Math.max(0, S.lp)} PV</span>`
        + `<span class="sub">${S.hand.filter(Boolean).length} en main</span>`
        + `<button class="chip" data-pile="${who}:${LOC.REMOVED}">Bannies : ${ban}</button></div>`;
    return `<div class="side ${who}">${foe ? head + hand + rowS + rowM : rowM + rowS + hand + head}</div>`;
}

function emzHTML(root) {
    // zones Extra Monstre : la gauche est la 5e de chez toi ou la 6e de l'adversaire (et inversement)
    const me = root.state.me.mzone, bot = root.state.bot.mzone;
    const left = me[5] ? zoneHTML(root, "me", LOC.MZONE, 5, me[5]) : bot[6] ? zoneHTML(root, "bot", LOC.MZONE, 6, bot[6], true) : emptyEmz(root, 5, 6);
    const right = me[6] ? zoneHTML(root, "me", LOC.MZONE, 6, me[6]) : bot[5] ? zoneHTML(root, "bot", LOC.MZONE, 5, bot[5], true) : emptyEmz(root, 6, 5);
    return `<div class="row emz"><div></div><div></div>${left}<div class="mid-cell"></div>${right}<div></div><div></div></div>`;
}
function emptyEmz(root, mySeq, foeSeq) {
    const P = root.ui.prompt;
    const g = root.game;
    if (P && P.kind === "place" && P.places.some((z) => z.player === g.bot && z.location === LOC.MZONE && z.sequence === foeSeq)) return zoneHTML(root, "bot", LOC.MZONE, foeSeq, null, true);
    return zoneHTML(root, "me", LOC.MZONE, mySeq, null);
}

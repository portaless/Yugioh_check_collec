// Duel contre la méta, partie interactions : clics sur les cartes, les zones et les fenêtres (assemblée avec les autres fichiers duel_meta_*.js par ygo/ui/duel_meta.py).

function bind(root) {
    const U = root.ui, P = U.prompt;
    const answer = (r) => P && P.resolve(r);
    root.querySelectorAll(".card[data-code]").forEach((el) => {
        const code = +el.dataset.code;
        if (!code) return;
        el.addEventListener("mouseenter", () => {
            if (U.detail === code) return;
            U.detail = code;
            const d = root.querySelector(".detail");
            if (d) d.outerHTML = detailHTML(root);
        });
    });
    // clic sur une carte jouable : une seule action possible, elle est jouée tout de suite ; sinon ses actions
    // s'affichent en boutons juste au-dessus de la carte
    root.querySelectorAll(".card.can[data-key]").forEach((el) => el.addEventListener("click", (e) => {
        e.stopPropagation();
        const acts = P.actions.filter((a) => a.key === el.dataset.key);
        U.detail = +el.dataset.code || U.detail;
        if (acts.length === 1) {
            U.menu = null; U.viewer = null;
            return answer(acts[0].response);
        }
        const r = el.getBoundingClientRect(), box = root.getBoundingClientRect();
        U.menu = { key: el.dataset.key, x: Math.max(0, Math.min(r.left - box.left + r.width / 2 - 120, box.width - 240)), y: r.top - box.top - 4 };
        render(root);
    }));
    root.querySelectorAll("[data-pile]").forEach((el) => el.addEventListener("click", (e) => {
        e.stopPropagation();
        const [who, loc] = el.dataset.pile.split(":");
        if (+loc === LOC.DECK) return;
        U.viewer = `${who}:${loc}`; render(root);
    }));
    root.querySelectorAll("[data-act]").forEach((el) => el.addEventListener("click", (e) => {
        e.stopPropagation();
        const a = root.menuActs[+el.dataset.act];
        U.menu = null; U.viewer = null;
        answer(a.response);
    }));
    root.querySelectorAll("[data-orphan]").forEach((el) => el.addEventListener("click", (e) => {
        e.stopPropagation();
        answer(root.orphans[+el.dataset.orphan].response);
    }));
    root.querySelectorAll("[data-btn]").forEach((el) => el.addEventListener("click", (e) => {
        e.stopPropagation();
        answer(P.buttons[+el.dataset.btn].response);
    }));
    root.querySelectorAll("[data-opt]").forEach((el) => el.addEventListener("click", () => answer(P.options[+el.dataset.opt].response)));
    root.querySelectorAll("[data-cancel]").forEach((el) => el.addEventListener("click", () => answer(P.cancel.response || P.cancel)));
    root.querySelectorAll("[data-yes]").forEach((el) => el.addEventListener("click", () => answer(el.dataset.yes === "1" ? P.yes : P.no)));
    root.querySelectorAll("[data-card]").forEach((el) => el.addEventListener("click", () => {
        const k = +el.dataset.card;
        if (P.step) return answer(P.build([k]));
        U.picked = U.picked.includes(k) ? U.picked.filter((x) => x !== k) : U.picked.length < P.max ? [...U.picked, k] : U.picked;
        render(root);
    }));
    root.querySelectorAll("[data-confirm]").forEach((el) => el.addEventListener("click", () => answer(P.build(U.picked))));
    root.querySelectorAll(".slot.pick").forEach((el) => el.addEventListener("click", (e) => {
        e.stopPropagation();
        const [player, location, sequence] = el.dataset.zone.split(":").map(Number);
        if (U.picked.some((z) => z.player === player && z.location === location && z.sequence === sequence)) return;
        U.picked = [...U.picked, { player, location, sequence }];
        if (U.picked.length >= P.count) return answer(P.build(U.picked));
        render(root);
    }));
    const ann = root.querySelector(".ann");
    if (ann) {
        ann.focus();
        ann.setSelectionRange(ann.value.length, ann.value.length);
        ann.addEventListener("input", () => { U.query = ann.value; render(root); });
    }
    root.querySelectorAll("[data-ann]").forEach((el) => el.addEventListener("click", () => { U.query = ""; answer(P.build(+el.dataset.ann)); }));
    root.querySelectorAll("[data-close]").forEach((el) => el.addEventListener("click", () => { U.viewer = null; render(root); }));
    root.querySelectorAll("[data-peek]").forEach((el) => el.addEventListener("change", () => { U.peek = el.checked; render(root); }));
    root.querySelectorAll("[data-again]").forEach((el) => el.addEventListener("click", () => { root.seed += 1; start(root); }));
}

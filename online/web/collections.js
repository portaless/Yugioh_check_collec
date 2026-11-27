// Client en ligne, collections partagées : annuaire (EX-C4) et page d'une collection avec recherche, filtres, nombre
// d'exemplaires, valeur et decks visibles. Le serveur ne renvoie que ce que le visiteur a le droit de voir (EX-C2).
// Sur la collection d'un autre, le filtre « me manque » compare avec ma propre collection publiée (EX-C5).

const MAX_SHOWN = 600;   // au-delà, on demande d'affiner la recherche plutôt que d'afficher des milliers d'images
const fold = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const day = (iso) => (iso ? new Date(iso.replace(" ", "T") + "Z").toLocaleDateString("fr-FR", { dateStyle: "long" }) : "");

async function directoryPage(player) {
    const { collections } = await api("GET", "/api/collections");
    const rows = collections.map((c) => `<a class="entry" href="/c/${encodeURIComponent(c.pseudo)}">
        <b>${esc(c.pseudo)}</b><span class="mute">${c.cards} cartes · ${c.copies} exemplaires · ${euros(c.value)}</span>
        <span class="tag">${VISIBILITY[c.visibility]}</span><span class="mute">publiée le ${day(c.published)}</span></a>`).join("");
    app.innerHTML = `<section class="card"><h2>Collections</h2>
        <p class="mute">Les collections publiques${player ? ", la tienne et celles que leurs propriétaires partagent avec toi" : ""}.</p>
        <div class="entries">${rows || `<p class="mute">Aucune collection publiée pour l'instant.</p>`}</div></section>`;
}

async function collectionPage(pseudo, player) {
    let c;
    try { c = await api("GET", `/api/collection?pseudo=${encodeURIComponent(pseudo)}`); }
    catch (e) {
        app.innerHTML = `<section class="card narrow center"><h2>${esc(e.message)}</h2>
            <p class="mute">Elle n'existe pas, ou son propriétaire ne la partage pas avec toi.</p>
            <a class="btn" href="/collections">Voir les collections</a></section>`;
        return;
    }
    const options = (values) => [...new Set(values)].filter(Boolean).sort((a, b) => a.localeCompare(b, "fr"))
        .map((v) => `<option>${esc(v)}</option>`).join("");
    const hasLocations = c.cards.some((x) => x.locations && x.locations.length);
    // mes cartes, pour comparer (ma collection publiée, si j'en ai une)
    const own = player && !c.mine ? await api("GET", `/api/collection?pseudo=${encodeURIComponent(player.pseudo)}`)
        .then((m) => new Set(m.cards.map((x) => x.id))).catch(() => null) : null;
    app.innerHTML = `<section class="card"><h2>Collection de ${esc(c.pseudo)}</h2>
        <p class="mute">Publiée le ${day(c.published)} · ${VISIBILITY[c.visibility]}
        ${c.mine ? ` · <a href="/compte">changer qui la voit</a>` : ""}</p>
        <div class="filters">
          <input id="q" placeholder="Recherche (nom, type, archétype)">
          <select id="cat"><option value="">Toutes catégories</option>${options(c.cards.map((x) => x.category))}</select>
          <select id="rar"><option value="">Toutes raretés</option>${options(c.cards.flatMap((x) => x.rarities))}</select>
          ${hasLocations ? `<select id="loc"><option value="">Tous emplacements</option>${options(c.cards.flatMap((x) => (x.locations || []).map((l) => l[0])))}</select>` : ""}
          ${own ? `<select id="miss"><option value="">Toutes ses cartes</option><option value="miss">Seulement celles qui me manquent</option>
            <option value="both">Seulement celles que j'ai aussi</option></select>` : ""}
          <select id="sort"><option value="name">Tri : nom</option><option value="value">Tri : valeur</option><option value="qty">Tri : exemplaires</option></select>
        </div><div class="metrics" id="metrics"></div><div class="gal" id="gal"></div></section>
        ${decksHTML(c)}`;
    const ids = ["q", "cat", "rar", "loc", "miss", "sort"];
    const show = () => {
        const v = Object.fromEntries(ids.map((id) => [id, app.querySelector(`#${id}`)?.value || ""]));
        const words = fold(v.q).split(/\s+/).filter(Boolean);
        const cards = c.cards.filter((x) => (!v.cat || x.category === v.cat) && (!v.rar || x.rarities.includes(v.rar))
            && (!v.loc || (x.locations || []).some((l) => l[0] === v.loc))
            && (!v.miss || (v.miss === "miss") !== own.has(x.id))
            && words.every((w) => fold(`${x.name} ${x.type} ${x.archetype}`).includes(w)));
        const by = { name: (a, b) => a.name.localeCompare(b.name, "fr"), value: (a, b) => b.value - a.value, qty: (a, b) => b.qty - a.qty };
        cards.sort(by[v.sort] || by.name);
        app.querySelector("#metrics").innerHTML = [["Cartes différentes", cards.length],
            ["Exemplaires", cards.reduce((n, x) => n + x.qty, 0)], ["Valeur Cardmarket", euros(cards.reduce((n, x) => n + x.value, 0))]]
            .map(([label, value]) => `<div class="metric"><span class="mute">${label}</span><b>${value}</b></div>`).join("");
        app.querySelector("#gal").innerHTML = cards.slice(0, MAX_SHOWN).map(tileHTML).join("")
            + (cards.length > MAX_SHOWN ? `<p class="mute">${cards.length - MAX_SHOWN} cartes de plus : affine la recherche.</p>` : "")
            + (cards.length ? "" : `<p class="mute">Aucune carte ne correspond.</p>`);
    };
    ids.forEach((id) => app.querySelector(`#${id}`)?.addEventListener("input", show));
    show();
}

function tileHTML(x) {
    const where = (x.locations || []).map((l) => `${l[0]} : ${l[1]}`).join(", ");
    const tip = [x.name, x.type, x.rarities.join(", "), where].filter(Boolean).join("\n");
    return `<figure class="tile" title="${esc(tip)}"><img loading="lazy" src="${IMG_SMALL}${x.id}.jpg" alt="${esc(x.name)}">
        <span class="qty">×${x.qty}</span><figcaption>${esc(x.name)}<small>${x.value ? euros(x.value) : ""}</small></figcaption></figure>`;
}

function decksHTML(c) {
    if (!c.decks.length) return "";
    const list = (codes) => {
        const n = new Map();
        codes.forEach((code) => n.set(code, (n.get(code) || 0) + 1));
        return [...n].map(([code, k]) => `<li>${k}× ${esc(c.names[code] || code)}</li>`).join("");
    };
    const decks = c.decks.map((d) => `<details class="deck"><summary><b>${esc(d.name)}</b>
        <span class="mute">${d.main.length} + ${d.extra.length}${c.mine && !d.visible ? " · visible par toi seul" : ""}</span></summary>
        <div class="grid2"><div><h3>Main Deck</h3><ul>${list(d.main)}</ul></div>
        <div><h3>Extra Deck</h3><ul>${list(d.extra) || "<li class=\"mute\">Vide</li>"}</ul></div></div></details>`).join("");
    return `<section class="card"><h2>Decks</h2>${decks}</section>`;
}

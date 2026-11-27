// Client en ligne, page Duels : choix du deck (publié ou fichier .ydk), duel par code (EX-D1), au hasard (EX-D2) ou
// sur invitation (EX-D3), attente de l'adversaire puis plateau du duel, avec le délai de réponse et l'abandon (EX-D6).
// Un duel en cours est retrouvé au rechargement de la page. On peut aussi regarder les duels des autres (EX-D7).
const BANLIST_LABEL = { "": "Sans liste des interdites", tcg: "Liste TCG", ocg: "Liste OCG" };

let events = null, invites = [], lastWait = null, clockTimer = null, watching = false;

// Le flux d'événements du serveur décide de l'écran : accueil, attente ou duel.
function listen(notice = "") {
    if (events) events.close();
    events = new EventSource("/api/duel/events");
    let root = null;
    events.addEventListener("invites", (e) => { invites = JSON.parse(e.data); showInvites(); });
    events.addEventListener("room", (e) => {
        const room = JSON.parse(e.data);
        if (room.status === "none" || room.status === "closed") { root = null; return lobby(room.reason || notice); }
        if (room.status === "waiting") { root = null; return waiting(room); }
        if (!root) {
            app.innerHTML = `<div class="duelbar"><span id="clock" class="mute"></span><button id="forfeit">Abandonner</button></div><div id="duel"></div>`;
            root = document.getElementById("duel");
            mountDuel(root);
            if (room.warning) root.ui.notice = room.warning;
            forfeitButton();
        }
        duelRoom(root, room);
    });
    events.addEventListener("state", (e) => {
        if (!root) return;
        const msg = JSON.parse(e.data);
        lastWait = msg.wait;
        if (msg.over || msg.state.over) document.getElementById("forfeit")?.remove();
        duelState(root, msg);
        tick();
    });
    clearInterval(clockTimer);
    clockTimer = setInterval(tick, 1000);
}

// Temps restant pour répondre : à toi, ou à l'adversaire.
function tick() {
    const el = document.getElementById("clock");
    if (!el) return;
    if (!lastWait) { el.textContent = ""; return; }
    const s = Math.max(0, Math.round((lastWait.until - Date.now()) / 1000));
    const t = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
    el.textContent = lastWait.mine ? `Il te reste ${t} pour répondre.` : `${watching ? lastWait.who : "L'adversaire"} a ${t} pour répondre.`;
    el.classList.toggle("late", lastWait.mine && s < 30);
}

function forfeitButton() {
    const b = document.getElementById("forfeit");
    b.addEventListener("click", async () => {
        if (!b.dataset.sure) { b.dataset.sure = "1"; b.textContent = "Confirmer l'abandon"; b.classList.add("danger"); return; }
        b.disabled = true;
        try { await api("POST", "/api/duel/forfeit"); } catch (e) { b.textContent = e.message; }
    });
}

function deckChoice() {
    const ydk = app.querySelector("#ydk").value.trim();
    return { ...(ydk ? { ydk } : { deck: app.querySelector("#deck").value }), banlist: app.querySelector("#banlist").value };
}

async function lobby(notice = "") {
    const [{ decks }, { banlists }, { duels }] = await Promise.all([api("GET", "/api/decks"), api("GET", "/api/banlists"), api("GET", "/api/duels")]);
    const lists = [{ key: "", name: "" }, ...banlists].map((b) => `<option value="${esc(b.key)}" ${b.key === "tcg" ? "selected" : ""}>${esc(BANLIST_LABEL[b.key] || b.key)}${b.name ? ` (${esc(b.name)})` : ""}</option>`).join("");
    const live = duels.map((d) => `<li>${esc(d.players[0])} contre ${esc(d.players[1])} <span class="mute">· tour ${d.turn}${d.watchers ? ` · ${d.watchers} spectateur(s)` : ""}</span>
        <a class="btn small" href="/regarder/${esc(d.code)}">Regarder</a></li>`).join("");
    const none = decks.length ? "" : `<p class="mute">Tu n'as pas encore publié de deck. Dans l'appli, page
        <b>Partage en ligne</b>, colle ta clé (voir <a href="/compte">Mon compte</a>) puis publie tes decks.
        Tu peux aussi utiliser un fichier .ydk ci-dessous.</p>`;
    const options = decks.map((d) => `<option value="${esc(d.name)}" ${d.ok ? "" : "disabled"}>${esc(d.name)} · ${d.main} + ${d.extra}${d.ok ? "" : " (hors des règles : 40 à 60 cartes, Extra 15 max)"}</option>`).join("");
    app.innerHTML = `<p class="err">${esc(notice)}</p><div id="invites"></div>
        <section class="card"><h2>Ton deck</h2>${none}
        <label>Mes decks publiés <select id="deck">${options}</select></label>
        <details><summary>Ou un deck au format .ydk (fichier des simulateurs)</summary>
          <input type="file" id="ydkfile" accept=".ydk,text/plain">
          <textarea id="ydk" rows="6" placeholder="Ou colle son contenu : #main&#10;14558127&#10;…"></textarea></details>
        <label class="banlist">Cartes interdites et limitées <select id="banlist">${lists}</select></label>
        <p class="mute">Pour un duel par code ou une invitation, c'est la liste choisie par celui qui crée le duel ; au hasard,
        tu n'affrontes que des joueurs qui ont choisi la même.</p>
        </section>
        <section class="grid3">
          <div class="card"><h2>Contre un ami</h2>
            <p class="mute">Crée un duel et donne-lui le code, ou entre le code qu'il t'a donné.</p>
            <button class="main" data-mode="create">Créer un duel</button>
            <div class="row"><input id="code" maxlength="6" placeholder="Code" autocomplete="off"><button data-mode="join">Rejoindre</button></div></div>
          <div class="card"><h2>Défier un joueur</h2>
            <p class="mute">Il reçoit ton invitation et l'accepte ou la refuse. Elle expire au bout de 5 minutes.</p>
            <div class="row"><input id="pseudo" maxlength="24" placeholder="Pseudo"><button class="main" data-mode="invite">Défier</button></div></div>
          <div class="card"><h2>Au hasard</h2>
            <p class="mute">Tu affrontes le premier joueur qui cherche aussi un duel.</p>
            <button class="main" data-mode="random">Chercher un adversaire</button></div>
        </section>
        ${live ? `<section class="card"><h2>Duels en cours</h2><ul class="live">${live}</ul></section>` : ""}`;
    app.querySelector("#ydkfile").addEventListener("change", async (e) => {
        const file = e.target.files[0];
        if (file) app.querySelector("#ydk").value = (await file.text()).slice(0, 20000);
    });
    app.querySelectorAll("[data-mode]").forEach((b) => b.addEventListener("click", () => send({ mode: b.dataset.mode,
        code: app.querySelector("#code").value, pseudo: app.querySelector("#pseudo").value })));
    showInvites();
}

async function send(body) {
    try {
        const r = await api("POST", "/api/duel", { ...body, ...deckChoice() });
        listen(r.warning);
    } catch (err) {
        const p = app.querySelector(".err");
        if (p) p.textContent = err.message;
    }
}

function showInvites() {
    const box = document.getElementById("invites");
    if (!box) return;
    box.innerHTML = invites.map((i) => `<div class="card invite"><span><b>${esc(i.from)}</b> te défie avec le deck
        « ${esc(i.deck)} » (${esc(BANLIST_LABEL[i.banlist] || i.banlist)}). Choisis ton deck ci-dessous, puis :</span>
        <button class="main" data-accept="${esc(i.code)}">Accepter</button><button data-decline="${esc(i.code)}">Refuser</button></div>`).join("");
    box.querySelectorAll("[data-accept]").forEach((b) => b.addEventListener("click", () => send({ mode: "join", code: b.dataset.accept })));
    box.querySelectorAll("[data-decline]").forEach((b) => b.addEventListener("click", () =>
        api("POST", "/api/duel/decline", { code: b.dataset.decline }).catch(() => {})));
}

function waiting(room) {
    const minutes = Math.max(1, Math.round((room.until - Date.now()) / 60000));
    const head = room.random ? `<h2>Recherche d'un adversaire…</h2><p class="mute">Le duel commence dès qu'un autre joueur cherche aussi.</p>`
        : room.invited ? `<h2>Invitation envoyée</h2><p class="mute">${esc(room.invited)} la voit sur sa page Duels. Elle expire dans ${minutes} min.</p>`
        : `<h2>Code du duel</h2><div class="code">${esc(room.code)}</div><p class="mute">Donne ce code à ton adversaire. Il expire dans ${minutes} min.</p>`;
    app.innerHTML = `<section class="card narrow center">${head}
        ${room.warning ? `<p class="err">${esc(room.warning)}</p>` : ""}
        <p class="mute">Ton deck : ${esc(room.deck)} · ${esc(BANLIST_LABEL[room.banlist] || room.banlist)}</p><button id="cancel">Annuler</button></section>`;
    app.querySelector("#cancel").addEventListener("click", async () => { await api("POST", "/api/duel/cancel"); listen(); });
}

// Spectateur : le terrain sans aucune main, mis à jour en direct, sans rien pouvoir jouer.
function watchPage(code) {
    if (events) events.close();
    watching = true;
    app.innerHTML = `<div class="duelbar"><span class="mute">Tu regardes ce duel : les mains restent cachées.</span>
        <span id="clock" class="mute"></span></div><div id="duel"></div>`;
    const root = document.getElementById("duel");
    mountDuel(root);
    events = new EventSource(`/api/duel/watch?code=${encodeURIComponent(code)}`);
    events.addEventListener("room", (e) => {
        const room = JSON.parse(e.data);
        if (room.status === "closed") { events.close(); app.innerHTML = `<section class="card narrow center"><h2>${esc(room.reason || "Duel terminé.")}</h2><a class="btn" href="/">Duels</a></section>`; return; }
        duelRoom(root, room);
    });
    events.addEventListener("state", (e) => {
        const msg = JSON.parse(e.data);
        lastWait = msg.wait;
        duelState(root, { ...msg, prompt: null });
        tick();
    });
    clearInterval(clockTimer);
    clockTimer = setInterval(tick, 1000);
}

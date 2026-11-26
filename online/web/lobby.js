// Client en ligne, partie accueil : pseudo (EX-I1), choix du deck, duel par code (EX-D1) ou au hasard (EX-D2),
// attente de l'adversaire puis plateau du duel. Un duel en cours est retrouvé au rechargement de la page.

const app = document.getElementById("app");
let events = null;

async function home() {
    const { player } = await api("GET", "/api/me");
    if (!player) return pseudoForm();
    document.getElementById("who").textContent = player.pseudo;
    listen();
}

function pseudoForm(error = "") {
    app.innerHTML = `<section class="card narrow"><h2>Choisis ton pseudo</h2>
        <p class="mute">Il te représente face à tes adversaires. Pas de mot de passe : ton navigateur garde une clé secrète.</p>
        <form id="f"><input name="pseudo" maxlength="24" placeholder="Pseudo (3 à 24 caractères)" autofocus>
        <button class="main">Continuer</button></form><p class="err">${esc(error)}</p></section>`;
    app.querySelector("#f").addEventListener("submit", async (e) => {
        e.preventDefault();
        try { await api("POST", "/api/me", { pseudo: e.target.pseudo.value }); home(); }
        catch (err) { pseudoForm(err.message); }
    });
}

// Le flux d'événements du serveur décide de l'écran : accueil, attente ou duel.
function listen() {
    if (events) events.close();
    events = new EventSource("/api/duel/events");
    let root = null;
    events.addEventListener("room", (e) => {
        const room = JSON.parse(e.data);
        if (room.status === "none" || room.status === "closed") { root = null; return lobby(); }
        if (room.status === "waiting") { root = null; return waiting(room); }
        if (!root) {
            app.innerHTML = `<div id="duel"></div>`;
            root = document.getElementById("duel");
            mountDuel(root);
        }
        duelRoom(root, room);
    });
    events.addEventListener("state", (e) => { if (root) duelState(root, JSON.parse(e.data)); });
}

async function lobby(error = "") {
    const { decks } = await api("GET", "/api/decks");
    const options = decks.map((d) => `<option value="${esc(d.name)}" ${d.ok ? "" : "disabled"}>${esc(d.name)} · ${d.main} + ${d.extra}${d.ok ? "" : " (hors des règles : 40 à 60 cartes, Extra 15 max)"}</option>`).join("");
    app.innerHTML = `<section class="card"><h2>Ton deck</h2>
        <label>Deck de l'appli <select id="deck">${options}</select></label>
        <details><summary>Ou colle un deck au format .ydk</summary><textarea id="ydk" rows="6" placeholder="#main&#10;14558127&#10;…"></textarea></details>
        </section>
        <section class="grid2">
          <div class="card"><h2>Contre un ami</h2>
            <p class="mute">Crée un duel et donne-lui le code, ou entre le code qu'il t'a donné.</p>
            <button class="main" data-mode="create">Créer un duel</button>
            <div class="row"><input id="code" maxlength="6" placeholder="Code" autocomplete="off"><button data-mode="join">Rejoindre</button></div></div>
          <div class="card"><h2>Au hasard</h2>
            <p class="mute">Tu affrontes le premier joueur qui cherche aussi un duel.</p>
            <button class="main" data-mode="random">Chercher un adversaire</button></div>
        </section><p class="err">${esc(error)}</p>`;
    app.querySelectorAll("[data-mode]").forEach((b) => b.addEventListener("click", async () => {
        const ydk = app.querySelector("#ydk").value.trim();
        const body = { mode: b.dataset.mode, code: app.querySelector("#code").value, ...(ydk ? { ydk } : { deck: app.querySelector("#deck").value }) };
        try { await api("POST", "/api/duel", body); listen(); }
        catch (err) { lobby(err.message); }
    }));
}

function waiting(room) {
    app.innerHTML = `<section class="card narrow center">
        ${room.random ? `<h2>Recherche d'un adversaire…</h2><p class="mute">Le duel commence dès qu'un autre joueur cherche aussi.</p>`
            : `<h2>Code du duel</h2><div class="code">${esc(room.code)}</div><p class="mute">Donne ce code à ton adversaire. Il expire dans 30 minutes.</p>`}
        <p class="mute">Ton deck : ${esc(room.deck)}</p><button id="cancel">Annuler</button></section>`;
    app.querySelector("#cancel").addEventListener("click", async () => { await api("POST", "/api/duel/cancel"); listen(); });
}

home().catch((e) => { app.innerHTML = `<p class="err">${esc(e.message)}</p>`; });

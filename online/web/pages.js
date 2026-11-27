// Client en ligne, aiguillage des pages selon l'adresse : / (duels), /collections (annuaire), /c/<pseudo>
// (une collection), /compte (clé, visibilité, amis) et /a-propos (licences). Le pseudo est demandé à la première
// visite (EX-I1) ; une identité existante se récupère avec sa clé (EX-I3).

async function boot() {
    const { player } = await api("GET", "/api/me");
    const path = decodeURIComponent(location.pathname);
    document.getElementById("who").textContent = player ? player.pseudo : "";
    document.querySelectorAll("nav a").forEach((a) => a.classList.toggle("on",
        a.getAttribute("href") === path || (!!a.dataset.prefix && path.startsWith(a.dataset.prefix))));
    if (path === "/a-propos") return aboutPage();
    if (path.startsWith("/c/")) return collectionPage(path.slice(3), player);
    if (path === "/collections") return directoryPage(player);
    if (!player) return pseudoForm();
    if (path === "/compte") return accountPage(player);
    listen();
}

function pseudoForm(error = "") {
    app.innerHTML = `<section class="card narrow"><h2>Choisis ton pseudo</h2>
        <p class="mute">Il te représente face à tes adversaires et sur ta collection. Pas de mot de passe : ton navigateur
        garde une clé secrète.</p>
        <form id="f"><input name="pseudo" maxlength="24" placeholder="Pseudo (3 à 24 caractères)" autofocus>
        <button class="main">Continuer</button></form><p class="err">${esc(error)}</p>
        ${loginHTML()}</section>`;
    app.querySelector("#f").addEventListener("submit", async (e) => {
        e.preventDefault();
        try { await api("POST", "/api/me", { pseudo: e.target.pseudo.value }); boot(); }
        catch (err) { pseudoForm(err.message); }
    });
    loginForm();
}

// Récupérer son identité sur un autre appareil : la clé copiée depuis « Mon compte » de l'appareil d'origine.
function loginHTML(title = "Tu as déjà un pseudo sur un autre appareil ?") {
    return `<details class="login"><summary>${title}</summary>
        <p class="mute">Colle la clé affichée sur la page Mon compte de cet appareil.</p>
        <form id="login"><input name="key" type="password" placeholder="Ta clé" autocomplete="off"><button>Utiliser cette clé</button></form>
        <p class="err" id="loginerr"></p></details>`;
}

function loginForm() {
    app.querySelector("#login").addEventListener("submit", async (e) => {
        e.preventDefault();
        try { await api("POST", "/api/login", { key: e.target.key.value }); location.href = "/compte"; }
        catch (err) { app.querySelector("#loginerr").textContent = err.message; }
    });
}

function aboutPage() {
    const link = (url, label) => `<a href="${url}" target="_blank" rel="noopener">${label}</a>`;
    app.innerHTML = `<section class="card narrow about"><h2>À propos</h2>
        <p>Ce site partage des collections Yu-Gi-Oh! et arbitre des duels entre joueurs. Il n'est ni produit ni soutenu
        par Konami ; Yu-Gi-Oh! est une marque de ses détenteurs.</p>
        <h3>Moteur de règles</h3>
        <p>Les duels sont arbitrés par le moteur YGOPro (ocgcore), compilé en WebAssembly par
        ${link("https://github.com/purerosefallen/koishipro-core.js", "koishipro-core.js")} (licence MIT).</p>
        <h3>Scripts des cartes : GPL-2.0</h3>
        <p>Les effets des cartes sont programmés par les scripts du projet
        ${link("https://github.com/Fluorohydride/ygopro-scripts", "ygopro-scripts")}, distribués sous licence
        ${link("https://www.gnu.org/licenses/old-licenses/gpl-2.0.html", "GNU GPL version 2")}. Le serveur les utilise
        sans modification ; leur code source complet est disponible à cette adresse.</p>
        <h3>Textes des cartes</h3>
        <p>Noms et textes en français : ${link("https://github.com/mycard/ygopro-database", "mycard/ygopro-database")}.</p>
        <h3>Illustrations</h3>
        <p>Les images sont chargées directement depuis ${link("https://ygoprodeck.com", "YGOPRODeck")} ; ce site ne les
        héberge ni ne les rediffuse.</p></section>`;
}

boot().catch((e) => { app.innerHTML = `<p class="err">${esc(e.message)}</p>`; });

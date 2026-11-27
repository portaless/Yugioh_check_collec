// Client en ligne, aiguillage des pages selon l'adresse : / (duels), /collections (annuaire), /c/<pseudo>
// (une collection) et /compte (clé, visibilité, amis). Le pseudo est demandé à la première visite (EX-I1).

async function boot() {
    const { player } = await api("GET", "/api/me");
    const path = decodeURIComponent(location.pathname);
    document.getElementById("who").textContent = player ? player.pseudo : "";
    document.querySelectorAll("nav a").forEach((a) => a.classList.toggle("on",
        a.getAttribute("href") === path || (!!a.dataset.prefix && path.startsWith(a.dataset.prefix))));
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
        <button class="main">Continuer</button></form><p class="err">${esc(error)}</p></section>`;
    app.querySelector("#f").addEventListener("submit", async (e) => {
        e.preventDefault();
        try { await api("POST", "/api/me", { pseudo: e.target.pseudo.value }); boot(); }
        catch (err) { pseudoForm(err.message); }
    });
}

boot().catch((e) => { app.innerHTML = `<p class="err">${esc(e.message)}</p>`; });

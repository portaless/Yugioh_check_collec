// Client en ligne, page Mon compte : clé à copier dans l'appli locale ou sur un autre appareil (EX-I2, EX-I3),
// collection et decks publiés, visibilité (EX-C2), amis autorisés à voir une collection « Amis » (EX-C3) et historique
// des duels (EX-D8).

async function accountPage(player, notice = "") {
    const [mine, { duels }] = await Promise.all([api("GET", "/api/mine"), api("GET", "/api/history")]);
    const history = duels.map((d) => `<tr class="${d.result === "victoire" ? "win" : d.result === "défaite" ? "loss" : ""}">
        <td>${day(d.date)}</td><td>${esc(d.opponent)}</td><td>${esc(d.myDeck)}</td><td>${esc(d.theirDeck)}</td>
        <td><b>${d.result}</b>${d.reason ? ` <span class="mute">(${esc(d.reason)})</span>` : ""}</td><td>${d.turns}</td></tr>`).join("");
    const col = mine.collection;
    const radios = Object.entries(VISIBILITY).map(([v, label]) => `<label class="radio"><input type="radio" name="vis"
        value="${v}" ${col && col.visibility === v ? "checked" : ""} ${col ? "" : "disabled"}> ${label}</label>`).join("");
    const decks = mine.decks.map((d) => `<li>${esc(d.name)} <span class="mute">· ${d.main} + ${d.extra}
        · ${d.visible ? "visible avec la collection" : "sert seulement à jouer"}</span></li>`).join("");
    const friends = mine.friends.map((f) => `<li>${esc(f)} <button class="small" data-remove="${esc(f)}">Retirer</button></li>`).join("");
    app.innerHTML = `<p class="err">${esc(notice)}</p>
      <section class="grid2">
        <div class="card"><h2>Ma clé</h2>
          <p class="mute">Colle-la dans l'appli, page <b>Partage en ligne</b>, pour publier ta collection et tes decks à ton nom,
          ou sur un autre appareil pour y retrouver ton pseudo.
          Ne la donne à personne : elle permet d'agir en ton nom.</p>
          <div class="row"><input id="key" type="password" readonly placeholder="Clé masquée">
          <button id="showkey">Afficher</button><button id="copykey">Copier</button></div></div>
        <div class="card"><h2>Ma collection</h2>
          ${col ? `<p class="mute">Publiée le ${day(col.published)} : ${col.cards} cartes, ${col.copies} exemplaires,
            ${euros(col.value)}. <a href="/c/${encodeURIComponent(player.pseudo)}">La voir</a></p>`
            : `<p class="mute">Pas encore publiée : publie-la depuis l'appli.</p>`}
          <p>Qui peut la voir ?</p><div class="radios">${radios}</div>
          <p class="mute">Publique : tout le monde. Amis : seulement les pseudos de ta liste. Privée : toi seul.</p></div>
      </section>
      <section class="grid2">
        <div class="card"><h2>Mes decks publiés</h2>${decks ? `<ul>${decks}</ul>` : `<p class="mute">Aucun deck publié.</p>`}</div>
        <div class="card"><h2>Mes amis</h2>
          <p class="mute">Ils voient ta collection quand elle est réglée sur « Amis ». En retirer un lui coupe l'accès aussitôt.</p>
          <form id="addf"><input name="pseudo" maxlength="24" placeholder="Pseudo d'un joueur"><button>Ajouter</button></form>
          ${friends ? `<ul class="friends">${friends}</ul>` : `<p class="mute">Personne pour l'instant.</p>`}</div>
      </section>
      <section class="card"><h2>Mes duels</h2>${history ? `<div class="scroll"><table class="history"><thead><tr><th>Date</th>
        <th>Adversaire</th><th>Mon deck</th><th>Son deck</th><th>Résultat</th><th>Tours</th></tr></thead><tbody>${history}</tbody></table></div>`
        : `<p class="mute">Aucun duel terminé pour l'instant.</p>`}</section>
      <section class="card">${loginHTML("Utiliser une autre identité (clé d'un autre appareil)")}</section>`;
    loginForm();

    const key = app.querySelector("#key");
    const loadKey = async () => { if (!key.value) key.value = (await api("GET", "/api/key")).key || ""; };
    app.querySelector("#showkey").addEventListener("click", async (e) => {
        await loadKey();
        key.type = key.type === "password" ? "text" : "password";
        e.target.textContent = key.type === "password" ? "Afficher" : "Masquer";
    });
    app.querySelector("#copykey").addEventListener("click", async (e) => {
        await loadKey();
        await navigator.clipboard.writeText(key.value);
        e.target.textContent = "Copiée";
    });
    const act = (call) => call.then(() => accountPage(player)).catch((err) => accountPage(player, err.message));
    app.querySelectorAll("input[name=vis]").forEach((r) => r.addEventListener("change", () =>
        act(api("POST", "/api/visibility", { visibility: r.value }))));
    app.querySelector("#addf").addEventListener("submit", (e) => {
        e.preventDefault();
        act(api("POST", "/api/friends", { pseudo: e.target.pseudo.value }));
    });
    app.querySelectorAll("[data-remove]").forEach((b) => b.addEventListener("click", () =>
        act(api("POST", "/api/friends", { pseudo: b.dataset.remove, remove: true }))));
}

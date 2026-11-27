// Tests du serveur en ligne (EX-T4), sans navigateur : identité, visibilité des collections, appariement, invitations,
// un duel complet joué par deux joueurs automatiques, abandon et temps de réponse écoulé.
// Lancement : `npm --prefix engine run test-online` (compile le serveur puis lance ces tests).
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { autoPlay, client, newPlayer, startServer, stream } from "./helpers.mjs";

// Monstres normaux classiques, 3 exemplaires de chacun : un deck de 40 cartes simple et légal
const VANILLA = [89631139, 46986414, 91152256, 15025844, 70781052, 6368038, 41392891, 13039848, 32452818, 5053103,
    67724379, 97590747, 14898066, 40640057];
const DECK = { name: "Normaux", main: VANILLA.flatMap((c) => [c, c, c]).slice(0, 40), extra: [], visible: true };
const YDK = ["#main", ...DECK.main, "#extra", "!side"].join("\n");

let server, alice, bob, carol;
before(async () => {
    server = await startServer({ ANSWER_MS: "4000" });
    [alice, bob, carol] = await Promise.all(["Alice", "Bob", "Carol"].map((p) => newPlayer(server.url, p)));
});
after(() => server.stop());

test("identité : pseudo unique, clé reconnue, récupération sur un autre appareil", async () => {
    assert.equal((await client(server.url).post("/api/me", { pseudo: "alice" })).status, 409);   // casse ignorée
    assert.equal((await client(server.url).post("/api/me", { pseudo: "a" })).status, 400);
    assert.equal((await alice.api.get("/api/me")).data.player.pseudo, "Alice");
    const login = await client(server.url).post("/api/login", { key: alice.key });
    assert.equal(login.data.player.pseudo, "Alice");
    assert.match(login.headers.get("set-cookie"), /HttpOnly; SameSite=Strict/);
    assert.equal((await client(server.url).post("/api/login", { key: "fausse" })).status, 404);
    assert.equal((await client(server.url, "fausse").get("/api/mine")).status, 401);
});

test("collections : privée, amis ou publique ; réponse identique quand elle est cachée", async () => {
    const card = { id: 89631139, qty: 2, name: "Dragon Blanc aux Yeux Bleus", category: "Monstre", value: 3.5, rarities: ["Ultra Rare"],
        locations: [["classeur", 2]] };
    const pub = await alice.api.post("/api/publish", { visibility: "private", cards: [card], decks: [DECK, { ...DECK, name: "Secret", visible: false }] });
    assert.equal(pub.status, 200);
    const see = (who) => (who ? who.api : client(server.url)).get("/api/collection?pseudo=Alice");
    const hidden = await see(bob);
    assert.deepEqual([hidden.status, hidden.data], [404, { error: "Collection introuvable." }]);
    assert.deepEqual((await client(server.url).get("/api/collection?pseudo=Personne")).data, hidden.data);
    assert.equal((await see(alice)).data.cards[0].locations, undefined);   // emplacements non demandés : retirés
    await alice.api.post("/api/visibility", { visibility: "friends" });
    await alice.api.post("/api/friends", { pseudo: "Bob" });
    const shared = await see(bob);
    assert.equal(shared.status, 200);
    assert.deepEqual(shared.data.decks.map((d) => d.name), ["Normaux"]);   // le deck « Secret » ne sert qu'à jouer
    assert.equal((await see(carol)).status, 404);
    assert.deepEqual((await bob.api.get("/api/collections")).data.collections.map((c) => c.pseudo), ["Alice"]);
    await alice.api.post("/api/friends", { pseudo: "Bob", remove: true });
    assert.equal((await see(bob)).status, 404);
    await alice.api.post("/api/visibility", { visibility: "public" });
    assert.equal((await see(null)).status, 200);
});

test("decks : un .ydk avec des cartes inconnues est accepté sans elles, refusé s'il devient illégal", async () => {
    const ok = await carol.api.post("/api/duel", { mode: "create", ydk: YDK.replace("#extra", "#extra\n123") });
    assert.equal(ok.status, 200);
    assert.match(ok.data.warning, /inconnues du moteur, retirées du deck : 123/);
    const short = await carol.api.post("/api/duel", { mode: "create", ydk: YDK.replace(/\n\d+\n\d+(?=\n#extra)/, "\n1\n2") });
    assert.equal(short.status, 400);
    await carol.api.post("/api/duel/cancel");
});

test("appariement au hasard et invitations", async () => {
    const [ea, eb, ec] = [alice, bob, carol].map((p) => stream(server.url, p.key));
    await alice.api.post("/api/duel", { mode: "random", ydk: YDK });
    await bob.api.post("/api/duel", { mode: "random", ydk: YDK });
    await Promise.all([ea, eb].map((e) => e.next("room", (r) => r.status === "playing")));
    for (const p of [alice, bob]) await p.api.post("/api/duel/forfeit");
    // Carol invite Alice, qui refuse ; puis Bob, qui accepte ; un tiers ne peut pas prendre l'invitation
    assert.equal((await carol.api.post("/api/duel", { mode: "invite", pseudo: "Alice", ydk: YDK })).status, 200);
    const inv = await ea.next("invites", (l) => l.length === 1);
    assert.equal(inv[0].from, "Carol");
    await alice.api.post("/api/duel/decline", { code: inv[0].code });
    assert.equal((await ec.next("room", (r) => r.status === "closed")).reason, "Alice a refusé ton invitation.");
    await carol.api.post("/api/duel", { mode: "invite", pseudo: "Bob", ydk: YDK });
    const [{ code }] = await eb.next("invites", (l) => l.length === 1);
    assert.equal((await alice.api.post("/api/duel", { mode: "join", code, ydk: YDK })).status, 404);
    assert.equal((await bob.api.post("/api/duel", { mode: "join", code, ydk: YDK })).status, 200);
    await ec.next("room", (r) => r.status === "playing");
    await bob.api.post("/api/duel/forfeit");
    const over = await ec.next("state", (s) => s.state.over);
    assert.equal(over.state.over, "Victoire ! Bob abandonne.");
    [ea, eb, ec].forEach((e) => e.close());
});

test("duel complet joué par deux joueurs automatiques, jusqu'à la défaite par deck vide", { timeout: 120000 }, async () => {
    // flux ouverts après l'entrée dans le salon, comme le navigateur : ils ne portent que ce duel
    const { code } = (await alice.api.post("/api/duel", { mode: "create", deck: "Normaux" })).data;
    assert.equal((await bob.api.post("/api/duel", { mode: "join", code, ydk: YDK })).status, 200);
    const [ea, eb] = [alice, bob].map((p) => stream(server.url, p.key));
    autoPlay(alice, ea);
    autoPlay(bob, eb);
    const ends = await Promise.all([ea, eb].map((e) => e.next("state", (s) => s.over, 110000)));
    const results = ends.map((s) => s.state.over).sort();
    assert.match(results[0], /^Défaite/);
    assert.match(results[1], /^Victoire/);
    assert.ok(ends[0].state.turn > 30, `seulement ${ends[0].state.turn} tours`);
    // la main de l'adversaire n'est jamais envoyée
    assert.ok(ends[0].state.bot.hand.every((c) => !c || c.code === 0));
    [ea, eb].forEach((e) => e.close());
});

test("sans réponse dans le délai, le joueur qui doit agir perd", { timeout: 20000 }, async () => {
    const { code } = (await alice.api.post("/api/duel", { mode: "create", ydk: YDK })).data;
    assert.equal((await carol.api.post("/api/duel", { mode: "join", code, ydk: YDK })).status, 200);
    const [ea, ec] = [alice, carol].map((p) => stream(server.url, p.key));
    const first = await ea.next("state", (s) => s.wait);
    const silent = first.wait.mine ? ea : ec, other = first.wait.mine ? ec : ea;
    assert.ok(first.wait.until > Date.now());
    assert.equal((await other.next("state", (s) => s.state.over, 8000)).state.over.startsWith("Victoire !"), true);
    assert.equal((await silent.next("state", (s) => s.state.over)).state.over, "Défaite : temps de réponse écoulé.");
    [ea, ec].forEach((e) => e.close());
});

test("limites : trop de pseudos créés depuis la même adresse", async () => {
    const codes = [];
    for (let i = 0; i < 9; i++) codes.push((await client(server.url).post("/api/me", { pseudo: `Robot${i}` })).status);
    assert.ok(codes.includes(429));
});

test("liste des interdites : un deck avec Pot de Cupidité est refusé en TCG, accepté sans liste", async () => {
    const banned = YDK.replace("#main\n", "#main\n55144522\n");   // 41 cartes dont une interdite
    const refused = await carol.api.post("/api/duel", { mode: "create", ydk: banned, banlist: "tcg" });
    assert.equal(refused.status, 400);
    assert.match(refused.data.error, /interdite/);
    assert.equal((await carol.api.post("/api/duel", { mode: "create", ydk: banned, banlist: "" })).status, 200);
    await carol.api.post("/api/duel/cancel");
    assert.ok((await client(server.url).get("/api/banlists")).data.banlists.some((b) => b.key === "tcg"));
});

test("spectateurs et historique : le spectateur ne voit aucune main, les deux joueurs retrouvent le duel", { timeout: 30000 }, async () => {
    const { code } = (await alice.api.post("/api/duel", { mode: "create", ydk: YDK })).data;
    await bob.api.post("/api/duel", { mode: "join", code, ydk: YDK });
    assert.ok((await client(server.url).get("/api/duels")).data.duels.some((d) => d.code === code));
    const [ea, eb] = [alice, bob].map((p) => stream(server.url, p.key));
    const watcher = stream(server.url, null, `/api/duel/watch?code=${code}`);
    const room = await watcher.next("room");
    assert.deepEqual([room.watch, room.me, room.opponent], [true, "Alice", "Bob"]);
    autoPlay(alice, ea);
    autoPlay(bob, eb);
    const seen = await watcher.next("state", (s) => s.state.turn >= 3);
    for (const side of ["me", "bot"]) assert.ok(seen.state[side].hand.every((c) => !c || c.code === 0), `main ${side} visible`);
    assert.equal(seen.prompt, null);
    assert.ok(!seen.state.log.some((l) => /^Tu /.test(l.text)), "journal écrit à la 2e personne");
    assert.ok(seen.state.log.some((l) => l.name === "Alice" || l.name === "Bob"));
    await Promise.all([ea, eb].map((e) => e.next("state", (s) => s.over, 25000)));
    const end = await watcher.next("state", (s) => s.over);
    assert.match(end.state.over, /^(Alice|Bob) gagne le duel\.$/);
    for (const p of [alice, bob]) {
        const [last] = (await p.api.get("/api/history")).data.duels;
        assert.equal(last.opponent, p === alice ? "Bob" : "Alice");
        assert.ok(["victoire", "défaite"].includes(last.result));
    }
    [ea, eb, watcher].forEach((e) => e.close());
});

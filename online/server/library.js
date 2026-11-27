// Collections et decks publiés depuis l'appli locale (EX-C1, EX-K1), visibilité (EX-C2) et amis (EX-C3).
// Une publication remplace la précédente ; les données sont vérifiées et bornées avant d'être enregistrées.
import { HttpError } from "./http.js";

const VISIBILITY = ["public", "friends", "private"];
const MAX_CARDS = 30000, MAX_DECKS = 100;
const text = (v, max) => String(v ?? "").slice(0, max);
const count = (v, max) => Math.max(0, Math.min(max, Math.floor(Number(v) || 0)));
const NOT_FOUND = () => new HttpError(404, "Collection introuvable.");

function cleanCard(c, withLocations) {
    const id = count(c?.id, 2 ** 31);
    const qty = count(c?.qty, 9999);
    if (!id || !qty) return null;
    const card = {
        id, qty, name: text(c.name, 120), category: text(c.category, 40), type: text(c.type, 60),
        archetype: text(c.archetype, 60), value: Math.round(Math.min(1e6, Math.max(0, Number(c.value) || 0)) * 100) / 100,
        rarities: (Array.isArray(c.rarities) ? c.rarities : []).slice(0, 12).map((r) => text(r, 40)).filter(Boolean),
    };
    if (withLocations && Array.isArray(c.locations)) {
        card.locations = c.locations.slice(0, 50).map((l) => [text(l?.[0], 60), count(l?.[1], 9999)]).filter((l) => l[0] && l[1]);
    }
    return card;
}

function cleanDeck(d) {
    const codes = (v) => (Array.isArray(v) ? v : []).slice(0, 90).map((c) => count(c, 2 ** 31)).filter(Boolean);
    const name = text(d?.name, 60).trim();
    return name ? { name, main: codes(d.main), extra: codes(d.extra), visible: !!d.visible } : null;
}

export function openLibrary(db, players, nameOf = () => "") {
    db.exec(`CREATE TABLE IF NOT EXISTS collections (
        player_id INTEGER PRIMARY KEY REFERENCES players(id),
        visibility TEXT NOT NULL DEFAULT 'private',
        published TEXT NOT NULL,
        cards TEXT NOT NULL,
        n_cards INTEGER NOT NULL, n_copies INTEGER NOT NULL, value REAL NOT NULL
    );
    CREATE TABLE IF NOT EXISTS decks (
        player_id INTEGER NOT NULL REFERENCES players(id),
        name TEXT NOT NULL,
        main TEXT NOT NULL, extra TEXT NOT NULL,
        visible INTEGER NOT NULL DEFAULT 0,
        PRIMARY KEY (player_id, name)
    );
    CREATE TABLE IF NOT EXISTS friends (
        owner_id INTEGER NOT NULL REFERENCES players(id),
        friend_id INTEGER NOT NULL REFERENCES players(id),
        PRIMARY KEY (owner_id, friend_id)
    )`);
    const now = () => new Date().toISOString().slice(0, 19).replace("T", " ");
    const isFriend = (ownerId, viewerId) => !!db.prepare("SELECT 1 FROM friends WHERE owner_id = ? AND friend_id = ?").get(ownerId, viewerId);
    const canSee = (row, viewer) => row.visibility === "public" || (viewer && (viewer.id === Number(row.player_id)
        || (row.visibility === "friends" && isFriend(Number(row.player_id), viewer.id))));
    const decksOf = (playerId) => db.prepare("SELECT name, main, extra, visible FROM decks WHERE player_id = ? ORDER BY name").all(playerId)
        .map((r) => ({ name: r.name, main: JSON.parse(r.main), extra: JSON.parse(r.extra), visible: !!r.visible }));
    const summary = (r) => ({ pseudo: r.pseudo, visibility: r.visibility, published: r.published,
        cards: Number(r.n_cards), copies: Number(r.n_copies), value: r.value });

    return {
        // Publication depuis l'appli locale : collection et decks remplacent la version précédente.
        publish(player, body) {
            if (!Array.isArray(body.cards) || body.cards.length > MAX_CARDS) throw new HttpError(400, "Collection invalide.");
            if (!Array.isArray(body.decks) || body.decks.length > MAX_DECKS) throw new HttpError(400, "Decks invalides.");
            const cards = body.cards.map((c) => cleanCard(c, !!body.locations)).filter(Boolean);
            const decks = [...new Map(body.decks.map(cleanDeck).filter(Boolean).map((d) => [d.name, d])).values()];
            const old = db.prepare("SELECT visibility FROM collections WHERE player_id = ?").get(player.id);
            const visibility = VISIBILITY.includes(body.visibility) ? body.visibility : old?.visibility || "private";
            const published = now();
            db.exec("BEGIN");
            try {
                db.prepare(`INSERT OR REPLACE INTO collections (player_id, visibility, published, cards, n_cards, n_copies, value)
                            VALUES (?, ?, ?, ?, ?, ?, ?)`).run(player.id, visibility, published, JSON.stringify(cards), cards.length,
                    cards.reduce((n, c) => n + c.qty, 0), Math.round(cards.reduce((n, c) => n + c.value, 0) * 100) / 100);
                db.prepare("DELETE FROM decks WHERE player_id = ?").run(player.id);
                const add = db.prepare("INSERT INTO decks (player_id, name, main, extra, visible) VALUES (?, ?, ?, ?, ?)");
                for (const d of decks) add.run(player.id, d.name, JSON.stringify(d.main), JSON.stringify(d.extra), d.visible ? 1 : 0);
                db.exec("COMMIT");
            } catch (e) { db.exec("ROLLBACK"); throw e; }
            return { published, visibility, cards: cards.length, decks: decks.length };
        },
        setVisibility(player, visibility) {
            if (!VISIBILITY.includes(visibility)) throw new HttpError(400, "Visibilité inconnue.");
            const { changes } = db.prepare("UPDATE collections SET visibility = ? WHERE player_id = ?").run(visibility, player.id);
            if (!changes) throw new HttpError(400, "Publie d'abord ta collection depuis l'appli.");
        },
        // Ce que le joueur a publié, pour sa page « Mon compte » et l'appli locale.
        mine(player) {
            const row = db.prepare("SELECT c.*, ? AS pseudo FROM collections c WHERE player_id = ?").get(player.pseudo, player.id);
            return { collection: row ? summary(row) : null, decks: decksOf(player.id)
                .map((d) => ({ name: d.name, main: d.main.length, extra: d.extra.length, visible: d.visible })) };
        },
        myDecks: (player) => decksOf(player.id),
        // Collection d'un joueur : refusée de la même façon qu'elle soit absente ou cachée (EX-C2).
        collection(viewer, pseudo) {
            const owner = players.playerByPseudo(pseudo);
            const row = owner && db.prepare("SELECT * FROM collections WHERE player_id = ?").get(owner.id);
            if (!row || !canSee(row, viewer)) throw NOT_FOUND();
            const mine = !!viewer && viewer.id === owner.id;
            const decks = decksOf(owner.id).filter((d) => mine || d.visible);
            const names = Object.fromEntries(decks.flatMap((d) => [...d.main, ...d.extra]).map((c) => [c, nameOf(c)]));
            return { ...summary({ ...row, pseudo: owner.pseudo }), mine, cards: JSON.parse(row.cards), decks, names };
        },
        // Annuaire : collections publiques et celles que leurs propriétaires partagent avec moi.
        directory(viewer) {
            const rows = db.prepare(`SELECT c.*, p.pseudo FROM collections c JOIN players p ON p.id = c.player_id
                                     WHERE c.visibility = 'public' OR c.player_id = ?1 OR (c.visibility = 'friends'
                                       AND EXISTS (SELECT 1 FROM friends f WHERE f.owner_id = c.player_id AND f.friend_id = ?1))
                                     ORDER BY c.published DESC`).all(viewer ? viewer.id : -1);
            return rows.map(summary);
        },
        friends: (player) => db.prepare(`SELECT p.pseudo FROM friends f JOIN players p ON p.id = f.friend_id
                                         WHERE f.owner_id = ? ORDER BY p.pseudo`).all(player.id).map((r) => r.pseudo),
        addFriend(player, pseudo) {
            const friend = players.playerByPseudo(pseudo);
            if (!friend) throw new HttpError(404, "Aucun joueur avec ce pseudo.");
            if (friend.id === player.id) throw new HttpError(400, "Tu vois déjà ta propre collection.");
            db.prepare("INSERT OR IGNORE INTO friends (owner_id, friend_id) VALUES (?, ?)").run(player.id, friend.id);
        },
        removeFriend(player, pseudo) {
            const friend = players.playerByPseudo(pseudo);
            if (friend) db.prepare("DELETE FROM friends WHERE owner_id = ? AND friend_id = ?").run(player.id, friend.id);
        },
    };
}

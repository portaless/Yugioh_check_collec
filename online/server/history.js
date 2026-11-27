// Historique des duels (EX-D8) : adversaire, decks, vainqueur et date, visible par les deux joueurs du duel.
const REASONS = { duel: "", abandon: "par abandon", temps: "temps de réponse écoulé", erreur: "erreur du moteur" };

export function openHistory(db) {
    db.exec(`CREATE TABLE IF NOT EXISTS duels (
        id INTEGER PRIMARY KEY,
        ended TEXT NOT NULL DEFAULT (datetime('now')),
        player0 INTEGER NOT NULL REFERENCES players(id), player1 INTEGER NOT NULL REFERENCES players(id),
        deck0 TEXT NOT NULL, deck1 TEXT NOT NULL,
        winner INTEGER,              -- siège du vainqueur (0 ou 1), NULL si personne
        reason TEXT NOT NULL,
        turns INTEGER NOT NULL
    )`);
    return {
        // seats : [{ player, deck }, …] ; result : { winner, reason } (null si le duel s'est arrêté sans fin)
        record(seats, result, turns) {
            db.prepare(`INSERT INTO duels (player0, player1, deck0, deck1, winner, reason, turns) VALUES (?, ?, ?, ?, ?, ?, ?)`)
                .run(seats[0].player.id, seats[1].player.id, seats[0].deck.name, seats[1].deck.name,
                    result ? result.winner : null, result ? result.reason : "erreur", turns);
        },
        forPlayer(player, limit = 50) {
            return db.prepare(`SELECT d.*, p0.pseudo AS pseudo0, p1.pseudo AS pseudo1 FROM duels d
                               JOIN players p0 ON p0.id = d.player0 JOIN players p1 ON p1.id = d.player1
                               WHERE d.player0 = ?1 OR d.player1 = ?1 ORDER BY d.id DESC LIMIT ?2`).all(player.id, limit)
                .map((r) => {
                    const seat = Number(r.player0) === player.id ? 0 : 1;
                    const winner = r.winner === null ? null : Number(r.winner);
                    return { date: r.ended, opponent: seat ? r.pseudo0 : r.pseudo1, myDeck: seat ? r.deck1 : r.deck0,
                        theirDeck: seat ? r.deck0 : r.deck1, turns: Number(r.turns), reason: REASONS[r.reason] ?? "",
                        result: winner === null ? "sans vainqueur" : winner === seat ? "victoire" : "défaite" };
                });
        },
    };
}

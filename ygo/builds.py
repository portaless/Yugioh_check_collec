"""Proposition de build Mekk-Chevalier construite uniquement avec les cartes du stock."""
from .importer import save_deck_from_counts

NAME = "mekk_opti (proposition)"

MAIN = {
    # Moteur Mekk : 15 monstres qui s'invoquent seuls dès que 2 cartes partagent une colonne
    "Mekk-Knight Blue Sky": 3, "Mekk-Knight Red Moon": 3, "Mekk-Knight Purple Nightfall": 2,
    "Mekk-Knight Yellow Star": 2, "Mekk-Knight Indigo Eclipse": 1, "Mekk-Knight Orange Sunset": 1,
    "Girsu, the Orcust Mekk-Knight": 3,
    # Handtraps du stock
    "Ash Blossom & Joyous Spring": 3, "Effect Veiler": 2, "Infinite Impermanence": 3,
    "Nibiru, the Primal Being": 1, "Mulcharmy Fuwalos": 1,
    # Board breakers / jeu en second
    "Lava Golem": 1, "Raigeki": 1, "Harpie's Feather Duster": 1, "Change of Heart": 1,
    "Monster Reborn": 1, "Triple Tactics Thrust": 1, "Pot of Prosperity": 1,
    # Héritage du Monde
    "World Legacy's Memory": 2, "World Legacy Scars": 1, "World Legacy Key": 1,
    "World Legacy's Secret": 2, "World Legacy Whispers": 1, "Solemn Judgment": 1,
}

EXTRA = {
    "Mekk-Knight Crusadia Avramax": 2, "Mekk-Knight Spectrum Supreme": 2, "Mekk-Knight of the Morning Star": 2,
    "I:P Masquerena": 2, "S:P Little Knight": 2, "Accesscode Talker": 1, "Chaos Angel": 1,
    "Psychic End Punisher": 1, "Hyper Psychic Blaster": 1, "Time Thief Redoer": 1,
}

SIDE = {
    "Droll & Lock Bird": 1, "Mulcharmy Purulia": 1, "Mulcharmy Meowls": 1, "Nibiru, the Primal Being": 1,
    "Mekk-Knight Green Horizon": 1, "World Legacy Key": 1, "World Legacy Whispers": 1, "Pot of Avarice": 1,
}

RATIONALE = """
**Idée directrice : un deck de 40 cartes centré sur les Mekk-Chevaliers, pensé pour jouer en second.**
Un Mekk-Chevalier s'invoque gratuitement dès que 2 cartes sont dans la même colonne. Plus l'adversaire
remplit son terrain, plus tes Mekk-Chevaliers sont faciles à poser. *Ciel Bleu* cherche même un Mekk-Chevalier
par carte adverse dans sa colonne.

**Ce qui sort du deck bêta (61 → 40 cartes)**
- *Rivalité des Seigneurs de Guerre* : interdite en TCG.
- Le moteur Psychique (Arlequin Psy, Sorcière, Clerc, Maniroue, Commandant, Processeur, Hélix, Téléporteur
  d'Urgence, Zone de Repos, Surcharge, Pouvoir Télépathique, Téléportateur Multiple) et le pack Mode Assaut.
  Ces cartes sont anciennes, peu synergiques avec les Mekk et diluent la pioche : avec 61 cartes, tu as
  nettement moins de chances d'ouvrir *Ciel Bleu* ou *Girsu*.
- *Force de Miroir*, *Pommes d'Or*, *L'Union fait la Force*, *Pot d'Avarice* : trop lents ou trop situationnels.

**Ce qui entre, depuis ton stock Arc-V**
- 3 *Infinite Impermanence*, 2 *Effect Veiler*, une 3e *Floraison de Cendres*, *Nibiru* et *Mulcharmy Fuwalos* :
  ils interrompent le combo adverse quand tu joues en second.
- *Poussée des Triples Tactiques* : si l'adversaire a activé un effet de monstre, elle pose depuis le deck
  une Magie/Piège Normale (*Raigeki*, *Plumeau*, *Changement de Cœur*, *Monster Reborn*).
- *Pot de la Prospérité* pour la consistance. Attention : tu ne peux plus piocher par effet ce tour-là,
  donc pas de pioche avec *Cicatrices*.

**Extra deck**
- *Girsu* devient Syntoniseur s'il y a 2 autres cartes dans sa colonne. Girsu (4) + Lune Rouge/Étoile Jaune (7)
  donne *Punisseur de la Fin Psychique* (11). Girsu + Ciel Bleu (5, Psychique) donne *Artilleur Hyper Psychique* (9).
- *Ange du Chaos* (10) traite un monstre LUMIÈRE comme Syntoniseur : Ciel Bleu + Ciel Bleu, ou Girsu + Coucher du Soleil.
  À l'invocation, il bannit 1 carte.
- *S:P Petite Chevaleresque*, *Accècodeur Bavard* et *I:P Masquerena* sont des Links génériques. Ils ouvrent
  aussi la voie à *Avramax* (2+ monstres invoqués depuis l'Extra Deck).

**Pistes d'achat** : *World Legacy Discovery*, *Enlilgirsu, the Orcust Mekk-Knight* et *Mekk-Knight Avram*
manquent à ta collection.
"""


def _counts(con, names: dict[str, int]) -> dict[int, int]:
    out = {}
    for name, qty in names.items():
        row = con.execute("SELECT id FROM cards WHERE name_en = ?", (name,)).fetchone()
        if row is None:
            raise KeyError(name)
        out[row["id"]] = qty
    return out


def create(con) -> int:
    deck_id = save_deck_from_counts(con, NAME, _counts(con, {**MAIN, **EXTRA}))
    for card_id, qty in _counts(con, SIDE).items():
        con.execute("INSERT OR REPLACE INTO deck_cards VALUES (?, ?, 'side', ?)", (deck_id, card_id, qty))
    con.execute("UPDATE decks SET notes = ? WHERE id = ?", (RATIONALE.strip(), deck_id))
    con.commit()
    return deck_id

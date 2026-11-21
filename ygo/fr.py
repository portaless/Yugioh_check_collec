"""Traductions françaises des termes du catalogue (l'API renvoie types, attributs et banlist en anglais)."""

RACES = {
    "Aqua": "Aqua", "Beast": "Bête", "Beast-Warrior": "Bête-Guerrier", "Creator God": "Dieu Créateur",
    "Cyberse": "Cyberse", "Dinosaur": "Dinosaure", "Divine-Beast": "Bête Divine", "Dragon": "Dragon",
    "Fairy": "Elfe", "Fiend": "Démon", "Fish": "Poisson", "Illusion": "Illusion", "Insect": "Insecte",
    "Machine": "Machine", "Plant": "Plante", "Psychic": "Psychique", "Pyro": "Pyro", "Reptile": "Reptile",
    "Rock": "Rocher", "Sea Serpent": "Serpent de Mer", "Spellcaster": "Magicien", "Thunder": "Tonnerre",
    "Warrior": "Guerrier", "Winged Beast": "Bête Ailée", "Wyrm": "Wyrm", "Zombie": "Zombie",
    # sous-types de Magie / Piège
    "Normal": "Normale", "Continuous": "Continue", "Counter": "Contre-Piège", "Equip": "Équipement",
    "Field": "Terrain", "Quick-Play": "Jeu-Rapide", "Ritual": "Rituelle",
}

ATTRIBUTES = {
    "LIGHT": "LUMIÈRE", "DARK": "TÉNÈBRES", "EARTH": "TERRE", "WATER": "EAU",
    "FIRE": "FEU", "WIND": "VENT", "DIVINE": "DIVIN",
}

BANLIST = {"Forbidden": "Interdite", "Banned": "Interdite", "Limited": "Limitée", "Semi-Limited": "Semi-Limitée"}

ARCHETYPES = {
    "-Eyes Dragon": "Dragon aux Yeux", "Archfiend": "Archdémon", "Assault Mode": "Mode Assaut",
    "Clear Wing": "Aile Claire", "Code Talker": "Codeur", "Fire Fist": "Poing de Feu",
    "Fire Formation": "Formation Feu", "Greed": "Avarice", "Harpie": "Harpie", "Hi-Speedroid": "Grande Vitesseroid",
    "Lunalight": "Clair de Lune", "Magician": "Magicien", "Mekk-Knight": "Mekk-Chevalier",
    "Odd-Eyes": "Yeux Impairs", "Pendulum": "Pendule", "Performapal": "Potartiste",
    "Phantom Knights": "Chevaliers Fantômes", "Primite": "Primite", "Roid": "Roid", "roid": "Roid",
    "Salamangreat": "Salamangrande", "Solemn": "Solennel", "Speedroid": "Vitesseroid", "Stardust": "Poussière d'Étoile",
    "Time Thief": "Voleur de Temps", "Toy": "Jouet", "Tri-Brigade": "Tri-Brigade", "Utopia": "Utopie",
    "World Legacy": "Héritage du Monde", "Crusadia": "Croisédia",
}

ZONES = {"main": "Main Deck", "extra": "Extra Deck", "side": "Side Deck"}
ZONES_REV = {v: k for k, v in ZONES.items()}


def tr(table: dict, value):
    if value is None or value != value:  # None ou NaN
        return ""
    return table.get(value, value)

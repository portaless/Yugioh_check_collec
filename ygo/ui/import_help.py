"""Explications de la page Import : remplir l'Excel, d'où viennent les prix, la banlist, le build proposé."""

import pandas as pd
import streamlit as st

from ygo import analysis as A
from ygo import cardtrader
from ygo import importer
from ygo.fr import BANLIST, tr
from ygo.ui.core import con


def explain_excel():
    st.markdown("""
#### Une feuille = un emplacement
Chaque feuille du classeur représente un endroit où sont rangées tes cartes (`Arc-v`, `classeur`, `boite A`…).
Ton stock total d'une carte est la **somme de toutes les feuilles**.
Une feuille dont le nom commence par **`deck_`** (ex. `deck_mekk_beta`) est en plus importée comme **deck** :
ses cartes comptent dans ton stock *et* forment un deck dans le Constructeur.

#### Les colonnes
La première ligne doit contenir les en-têtes ci-dessous. Seules quelques colonnes sont lues : toutes les autres
informations (type, effet, banlist…) viennent du catalogue officiel, inutile de les remplir.
""")
    st.dataframe(pd.DataFrame([
        {"Colonne": "carte", "Utilisée": "Oui", "Rôle": "Nom de la carte, en français ou en anglais. Les fautes et "
                                                       "les accents manquants sont tolérés."},
        {"Colonne": "nombre", "Utilisée": "Oui", "Rôle": "Nombre d'exemplaires (1 si vide). Une carte notée sur plusieurs lignes "
                                                                  "identiques est regroupée en une seule, quantités additionnées (dans l'Excel aussi)."},
        {"Colonne": "magie / piège / monstre", "Utilisée": "Aide", "Rôle": "Un « x » dans la bonne colonne aide à "
                                                                         "distinguer deux cartes au nom proche."},
        {"Colonne": "fusion / synchro / xyz / link", "Utilisée": "Aide", "Rôle": "Un « x » indique un monstre "
                                                                               "d'Extra Deck (même usage)."},
        {"Colonne": "étoile", "Utilisée": "Aide", "Rôle": "Niveau, Rang ou valeur Lien : départage les homonymes."},
        {"Colonne": "rareté", "Utilisée": "Oui", "Rôle": "Rareté de ton exemplaire, en français, en anglais ou en "
                                                         "abrégé (Commune, Rare, SR, Ultra Rare, ScR, Starlight…). "
                                                         "Pour une même carte en deux raretés, fais deux lignes."},
        {"Colonne": "code", "Utilisée": "Facultative", "Rôle": "Code imprimé sous l'illustration (ex. CRMS-FR042) : "
                                                               "désigne l'extension exacte, donc le prix exact. Sans "
                                                               "code, le prix est celui de la rareté la moins chère."},
        {"Colonne": "pendule, ban, limitation, effet, contexte, type", "Utilisée": "Non",
         "Rôle": "Ignorées : remplies automatiquement depuis le catalogue."},
    ]), hide_index=True, width="stretch")
    st.markdown("""
#### Exemple
| carte | magie | piège | monstre | synchro | étoile | nombre | rareté | code |
|---|---|---|---|---|---|---|---|---|
| Ciel Bleu Mekk-Chevalier | | | x | | 5 | 3 | Commune | |
| Infini Éphémère | | x | | | | 2 | Secret Rare | |
| Infini Éphémère | | x | | | | 1 | Starlight | |
| Artilleur Hyper Psychique | | | x | x | 9 | 1 | Ultra Rare | CRMS-FR042 |
| Artilleur Hyper Psychique | | | x | x | 9 | 1 | Rare | LC5D-FR235 |

#### Reconnaissance des noms
Chaque nom est comparé aux 14 000+ cartes du catalogue (noms français et anglais). Au-dessus de 95/100 de
ressemblance, la carte est reconnue automatiquement ; en dessous, elle part dans la page **Corrections**, où ton
choix est enregistré dans `corrections.json` pour tous les imports suivants. Une même carte présente sur plusieurs
lignes d'une feuille voit ses quantités additionnées.
""")
    sheets = con.execute("""SELECT location, COUNT(*) AS lignes, SUM(quantity) AS cartes,
                            SUM(card_id IS NULL) AS non_reconnues FROM collection GROUP BY location""").fetchall()
    if sheets:
        st.markdown("#### Ton fichier actuel")
        st.dataframe(pd.DataFrame([{"Feuille": r["location"], "Lignes": r["lignes"], "Exemplaires": r["cartes"],
                                    "Non reconnues": r["non_reconnues"]} for r in sheets]), hide_index=True)


def explain_prices():
    st.markdown(f"""
#### D'où viennent les prix ?
Du **guide des prix Cardmarket**, publié chaque jour en accès libre. Le prix affiché est le **prix tendance**
d'une impression précise (extension + rareté), toutes langues confondues. Le bouton « Mettre à jour les prix
Cardmarket » ci-dessus le retélécharge.

#### Le problème de la rareté
Les fichiers de Cardmarket donnent, pour chaque produit, le nom de la carte et un numéro d'extension, mais **pas
la rareté**. Quand une carte existe en une seule rareté dans une extension, pas de doute. Quand elle en a
plusieurs (ex. Ultra Rare et Ultimate Rare dans Crimson Crisis), il faut savoir quel produit est lequel :

| Marque | Signification |
|---|---|
| *(rien)* | Exact : une seule possibilité, rareté donnée par CardTrader ou choisie par toi |
| ≈ | Déduit : produits attribués de la rareté la plus commune à la plus rare, et les prix confirment cet ordre (fiable à ~90 %) |
| ? | Douteux : les prix contredisent l'ordre, ou le nombre de produits ne correspond pas. À vérifier dans **Corrections** |

#### CardTrader, pour lever les doutes
CardTrader (autre site de vente européen) indique pour chacune de ses impressions la rareté **et** l'identifiant
Cardmarket correspondant. Avec son jeton, chaque produit Cardmarket retrouve sa rareté exacte.
1. Crée un compte gratuit sur cardtrader.com.
2. Dans les **paramètres de ton profil**, copie ton **jeton API** (« API token »).
3. Colle-le seul dans le fichier `{cardtrader.TOKEN_PATH.relative_to(importer.ROOT)}` (non envoyé sur GitHub).
4. Clique sur « Mettre à jour les prix Cardmarket ». La première fois, la lecture de CardTrader prend quelques minutes.

Statut : **{"jeton trouvé" if cardtrader.token() else "pas de jeton"}**, {len(cardtrader.load_index())} produits
Cardmarket dont la rareté est connue par CardTrader.

#### Ce qui n'est pas fait
Le site Cardmarket affiche bien la rareté, mais il n'est **pas lu automatiquement** : c'est interdit par ses
conditions d'utilisation, et ton compte pourrait être suspendu. Son API officielle est réservée aux vendeurs
professionnels.
""")
    rows = con.execute("""SELECT COALESCE(confidence, 'sans prix') AS c, COUNT(*) AS n FROM printings
                          WHERE card_id IN (SELECT card_id FROM collection) GROUP BY 1""").fetchall()
    if rows:
        names = {"manuel": "Choisies à la main", "exact": "Exactes", "deduit": "Déduites (≈)", "doute": "Douteuses (?)",
                 "sans prix": "Sans prix (extension non trouvée)"}
        st.markdown("#### Impressions de tes cartes")
        st.dataframe(pd.DataFrame([{"Statut": names.get(r["c"], r["c"]), "Impressions": r["n"]} for r in rows]),
                     hide_index=True)


def explain_banlist():
    catalog_file = importer.DATA_DIR / "cards_en.json"
    from datetime import datetime
    updated = datetime.fromtimestamp(catalog_file.stat().st_mtime).strftime("%d/%m/%Y") if catalog_file.exists() else "?"
    st.markdown(f"""
#### D'où vient la banlist ?
La banlist est celle du **TCG** (format des tournois officiels en Europe et en Amérique). Elle est fournie
avec le catalogue YGOPRODeck, mis à jour le **{updated}**. Konami la change plusieurs fois par an : le bouton
« Mettre à jour le catalogue » ci-dessus récupère la dernière version.

#### Les statuts
| Statut | Exemplaires autorisés dans Main + Extra + Side |
|---|---|
| Illimitée | 3 |
| Semi-Limitée | 2 |
| Limitée | 1 |
| Interdite | 0 : la carte rend le deck illégal |

Le statut est affiché sur chaque fiche de carte. Le Constructeur et l'Analyse signalent un deck qui dépasse ces limites.
""")
    rows = con.execute("""SELECT c.name_fr, c.name_en, c.ban_tcg, o.owned FROM owned o JOIN cards c ON c.id = o.card_id
                          WHERE c.ban_tcg IS NOT NULL ORDER BY c.ban_tcg, c.name_fr""").fetchall()
    if rows:
        st.markdown("#### Tes cartes concernées")
        st.dataframe(pd.DataFrame([{"Carte": r["name_fr"] or r["name_en"], "Statut": tr(BANLIST, r["ban_tcg"]),
                                    "Autorisées": A.BAN_LIMIT.get(r["ban_tcg"], 3), "En stock": r["owned"]}
                                   for r in rows]), hide_index=True, width="stretch")


def explain_build():
    st.markdown("""
#### Un algorithme d'optimisation
Les builds se calculent dans la page **Générateur de build**. Un algorithme y cherche, parmi les combinaisons
possibles de ton stock, le Main Deck qui maximise tes objectifs.

**1. Les contraintes, non négociables**
- Uniquement des cartes de **ton stock** : chaque carte est plafonnée à min(stock, banlist, 3) exemplaires.
- La **banlist TCG** (voir l'onglet précédent).
- La taille du Main Deck que tu choisis (40 à 60), plus les cartes que tu **forces** ou **exclues**.

**2. Le score d'un deck**
Chaque deck candidat est jugé par simulation de mains de départ, avec le même modèle que les pages Duel et Méta :
- part de **mains fortes en premier** (un starter, de quoi l'invoquer et une protection pour le tour adverse) ;
- part de **mains fortes en second** (un starter et de quoi couper le combo adverse ou nettoyer son terrain) ;
- **indice face au méta** : régularité face aux interruptions des decks qui gagnent actuellement en tournoi ;
- une pénalité pour les cartes **hors moteur** (ni du moteur choisi, ni interruption, protection ou destruction).

Tu règles le poids de chaque objectif avec des curseurs.

**3. La recherche**
- **Départ glouton** : on remplit le deck avec les cartes les plus utiles (starters, interruptions, protections…).
- **Recuit simulé** : des milliers de fois, on retire une carte et on en ajoute une autre. Une amélioration est
  toujours gardée ; une dégradation l'est parfois au début, pour ne pas rester bloqué sur une solution moyenne.
- Tous les essais sont jugés sur **les mêmes mains tirées** : deux variantes se comparent équitablement.

**4. La vérification**
Le deck trouvé est réévalué sur **20 000 nouvelles mains** et comparé à tes autres builds. Un gain qui ne serait
qu'un coup de chance des tirages de la recherche disparaîtrait à cette étape.

**5. L'Extra Deck**
Il est rempli par règles : tes cartes forcées, puis l'Extra du moteur, puis les Extra génériques invocables avec
tes monstres (Synchro s'il y a un Syntoniseur dans le Main, Xyz s'il y a assez de monstres du bon niveau).

**Limites du modèle**
L'algorithme optimise la **régularité des mains**, pas l'issue d'un duel : il ne joue pas les combos et ne connaît
chaque carte que par son rôle. Garde un œil critique sur le résultat ; les cartes forcées et exclues sont là pour
ça. La proposition `mekk_opti`, construite à la main, reste disponible pour comparer.
""")

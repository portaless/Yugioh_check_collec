# Collection Yu-Gi-Oh!

Base SQLite de ma collection (source : `yugioh.xlsx`) enrichie avec le catalogue YGOPRODeck, et IHM Streamlit pour parcourir les cartes, construire des decks de n'importe quel archétype et les mesurer face au méta.

## Démarrage

Après un `git clone` :

```bash
python -m venv .venv                              # une seule fois : crée l'environnement Python
.venv\Scripts\python.exe -m pip install -r requirements.txt
.venv\Scripts\python.exe lancer.py                # ou : python -m streamlit run app.py
```

Au premier lancement, l'appli s'installe toute seule (quelques minutes, connexion internet requise) : catalogue des
cartes, collection de l'Excel, decks, méta et prix. Même chose en ligne de commande : `python -m ygo.install`.

### Gérer ta propre collection

Le dépôt contient la collection de son auteur, pour la démonstration. Pour suivre la tienne : page **Import** →
« Créer ma collection » (ou `python -m ygo.install --ma-collection`). Cela crée `ma_collection/` avec un Excel vierge ;
relance l'appli, remplis `ma_collection/yugioh.xlsx`, puis « Réimporter l'Excel ». Ce dossier n'est pas versionné :
tes `git pull` ne touchent pas à ta collection. Supprime-le pour revenir à celle du dépôt.

Le jeton CardTrader est facultatif : sans lui, les raretés exactes viennent de `cardtrader_index.json.gz` ; seules les
extensions sorties depuis auront un prix déduit (≈). Pour le tien, voir **Import → Les prix**.

Pour tout mettre à jour ensuite, la page **Import**, ou :

```bash
.venv\Scripts\python.exe -m ygo.importer --refresh  # retélécharge le catalogue et réimporte l'Excel
.venv\Scripts\python.exe -m ygo.meta                # decks de tournoi récents
.venv\Scripts\python.exe -m ygo.cardmarket --refresh --cardtrader  # prix (et raretés exactes, avec le jeton)
```

Tests : `.venv\Scripts\python.exe -m pytest` (les tests de pages sont ignorés tant que `data/yugioh.db` n'existe pas).

## Pages

| Section | Page | Rôle |
|---|---|---|
| Ma collection | Collection | Galerie de tes cartes, fiche agrandie navigable au clavier (← →) avec ton stock par rareté, rangement (feuille de l'Excel), prix et effet de rareté |
| | Saisir ma collection | Ajouter, modifier ou retirer des cartes avec auto-complétion, sans ouvrir l'Excel |
| | Constructeur de deck | Composer un deck, légalité et régularité des mains en direct, export `.ydk` |
| | Bourse | Évolution du prix de tes cartes et de ta collection depuis le 1er novembre 2026, relevé Cardmarket quotidien |
| Analyse | Analyse | Composition et probabilités d'un deck |
| | Duel de decks | Deux decks face à face : KPI, duel simulé sur un plateau (rejoué étape par étape), leviers |
| | Duel contre la méta | Tu joues ton deck à la main contre une liste de tournoi jouée par un bot : combats, points de vie, interruptions (`ygo/playtest.py`, `ygo/ui/duel_meta.js`) |
| | Simulation méta | Tes builds contre les decks qui gagnent en tournoi |
| | Générateur de build | Meilleur deck d'un archétype avec ton stock : recuit simulé sous contraintes de stock et de banlist |
| Données | Corrections / Import | Reconnaissance des noms, version Cardmarket des raretés incertaines, réimport, prix, banlist, méthode |

## Organisation du code

- `app.py` : configuration et navigation uniquement.
- `ygo/` : le cœur, sans interface — `db.py` (schéma), `importer.py` (Excel + catalogue), `analysis.py` (rôles, légalité,
  probabilités), `stock.py` (saisie de la collection depuis l'IHM), `plan.py` (moteur d'un deck et rôle des cartes, lus dans leur texte), `simulation.py` (mains et matchups), `optimizer.py` (générateur), `meta.py` (decks de tournoi),
  `fr.py` (traductions), `builds.py` (proposition manuelle `mekk_opti`), `rarity.py` (raretés),
  `cardmarket.py` (prix par impression), `cardtrader.py` (rareté exacte des produits Cardmarket),
  `bourse.py` (historique des prix).
- `ygo/ui/` : l'interface — `core.py` (catalogue, galerie, visionneuse), `style.py` (direction artistique), une page par module.
- `ygo/viewer.html` : visionneuse de cartes exécutée dans le navigateur.
- `.streamlit/config.toml` : thème (bleu nuit et or, Cinzel / Inter).
- `tests/` : tests unitaires sur une base autonome + rendu de chaque page.

## Moteur d'un deck

Chaque deck a un **moteur** : l'archétype autour duquel il est construit (choix « Moteur du deck » dans le
Constructeur, l'Analyse et le Duel ; par défaut, l'archétype le plus présent). Les rôles se déduisent du texte
anglais des cartes, pour n'importe quel archétype : *starter* (s'invoque depuis la main, ou ajoute / invoque /
envoie au cimetière depuis le deck), *moteur* (carte de l'archétype ou qui le nomme), interruption, protection,
destruction, et *hors moteur*. C'est une heuristique : elle ne joue pas les combos.

## Données

- La page **Saisir ma collection** écrit elle-même dans l'Excel (nom, nombre, rareté, code), puis le complète et le
  réimporte : l'Excel reste le stockage, mais il n'est plus nécessaire de l'ouvrir.
- Une feuille Excel = un emplacement (`Arc-v`, `classeur`, `boite A`…). Les feuilles `deck_…` sont aussi importées comme decks.
- Colonnes lues : `carte`, `nombre`, `rareté`, `code` (facultatif, ex. `CRMS-FR042`), et en aide à la reconnaissance `magie`/`piège`/`monstre`,
  `fusion`/`synchro`/`xyz`/`link`, `étoile` (détails dans la page Import).
- Une même carte peut être notée sur plusieurs lignes : les lignes identiques (hors `nombre`) sont regroupées et leurs quantités additionnées, dans la base comme dans l'Excel (si le fichier n'est pas ouvert).
- Excel abrégé : nom, nombre et préfixe d'extension suffisent ; Import → « Compléter l'Excel » (ou `python -m ygo.completer`)
  remplit le reste et surligne en jaune les raretés à choisir.
- `corrections.json` : noms de l'Excel associés à la bonne carte (rempli à la main ou depuis la page **Corrections**).
- `versions_cardmarket.json` : produit Cardmarket choisi à la main quand la rareté d'un produit est incertaine.
- `historique_prix.csv` / `historique_collection.csv` : relevés quotidiens de la page Bourse (prix de chaque
  version possédée, valeur de la collection). Ils ne se régénèrent pas : à garder et à commiter.
- `data/cardtrader_token.txt` (facultatif, non versionné) : jeton API CardTrader, pour la rareté exacte des produits.
- `traductions.json` : noms et textes français (non officiels) des cartes que l'API n'a pas encore en français.
- `noms_fr_officiels.json` : noms français officiels des cartes que YGOPRODeck ne traduit pas, relevés sur Yugipedia (CC BY-SA) par `python -m ygo.noms_fr` ; complété à chaque « Mettre à jour le catalogue ».
- `ma_collection/` (facultatif, non versionné) : s'il existe, remplace les fichiers personnels ci-dessous
  (Excel, corrections, versions, historique, decks).
- `decks.json` : copie des decks de l'IHM, mise à jour automatiquement ; un clone du dépôt les retrouve.
- `cardtrader_index.json.gz` : rareté exacte de chaque produit Cardmarket (copie de l'index CardTrader), pour que
  les clones en profitent sans jeton.
- `data/` et `static/cards/` (non versionnés) : base SQLite, catalogue, decks méta, images, reconstruits au premier lancement.

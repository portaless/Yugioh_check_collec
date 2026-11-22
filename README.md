# Collection Yu-Gi-Oh!

Base SQLite de ma collection (source : `yugioh.xlsx`) enrichie avec le catalogue YGOPRODeck, et IHM Streamlit pour parcourir les cartes, construire des decks Mekk-Chevalier et les mesurer face au méta.

## Démarrage

```bash
python -m venv .venv                              # une seule fois : crée l'environnement Python
.venv\Scripts\python.exe -m pip install -r requirements.txt
.venv\Scripts\python.exe -m ygo.importer          # construit data/yugioh.db (--refresh pour retélécharger le catalogue)
.venv\Scripts\python.exe -m ygo.meta              # télécharge les decks de tournoi récents
.venv\Scripts\python.exe -m ygo.cardmarket        # prix Cardmarket par impression (--cardtrader pour les raretés exactes)
.venv\Scripts\python.exe lancer.py                # ou : python -m streamlit run app.py
```

Tests : `.venv\Scripts\python.exe -m pytest` (les tests de pages sont ignorés tant que `data/yugioh.db` n'existe pas).

## Pages

| Section | Page | Rôle |
|---|---|---|
| Ma collection | Collection | Galerie de tes cartes, fiche agrandie navigable au clavier (← →) avec ton stock par rareté, prix et effet de rareté |
| | Constructeur de deck | Composer un deck, légalité et régularité des mains en direct, export `.ydk` |
| | Bourse | Évolution du prix de tes cartes et de ta collection depuis le 1er novembre 2026, relevé Cardmarket quotidien |
| Analyse | Analyse | Composition et probabilités d'un deck |
| | Duel de decks | Deux decks face à face : KPI, mains d'exemple, leviers |
| | Simulation méta | Tes builds contre les decks qui gagnent en tournoi |
| | Générateur de build | Algorithme d'optimisation (recuit simulé) sous contraintes de stock et de banlist |
| Données | Corrections / Import | Reconnaissance des noms, version Cardmarket des raretés incertaines, réimport, prix, banlist, méthode |

## Organisation du code

- `app.py` : configuration et navigation uniquement.
- `ygo/` : le cœur, sans interface — `db.py` (schéma), `importer.py` (Excel + catalogue), `analysis.py` (rôles, légalité,
  probabilités), `simulation.py` (mains et matchups), `optimizer.py` (générateur), `meta.py` (decks de tournoi),
  `fr.py` (traductions), `builds.py` (proposition manuelle `mekk_opti`), `rarity.py` (raretés),
  `cardmarket.py` (prix par impression), `cardtrader.py` (rareté exacte des produits Cardmarket),
  `bourse.py` (historique des prix).
- `ygo/ui/` : l'interface — `core.py` (catalogue, galerie, visionneuse), `style.py` (direction artistique), une page par module.
- `ygo/viewer.html` : visionneuse de cartes exécutée dans le navigateur.
- `.streamlit/config.toml` : thème (bleu nuit et or, Cinzel / Inter).
- `tests/` : tests unitaires sur une base autonome + rendu de chaque page.

## Données

- Une feuille Excel = un emplacement (`Arc-v`, `classeur`, `boite A`…). Les feuilles `deck_…` sont aussi importées comme decks.
- Colonnes lues : `carte`, `nombre`, `rareté`, `code` (facultatif, ex. `CRMS-FR042`), et en aide à la reconnaissance `magie`/`piège`/`monstre`,
  `fusion`/`synchro`/`xyz`/`link`, `étoile` (détails dans la page Import).
- Une même carte peut être notée sur plusieurs lignes : les lignes identiques (hors `nombre`) sont regroupées et leurs quantités additionnées, dans la base comme dans l'Excel (si le fichier n'est pas ouvert).
- `corrections.json` : noms de l'Excel associés à la bonne carte (rempli à la main ou depuis la page **Corrections**).
- `versions_cardmarket.json` : produit Cardmarket choisi à la main quand la rareté d'un produit est incertaine.
- `historique_prix.csv` / `historique_collection.csv` : relevés quotidiens de la page Bourse (prix de chaque
  version possédée, valeur de la collection). Ils ne se régénèrent pas : à garder et à commiter.
- `data/cardtrader_token.txt` (facultatif, non versionné) : jeton API CardTrader, pour la rareté exacte des produits.
- `traductions.json` : noms et textes français (non officiels) des cartes que l'API n'a pas encore en français.
- `data/` et `static/cards/` (non versionnés) : base SQLite, catalogue, decks méta, images. Les decks créés dans l'IHM
  vivent dans `data/yugioh.db` : exporte-les en `.ydk` pour les sauvegarder.

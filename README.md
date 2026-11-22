# Collection Yu-Gi-Oh!

Base SQLite de ma collection (source : `yugioh.xlsx`) enrichie avec le catalogue YGOPRODeck, et IHM Streamlit pour parcourir les cartes, construire des decks Mekk-Chevalier et les mesurer face au méta.

## Démarrage

```bash
.venv\Scripts\python.exe -m pip install -r requirements.txt
.venv\Scripts\python.exe -m ygo.importer          # construit data/yugioh.db (--refresh pour retélécharger le catalogue)
.venv\Scripts\python.exe -m ygo.meta              # télécharge les decks de tournoi récents
.venv\Scripts\python.exe lancer.py                # ou : python -m streamlit run app.py
```

Tests : `.venv\Scripts\python.exe -m pytest` (les tests de pages sont ignorés tant que `data/yugioh.db` n'existe pas).

## Pages

| Section | Page | Rôle |
|---|---|---|
| Ma collection | Collection | Galerie de tes cartes, fiche agrandie navigable au clavier (← →) |
| | Constructeur de deck | Composer un deck, légalité et régularité des mains en direct, export `.ydk` |
| Analyse | Analyse | Composition et probabilités d'un deck |
| | Duel de decks | Deux decks face à face : KPI, mains d'exemple, leviers |
| | Simulation méta | Tes builds contre les decks qui gagnent en tournoi |
| | Générateur de build | Algorithme d'optimisation (recuit simulé) sous contraintes de stock et de banlist |
| Données | Corrections / Import | Reconnaissance des noms, réimport, format de l'Excel, banlist, méthode |

## Organisation du code

- `app.py` : configuration et navigation uniquement.
- `ygo/` : le cœur, sans interface — `db.py` (schéma), `importer.py` (Excel + catalogue), `analysis.py` (rôles, légalité,
  probabilités), `simulation.py` (mains et matchups), `optimizer.py` (générateur), `meta.py` (decks de tournoi),
  `fr.py` (traductions), `builds.py` (proposition manuelle `mekk_opti`).
- `ygo/ui/` : l'interface — `core.py` (catalogue, galerie, visionneuse), `style.py` (direction artistique), une page par module.
- `ygo/viewer.html` : visionneuse de cartes exécutée dans le navigateur.
- `.streamlit/config.toml` : thème (bleu nuit et or, Cinzel / Inter).
- `tests/` : tests unitaires sur une base autonome + rendu de chaque page.

## Données

- Une feuille Excel = un emplacement (`Arc-v`, `classeur`, `boite A`…). Les feuilles `deck_…` sont aussi importées comme decks.
- Colonnes lues : `carte`, `nombre`, `rareté`, et en aide à la reconnaissance `magie`/`piège`/`monstre`,
  `fusion`/`synchro`/`xyz`/`link`, `étoile` (détails dans la page Import).
- `corrections.json` : noms de l'Excel associés à la bonne carte (rempli à la main ou depuis la page **Corrections**).
- `traductions.json` : noms et textes français (non officiels) des cartes que l'API n'a pas encore en français.
- `data/` et `static/cards/` (non versionnés) : base SQLite, catalogue, decks méta, images. Les decks créés dans l'IHM
  vivent dans `data/yugioh.db` : exporte-les en `.ydk` pour les sauvegarder.

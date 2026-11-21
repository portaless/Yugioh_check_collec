# Collection Yu-Gi-Oh!

Base SQLite de ma collection (source : `yugioh.xlsx`) enrichie avec le catalogue YGOPRODeck, et IHM Streamlit pour parcourir les cartes et construire des decks.

## Démarrage

```bash
.venv\Scripts\python.exe -m pip install -r requirements.txt
.venv\Scripts\python.exe -m ygo.importer          # construit data/yugioh.db (--refresh pour retélécharger le catalogue)
.venv\Scripts\python.exe -m streamlit run app.py
```

## Organisation

- Une feuille Excel = un emplacement (`Arc-v`, `classeur`, `boite A`…). Les feuilles `deck_…` sont aussi importées comme decks.
- `corrections.json` : noms de l'Excel associés à la bonne carte (rempli à la main ou depuis la page **Corrections**).
- `data/` (non versionné) : base SQLite, catalogue JSON, cache d'images. Les decks créés dans l'IHM vivent dans `data/yugioh.db` : exporte-les en `.ydk` pour les sauvegarder.
- `ygo/builds.py` : proposition de build Mekk-Chevalier construite avec le stock.
- `traductions.json` : noms et textes français (non officiels) des cartes que l'API n'a pas encore en français.
- `ygo/simulation.py` : simulation des mains de départ (page Duel de decks) et des matchups (page Simulation méta).
- `ygo/meta.py` : decks de tournoi récents (YGOPRODeck) ; `python -m ygo.meta` les retélécharge.
- Colonnes de l'Excel lues : `carte`, `nombre`, `rareté`, et en aide à la reconnaissance `magie`/`piège`/`monstre`,
  `fusion`/`synchro`/`xyz`/`link`, `étoile` (détails dans la page Import).

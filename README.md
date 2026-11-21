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

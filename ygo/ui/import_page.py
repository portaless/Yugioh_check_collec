"""Page Import : réimporter l'Excel, mettre à jour le catalogue, le méta et les prix, créer sa collection."""


import pandas as pd
import requests
import streamlit as st

from ygo import bourse
from ygo import builds
from ygo import cardmarket as CM
from ygo import cardtrader
from ygo import completer
from ygo import engine_data
from ygo import importer
from ygo import install
from ygo import noms_fr
from ygo.ui.core import con
from ygo.ui.import_help import explain_banlist, explain_build, explain_excel, explain_prices
from ygo.ui.style import page_header


def page_import():
    page_header(
        "Import & mise à jour",
        "Relis ton Excel, mets à jour le catalogue et la banlist, et découvre comment tout est calculé.",
        "Données",
    )
    personal = install.USER_DIR == install.PERSONAL_DIR
    source = importer.EXCEL_PATH.relative_to(importer.ROOT).as_posix()
    st.markdown(f"Source : `{source}`" + (" (ta collection personnelle)" if personal else " (collection du dépôt)")
                + ". Chaque feuille est un **emplacement** (Arc-v, classeur, boîte A…). Les feuilles `deck_…` "
                "sont aussi importées comme decks.")
    if not personal:
        with st.expander("Tu as récupéré ce dépôt et tu veux gérer **ta propre collection** ?"):
            st.markdown(
                "Ce bouton crée le dossier `ma_collection/` avec un Excel vierge, au même format. Ce dossier n'est "
                "pas envoyé sur GitHub : tes `git pull` restent sans conflit, et la collection du dépôt reste "
                "intacte. Ensuite :\n"
                "1. **relance l'appli** (Ctrl+C dans le terminal, puis `lancer.py`) : elle passe sur ta collection, "
                "vide pour l'instant ;\n"
                "2. remplis `ma_collection/yugioh.xlsx` (une feuille par rangement, colonnes expliquées plus bas) ;\n"
                "3. clique sur « Réimporter l'Excel ».\n\n"
                "Pour revenir à la collection du dépôt, supprime ou renomme le dossier `ma_collection/` et relance.")
            if st.button("Créer ma collection"):
                install.create_personal()
                st.success("Dossier `ma_collection/` créé. Relance l'appli pour passer sur ta collection.")
    if not cardtrader.token():
        st.info("Pas de jeton CardTrader : les raretés exactes viennent de la copie du dépôt. Les extensions sorties "
                "depuis n'auront qu'un prix déduit (≈). Pour un jeton gratuit, voir l'onglet « Les prix » plus bas.")
    st.warning("Le réimport remplace toute la collection et les decks `deck_…` par le contenu de l'Excel. "
               "Les autres decks sont conservés.")
    with st.expander("Compléter l'Excel automatiquement"):
        st.markdown("Note seulement le **nom**, le **nombre** et le **code de l'extension** (« CRMS », imprimé sous "
                    "l'illustration) dans la colonne `code`, ou dans `rareté`. Ce bouton remplit le reste : catégorie, "
                    "étoiles, code complet, et la rareté quand l'extension n'en a qu'une. Sinon, la case rareté est "
                    "surlignée en jaune avec les choix possibles en commentaire. Ferme l'Excel avant.")
        if st.button("Compléter l'Excel puis réimporter"):
            try:
                report = completer.complete(con)
                st.session_state["import_report"] = importer.import_excel(con)
                st.success(f"{report['done']} ligne(s) complétée(s).")
                if report["choose"]:
                    st.warning("Rareté à choisir (cases jaunes) :\n\n" + "\n".join(f"- {l}" for l in report["choose"]))
                if report["learned"]:
                    st.info("Reconnues grâce à l'extension, à vérifier dans la fiche :\n\n"
                            + "\n".join(f"- {n}" for n in report["learned"]))
                if report["unknown"]:
                    st.error("Non trouvées :\n\n" + "\n".join(f"- {l}" for l in report["unknown"]))
            except PermissionError:
                st.error("L'Excel est ouvert ailleurs : ferme-le puis recommence.")
    c1, c2, c3, c4 = st.columns(4)
    if c1.button("Réimporter l'Excel", type="primary"):
        st.session_state["import_report"] = importer.import_excel(con)
    if c2.button("Mettre à jour le catalogue (banlist, nouvelles cartes)"):
        with st.spinner("Téléchargement du catalogue YGOPRODeck…"):
            importer.download_catalog(force=True)
            n = importer.load_catalog(con)
        with st.spinner("Noms français des nouvelles cartes (Yugipedia)…"):
            try:
                noms_fr.download(con, log=lambda _: None)
            except (requests.RequestException, RuntimeError) as e:
                st.warning(f"Noms français non mis à jour : {e}")
        with st.spinner("Scripts des cartes pour le moteur de règles du duel…"):
            try:
                engine_data.download(log=lambda _: None)
            except requests.RequestException as e:
                st.warning(f"Moteur de règles non mis à jour : {e}")
        with st.spinner("Réimport de ta collection…"):
            importer.import_excel(con)
            if (CM.CM_DIR / "products.json").exists():
                CM.build(con, log=lambda _: None)
        st.success(f"{n} cartes dans le catalogue.")
    if c3.button("Mettre à jour les prix Cardmarket"):
        with st.spinner("Téléchargement des prix Cardmarket…"):
            if cardtrader.token():
                cardtrader.download(log=lambda _: None)
            CM.download(force=True)
            stats = CM.build(con, log=lambda _: None)
            bourse.record_current(con)
        st.success("Prix à jour : " + ", ".join(f"{v} {k}" for k, v in sorted(stats.items())) + " (toutes cartes).")
    if c4.button("Recréer la proposition de build"):
        builds.create(con)
        st.success(f"Deck « {builds.NAME} » recréé.")
    report = st.session_state.get("import_report")
    if report:
        ok = sum(1 for r in report if r["card_id"])
        st.success(f"{ok} / {len(report)} lignes reconnues.")
        missing = [{"Feuille": r["sheet"], "Nom dans l'Excel": r["excel"], "Score": r["score"]}
                   for r in report if not r["card_id"]]
        if missing:
            st.dataframe(pd.DataFrame(missing), hide_index=True)

    st.divider()
    tab_excel, tab_prices, tab_ban, tab_build = st.tabs(
        ["Format de l'Excel", "Les prix", "La banlist", "Comment est calculé un build"])
    with tab_excel:
        explain_excel()
    with tab_prices:
        explain_prices()
    with tab_ban:
        explain_banlist()
    with tab_build:
        explain_build()

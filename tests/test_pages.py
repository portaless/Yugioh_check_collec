"""Chaque page s'affiche sans erreur sur ta vraie base (ignoré si data/yugioh.db n'existe pas encore)."""
from pathlib import Path

import pytest
from streamlit.testing.v1 import AppTest

from ygo.db import DB_PATH

HARNESS = str(Path(__file__).with_name("page_harness.py"))
PAGES = ["collection", "constructeur", "bourse", "analyse", "duel", "meta", "generateur", "corrections", "import"]

pytestmark = pytest.mark.skipif(not DB_PATH.exists(), reason="base locale absente : lance d'abord python -m ygo.importer")


@pytest.mark.parametrize("page", PAGES)
def test_page_renders(page):
    at = AppTest.from_file(HARNESS, default_timeout=300)
    at.session_state["page"] = page
    at.run()
    assert not at.exception, [e.value for e in at.exception]


def test_app_navigation_renders():
    at = AppTest.from_file(str(Path(__file__).parent.parent / "app.py"), default_timeout=300)
    at.run()
    assert not at.exception, [e.value for e in at.exception]

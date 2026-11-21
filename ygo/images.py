"""Cache local des images (YGOPRODeck demande de ne pas les charger directement depuis leur site).

Les images sont servies en fichiers statiques par Streamlit (static/ → app/static/) : le navigateur
les garde en cache, au lieu de les recevoir à nouveau à chaque interaction.
"""
import requests

from .db import ROOT

IMG_DIR = ROOT / "static" / "cards"


def image_src(card_id: int, url: str) -> str | None:
    """URL relative de l'image pleine résolution (421×614) ; le catalogue stocke l'URL de la miniature."""
    IMG_DIR.mkdir(parents=True, exist_ok=True)
    path = IMG_DIR / f"{card_id}.jpg"
    if not path.exists():
        try:
            r = requests.get(url.replace("/cards_small/", "/cards/"), timeout=20)
            r.raise_for_status()
            path.write_bytes(r.content)
        except requests.RequestException:
            return None
    return f"app/static/cards/{card_id}.jpg"

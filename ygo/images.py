"""Cache local des images (YGOPRODeck demande de ne pas les charger directement depuis leur site)."""
import requests

from .db import DATA_DIR

IMG_DIR = DATA_DIR / "images"


def image_path(card_id: int, url: str):
    IMG_DIR.mkdir(parents=True, exist_ok=True)
    path = IMG_DIR / f"{card_id}.jpg"
    if not path.exists():
        try:
            r = requests.get(url, timeout=20)
            r.raise_for_status()
            path.write_bytes(r.content)
        except requests.RequestException:
            return None
    return path

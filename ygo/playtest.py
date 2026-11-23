"""Duel jouable contre un deck méta : données envoyées au plateau (ygo/ui/duel_meta.js), qui joue tout le duel
dans le navigateur.

Tu joues tes cartes à la main, comme sur un simulateur sans automatisation des effets. L'adversaire est une
liste méta jouée par un bot qui ne lit pas les effets carte par carte : il agit selon le rôle de chaque carte,
déduit de son texte (plan.py, meta.py) :
- starter : lance son moteur, qui sort des monstres du deck puis un monstre de l'Extra Deck ;
- interruption : annule l'effet d'un de tes starters ou cartes du moteur (Floraison de Cendres…), pioche à
  chacune de tes Invocations Spéciales (Mulcharmy, Maxx « C »), ou tribute tout le terrain à ta 5e invocation
  (Nibiru) ;
- destruction : vide ta zone Magie/Piège (Plumeau de Dame Harpie), tes monstres (Raigeki…), ou un monstre ;
- Piège de protection posé : annule une de tes activations ou une attaque.
"""
from . import meta
from . import plan as P
from .db import is_extra

LIFE = 8000

# Effets de destruction connus par leur nom ; les autres détruisent ton monstre le plus fort
SPELL_WIPE = {"Harpie's Feather Duster", "Heavy Storm", "Evenly Matched"}
MONSTER_WIPE = {"Raigeki", "Dark Ruler No More", "Lightning Storm", "Dark Hole", "Torrential Tribute",
                "Triple Tactics Thrust"}
KAIJU = "Kaiju"
DRAWERS = ("Maxx \"C\"", "Mulcharmy")


def _kind(c: dict, f: dict) -> str:
    """Comportement du bot pour une carte."""
    name = c["name_en"]
    if name == "Nibiru, the Primal Being":
        return "nibiru"
    if name.startswith(DRAWERS):
        return "draw"
    if f.get("handtrap") or f.get("interrupt"):
        return "negate"
    if f.get("breaker"):
        if name in SPELL_WIPE:
            return "spell_wipe"
        if name in MONSTER_WIPE:
            return "monster_wipe"
        if KAIJU in name or name == "Lava Golem":
            return "kaiju"
        return "destroy"
    if c["frame_type"] == "trap":
        return "protect"  # un Piège posé sert au bot à annuler une activation ou une attaque
    return ""


def card(c: dict, plan: P.Plan, img: str | None) -> dict:
    f = P.flags(c, plan) | meta.opponent_flags(c)
    frame = c["frame_type"]
    return {
        "id": c["id"], "name": c["name_fr"] or c["name_en"], "en": c["name_en"], "frame": frame,
        "kind": "spell" if frame.startswith("spell") else "trap" if frame.startswith("trap") else "monster",
        "extra": is_extra(frame), "link": "link" in frame, "level": c["level"], "linkval": c["linkval"],
        "atk": c["atk"], "def": c["def"], "race": c["race"], "attribute": c["attribute"],
        "text": c["desc_fr"] or c["desc_en"] or "", "img": img,
        "starter": bool(f.get("starter")), "engine": bool(f.get("engine")) or plan.engine(c),
        "role": _kind(c, f),
        # utilisable en réponse pendant le tour adverse : effet rapide, Magie Jeu-Rapide, Piège, interruption
        "quick": "Quick Effect" in (c["desc_en"] or "") or c["race"] == "Quick-Play" or frame.startswith("trap")
                 or bool(f.get("interrupt") or f.get("handtrap")),
    }


def side(name: str, main: list[dict], extra: list[dict], plan: P.Plan, imgs: dict) -> dict:
    """Une entrée par exemplaire ; main et extra sont des listes de fiches cartes (doublons compris)."""
    return {"name": name, "plan": plan.label, "life": LIFE,
            "main": [card(c, plan, imgs.get(c["id"])) for c in main],
            "extra": [card(c, plan, imgs.get(c["id"])) for c in extra]}


def from_deck(cards: list[dict], zone: str) -> list[dict]:
    """Cartes d'un deck de l'appli (analysis.deck_cards) : un exemplaire par entrée."""
    return [c for c in cards if c["zone"] == zone for _ in range(c["quantity"])]

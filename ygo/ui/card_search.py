"""Recherche d'une carte avec suggestions illustrées (miniatures au-dessus du champ, tolérante aux fautes)."""
from concurrent.futures import ThreadPoolExecutor

import pandas as pd
import streamlit as st
from rapidfuzz import fuzz, process

from ygo.images import thumb_src
from ygo.importer import normalize
from ygo.ui.core import catalog, search_any


# ---------------------------------------------------------------- recherche de carte avec miniatures
# Champ de saisie sur mesure : la frappe part vers Python (state « query »), qui renvoie les meilleures cartes
# avec leur miniature, affichées en grille au-dessus du champ ; un clic (ou Entrée) sur une suggestion renvoie son code (trigger « pick »).
CARD_SEARCH = st.components.v2.component(
    "card_search",
    css="""
    .cs { position: relative; font-family: inherit; }
    .cs input { width: 100%; box-sizing: border-box; padding: .6rem .8rem; border-radius: .6rem; font-size: 1rem;
                background: #171B30; color: #E9E6DD; border: 1px solid #2A3050; outline: none; }
    .cs input:focus { border-color: #E3B341; box-shadow: 0 0 0 1px #E3B341; }
    .cs .list { margin-bottom: .5rem; display: grid; grid-template-columns: repeat(auto-fill, minmax(118px, 1fr));
                gap: .6rem; }
    .cs .item { cursor: pointer; border-radius: .5rem; padding: .35rem; border: 1px solid transparent;
                background: #11152A; transition: border-color .12s, transform .12s; }
    .cs .item:hover, .cs .item.sel { border-color: #E3B341; transform: translateY(-2px); }
    .cs .item img { width: 100%; border-radius: 4px; display: block; aspect-ratio: 168 / 246; object-fit: cover;
                    background: #0D1020; }
    .cs .name { font-size: .8rem; color: #E9E6DD; margin-top: .3rem; line-height: 1.25; }
    .cs .sub { font-size: .72rem; color: #A8A49A; }
    .cs .owned { color: #E3B341; }
    .cs .empty { color: #A8A49A; font-size: .85rem; padding: .3rem .1rem; }
    """,
    js="""
    export default function(component) {
        const { data, parentElement } = component;
        let root = parentElement.querySelector(".cs");
        if (!root) {
            root = document.createElement("div");
            root.className = "cs";
            // suggestions au-dessus du champ : elles ne cachent pas la suite de la page
            root.innerHTML = '<div class="list"></div><input type="text" autocomplete="off" spellcheck="false">';
            parentElement.appendChild(root);
            const input = root.querySelector("input");
            // choix d'une carte : champ et suggestions vidés tout de suite, sans attendre Python
            root.pick = (id) => {
                input.value = "";
                root.querySelector(".list").innerHTML = "";
                root.api.setStateValue("query", "");
                root.api.setTriggerValue("pick", id);
            };
            let timer;
            input.addEventListener("input", () => {
                clearTimeout(timer);
                timer = setTimeout(() => root.api.setStateValue("query", input.value), 250);
            });
            input.addEventListener("keydown", (e) => {
                const items = [...root.querySelectorAll(".item")];
                if (!items.length) return;
                let i = items.findIndex((it) => it.classList.contains("sel"));
                if (e.key === "ArrowRight" || e.key === "ArrowDown") i = Math.min(items.length - 1, i + 1);
                else if (e.key === "ArrowLeft" || e.key === "ArrowUp") i = Math.max(0, i - 1);
                else if (e.key === "Enter") { root.pick(items[Math.max(0, i)].dataset.id); return; }
                else return;
                e.preventDefault();
                items.forEach((it, k) => it.classList.toggle("sel", k === i));
            });
        }
        root.api = component;
        const input = root.querySelector("input");
        input.placeholder = data.placeholder;
        if (root.dataset.clear !== String(data.clear)) {
            root.dataset.clear = String(data.clear);
            input.value = "";
        }
        // après un ajout réussi : curseur dans le champ, prêt pour la carte suivante
        if (data.focus && root.dataset.focus !== String(data.focus)) {
            root.dataset.focus = String(data.focus);
            setTimeout(() => { input.focus(); input.scrollIntoView({ block: "center" }); }, 50);
        }
        const list = root.querySelector(".list");
        list.innerHTML = "";
        if (!input.value.trim()) return;
        if (!data.results.length) {
            list.innerHTML = '<div class="empty">Aucune carte trouvée.</div>';
            return;
        }
        data.results.forEach((r, k) => {
            const item = document.createElement("div");
            item.className = "item" + (k === 0 ? " sel" : "");
            item.dataset.id = r.id;
            item.innerHTML = (r.img ? '<img src="' + r.img + '" loading="lazy">' : "")
                + '<div class="name"></div><div class="sub"></div>';
            item.querySelector(".name").textContent = r.name;
            const sub = item.querySelector(".sub");
            sub.textContent = r.sub;
            if (r.owned) sub.classList.add("owned");
            item.addEventListener("mousedown", (e) => { e.preventDefault(); root.pick(r.id); });
            list.appendChild(item);
        });
    }
    """,
)


def rank_cards(query: str, limit: int = 8) -> pd.DataFrame:
    """Cartes dont le nom (français ou anglais) contient tous les mots tapés ; les noms qui commencent par
    la saisie d'abord, puis les cartes possédées, puis les noms les plus courts."""
    q = normalize(query or "")
    if not q:
        return catalog().head(0)
    df = search_any(catalog(), [q])
    starts = df["search"].str.startswith(q) | df["nom"].map(normalize).str.startswith(q)
    order = pd.DataFrame({"starts": ~starts, "owned": df["owned"] == 0, "len": df["nom"].str.len()}, index=df.index)
    exact = df.loc[order.sort_values(["starts", "owned", "len"]).index[:limit]]
    if len(exact) >= limit:
        return exact
    near = _near(q).drop(exact.index, errors="ignore")
    return pd.concat([exact, near.head(limit - len(exact))])


def _near(q: str) -> pd.DataFrame:
    """Faute de frappe tolérée : chaque mot tapé doit ressembler à un mot du nom (« griffayeur » trouve
    « Griffrayeur »). Les plus ressemblantes d'abord."""
    df = catalog()
    vocab = _vocabulary(tuple(df["search"]))
    similar = []
    for word in q.split():
        found = {w: s for w, s, _ in process.extract(word, vocab, scorer=fuzz.ratio, score_cutoff=80, limit=None)}
        similar.append(found)
    if not similar:
        return df.head(0)
    scores = df["search"].map(lambda text: _near_score(text.split(), similar))
    hits = scores[scores > 0]
    return df.loc[hits.sort_values(ascending=False).index]


def _near_score(words: list[str], similar: list[dict]) -> float:
    total = 0.0
    for found in similar:
        best = max((found.get(w, 0) for w in words), default=0)
        if not best:
            return 0.0
        total += best
    return total / len(similar)


@st.cache_data(max_entries=1, show_spinner=False)
def _vocabulary(texts: tuple[str, ...]) -> list[str]:
    return sorted({w for t in texts for w in t.split()})


def card_search(key: str, placeholder: str = "Tape le nom d'une carte…", focus: int = 0) -> int | None:
    """Recherche d'une carte avec suggestions illustrées. Renvoie le code de la carte choisie (une seule fois).
    Changer `focus` remet le curseur dans le champ."""
    query = (st.session_state.get(key) or {}).get("query", "")
    found = rank_cards(query)
    with ThreadPoolExecutor(8) as pool:  # miniatures téléchargées en parallèle la première fois
        imgs = list(pool.map(thumb_src, found["id"].astype(int), found["image_url"]))
    results = [{"id": int(c["id"]), "name": c["nom"], "img": img,
                "sub": f"Stock : {int(c['owned'])}" if c["owned"] else c["catégorie"], "owned": bool(c["owned"])}
               for c, img in zip(found.to_dict("records"), imgs)]
    clear = st.session_state.get(f"{key}_clear", 0)
    res = CARD_SEARCH(data={"placeholder": placeholder, "results": results, "clear": clear, "focus": focus}, key=key,
                      default={"query": ""}, on_query_change=lambda: None, on_pick_change=lambda: None)
    if res.pick:
        st.session_state[f"{key}_clear"] = clear + 1  # vide le champ au prochain affichage
        return int(res.pick)
    return None

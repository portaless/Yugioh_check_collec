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

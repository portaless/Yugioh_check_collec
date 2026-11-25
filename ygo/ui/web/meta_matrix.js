export default function(component) {
    const { data, setTriggerValue, parentElement } = component;
    let root = parentElement.querySelector(".wrap");
    if (!root) { root = document.createElement("div"); root.className = "wrap"; parentElement.appendChild(root); }
    root.innerHTML = data;
    root.querySelectorAll("td.deck").forEach((cell) => {
        cell.oncontextmenu = (e) => {
            e.preventDefault();
            root.querySelectorAll("td.deck.on").forEach((c) => c.classList.remove("on"));
            cell.classList.add("on");
            setTriggerValue("deck", cell.dataset.deck);
        };
    });
}

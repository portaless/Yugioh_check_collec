// Client en ligne, partie duel : le plateau partagé avec le duel local (ygo/ui/web/duel_meta_*.js) affiche ce que le
// serveur envoie. Une petite façade remplace le moteur local (root.game) : le serveur arbitre, le navigateur ne
// renvoie que le jeton de la réponse choisie.

const IMG = "https://images.ygoprodeck.com/images/cards_small/";

function mountDuel(root) {
    root.className = "dm";
    root.online = true;
    root.ui = { menu: null, viewer: null, prompt: null, picked: [], detail: null, peek: false, query: "" };
    root.data = {
        names: {}, texts: {}, botName: "", me: { extra: [] }, bot: { extra: [] },
        imgs: new Proxy({}, { get: (_, code) => (+code ? `${IMG}${code}.jpg` : undefined) }),
    };
    root.game = { me: 0, bot: 1, engine: { texts: new Map() }, undoPoint: () => null };
    root.addEventListener("click", (e) => {   // clic hors d'un menu : on le ferme
        if (root.ui.menu && !e.target.closest(".menu, .effbox")) { root.ui.menu = null; render(root); }
    });
    window.addEventListener("keydown", (e) => { if (e.key === "Escape" && root.state) escape(root); }, true);
    document.addEventListener("fullscreenchange", () => { if (root.state) render(root); });
}

// Pas de retour arrière ni de nouvelle partie en ligne : l'adversaire a déjà vu l'action.
function start() {}

function duelRoom(root, room) {
    root.game.me = room.player;
    root.game.bot = 1 - room.player;
    root.data.botName = room.opponent || "Adversaire";
    root.data.me.extra = room.myExtra || [];
}

let cardNames = null;
async function duelState(root, msg) {
    for (const [code, [name, text]] of Object.entries(msg.cards || {})) {
        root.data.names[code] = name;
        root.data.texts[code] = text;
    }
    root.state = msg.state;
    const q = msg.prompt;
    if (q && q.kind === "announce") {
        cardNames = cardNames || (await api("GET", "/api/cardnames")).names;
        q.names = cardNames;
    }
    root.ui.prompt = q ? { ...q, build: (arg) => ({ build: arg }), resolve: (r) => sendAnswer(root, r) } : null;
    root.ui.picked = [];
    render(root);
}

function sendAnswer(root, answer) {
    const prev = root.ui.prompt;
    root.ui.prompt = null; root.ui.picked = []; root.ui.menu = null;
    render(root);
    api("POST", "/api/duel/answer", { answer }).catch((e) => {
        root.ui.prompt = prev;   // la question reste posée : le joueur peut choisir autre chose
        root.ui.notice = e.message;
        render(root);
    });
}

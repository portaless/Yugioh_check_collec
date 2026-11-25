// Constantes du moteur YGOPro : emplacements, positions, informations demandées sur les cartes, phases.
import { _OcgcoreConstants } from "koishipro-core.js";

export const K = _OcgcoreConstants.OcgcoreScriptConstants;
export const C = _OcgcoreConstants.OcgcoreCommonConstants;
const LOC = { DECK: 1, HAND: 2, MZONE: 4, SZONE: 8, GRAVE: 16, REMOVED: 32, EXTRA: 64, OVERLAY: 128 };
const POS = { FU_ATK: 1, FD_ATK: 2, FU_DEF: 4, FD_DEF: 8 };
const QUERY = C.QUERY_CODE | C.QUERY_POSITION | C.QUERY_ATTACK | C.QUERY_DEFENSE | C.QUERY_TYPE | C.QUERY_LEVEL
    | C.QUERY_RANK | C.QUERY_LINK | C.QUERY_OVERLAY_CARD;
const PHASES = { 1: "Draw Phase", 2: "Standby Phase", 4: "Main Phase 1", 8: "Battle Phase", 16: "Battle Phase",
    32: "Battle Phase", 64: "Battle Phase", 128: "Battle Phase", 256: "Main Phase 2", 512: "End Phase" };
export { LOC, POS, QUERY, PHASES };

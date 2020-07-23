import TurnAlertManager from "./scripts/TurnAlertManager.js";
import {
    patch_CombatTracker_getEntryContextOptions,
    patch_CombatTracker_activateListeners,
} from "./scripts/patches.js";
import handleUpdateCombat from "./scripts/handleUpdateCombat.js";

Hooks.on("init", () => {
    game.TurnAlertManager = new TurnAlertManager();

    patch_CombatTracker_activateListeners();
    patch_CombatTracker_getEntryContextOptions();
});

Hooks.on("preUpdateCombat", handleUpdateCombat);

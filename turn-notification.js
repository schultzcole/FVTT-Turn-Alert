import TurnNotificationManager from "./scripts/TurnNotificationManager.js";
import {
    patch_CombatTracker_getEntryContextOptions,
    patch_CombatTracker_activateListeners,
} from "./scripts/patches.js";
import handleUpdateCombat from "./scripts/handleUpdateCombat.js";

Hooks.on("init", () => {
    game.TurnNotificationManager = new TurnNotificationManager();

    patch_CombatTracker_activateListeners();
    patch_CombatTracker_getEntryContextOptions();
});

Hooks.on("updateCombat", handleUpdateCombat);

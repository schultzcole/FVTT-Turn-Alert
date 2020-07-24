import TurnAlertManager from "./scripts/TurnAlertManager.js";
import {
    patch_CombatTracker_getEntryContextOptions,
    patch_CombatTracker_activateListeners,
} from "./scripts/patches.js";
import handleUpdateCombat from "./scripts/handleUpdateCombat.js";
import CONST from "./scripts/const.js";
import CombatAlertsApplication from "./apps/CombatAlertsApplication.js";

Hooks.on("init", () => {
    game.TurnAlertManager = new TurnAlertManager();

    patch_CombatTracker_activateListeners();
    patch_CombatTracker_getEntryContextOptions();
});

Hooks.on("preUpdateCombat", handleUpdateCombat);

Hooks.on("renderCombatTracker", (tracker, html, data) => {
    if (!data.combat.data.round) return;
    if (!game.user.isGm) return;

    const alertButton = $(document.createElement("a"));
    alertButton.addClass(["combat-control", "combat-alerts"]);
    alertButton.attr("title", game.i18n.localize(`${CONST.moduleName}.APP.CombatAlertsTitle`));
    alertButton.html('<i class="fas fa-bell"></i>');
    alertButton.click((event) => {
        const combatId = data.combat.data._id;
        const app = new CombatAlertsApplication({ combatId });
        app.render(true);
    });

    html.find("header#combat-round h3").after(alertButton);
});

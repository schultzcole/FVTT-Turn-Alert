import {
    patch_CombatTracker_getEntryContextOptions,
    patch_CombatTracker_activateListeners,
} from "./scripts/patches.js";
import { handlePreUpdateCombat, handleUpdateCombat } from "./scripts/handleUpdateCombat.js";
import CONST from "./scripts/const.js";
import CombatAlertsApplication from "./apps/CombatAlertsApplication.js";
import TurnAlert from "./scripts/TurnAlert.js";
import TurnAlertConfig from "./apps/TurnAlertConfig.js";

Hooks.on("init", () => {
    globalThis.TurnAlert = TurnAlert;
    globalThis.TurnAlertConfig = TurnAlertConfig;

    patch_CombatTracker_activateListeners();
    patch_CombatTracker_getEntryContextOptions();

    game.socket.on(`module.${CONST.moduleName}`, async (payload) => {
        const firstGm = game.users.find((u) => u.isGM && u.active);
        switch (payload.type) {
            case "createAlert":
                if (!firstGm || game.user !== firstGm) break;
                await TurnAlert.create(payload.alertData);
                break;
            case "updateAlert":
                if (!firstGm || game.user !== firstGm) break;
                await TurnAlert.update(payload.alertData);
                break;
            case "deleteAlert":
                if (!firstGm || game.user !== firstGm) break;
                await TurnAlert.delete(payload.combatId, payload.alertId);
                break;
            default:
                throw new Error(
                    `Turn Alert | Unknown socket payload type: ${payload.type} | payload contents:\n${JSON.stringify(
                        payload
                    )}`
                );
                break;
        }
    });
});

Hooks.on("preUpdateCombat", handlePreUpdateCombat);
Hooks.on("updateCombat", handleUpdateCombat);

Hooks.on("renderCombatTracker", (tracker, html, data) => {
    if (!data.combat?.data?.round) return;

    const alertButton = $(document.createElement("a"));
    alertButton.addClass(["combat-control", "combat-alerts"]);
    alertButton.attr("title", game.i18n.localize(`${CONST.moduleName}.APP.CombatAlertsTitle`));
    alertButton.html('<i class="fas fa-bell"></i>');
    alertButton.click((event) => {
        const combatId = data.combat.id;
        const app = new CombatAlertsApplication({ combatId });
        app.render(true);
    });

    html.find("header#combat-round h3").after(alertButton);
});

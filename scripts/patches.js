import TurnNotificationConfig from "../apps/TurnNotificationConfig.js";
import CONST from "./const.js";

/**
 * Patches CombatTracker#activateListeners to allow players to access
 * the context menu for combatants.
 */
export function patch_CombatTracker_activateListeners() {
    const old = CombatTracker.prototype.activateListeners;
    CombatTracker.prototype.activateListeners = function (html) {
        old.call(this, html);

        // The existing activateListeners already adds the context menu
        // for GMs so we only need to add it for non-GMs here.
        if (!game.user.isGM) this._contextMenu(html);
    };
}

/**
 * Adds the "Add Notification" element to the combatant context menu.
 */
export function patch_CombatTracker_getEntryContextOptions() {
    const old = CombatTracker.prototype._getEntryContextOptions;
    CombatTracker.prototype._getEntryContextOptions = function () {
        const entries = game.user.isGM ? old.call(this) : [];
        entries.unshift({
            name: game.i18n.localize(`${CONST.moduleName}.APP.AddNotification`),
            icon: '<i class="fas fa-bell"></i>',
            condition: (li) => {
                return canvas.tokens.get(li.data("token-id")).owner;
            },
            callback: (li) => {
                const notificationData = {
                    combatId: this.combat.data._id,
                    createdRound: this.combat.data.round,
                    round: 1,
                    turnId: li.data("combatant-id"),
                    userId: game.userId,
                };
                new TurnNotificationConfig(notificationData, {}).render(true);
            },
        });
        return entries;
    };
}

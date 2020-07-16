import TurnNotificationConfig from "../apps/TurnNotificationConfig.js";
import CONST from "./const.js";
import CombatNotificationApplication from "../apps/CombatNotificationApplication.js";

/**
 * Easily accessible utility functions for Turn Notifications
 */
export default class TurnNotificationManager {
    /**
     * Displays the dialog for creating a new Turn Notification which will activate on the current turn.
     *
     * The Turn Notification will be added to the active combat.
     * @param {Object} data Initial data for the resulting turn notification.
     * @param {Object} options Extra options for the TurnNotificationConfig FormApplication
     */
    createOnCurrentTurn(data, options) {
        const turnId = game.combat.turns?.length ? game.combat.turns[game.combat.data.turn]._id : null;

        this._create(mergeObject(data, { turn: turnId }), options);
    }

    /**
     * Displays the dialog for creating a new Turn Notification which will
     * activate at the top of a round rather than a particular turn.
     *
     * The Turn Notification will be added to the active combat.
     * @param {Object} data Initial data for the resulting turn notification.
     * @param {Object} options Extra options for the TurnNotificationConfig FormApplication
     */
    createAtTopOfRound(data, options) {
        this._create(data, options);
    }

    _create(data, options) {
        if (!game.combat) {
            ui.notifications.error("Cannot create a turn notification if no combats exist.");
            return;
        }

        const currentCombat = game.combat.data;

        const notificationData = {
            combat: currentCombat._id,
            createdRound: currentCombat.round,
            round: data.roundAbsolute ? currentCombat.round + 1 : 1,
            user: game.userId,
        };

        const app = new TurnNotificationConfig(mergeObject(notificationData, data), options);
        app.render(true);
    }

    /**
     * Clears all notifications on a given combat.
     * @param {String} combatId The id string of the combat to clear all notifications for.
     */
    async clearAllNotificationsForCombat(combatId) {
        const combat = combatId ? game.combats.get(combatId) : game.combat;
        return combat.unsetFlag(CONST.moduleName, "notifications");
    }

    viewNotificationsForCombat(combatId) {
        if (!combatId) combatId = game.combat.data._id;
        const app = new CombatNotificationApplication({ combatId });
        app.render(true);
    }
}

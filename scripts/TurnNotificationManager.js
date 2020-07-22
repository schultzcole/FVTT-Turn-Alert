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
        if (!game.combat?.turns?.length) {
            ui.notifications.warn(game.i18n.localize(`${CONST.moduleName}.ERROR.CannotCreateNoti.NoCombatants`));
            return;
        }
        const turnId = game.combat.turns[game.combat.data.turn]._id;

        this._create(mergeObject(data, { turnId: turnId }), options);
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

    /**
     * Internal method for ease of creating a new notification with some default values.
     * @param {Object} data Initial data for the turn notification
     * @param {Object} options Extra application options
     */
    _create(data, options) {
        if (!game.combat) {
            ui.notifications.error(game.i18n.localize(`${CONST.moduleName}.ERROR.CannotCreateNoti.NoCombats`));
            return;
        }

        const currentCombat = game.combat.data;

        const notificationData = {
            combatId: currentCombat._id,
            createdRound: currentCombat.round,
            round: data.roundAbsolute ? currentCombat.round + 1 : 1,
            userId: game.userId,
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

    /**
     * Show a window which allows for viewing, editing, deleting and adding new Notifications to the current combat.
     * @param {string} combatId The id of the combat to view notifications for.
     */
    viewNotificationsForCombat(combatId) {
        if (!combatId) combatId = game.combat?.data?._id;
        if (!combatId) {
            ui.notifications.warn(game.i18n.localize(`${CONST.moduleName}.ERROR.CannotViewCombat.NoCombat`));
            return;
        }
        const app = new CombatNotificationApplication({ combatId });
        app.render(true);
    }
}

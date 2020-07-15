import TurnNotificationConfig from "./TurnNotificationConfig.js";
import CONST from "./const.js";

/**
 * Displays the dialog for creating a new Turn Notification which will activate on the current turn.
 *
 * The Turn Notification will be added to the active combat.
 * @param {Object} data Initial data for the resulting turn notification.
 * @param {Object} options Extra options for the TurnNotificationConfig FormApplication
 */
function createOnCurrentTurn(data, options) {
    const turnId = game.combat.turns?.length ? game.combat.turns[game.combat.data.turn]._id : null;

    _create(mergeObject(data, { turn: turnId }), options);
}

/**
 * Displays the dialog for creating a new Turn Notification which will
 * activate at the top of a round rather than a particular turn.
 *
 * The Turn Notification will be added to the active combat.
 * @param {Object} data Initial data for the resulting turn notification.
 * @param {Object} options Extra options for the TurnNotificationConfig FormApplication
 */
function createAtTopOfRound(data, options) {
    _create(data, options);
}

function _create(data, options) {
    const currentCombat = game.combat.data;

    const notificationData = {
        combat: currentCombat._id,
        round: data.roundAbsolute ? currentCombat.round + 1 : 1
    }

    const app = new TurnNotificationConfig(mergeObject(notificationData, data), options);
    app.render(true);
}

/**
 * Clears all notifications on a given combat.
 * @param {String} combatId The id string of the combat to clear all notifications for.
 */
async function clearAll(combatId) {
    const combat = combatId ? game.combats.get(combatId) : game.combat;
    return combat.unsetFlag(CONST.moduleName, "notifications");
}

/**
 * Easily accessible utility functions for Turn Notifications
 */
let TurnNotificationManager = {
    createOnCurrentTurn: createOnCurrentTurn,
    createAtTopOfRound: createAtTopOfRound,
    clearAll: clearAll
}
export default TurnNotificationManager;
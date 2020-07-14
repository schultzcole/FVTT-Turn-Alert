import TurnNotificationConfig from "./TurnNotificationConfig.js";
import CONST from "./const.js";

/**
 * Displays the dialog for creating a new Turn Notification.
 * The Turn Notification will be added to the active combat.
 * @param data    Seed data for the resulting {TurnNotification}.
 * @param options Extra options for the {TurnNotificationConfig} FormApplication.
 */
function createOnCurrentTurn(data, options) {
    const turnId = game.combat.turns?.length ? game.combat.turns[currentCombat.turn]._id : null;

    create(mergeObject(data, { turn: turnId }), options);
}

function createAtTopOfRound(data, options) {
    create(data, options);
}

function create(data, options) {
    const currentCombat = game.combat.data;

    const notificationData = {
        combat: currentCombat._id,
        round: currentCombat.round,
        roundAbsolute: true,
        turn: null
    }

    const app = new TurnNotificationConfig(mergeObject(notificationData, data), options);
    app.render(true);
}

function clearAll(combatId) {
    const combat = combatId ? game.combats.get(combatId) : game.combat;
    combat.unsetFlag(CONST.moduleName, "notifications");
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
import TurnNotificationConfig from "./TurnNotificationConfig.js";

/**
 * Easily accessible utility functions for Turn Notifications
 */
let TurnNotificationManager = {

    /**
     * Displays the dialog for creating a new Turn Notification.
     * The Turn Notification will be added to the active combat.
     * @param data    Seed data for the resulting {TurnNotification}.
     * @param options Extra options for the {TurnNotificationConfig} FormApplication.
     */
    create: function(data, options) {
        const currentCombat = game.combat.data;

        const turnId = game.combat.turns?.length ? game.combat.turns[currentCombat.turn]._id : null;
        const notificationData = {
            combat: currentCombat._id,
            round: currentCombat.round,
            roundAbsolute: true,
            turn: turnId
        }

        const app = new TurnNotificationConfig(mergeObject(notificationData, data), options);
        app.render(true);
    }
}
export default TurnNotificationManager;
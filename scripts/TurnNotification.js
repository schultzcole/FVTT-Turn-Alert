import CONST from "./const.js";

/**
 * Data structure schema:
 * {
 *     id: id string,                         // The 16 char (allegedly) unique ID for this notification.
 *     combat: id string,                     // The combat that this turn notification belongs to
 *     createdRound: integer                  // The combat round during which this notification was created
 *     round: integer,                        // The round that this turn notification will activate on
 *     turn: id string | null,                // The turn that this notification will activate on. If null, activates at the top of the round
 *     endOfTurn: true,                       // Whether the notification should trigger at the end of the turn, or beginning of the turn
 *     roundAbsolute: boolean,                // Whether the round number is absolute (i.e. the notification happens on round 5) or relative to the round during which the notification was created (i.e. the notification happens 5 rounds after creation)
 *     repeating: boolean,                    // Whether this notification will repeat. If this notification triggers on an absolute round number (roundAbsolute is true), this is ignored!
 *     message: string,                       // The message to be displayed in chat when the notification is activated
 *     recipients: [actor id strings] | null  // The actors to whom the message should be whispered. If null, the message is public
 * }
 */

export default class TurnNotification {
    static get defaultData() {
        return {
            id: null,
            combat: null,
            createdRound: 0,
            round: 0,
            turn: null,
            roundAbsolute: true,
            repeating: false,
            message: "",
            recipients: null
        };
    }

    static async create(data) {
        if (!data.combat) {
            throw new Error(`Invalid combat id provided, cannot add notification to combat: ${data.combat}`);
        }

        const notificationData = mergeObject(this.prototype.constructor.defaultData, data);
        const combat = game.combats.get(notificationData.combat);

        const id = randomID(16);
        notificationData.id = id;

        notificationData.createdRound = combat.data.round;

        let combatNotifications = combat.getFlag(CONST.moduleName, "notifications");
        if (!combatNotifications) combatNotifications = {};
        combatNotifications[id] = notificationData;

        return combat.setFlag(CONST.moduleName, "notifications", combatNotifications);
    }
}

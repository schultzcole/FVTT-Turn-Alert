import CONST from "./const.js";
import { compareTurns } from "./utils.js";

/**
 * Data structure schema:
 * {
 *     id: id string,                         // The 16 char (allegedly) unique ID for this notification.
 *     combatId: id string,                     // The combat that this turn notification belongs to
 *     createdRound: integer                  // The combat round during which this notification was created
 *     round: integer,                        // The round that this turn notification will activate on
 *     turnId: id string | null,                // The turn that this notification will activate on. If null, activates at the top of the round
 *     endOfTurn: true,                       // Whether the notification should trigger at the end of the turn, or beginning of the turn. Only used if turn is not null.
 *     roundAbsolute: boolean,                // Whether the round number is absolute (i.e. the notification happens on round 5) or relative to the round during which the notification was created (i.e. the notification happens 5 rounds after creation)
 *     repeating: boolean,                    // Whether this notification will repeat. If this notification triggers on an absolute round number (roundAbsolute is true), this is ignored!
 *     message: string,                       // The message to be displayed in chat when the notification is activated
 *     userId: id string,                       // The user that created this notification
 *     recipientIds: [user id strings]          // The users to whom the message should be whispered. If empty, the message is public
 * }
 */

export default class TurnNotification {
    static get defaultData() {
        return {
            id: null,
            combatId: null,
            createdRound: 0,
            round: 0,
            turnId: null,
            endOfTurn: false,
            roundAbsolute: false,
            repeating: false,
            message: "",
            userId: null,
            recipientIds: null,
        };
    }

    static getCombat = (data) => game.combats.get(data.combatId);

    static getTurnIndex = (data) => TurnNotification.getCombat(data).turns.findIndex((t) => t._id === data.turnId);

    static checkTrigger(data, currentRound, currentTurn) {
        const nextTriggerRound = TurnNotification.nextTrigger(data, currentRound);
        const turnIndex = TurnNotification.getTurnIndex(data);

        return compareTurns(nextTriggerRound, turnIndex, currentRound, currentTurn) === 0;
    }

    static checkExpired(data, currentRound, currentTurn) {
        const nextTriggerRound = TurnNotification.nextTrigger(data, currentRound);
        let turnIndex = TurnNotification.getTurnIndex(data);
        if (data.endOfTurn) turnIndex++;

        return compareTurns(nextTriggerRound, turnIndex, currentRound, currentTurn) <= 0;
    }

    static nextTrigger(data, currentRound) {
        if (data.roundAbsolute) {
            return data.round;
        } else if (data.repeating && data.round > 0) {
            return Math.ceil((currentRound - data.createdRound) / data.round) * data.round + data.createdRound;
        } else {
            return data.createdRound + data.round;
        }
    }

    static async create(data) {
        if (!data.combatId) {
            throw new Error(`Invalid combat id provided, cannot add notification to combat: ${data.combatId}`);
        }

        const notificationData = mergeObject(this.prototype.constructor.defaultData, data);

        const id = randomID(16);
        notificationData.id = id;

        const combat = game.combats.get(notificationData.combatId);

        let combatNotifications = combat.getFlag(CONST.moduleName, "notifications");

        if (!combatNotifications) combatNotifications = {};
        else combatNotifications = duplicate(combatNotifications);

        combatNotifications[id] = notificationData;

        return combat.update({ [`flags.${CONST.moduleName}.notifications`]: combatNotifications });
    }

    /**
     * Updates a given turn notification. REQUIRES the given notification data to contain an ID and combat ID.
     * @param {object} data The TurnNotification data to update.
     */
    static async update(data) {
        if (!data.id) {
            throw new Error("Cannot update a notification that doesn't contain a notification ID.");
        }
        if (!data.combatId) {
            throw new Error("Cannot update a notification that doesn't contain a combat ID.");
        }

        const combat = game.combats.get(data.combatId);

        if (!combat) {
            throw new Error(`The combat "${data.combatID}" does not exist.`);
        }

        const notifications = combat.getFlag(CONST.moduleName, "notifications");
        const existingData = getProperty(notifications, data.id);

        if (!existingData) {
            throw new Error(
                `Cannot update notification ${data.id} in combat ${data.combatId} because that notification doesn't already exist in that combat.`
            );
        }

        notifications[data.id] = mergeObject(existingData, data);

        await combat.unsetFlag(CONST.moduleName, "notifications");
        combat.setFlag(CONST.moduleName, "notifications", notifications);
    }

    static async delete(combatId, notificationId) {
        const combat = game.combats.get(combatId);

        if (!combat) {
            throw new Error(`The combat "${data.combatID}" does not exist.`);
        }

        const notifications = combat.getFlag(CONST.moduleName, "notifications") || {};

        if (!(notificationId in notifications)) {
            throw new Error(`The notification "${notificationId}" does not exist in combat "${combatId}".`);
        }

        delete notifications[notificationId];

        await combat.unsetFlag(CONST.moduleName, "notifications");
        combat.setFlag(CONST.moduleName, "notifications", notifications);
    }
}

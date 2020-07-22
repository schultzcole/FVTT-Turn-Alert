import CONST from "./const.js";
import { compareTurns } from "./utils.js";

/**
 * Data structure schema:
 * {
 *     id: id string,                   // The 16 char (allegedly) unique ID for this notification.
 *     combatId: id string,             // The id of the combat that this turn notification belongs to
 *     createdRound: integer            // The combat round during which this notification was created
 *     round: integer,                  // The round that this turn notification will activate on
 *     turnId: id string | null,        // The id of the turn that this notification will activate on. If null, activates at the top of the round
 *     endOfTurn: true,                 // Whether the notification should trigger at the end of the turn, or beginning of the turn. Only used if turnId is not null.
 *     roundAbsolute: boolean,          // Whether the round number is absolute (i.e. the notification happens on round 5) or relative to the round during which the notification was created (i.e. the notification happens 5 rounds after creation)
 *     repeating: boolean,              // Whether this notification will repeat. If this notification triggers on an absolute round number (roundAbsolute is true), this is ignored!
 *     message: string,                 // The message to be displayed in chat when the notification is activated
 *     userId: id string,               // The user that created this notification
 *     recipientIds: [user id strings]  // The users to whom the message should be whispered. If empty, the message is public
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

    /** gets the Combat object that this notification belongs to. */
    static getCombat = (notification) => game.combats.get(notification.combatId);

    /** gets the index of the turn that this notification is set to trigger on. */
    static getTurnIndex = (notification) =>
        TurnNotification.getCombat(notification).turns.findIndex((t) => t._id === notification.turnId);

    /** gets the next upcoming round and turn that this notification will trigger on. */
    static getNextTriggerTurn = (notification, currentRound) => ({
        round: TurnNotification.nextTriggerRound(notification, currentRound),
        turn: notification.endOfTurn
            ? TurnNotification.getTurnIndex(notification) + 1
            : TurnNotification.getTurnIndex(notification),
    });

    /** gets the next round that this notification will trigger on. */
    static nextTriggerRound(notification, currentRound) {
        if (notification.roundAbsolute) {
            return notification.round;
        } else if (notification.repeating && notification.round > 0) {
            return (
                Math.ceil((currentRound - notification.createdRound) / notification.round) * notification.round +
                notification.createdRound
            );
        } else {
            return notification.createdRound + notification.round;
        }
    }

    /** checks whether a given notification triggers on the current round and turn */
    static checkTrigger = (notification, currentRound, currentTurn) =>
        TurnNotification._checkTurn((a, b) => a === b, notification, currentRound, currentTurn);

    /** checks whether a given notification is expired given the current round and turn */
    static checkExpired = (notification, currentRound, currentTurn) =>
        TurnNotification._checkTurn((a, b) => a <= b, notification, currentRound, currentTurn);

    /** checks how a given notification's trigger compares to the current round and turn based on a given comparison function */
    static _checkTurn(cmp, data, currentRound, currentTurn) {
        const { round, turn } = TurnNotification.getNextTriggerTurn(data, currentRound);
        return cmp(compareTurns(round, turn, currentRound, currentTurn), 0);
    }

    /**
     * Creates a new turn notification with the given data.
     * This function creates the notification in the database by attaching the notification data
     * to the combat with the id provided as the combatId in the notification data.
     * @param {Object} data                           The notification data to add.
     * @param {id string} data.id                     The 16 char (allegedly) unique ID for this notification.
     * @param {id string} data.combatId               The id of the combat that this turn notification belongs to
     * @param {integer} data.createdRound             The combat round during which this notification was created
     * @param {integer} data.round                    The round that this turn notification will activate on
     * @param {id string} data.turnId                 The id of the turn that this notification will activate on. If null, activates at the top of the round
     * @param {boolean} data.endOfTurn                Whether the notification should trigger at the end of the turn, or beginning of the turn. Only used if turnId is not null.
     * @param {boolean} data.roundAbsolute            Whether the round number is absolute (i.e. the notification happens on round 5) or relative to the round during which the notification was created (i.e. the notification happens 5 rounds after creation)
     * @param {boolean} data.repeating                Whether this notification will repeat. If this notification triggers on an absolute round number (roundAbsolute is true), this is ignored!
     * @param {string} data.message                   The message to be displayed in chat when the notification is activated
     * @param {id string} data.userId                 The user that created this notification
     * @param {Array(id string)} data.recipientIds    The users to whom the message should be whispered. If empty, the message is public
     */
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

    /**
     * Deletes a notification from a given combat.
     * @param {id string} combatId The id of the combat to delete a notification from.
     * @param {id string} notificationId The id of the notification to delete.
     */
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

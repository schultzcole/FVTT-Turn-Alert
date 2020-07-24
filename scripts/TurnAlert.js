import CONST from "./const.js";
import { compareTurns } from "./utils.js";

/**
 * Data structure schema:
 * {
 *     id: id string,                   // The 16 char (allegedly) unique ID for this alert.
 *     combatId: id string,             // The id of the combat that this turn alert belongs to
 *     createdRound: integer            // The combat round during which this alert was created
 *     round: integer,                  // The round that this turn alert will activate on
 *     turnId: id string | null,        // The id of the turn that this alert will activate on. If null, activates at the top of the round
 *     endOfTurn: true,                 // Whether the alert should trigger at the end of the turn, or beginning of the turn. Only used if turnId is not null.
 *     roundAbsolute: boolean,          // Whether the round number is absolute (i.e. the alert happens on round 5) or relative to the round during which the alert was created (i.e. the alert happens 5 rounds after creation)
 *     repeating: boolean,              // Whether this alert will repeat. If this alert triggers on an absolute round number (roundAbsolute is true), this is ignored!
 *     message: string,                 // The message to be displayed in chat when the alert is activated
 *     macro: string                    // The macro id or name to trigger when this alert is triggered
 *     userId: id string,               // The user that created this alert
 *     recipientIds: [user id strings]  // The users to whom the message should be whispered. If empty, the message is public
 * }
 */

export default class TurnAlert {
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
            macro: null,
            userId: null,
            recipientIds: null,
        };
    }

    /** gets the Combat object that this alert belongs to. */
    static getCombat = (alert) => game.combats.get(alert.combatId);

    /** gets the index of the turn that this alert is set to trigger on. */
    static getTurnIndex = (alert) => TurnAlert.getCombat(alert).turns.findIndex((t) => t._id === alert.turnId);

    /** gets the next upcoming round and turn that this alert will trigger on. */
    static getNextTriggerTurn = (alert, currentRound) => ({
        round: TurnAlert.nextTriggerRound(alert, currentRound),
        turn: alert.endOfTurn ? TurnAlert.getTurnIndex(alert) + 1 : TurnAlert.getTurnIndex(alert),
    });

    /** gets the next round that this alert will trigger on. */
    static nextTriggerRound(alert, currentRound) {
        if (alert.roundAbsolute) {
            return alert.round;
        } else if (alert.repeating && alert.round > 0) {
            return Math.ceil((currentRound - alert.createdRound) / alert.round) * alert.round + alert.createdRound;
        } else {
            return alert.createdRound + alert.round;
        }
    }

    /** checks whether a given alert triggers on the current round and turn */
    static checkTrigger = (alert, currentRound, currentTurn) =>
        TurnAlert._checkTurn((a, b) => a === b, alert, currentRound, currentTurn);

    /** checks whether a given alert is expired given the current round and turn */
    static checkExpired = (alert, currentRound, currentTurn) =>
        TurnAlert._checkTurn((a, b) => a <= b, alert, currentRound, currentTurn);

    /** checks how a given alert's trigger compares to the current round and turn based on a given comparison function */
    static _checkTurn(cmp, data, currentRound, currentTurn) {
        const { round, turn } = TurnAlert.getNextTriggerTurn(data, currentRound);
        return cmp(compareTurns(round, turn, currentRound, currentTurn), 0);
    }

    /**
     * Creates a new turn alert with the given data.
     * This function creates the alert in the database by attaching the alert data
     * to the combat with the id provided as the combatId in the alert data.
     * @param {Object} data                           The alert data to add.
     * @param {id string} data.combatId               The id of the combat that this turn alert belongs to
     * @param {integer} data.createdRound             The combat round during which this alert was created
     * @param {integer} data.round                    The round that this turn alert will activate on
     * @param {id string} data.turnId                 The id of the turn that this alert will activate on. If null, activates at the top of the round
     * @param {boolean} data.endOfTurn                Whether the alert should trigger at the end of the turn, or beginning of the turn. Only used if turnId is not null.
     * @param {boolean} data.roundAbsolute            Whether the round number is absolute (i.e. the alert happens on round 5) or relative to the round during which the alert was created (i.e. the alert happens 5 rounds after creation)
     * @param {boolean} data.repeating                Whether this alert will repeat. If this alert triggers on an absolute round number (roundAbsolute is true), this is ignored!
     * @param {string} data.message                   The message to be displayed in chat when the alert is activated
     * @param {string} data.macro                     The macro id or name to trigger when this alert is triggered
     * @param {id string} data.userId                 The user that created this alert
     * @param {Array(id string)} data.recipientIds    The users to whom the message should be whispered. If empty, the message is public
     */
    static async create(data) {
        const combat = game.combats.get(data.combatId);
        if (!combat) {
            throw new Error(`Invalid combat id provided, cannot add alert to combat: ${data.combatId}`);
        }

        const alertData = mergeObject(this.prototype.constructor.defaultData, data);

        const id = randomID(16);
        alertData.id = id;

        if (data.turnId !== null && TurnAlert.getNextTriggerTurn(data) === -1) {
            throw new Error(
                `The provided turnId ("${data.turnId}") does not match any combatants in combat ${data.combatId}`
            );
        }

        let combatAlerts = combat.getFlag(CONST.moduleName, "alerts");

        if (!combatAlerts) combatAlerts = {};
        else combatAlerts = duplicate(combatAlerts);

        combatAlerts[id] = alertData;

        return combat.update({ [`flags.${CONST.moduleName}.alerts`]: combatAlerts });
    }

    /**
     * Updates a given turn alert. REQUIRES the given alert data to contain an ID and combat ID.
     * @param {object} data The TurnAlert data to update.
     */
    static async update(data) {
        if (!data.id) {
            throw new Error("Cannot update an alert that doesn't contain an alert ID.");
        }
        if (!data.combatId) {
            throw new Error("Cannot update an alert that doesn't contain a combat ID.");
        }

        const combat = game.combats.get(data.combatId);

        if (!combat) {
            throw new Error(`The combat "${data.combatID}" does not exist.`);
        }

        const alerts = combat.getFlag(CONST.moduleName, "alerts");
        const existingData = getProperty(alerts, data.id);

        if (!existingData) {
            throw new Error(
                `Cannot update alert ${data.id} in combat ${data.combatId} because that alert doesn't already exist in that combat.`
            );
        }

        alerts[data.id] = mergeObject(existingData, data);

        await combat.unsetFlag(CONST.moduleName, "alerts");
        combat.setFlag(CONST.moduleName, "alerts", alerts);
    }

    /**
     * Deletes an alert from a given combat.
     * @param {id string} combatId The id of the combat to delete an alert from.
     * @param {id string} alertId The id of the alert to delete.
     */
    static async delete(combatId, alertId) {
        const combat = game.combats.get(combatId);

        if (!combat) {
            throw new Error(`The combat "${data.combatID}" does not exist.`);
        }

        const alerts = combat.getFlag(CONST.moduleName, "alerts") || {};

        if (!(alertId in alerts)) {
            throw new Error(`The alert "${alertId}" does not exist in combat "${combatId}".`);
        }

        delete alerts[alertId];

        await combat.unsetFlag(CONST.moduleName, "alerts");
        combat.setFlag(CONST.moduleName, "alerts", alerts);
    }
}

import CONST from "./const.js";

/**
 * Data structure schema:
 * {
 *     id: id string,                         // The 16 char (allegedly) unique ID for this reminder.
 *     combat: id string,                     // The combat that this turn reminder belongs to
 *     round: integer,                        // The round that this turn reminder will activate on
 *     turn: id string | null,                // The turn that this reminder will activate on. If null, activates at the top of the round
 *     roundAbsolute: boolean,                // Whether the round number is absolute (i.e. the reminder happens on round 5) or relative to the round during which the reminder was created (i.e. the reminder happens 5 rounds after creation)
 *     repeating: boolean,                    // Whether this reminder will repeat. If this reminder triggers on an absolute round number (roundAbsolute is true), this is ignored!
 *     message: string,                       // The message to be displayed in chat when the reminder is activated
 *     recipients: [actor id strings] | null  // The actors to whom the message should be whispered. If null, the message is public
 * }
 */

export default class TurnNotification {
    constructor(data) {
        this.data = data;

        if (!this.data.id) {
            throw new Error(`Invalid id provided: ${this.data.id}`);
        }

        if (!this.data.combat) {
            throw new Error(`Invalid combat id provided: ${this.data.combat}`);
        }
    }

    static get defaultData() {
        return {
            id: null,
            combat: null,
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

        const notiData = mergeObject(this.prototype.constructor.defaultData, data);

        const id = randomID(16);
        notiData.id = id;

        const turnNotification = new TurnNotification(notiData);

        let combatNotifications = game.combat.getFlag(CONST.moduleName, "notifications");
        if (!combatNotifications) combatNotifications = {};
        combatNotifications[id] = notiData;

        return game.combats.get(notiData.combat).setFlag(CONST.moduleName, "notifications", combatNotifications);
    }
}

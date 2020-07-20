import CONST from "../scripts/const.js";
import TurnNotificationConfig from "./TurnNotificationConfig.js";
import TurnNotification from "../scripts/TurnNotification.js";

/**
 * Provides an interface to view, add, update, and delete notifications on a given combat.
 * @param {string} data.combatId The id of the combat to display.
 */
export default class CombatNotificationApplication extends Application {
    constructor(data, options) {
        super(options);

        this.combatId = data.combatId;

        if (!this._combat) throw new Error(`The given combatID (${data.combatId}) is not valid.`);

        this._updateHandler = this._onCombatUpdate.bind(this);

        Hooks.on("updateCombat", this._updateHandler);
    }

    /**
     * Gets a reference to the combat for this instance.
     */
    get _combat() {
        return game.combats.get(this.combatId);
    }

    /**
     * A handler called each time the combat associated with this instance changes.
     */
    _onCombatUpdate() {
        this.render(false);
    }

    /**
     * Prepares and gets the relevant data for each turn in the combat.
     */
    get _turnData() {
        return this._combat.turns.map((turn) => ({
            id: turn._id,
            img: turn.img,
            name: turn.name,
            initiative: turn.initiative,
            notifications: this._notificationsForTurn(turn._id).map((n) => {
                const nextTrigger = TurnNotification.nextTrigger(n, this._combat.data.round);
                const roundGt1 = n.round > 1;
                const repeatString = roundGt1 ? `Repeats every ${n.round} rounds` : `Repeats every round`;
                const startEndIcon = n.endOfTurn ? "hourglass-end" : "hourglass-start";
                return {
                    id: n.id,
                    message: n.message,
                    repeating: n.repeating,
                    repeatString: repeatString,
                    roundString: `Round ${nextTrigger}`,
                    roundIcon: startEndIcon,
                };
            }),
        }));
    }

    /**
     * Gets all of the notifications associated with a particular turn
     * @param {string} turnId The turn id to get notifications for
     */
    _notificationsForTurn(turnId) {
        const notifications = this._combat.getFlag(CONST.moduleName, "notifications");
        if (!notifications) return [];
        return Object.values(notifications).filter((notification) => notification.turnId === turnId);
    }

    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            template: `${CONST.modulePath}/templates/combat-notification.hbs`,
            title: "Combat Notifications",
            width: 500,
            height: 650,
            resizable: true,
        });
    }

    /** @override */
    getData(options) {
        return {
            timesRendered: this.timesRendered,
            turns: this._turnData,
            topOfRoundNotifications: this._notificationsForTurn(null),
            currentTurn: this._combat.data.turn,
        };
    }

    /** @override */
    activateListeners(html) {
        super.activateListeners(html);

        // Set minimum width of the containing application window.
        html.parent().parent().css("min-width", 300);

        // Listen for notification add buttons to be clicked.
        html.find(".add-notification-button").click((event) => {
            const notificationData = {
                combatId: this.combatId,
                createdRound: this._combat.data.round,
                round: 1,
                turnId: event.currentTarget.dataset.turnid,
                userId: game.userId,
            };
            new TurnNotificationConfig(notificationData, {}).render(true);
        });

        // Listen for notification edit buttons to be clicked.
        html.find(".edit-notification-button").click((event) => {
            const notificationId = event.currentTarget.dataset.id;
            const notificationData = getProperty(
                this._combat.data,
                `flags.${CONST.moduleName}.notifications.${notificationId}`
            );
            if (!notificationData) {
                throw new Error(
                    `Trying to edit a non-existent turn notification! ID "${notificationId}" does not exist on combat "${this.combatId}"`
                );
            }
            new TurnNotificationConfig(notificationData, {}).render(true);
        });
    }

    /** @override */
    async close() {
        // Unregister the combat update handler.
        Hooks.off("updateCombat", this._updateHandler);
        return super.close();
    }
}

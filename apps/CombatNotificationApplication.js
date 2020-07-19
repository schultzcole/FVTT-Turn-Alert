import CONST from "../scripts/const.js";
import TurnNotificationConfig from "./TurnNotificationConfig.js";

/**
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

    get _combat() {
        return game.combats.get(this.combatId);
    }

    _onCombatUpdate(combat, changed, diff, userId) {
        this.render(false);
    }

    get _turnData() {
        return this._combat.turns.map((turn) => ({
            id: turn._id,
            img: turn.img,
            name: turn.name,
            initiative: turn.initiative,
            notifications: this._notificationsForTurn(turn._id),
        }));
    }

    _notificationsForTurn(turnId) {
        const notifications = this._combat.getFlag(CONST.moduleName, "notifications");
        if (!notifications) return [];
        return Object.values(notifications).filter((notification) => notification.turn === turnId);
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

        html.parent().parent().css("min-width", 300);

        const addButtons = html.find(".add-notification-button");
        addButtons.click((event) => {
            const notificationData = {
                combat: this.combatId,
                createdRound: this._combat.data.round,
                round: 1,
                turn: event.currentTarget.dataset.turnid,
                user: game.userId,
            };
            new TurnNotificationConfig(notificationData, {}).render(true);
        });
    }

    /** @override */
    async close() {
        Hooks.off("updateCombat", this._updateHandler);
        return super.close();
    }
}

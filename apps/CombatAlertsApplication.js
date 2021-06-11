import CONST from "../scripts/const.js";
import TurnAlertConfig from "./TurnAlertConfig.js";
import TurnAlert from "../scripts/TurnAlert.js";

/**
 * Provides an interface to view, add, update, and delete alerts on a given combat.
 * @param {string} data.combatId The id of the combat to display.
 */
export default class CombatAlertsApplication extends Application {
    constructor(data, options) {
        super(options);

        this.combatId = data.combatId;
        this._combat = game.combats.get(this.combatId);
        if (!this._combat) throw new Error(`The given combatID (${data.combatId}) is not valid.`);

        this._updateHandler = this._onCombatUpdate.bind(this);

        Hooks.on("updateCombat", this._updateHandler);
        Hooks.on("deleteCombat", this.close.bind(this));
    }

    /**
     * A handler called each time the combat associated with this instance changes.
     */
    _onCombatUpdate(combat, changed, options, userId) {
        if (combat.data.id === this.combatId && changed.active === false) {
            this.close();
        } else {
            this.render(false);
        }
    }

    /** @override */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            template: `${CONST.modulePath}/templates/combat-alerts.hbs`,
            title: game.i18n.localize(`${CONST.moduleName}.APP.CombatAlertsTitle`),
            width: 650,
            height: 650,
            resizable: true,
        });
    }

    /** @override */
    getData(options) {
        return {
            // Prepend the turn list with the "Top of Round" pseudo-turn
            turns: [
                {
                    index: -1,
                    id: null,
                    img: null,
                    name: game.i18n.localize(`${CONST.moduleName}.APP.TopOfRound`),
                    initiative: null,
                    isVisible: game.user.isGM,
                    alerts: this._alertsForTurn(null).map(this._createAlertDisplayData.bind(this)),
                },
            ]
                .concat(this._turnData())
                .filter((turn) => turn.isVisible),
            currentRound: this._combat.data.round,
            currentTurn: this._combat.data.turn + 1,
            currentInitiative: this._combat.turns[this._combat.data.turn]?.initiative,
        };
    }

    /** Prepares and gets the relevant data for each turn in the combat. */
    _turnData() {
        return this._combat.turns.map((turn, index) => ({
            index,
            id: turn.id,
            img: turn.img,
            name: turn.name,
            initiative: turn.initiative,
            isVisible: turn.isOwner && turn.visible && !turn.hidden,
            alerts: this._alertsForTurn(turn.id)
                .map(this._createAlertDisplayData.bind(this))
                .filter((alert) => alert.isVisible),
        }));
    }

    /** Produces the data required by the view for the given alert */
    _createAlertDisplayData(alert) {
        const nextTrigger = TurnAlert.nextTriggerRound(alert, this._combat.data.round, this._combat.data.turn);
        const repeatString =
            alert.repeating?.frequency > 1
                ? game.i18n.format(`${CONST.moduleName}.APP.RepeatEveryNRounds`, {
                      num: alert.repeating.frequency,
                  })
                : game.i18n.localize(`${CONST.moduleName}.APP.RepeatEveryOneRound`);

        const roundTitle = alert.endOfTurn
            ? `${CONST.moduleName}.APP.TriggerAtEndOfTurnNum`
            : `${CONST.moduleName}.APP.TriggerAtStartOfTurnNum`;
        const roundIcon = alert.endOfTurn ? "hourglass-end" : "hourglass-start";

        const macroName = (game.macros.get(alert.macro) || game.macros.getName(alert.macro))?.data?.name;

        return {
            id: alert.id,
            label: alert.label,
            message: alert.message,
            recipientNames: alert.recipientIds.map((id) => game.users.get(id).data.name).join(", "),
            repeating: alert.repeating,
            round: nextTrigger,
            isVisible: game.user.isGM || game.userId == alert.userId,
            repeatString,
            roundTitle,
            roundIcon,
            macroName,
        };
    }

    /**
     * Gets all of the alerts associated with a particular turn
     * @param {string} turnId The turn id to get alerts for
     */
    _alertsForTurn(turnId) {
        const alerts = this._combat.getFlag(CONST.moduleName, "alerts");
        if (!alerts) return [];
        return Object.values(alerts).filter((alert) => alert.turnId === turnId);
    }

    _getHeaderButtons() {
        let buttons = super._getHeaderButtons();
        buttons.unshift({
            icon: "fas fa-info-circle",
            class: "icon",
            label: "",
            onclick: async (event) => {
                window.open("https://github.com/schultzcole/FVTT-Turn-Alert/wiki/User-Guide#combat-alerts-window");
            },
        });

        return buttons;
    }

    /** @override */
    activateListeners(html) {
        super.activateListeners(html);

        // Set minimum width of the containing application window.
        html.parent().parent().css("min-width", 300);

        // Listen for "delete all" button to be clicked.
        html.find("#cn-delete-all").click((event) => {
            this._combat.unsetFlag(CONST.moduleName, "alerts");
        });

        // Listen for alert add buttons to be clicked.
        html.find(".add-alert-button").click((event) => {
            const alertData = {
                combatId: this.combatId,
                createdRound: this._combat.data.round,
                round: 1,
                turnId: event.currentTarget.dataset.turnid || null,
            };
            new TurnAlertConfig(alertData, {}).render(true);
        });

        // Listen for alert edit buttons to be clicked.
        html.find(".edit-alert-button").click((event) => {
            const alertId = event.currentTarget.dataset.id;
            const alertData = getProperty(this._combat.data, `flags.${CONST.moduleName}.alerts.${alertId}`);
            if (!alertData) {
                throw new Error(
                    `Trying to edit a non-existent turn alert! ID "${alertId}" does not exist on combat "${this.combatId}"`
                );
            }
            new TurnAlertConfig(alertData, {}).render(true);
        });

        // Listen for alert delete buttons to be clicked.
        html.find(".delete-alert-button").click((event) => {
            TurnAlert.delete(this.combatId, event.currentTarget.dataset.id);
        });
    }

    /** @override */
    async close() {
        // Unregister the combat update handler.
        Hooks.off("updateCombat", this._updateHandler);
        return super.close();
    }
}

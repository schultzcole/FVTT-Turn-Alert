import TurnAlertConfig from "../apps/TurnAlertConfig.js";
import CONST from "./const.js";
import CombatAlertsApplication from "../apps/CombatAlertsApplication.js";

/**
 * Easily accessible utility functions for Turn Alerts
 */
export default class TurnAlertManager {
    /**
     * Displays the dialog for creating a new Turn Alert which will activate on the current turn.
     *
     * The Turn Alert will be added to the active combat.
     * @param {Object} data Initial data for the resulting turn alert.
     * @param {Object} options Extra options for the TurnAlertConfig FormApplication
     */
    createOnCurrentTurn(data, options) {
        if (!game.combat?.turns?.length) {
            ui.notifications.warn(game.i18n.localize(`${CONST.moduleName}.ERROR.CannotCreateAlert.NoCombatants`));
            return;
        }
        const turnId = game.combat.turns[game.combat.data.turn]._id;

        this._create(mergeObject(data, { turnId: turnId }), options);
    }

    /**
     * Displays the dialog for creating a new Turn Alert which will
     * activate at the top of a round rather than a particular turn.
     *
     * The Turn Alert will be added to the active combat.
     * @param {Object} data Initial data for the resulting turn alert.
     * @param {Object} options Extra options for the TurnAlertConfig FormApplication
     */
    createAtTopOfRound(data, options) {
        this._create(data, options);
    }

    /**
     * Internal method for ease of creating a new alert with some default values.
     * @param {Object} data Initial data for the turn alert
     * @param {Object} options Extra application options
     */
    _create(data, options) {
        if (!game.combat) {
            ui.notifications.error(game.i18n.localize(`${CONST.moduleName}.ERROR.CannotCreateAlert.NoCombats`));
            return;
        }

        const currentCombat = game.combat.data;

        const alertData = {
            combatId: currentCombat._id,
            createdRound: currentCombat.round,
            round: data.roundAbsolute ? currentCombat.round + 1 : 1,
            userId: game.userId,
        };

        const app = new TurnAlertConfig(mergeObject(alertData, data), options);
        app.render(true);
    }

    /**
     * Clears all alerts on a given combat.
     * @param {String} combatId The id string of the combat to clear all alerts for.
     */
    async clearAllAlertsForCombat(combatId) {
        const combat = combatId ? game.combats.get(combatId) : game.combat;
        return combat.unsetFlag(CONST.moduleName, "alerts");
    }

    /**
     * Show a window which allows for viewing, editing, deleting and adding new Alerts to the current combat.
     * @param {string} combatId The id of the combat to view alerts for.
     */
    viewAlertsForCombat(combatId) {
        if (!combatId) combatId = game.combat?.data?._id;
        if (!combatId) {
            ui.notifications.warn(game.i18n.localize(`${CONST.moduleName}.ERROR.CannotViewCombatAlert.NoCombat`));
            return;
        }
        const app = new CombatAlertsApplication({ combatId });
        app.render(true);
    }
}

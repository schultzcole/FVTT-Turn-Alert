import CONST from "../scripts/const.js";

/**
 * @param {string} data.combatId The id of the combat to display.
 */
export default class CombatNotificationApplication extends Application {
    constructor(data, options) {
        super(data, options);

        this.combat = game.combats.get(data.combatId);
    }

    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            template: `${CONST.modulePath}/templates/combat-notification.hbs`,
            title: "Combat Notifications",
            width: 500,
        });
    }

    /** @override */
    getData(options) {
        return {
            turns: this.combat.turns.map((turn) => ({
                id: turn._id,
                img: turn.img,
                name: turn.name,
                initiative: turn.initiative,
            })),
        };
    }
}

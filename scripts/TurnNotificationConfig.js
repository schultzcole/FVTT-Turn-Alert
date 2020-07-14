import CONST from "./const.js";
import TurnNotification from "./TurnNotification.js";

export default class TurnNotificationConfig extends FormApplication {

    constructor(data, options) {
        super(data, options);
        this.topOfRound = data.turn == null;

        if (!game.combats.has(data.combat)) {
            ui.notifications.error("Either no combat id was provided or the id provided did not match any active combats.");

            const combats = Array.from(game.combats.keys()).join(", ");
            throw new Error(`Invalid combat id provided. Got ${data.combat}, which does not match any of [${combats}]`)
        }
    }

    /** @override */
	static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "turn-notification-config",
            classes: ["sheet"],
            title: "Turn Notification Configuration",
            template: `${CONST.modulePath}/templates/turn-notification-config.hbs`,
            width: 400,
            submitOnChange: false,
            closeOnSubmit: true,
            resizable: true
        });
    }

    /** @override */
    getData(options) {
        return {
            object: duplicate(this.object),
            topOfRound: this.topOfRound,
            options: this.options
        }
    }
    
    /** @override */
    _onChangeInput(event) {
        const fd = this._getFormData(event.currentTarget.form);
        const newRoundAbsolute = fd.get("roundAbsolute") === "true";
        if (newRoundAbsolute != Boolean(this.object.roundAbsolute)) {
            this.object.roundAbsolute = newRoundAbsolute;
            this.render(false);
        }
    }

    /** @override */
    async _updateObject(event, formData) {
        if ( this.object.id ) {
            console.log("Updating existing notification!");
        } else {
            console.log("Creating new notification!")
        }
        
        console.log(this.object);
        console.log(formData);

        let finalData = mergeObject(this.object, formData);
        console.log(finalData);
        TurnNotification.create(finalData);
    }
}
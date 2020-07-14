import CONST from "./const.js";
import TurnNotification from "./TurnNotification.js";

export default class TurnNotificationConfig extends FormApplication {

    constructor(data, options) {
        super(data, options);

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
            validRound: !this.object.roundAbsolute || game.combats.get(this.object.combat).data.round <= this.object.round,
            options: this.options
        }
    }
    
    /** @override */
    _onChangeInput(event) {
        const fd = this._getFormData(event.currentTarget.form);
        
        const newData = {
            round: Number(fd.get("round")),
            roundAbsolute: fd.get("roundAbsolute") === "true",
            repeating: fd.get("repeating") === "true",
            message: fd.get("message")
        }

        this.object = mergeObject(this.object, newData);

        this.render(true);
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
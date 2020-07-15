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

    get validRound() {
        const combat = game.combats.get(this.object.combat);
        const thisRoundLater = combat.data.round < this.object.round;
        const isCurrentRound = combat.data.round == this.object.round;
        const thisTurnIndex = combat.turns.findIndex(turn => turn._id === this.object.turn);
        const thisTurnLater = combat.data.turn < thisTurnIndex;

        if (this.object.roundAbsolute) {
            return thisRoundLater || (isCurrentRound && thisTurnLater);
        } else {
            return this.object.round > 0 || thisTurnLater;
        }
    }

    get turnData() {
        if (this.object.turn === null) return null;

        const turn = game.combats.get(this.object.combat).turns.find(turn => turn._id === this.object.turn);

        return !turn ? null: {
            imgPath: turn.token.img,
            name: turn.token.name,
            initiative: turn.initiative
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
            validRound: this.validRound,
            topOfRound: this.object.turn === null,
            turnData: this.turnData,
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
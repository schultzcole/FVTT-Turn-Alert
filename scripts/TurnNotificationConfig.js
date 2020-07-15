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

        this.baseData = duplicate(data);
        this.combat = game.combats.get(data.combat);
        this.turn = this.object.turn ? this.combat.turns.find(turn => turn._id === this.object.turn) : null;
    }

    get _roundLabel() {
        return this.object.roundAbsolute ? "Trigger on round" : "Trigger after rounds";
    }

    get _validRound() {
        const thisRoundLater = this.combat.data.round < this.object.round;
        const isCurrentRound = this.combat.data.round == this.object.round;
        const thisTurnIndex = this.combat.turns.findIndex(turn => turn._id === this.object.turn);
        const thisTurnLater = this.combat.data.turn < thisTurnIndex;
        const isCurrentTurn = this.combat.data.turn == thisTurnIndex;
        const turnValid = thisTurnLater || (this.object.endOfTurn && isCurrentTurn);

        if (this.object.roundAbsolute) {
            return thisRoundLater || (isCurrentRound && turnValid);
        } else {
            return this.object.round > 0 || turnValid;
        }
    }

    get _turnData() {
        return !this.turn ? null: {
            imgPath: this.turn.token.img,
            name: this.turn.token.name,
            initiative: this.turn.initiative
        }
    }

    get _canRepeat() {
        return this.object.round != 0 && !this.object.roundAbsolute;
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
            roundLabel: this._roundLabel,
            validRound: this._validRound,
            topOfRound: !this.object.turn,
            turnData: this._turnData,
            canRepeat: this._canRepeat,
            options: this.options
        }
    }

    /** @override */
    activateListeners(html) {
        super.activateListeners(html);

        html.find('.turn-display').hover(this._onCombatantHover.bind(this), this._onCombatantHoverOut.bind(this));
    }

    _onCombatantHover(event) {
        event.preventDefault();
        const token = canvas.tokens.get(this.turn?.token?._id);
        if (token && token.isVisible && !token._controlled) {
            token._onHoverIn(event);
        }
    }

    _onCombatantHoverOut(event) {
        event.preventDefault();
        const token = canvas.tokens.get(this.turn?.token?._id);
        if (token ) {
            token._onHoverOut(event);
        }
    }
    
    /** @override */
    _onChangeInput(event) {
        const fd = this._getFormData(event.currentTarget.form);
        
        const newData = {
            round: Number(fd.get("round")),
            roundAbsolute: fd.get("roundAbsolute") === "true",
            repeating: fd.get("repeating") === "true",
            endOfTurn: fd.get("endOfTurn") === "true",
            message: fd.get("message")
        }

        const oldRoundAbsolute = this.object.roundAbsolute || false;
        if (oldRoundAbsolute != newData.roundAbsolute) {
            newData.round = newData.roundAbsolute
                ? this.combat.data.round + newData.round  // round number was previously relative
                : newData.round - this.combat.data.round; // round number was previously absolute
        }

        this.object = mergeObject(this.object, newData);

        this.render(true);
    }

    /** @override */
    async _updateObject(event, formData) {
        if (this.object.id) {
            console.log("Updating existing notification!");
        } else {
            console.log("Creating new notification!")
        }

        if (formData.roundAbsolute) delete formData.repeating;
        if (this.object.topOfRound) delete formData.endOfTurn;

        let finalData = mergeObject(this.baseData, formData);
        TurnNotification.create(finalData);
    }
}
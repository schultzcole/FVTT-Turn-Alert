import CONST from "../scripts/const.js";
import TurnNotification from "../scripts/TurnNotification.js";

/**
 * A window for creating or editing a turn notification.
 * The data object passed in to the should match the TurnNotification data schema.
 */
export default class TurnNotificationConfig extends FormApplication {
    constructor(data, options) {
        super(data, options);

        if (!game.combats.has(data.combatId)) {
            ui.notifications.error(
                "Either no combat id was provided or the id provided did not match any active combats."
            );

            const combats = Array.from(game.combats.keys()).join(", ");
            throw new Error(
                `Invalid combat id provided. Got ${data.combatId}, which does not match any of [${combats}]`
            );
        }

        this.baseData = duplicate(data);
        this.combat = game.combats.get(data.combatId);
        this.turn = this.object.turnId ? this.combat.turns.find((turn) => turn._id === this.object.turnId) : null;
    }

    get _roundLabel() {
        return this.object.roundAbsolute ? "Trigger on round" : "Trigger after rounds";
    }

    get _validRound() {
        const thisRoundLater = this.combat.data.round < this.object.round;
        const isCurrentRound = this.combat.data.round == this.object.round;
        const thisTurnIndex = this.combat.turns.findIndex((turn) => turn._id === this.object.turnId);
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
        return !this.turn
            ? null
            : {
                  imgPath: this.turn.token.img,
                  name: this.turn.token.name,
                  initiative: this.turn.initiative,
              };
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
            width: 600,
            submitOnChange: false,
            closeOnSubmit: true,
            resizable: true,
        });
    }

    /** @override */
    getData(options) {
        return {
            object: duplicate(this.object),
            roundLabel: this._roundLabel,
            validRound: this._validRound,
            topOfRound: !this.object.turnId,
            turnData: this._turnData,
            canRepeat: this._canRepeat,
            users: game.users.entries.map((user) => ({ id: user.data._id, name: user.data.name })),
            userCount: game.users.entries.length,
            options: this.options,
        };
    }

    /** @override */
    activateListeners(html) {
        super.activateListeners(html);

        html.find(".turn-display").hover(this._onCombatantHover.bind(this), this._onCombatantHoverOut.bind(this));
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
        if (token) {
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
            message: fd.get("message"),
        };

        const oldRoundAbsolute = this.object.roundAbsolute || false;
        if (oldRoundAbsolute != newData.roundAbsolute) {
            newData.round = newData.roundAbsolute
                ? this.combat.data.round + newData.round // round number was previously relative
                : newData.round - this.combat.data.round; // round number was previously absolute
        }

        this.object = mergeObject(this.object, newData);

        this._updateForm();
    }

    _updateForm() {
        const form = $(".turn-notification-config");

        const roundLabel = form.find("#roundLabel");
        roundLabel.text(this._roundLabel);

        const roundTextBox = form.find("#round");
        roundTextBox.prop("value", this.object.round);

        const validRoundWarning = form.find("#validRoundWarning");
        if (this._validRound) {
            validRoundWarning.hide();
        } else {
            validRoundWarning.show();
        }

        const repeatingCheckbox = form.find("#repeating");
        repeatingCheckbox.prop("disabled", !this._canRepeat);
        repeatingCheckbox.prop("checked", this._canRepeat && this.object.repeating);

        const endOfTurnCheckbox = form.find("#endOfTurn");
        endOfTurnCheckbox.prop("checked", this.object.endOfTurn);

        const messageBox = form.find("#message");
        messageBox.text(this.object.message);
    }

    /** @override */
    async _updateObject(event, formData) {
        if (formData.roundAbsolute) delete formData.repeating;
        if (this.object.topOfRound) delete formData.endOfTurn;

        formData.recipientIds = $(".turn-notification-config #recipients option")
            .filter(function () {
                return this.selected;
            })
            .map(function () {
                return this.value;
            })
            .get();

        let finalData = mergeObject(this.baseData, formData);

        if (this.object.id) {
            console.log("Updating existing notification!");
            TurnNotification.update(finalData);
        } else {
            console.log("Creating new notification!");
            TurnNotification.create(finalData);
        }
    }
}

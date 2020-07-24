import CONST from "../scripts/const.js";
import TurnAlert from "../scripts/TurnAlert.js";

/**
 * A window for creating or editing a turn alert.
 * The data object passed in to the should match the TurnAlert data schema.
 */
export default class TurnAlertConfig extends FormApplication {
    constructor(data, options) {
        super(data, options);

        if (!game.combats.has(data.combatId)) {
            ui.notifications.error(game.i18n.localize(`${CONST.moduleName}.ERROR.CannotShowAlertConfig.NoCombatId`));

            const combats = Array.from(game.combats.keys()).join(", ");
            throw new Error(
                `Invalid combat id provided. Got ${data.combatId}, which does not match any of [${combats}]`
            );
        }

        this.combat = game.combats.get(data.combatId);
        this.turn = this.object.turnId ? this.combat.turns.find((turn) => turn._id === this.object.turnId) : null;
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

    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "turn-alert-config",
            classes: ["sheet"],
            title: game.i18n.localize(`${CONST.moduleName}.APP.TurnAlertConfigTitle`),
            template: `${CONST.modulePath}/templates/turn-alert-config.hbs`,
            width: 600,
            submitOnChange: false,
            closeOnSubmit: true,
            resizable: true,
        });
    }

    /** @override */
    getData(options) {
        const { round, roundAbsolute, endOfTurn } = this.object;
        return {
            object: duplicate(this.object),
            roundLabel: this._getRoundLabel(roundAbsolute),
            validRound: this._validRound(round, roundAbsolute, endOfTurn),
            topOfRound: !this.object.turnId,
            turnData: this._turnData,
            canRepeat: this._canRepeat(round, roundAbsolute),
            users: game.users.entries.map((user) => ({ id: user.data._id, name: user.data.name })),
            userCount: game.users.entries.length,
            options: this.options,
            submitButton: this.object.id
                ? game.i18n.localize(`${CONST.moduleName}.APP.UpdateAlert`)
                : game.i18n.localize(`${CONST.moduleName}.APP.CreateAlert`),
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

        let newRound = Number(fd.get("round"));
        const newRoundAbsolute = fd.get("roundAbsolute") === "true";
        const newRepeating = fd.get("repeating") === "true";
        const newEndOfTurn = fd.get("endOfTurn") === "true";
        const newMacroString = fd.get("macro");

        const oldRoundAbsolute = this._roundAbsolute || false;
        if (oldRoundAbsolute != newRoundAbsolute) {
            newRound = newRoundAbsolute
                ? this.combat.data.round + newRound // round number was previously relative
                : newRound - this.combat.data.round; // round number was previously absolute
        }

        this._roundAbsolute = newRoundAbsolute;

        this._updateForm(newRound, newRoundAbsolute, newRepeating, newEndOfTurn, newMacroString);
    }

    _updateForm(round, roundAbsolute, repeating, endOfTurn, macroString) {
        const form = $(".turn-alert-config");

        const roundLabel = form.find("#roundLabel");
        roundLabel.text(this._getRoundLabel(roundAbsolute));

        const roundTextBox = form.find("#round");
        roundTextBox.prop("value", round);

        const repeatingCheckbox = form.find("#repeating");
        const canRepeat = this._canRepeat(round, roundAbsolute);
        repeatingCheckbox.prop("disabled", !canRepeat);
        repeatingCheckbox.prop("checked", canRepeat && repeating);

        const validRoundWarning = form.find("#validRoundWarning");
        if (this._validRound(round, roundAbsolute, endOfTurn)) {
            validRoundWarning.hide();
        } else {
            validRoundWarning.show();
        }

        const validMacroWarning = form.find("#macroWarning");
        if (this._validMacro(macroString)) {
            validMacroWarning.hide();
        } else {
            validMacroWarning.show();
        }
    }

    _getRoundLabel(roundAbsolute) {
        return roundAbsolute
            ? game.i18n.localize(`${CONST.moduleName}.APP.TriggerOnRound`)
            : game.i18n.localize(`${CONST.moduleName}.APP.TriggerAfterRounds`);
    }

    _canRepeat(round, roundAbsolute) {
        return round > 0 && !roundAbsolute;
    }

    _validRound(round, roundAbsolute, endOfTurn) {
        const thisRoundLater = this.combat.data.round < round;
        const isCurrentRound = this.combat.data.round == round;
        const thisTurnIndex = this.combat.turns.findIndex((turn) => turn._id === this.object.turnId);
        const thisTurnLater = this.combat.data.turn < thisTurnIndex;
        const isCurrentTurn = this.combat.data.turn == thisTurnIndex;
        const turnValid = thisTurnLater || (endOfTurn && isCurrentTurn);

        if (roundAbsolute) {
            return thisRoundLater || (isCurrentRound && turnValid);
        } else {
            return round > 0 || turnValid;
        }
    }

    _validMacro(macroString) {
        return Boolean(!macroString || game.macros.get(macroString) || game.macros.getName(macroString));
    }

    /** @override */
    async _updateObject(event, formData) {
        if (formData.roundAbsolute) delete formData.repeating;
        if (this.object.topOfRound) delete formData.endOfTurn;

        formData.recipientIds = $(".turn-alert-config #recipients option")
            .filter(function () {
                return this.selected;
            })
            .map(function () {
                return this.value;
            })
            .get();

        let finalData = mergeObject(this.object, formData);

        if (this.object.id) {
            TurnAlert.update(finalData);
        } else {
            TurnAlert.create(finalData);
        }
    }
}

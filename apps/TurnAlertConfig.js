import CONST from "../scripts/const.js";
import TurnAlert from "../scripts/TurnAlert.js";

/**
 * A window for creating or editing a turn alert.
 * The data object passed in to the should match the TurnAlert data schema.
 */
export default class TurnAlertConfig extends FormApplication {
    constructor(data, options) {
        data = foundry.utils.mergeObject(TurnAlert.defaultData, data);
        if (data.repeating) {
            data.repeating = foundry.utils.mergeObject(TurnAlert.defaultRepeatingData, data.repeating);
        }

        super(data, options);

        if (!game.combats.has(data.combatId)) {
            ui.notifications.error(game.i18n.localize(`${CONST.moduleName}.ERROR.CannotShowAlertConfig.NoCombatId`));

            const combats = Array.from(game.combats.keys()).join(", ");
            throw new Error(
                `Invalid combat id provided. Got ${data.combatId}, which does not match any of [${combats}]`
            );
        }

        this._roundAbsolute = data.roundAbsolute;
        this._expireAbsolute = data.repeating?.expireAbsolute;

        this.combat = game.combats.get(data.combatId);
        this.turn = this.object.turnId ? this.combat.turns.find((turn) => turn.id === this.object.turnId) : null;
    }

    get _turnData() {
        return !this.turn
            ? null
            : {
                  imgPath: this.turn.token.data.img,
                  name: this.turn.token.name,
                  initiative: this.turn.initiative,
              };
    }

    /** @override */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            id: "turn-alert-config",
            classes: ["sheet"],
            title: game.i18n.localize(`${CONST.moduleName}.APP.TurnAlertConfigTitle`),
            template: `${CONST.modulePath}/templates/turn-alert-config.hbs`,
            width: 450,
            submitOnChange: false,
            closeOnSubmit: true,
            resizable: true,
        });
    }

    /** @override */
    getData(options) {
        const { round, roundAbsolute, endOfTurn, turnId, repeating } = this.object;
        return {
            object: foundry.utils.deepClone(this.object),
            roundLabel: this._getRoundLabel(roundAbsolute),
            expireLabel: this._getExpireLabel(repeating?.expireAbsolute),
            validRound: this._validRound(round, roundAbsolute, endOfTurn),
            topOfRound: !turnId,
            turnData: this._turnData,
            repeating: Boolean(repeating),
            users: game.users.map((user) => ({
                id: user.data.id,
                name: user.data.name,
                selected: this.object.recipientIds?.includes(user.data.id),
            })),
            userCount: game.users.entries.length,
            options: this.options,
            submitButton: this.object.id
                ? game.i18n.localize(`${CONST.moduleName}.APP.UpdateAlert`)
                : game.i18n.localize(`${CONST.moduleName}.APP.CreateAlert`),
        };
    }

    _getHeaderButtons() {
        let buttons = super._getHeaderButtons();
        buttons.unshift({
            icon: "fas fa-info-circle",
            class: "icon",
            label: "",
            onclick: async (event) => {
                window.open(
                    "https://github.com/schultzcole/FVTT-Turn-Alert/wiki/User-Guide#turn-alert-configuration-dialog"
                );
            },
        });

        return buttons;
    }

    /** @override */
    activateListeners(html) {
        super.activateListeners(html);

        html.find(".turn-display").hover(this._onCombatantHover.bind(this), this._onCombatantHoverOut.bind(this));
    }

    _onCombatantHover(event) {
        event.preventDefault();
        const token = canvas.tokens.get(this.turn?.token?.id);
        if (token && token.isVisible && !token._controlled) {
            token._onHoverIn(event);
        }
    }

    _onCombatantHoverOut(event) {
        event.preventDefault();
        const token = canvas.tokens.get(this.turn?.token?.id);
        if (token) {
            token._onHoverOut(event);
        }
    }

    /** @override */
    _onChangeInput(event) {
        let fd = null;
        if (isNewerVersion(game.data.version, "0.7.0")) {
            fd = new FormDataExtended(event.currentTarget.form);
        } else {
            fd = this._getFormData(event.currentTarget.form);
        }

        let formRound = Number(fd.get("round"));
        const formRoundAbsolute = fd.get("roundAbsolute") === "true";
        const formRepeating = fd.get("repeatingToggle") === "true";
        const formEndOfTurn = fd.get("endOfTurn") === "true";
        const formMacroString = fd.get("macro");

        // Convert between absolute and relative round number
        const prevRoundAbsolute = this._roundAbsolute || false;
        if (prevRoundAbsolute != formRoundAbsolute) {
            formRound = formRoundAbsolute
                ? this.combat.data.round + formRound // round number was previously relative
                : formRound - this.combat.data.round; // round number was previously absolute
        }

        this._roundAbsolute = formRoundAbsolute;

        // Get repeating parameters if necessary
        let formRepeatParams = {};
        if (formRepeating) {
            formRepeatParams = {
                frequency: Number(fd.get("repeatFrequency")),
                expire: Number(fd.get("repeatExpire")),
                expireAbsolute: fd.get("repeatExpireAbsolute") === "true",
            };
        }

        // Update repeating expiration round based on absolute/relative and initial trigger round.
        const triggerRoundAbs = formRoundAbsolute ? formRound : this.combat.data.round + formRound;
        const prevExpireAbsolute = this._expireAbsolute || false;
        if (prevExpireAbsolute != formRepeatParams.expireAbsolute) {
            formRepeatParams.expire = formRepeatParams.expireAbsolute
                ? triggerRoundAbs + formRepeatParams.expire // expire round was previously relative
                : formRepeatParams.expire - triggerRoundAbs; // expire round was previously absolute
        }

        this._expireAbsolute = formRepeatParams.expireAbsolute;

        this._updateForm(formRound, formRoundAbsolute, formRepeating, formEndOfTurn, formMacroString, formRepeatParams);
    }

    _updateForm(round, roundAbsolute, repeating, endOfTurn, macroString, repeatParams) {
        const form = $(".turn-alert-config");

        const roundLabel = form.find("#roundLabel");
        roundLabel.text(this._getRoundLabel(roundAbsolute));

        const roundTextBox = form.find("#round");
        roundTextBox.prop("value", round);

        const validRoundWarning = form.find("#validRoundWarning");
        if (this._validRound(round, roundAbsolute, endOfTurn)) {
            validRoundWarning.hide();
        } else {
            validRoundWarning.show();
        }

        const repeatingParams = form.find("#repeatingParams");
        if (repeating) {
            repeatingParams.show();

            const frequencyTextBox = repeatingParams.find("#frequency");
            frequencyTextBox.prop("value", Math.max(repeatParams.frequency, 1));

            const expireLabel = repeatingParams.find("#expireLabel");
            expireLabel.text(this._getExpireLabel(repeatParams.expireAbsolute));

            const expireTextBox = repeatingParams.find("#expire");
            expireTextBox.prop("value", repeatParams.expire);
        } else {
            repeatingParams.hide();
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

    _getExpireLabel(expireAbsolute) {
        return expireAbsolute
            ? game.i18n.localize(`${CONST.moduleName}.APP.RepeatExpireOn`)
            : game.i18n.localize(`${CONST.moduleName}.APP.RepeatExpireAfter`);
    }

    _validRound(round, roundAbsolute, endOfTurn) {
        const thisRoundLater = this.combat.data.round < round;
        const isCurrentRound = this.combat.data.round == round;
        const thisTurnIndex = this.combat.turns.findIndex((turn) => turn.id === this.object.turnId);
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
        const whisperRecipients = $(".turn-alert-config #recipients option")
            .get()
            .map((option) => ({ selected: option.selected, id: option.value }));

        const newData = {
            round: formData.round,
            roundAbsolute: formData.roundAbsolute,
            repeating: formData.repeatingToggle
                ? {
                      frequency: formData.repeatFrequency,
                      expire: formData.repeatExpire,
                      expireAbsolute: formData.repeatExpireAbsolute,
                  }
                : null,
            endOfTurn: !this.object.topOfRound && formData.endOfTurn,
            label: formData.label,
            message: formData.message,
            recipientIds: whisperRecipients.every((r) => r.selected)
                ? []
                : whisperRecipients.filter((r) => r.selected).map((r) => r.id),
            macro: formData.macro,
        };

        let finalData = foundry.utils.mergeObject(this.object, newData, { inplace: false });

        if (this.object.id) {
            TurnAlert.update(finalData);
        } else {
            TurnAlert.create(finalData);
        }
    }
}

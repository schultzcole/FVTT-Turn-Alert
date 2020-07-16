import TurnNotificationConfig from "./TurnNotificationConfig.js";

export function patch_CombatTracker_activateListeners() {
    const old = CombatTracker.prototype.activateListeners;
    CombatTracker.prototype.activateListeners = function(html) {
        old.call(this, html);
        if (!game.user.isGM) this._contextMenu(html);
    }
}

export function patch_CombatTracker_getEntryContextOptions() {
    const old = CombatTracker.prototype._getEntryContextOptions;
    CombatTracker.prototype._getEntryContextOptions = function() {
        const options = game.user.isGM ? old.call(this) : [];
        options.unshift({
            name: "Add Notification",
            icon: '<i class="fas fa-bell"></i>',
            condition: li => {
                return canvas.tokens.get(li.data("token-id")).owner;
            },
            callback: li => {
                const notificationData = {
                    combat: this.combat.data._id,
                    createdRound: this.combat.data.round,
                    round: 1,
                    turn: li.data("combatant-id"),
                    user: game.userId,
                }
                new TurnNotificationConfig(notificationData, {}).render(true);
            }
        });
        return options;
    }
}
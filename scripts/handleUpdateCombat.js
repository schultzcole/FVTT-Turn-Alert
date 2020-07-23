import CONST from "./const.js";
import TurnAlert from "./TurnAlert.js";
import { compareTurns } from "./utils.js";

export default async function handleUpdateCombat(combat, changed, options, userId) {
    if (!("round" in changed || "turn" in changed) || !combat.turns?.length) {
        return;
    }

    let alerts = combat.getFlag(CONST.moduleName, "alerts");
    if (!alerts) return true; // allow the update, but quit the handler early
    alerts = duplicate(alerts);

    const oldCombatData = game.combats.get(combat.data._id).data;
    const prevRound = oldCombatData.round;
    const prevTurn = oldCombatData.turn;
    const nextRound = "round" in changed ? changed.round : prevRound;
    const nextTurn = "turn" in changed ? changed.turn : prevTurn;

    if (compareTurns(prevRound, prevTurn, nextRound, nextTurn) > 0) return true; // allow the update, but quit the handler early

    let anyDeleted = false;
    for (let id in alerts) {
        const alert = alerts[id];
        if (game.userId === alert.userId && TurnAlert.checkTrigger(alert, nextRound, nextTurn)) {
            if (alert.message) {
                const messageData = {
                    speaker: {
                        alias: game.i18n.localize(`${CONST.moduleName}.APP.TurnAlert`),
                    },
                    content: alert.message,
                    whisper: alert.recipientIds,
                };
                ChatMessage.create(messageData);
            }
        }

        if (game.user.isGM && TurnAlert.checkExpired(alert, nextRound, nextTurn)) {
            delete alerts[id];
            anyDeleted = true;
        }
    }

    const firstGm = game.users.find((u) => u.isGM && u.active);
    if (firstGm && game.user === firstGm && anyDeleted) {
        await combat.unsetFlag(CONST.moduleName, "alerts");
        if (Object.keys(alerts).length > 0) {
            return combat.setFlag(CONST.moduleName, "alerts", alerts);
        }
    }

    return true;
}

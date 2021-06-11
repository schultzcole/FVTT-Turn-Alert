import CONST from "./const.js";
import TurnAlert from "./TurnAlert.js";
import { compareTurns } from "./utils.js";

export async function handlePreUpdateCombat(combat, changed, options, userId) {
    if (!("round" in changed || "turn" in changed) || !combat.turns?.length) {
        return true;
    }

    options.prevRound = combat.data.round;
    options.prevTurn = combat.data.turn;
}

export async function handleUpdateCombat(combat, changed, options, userId) {
    if (!("round" in changed || "turn" in changed) || !combat.turns?.length) {
        return;
    }

    let alerts = combat.getFlag(CONST.moduleName, "alerts");
    if (!alerts) return;
    alerts = foundry.utils.deepClone(alerts);

    const prevRound = options.prevRound;
    const prevTurn = options.prevTurn;
    const nextRound = "round" in changed ? changed.round : prevRound;
    const nextTurn = "turn" in changed ? changed.turn : prevTurn;

    if (compareTurns(prevRound, prevTurn, nextRound, nextTurn) > 0) return;

    let anyDeleted = false;
    for (let id in alerts) {
        const alert = alerts[id];

        if (game.userId === alert.userId && TurnAlert.checkTrigger(alert, nextRound, nextTurn, prevRound, prevTurn)) {
            TurnAlert.execute(alert);
        }

        if (game.user.isGM && TurnAlert.checkExpired(alert, nextRound, nextTurn, prevRound, prevTurn)) {
            delete alerts[id];
            anyDeleted = true;
        }
    }

    const firstGm = game.users.find((u) => u.isGM && u.active);
    if (firstGm && game.user === firstGm && anyDeleted) {
        await combat.unsetFlag(CONST.moduleName, "alerts");
        if (Object.keys(alerts).length > 0) {
            combat.setFlag(CONST.moduleName, "alerts", alerts);
        }
    }
}

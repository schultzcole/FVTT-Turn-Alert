import CONST from "./const.js";
import TurnNotification from "./TurnNotification.js";

export default async function handleUpdateCombat(combat, changed, diff, userId) {
    if (!("round" in changed || "turn" in changed)) {
        await _savePreviousTurn(combat, userId);
        return;
    }

    const notifications = combat.getFlag(CONST.moduleName, "notifications");

    const turn = combat.turns[combat.data.turn]._id;
    const round = combat.data.round;
    const prev = combat.getFlag(CONST.moduleName, "previousTurn");
    const prevRound = prev.prevRound || 0;
    const prevTurn = combat.turns[prev.prevTurn || 0]?._id;

    for (let id in notifications) {
        const notification = notifications[id];
        if (game.userId !== notification.user) continue;

        const triggerRound = notification.endOfTurn ? prevRound : round;
        const triggerTurn = notification.endOfTurn ? prevTurn : turn;
        if (TurnNotification.checkTrigger(notification, triggerRound, round !== prevRound, triggerTurn)) {
            if (notification.message) {
                const messageData = {
                    speaker: { alias: "Turn Notification" },
                    content: notification.message,
                    whisper: notification.recipients,
                };
                ChatMessage.create(messageData);
            }
        }
    }

    await _pruneExpiredNotifications(combat, notifications, round);

    await _savePreviousTurn(combat, userId);
}

function _savePreviousTurn(combat, userId) {
    if (game.userId !== userId) return;

    const previousTurn = {
        prevRound: combat.data.round,
        prevTurn: combat.data.turn,
    };

    return combat.setFlag(CONST.moduleName, "previousTurn", previousTurn);
}

function _pruneExpiredNotifications(combat, notifications, currentRound) {
    if (!game.user.isGM) return;

    let anyDeleted = false;
    for (let id in notifications) {
        if (TurnNotification.checkExpired(notifications[id], currentRound)) {
            delete notifications[id];
            anyDeleted = true;
        }
    }
    if (anyDeleted) {
        return combat.setFlag(CONST.moduleName, "notifications", notifications);
    }
}

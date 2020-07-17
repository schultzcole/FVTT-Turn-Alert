import CONST from "./const.js";
import TurnNotification from "./TurnNotification.js";

export default async function handleUpdateCombat(combat, changed, diff, userId) {
    if (!("round" in changed || "turn" in changed) || !combat.turns?.length) {
        // await _savePreviousTurn(combat, userId);
        return;
    }

    let notifications = combat.getFlag(CONST.moduleName, "notifications");
    if (!notifications) return;
    notifications = duplicate(notifications);

    const round = combat.data.round;
    const turn = combat.data.turn;
    const prevRound = combat.previous.round || Math.max(round - 1, 0);
    const prevTurn = combat.previous.turn || Math.max(turn - 1, 0);

    let anyDeleted = false;
    for (let id in notifications) {
        const notification = notifications[id];

        const triggerRound = notification.endOfTurn ? prevRound : round;
        const triggerTurn = notification.endOfTurn ? prevTurn : turn;
        const turnId = combat.turns[triggerTurn]._id;
        if (TurnNotification.checkTrigger(notification, triggerRound, "round" in changed, turnId)) {
            if (game.userId === notification.user && notification.message) {
                const messageData = {
                    speaker: { alias: "Turn Notification" },
                    content: notification.message,
                    whisper: notification.recipients,
                };
                ChatMessage.create(messageData);
            }

            if (!notification.repeating) {
                delete notifications[id];
                anyDeleted = true;
            }
        }
    }

    if (game.user.isGM && anyDeleted) {
        await combat.unsetFlag(CONST.moduleName, "notifications");
        return combat.setFlag(CONST.moduleName, "notifications", notifications);
    }

    // await _savePreviousTurn(combat, userId);
}

function _savePreviousTurn(combat, userId) {
    if (game.userId !== userId) return;

    const previousTurn = {
        prevRound: combat.data.round,
        prevTurn: combat.data.turn,
    };

    return combat.setFlag(CONST.moduleName, "previousTurn", previousTurn);
}

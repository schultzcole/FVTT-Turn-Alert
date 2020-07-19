import CONST from "./const.js";
import TurnNotification from "./TurnNotification.js";
import { compareTurns } from "./utils.js";

export default async function handleUpdateCombat(combat, changed, options, userId) {
    if (!("round" in changed || "turn" in changed) || !combat.turns?.length) {
        return;
    }

    let notifications = combat.getFlag(CONST.moduleName, "notifications");
    if (!notifications) return true; // allow the update, but quit the handler early
    notifications = duplicate(notifications);

    const oldCombatData = game.combats.get(combat.data._id).data;
    const prevRound = oldCombatData.round;
    const prevTurn = oldCombatData.turn;
    const nextRound = "round" in changed ? changed.round : prevRound;
    const nextTurn = "turn" in changed ? changed.turn : prevTurn;

    if (compareTurns(prevRound, prevTurn, nextRound, nextTurn) > 0) return true; // allow the update, but quit the handler early

    let anyDeleted = false;
    for (let id in notifications) {
        const notification = notifications[id];

        const triggerRound = notification.endOfTurn ? prevRound : nextRound;
        const triggerTurn = notification.endOfTurn ? prevTurn : nextTurn;
        const turnId = combat.turns[triggerTurn]._id;
        if (
            game.userId === notification.user &&
            TurnNotification.checkTrigger(notification, triggerRound, "round" in changed, turnId)
        ) {
            if (notification.message) {
                const messageData = {
                    speaker: {
                        alias: "Turn Notification",
                    },
                    content: notification.message,
                    whisper: notification.recipients,
                };
                ChatMessage.create(messageData);
            }
        }

        if (game.user.isGM && TurnNotification.checkExpired(notification, nextRound, nextTurn)) {
            delete notifications[id];
            anyDeleted = true;
        }
    }

    const firstGm = game.users.find((u) => u.isGM && u.active);
    if (firstGm && game.user === firstGm && anyDeleted) {
        await combat.unsetFlag(CONST.moduleName, "notifications");
        if (Object.keys(notifications).length > 0) {
            return combat.setFlag(CONST.moduleName, "notifications", notifications);
        }
    }
}

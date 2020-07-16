import TurnNotificationManager from "./scripts/TurnNotificationManager.js";
import CONST from "./scripts/const.js";
import TurnNotification from "./scripts/TurnNotification.js";
import { patch_CombatTracker_getEntryContextOptions, patch_CombatTracker_activateListeners } from "./scripts/patches.js";

Hooks.on("init", () => {
    game.TurnNotificationManager = TurnNotificationManager;

    patch_CombatTracker_activateListeners();
    patch_CombatTracker_getEntryContextOptions();
});

Hooks.on("updateCombat", async (combat, changed, diff, userId) => {
    if (!("round" in changed || "turn" in changed)) {
        await savePreviousTurn(combat, userId);
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
                    whisper: notification.recipients
                };
                ChatMessage.create(messageData);
            }
        }
    }

    if (game.user.isGM) {
        let anyDeleted = false;
        for (let id in notifications) {
            if (TurnNotification.checkExpired(notifications[id], round)) {
                delete notifications[id];
                anyDeleted = true;
            }
        }
        if (anyDeleted) {
            await combat.setFlag(CONST.moduleName, "notifications", notifications);
        }
    }

    await savePreviousTurn(combat, userId);
});

function savePreviousTurn(combat, userId) {
    if (game.userId !== userId) return;

    const previousTurn = {
        prevRound: combat.data.round,
        prevTurn: combat.data.turn
    }

    return combat.setFlag(CONST.moduleName, "previousTurn", previousTurn);
}
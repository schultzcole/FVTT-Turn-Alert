import TurnNotificationManager from "./scripts/TurnNotificationManager.js";

Hooks.on("init", () => {
    game.TurnNotificationManager = TurnNotificationManager;
})
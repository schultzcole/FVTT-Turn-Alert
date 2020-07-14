import { TurnNotificationConfig } from "./scripts/TurnNotificationConfig.js";

Hooks.on("init", () => {
    game.TurnNotification = {};
    game.TurnNotification.create = function(data, options) {
        const app = new TurnNotificationConfig(data, options);
        app.render(true);
    }
})
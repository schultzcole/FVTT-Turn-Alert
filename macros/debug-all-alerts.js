function main() {
    if (!game.combat) {
        ui.notifications.error("There is no currently active combat.");
        return;
    }
    const alerts = game.combat?.data?.flags?.turnAlert?.alerts;

    if (!alerts || alerts.length === 0) {
        ui.notifications.error("There are no alerts on the currently active combat.");
        return;
    }

    const content = JSON.stringify(alerts, null, 2);
    new Dialog(
        {
            title: "DEBUG - All ALerts",
            content: `<textarea rows="40" style="resize: none" readonly>${content}</textarea>`,
            buttons: {
                done: {
                    icon: '<i class="fas fa-check"></i>',
                    label: "Done",
                },
            },
        },
        { width: 700 }
    ).render(true);
}

main();

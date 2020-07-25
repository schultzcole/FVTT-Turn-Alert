# Turn Alert

Set alerts to trigger on a particular round of combat or on a particular token's turn.
Alerts can create a chat message or execute a macro, for endless possibilities.

## User Guide

### Combat Tracker

Interacting with *Turn Alert* begins in the combat tracker:

![Combat tracker with additional Turn Alert buttons](https://f002.backblazeb2.com/file/cws-images/FVTT-Turn-Alert/combat_tracker.webp)

- **Add Alert:** an additional option to add a new turn alert has been added to the combatant context menu.
Clicking on **Add Alert** will open the Turn Alert Configuration dialog.
The Turn Alert Configuration dialog is where you create new and edit existing Turn Alerts.  
The option to add an alert is available to GMs, but is also available for players for combatants that they own.
- **View Combat Alerts:** at the top of the combat tracker is a new alert icon, which opens the Combat Alerts window.
The Combat Alerts window provides a way to view, add, edit, and delete all alerts for a given combat.  
This button is available to GMs only.

### Turn Alert Configuration Dialog

The Turn Alert Configuration dialog is where you will create new alerts and update existing ones.
It provides mechanisms to specify what round of combat an alert should trigger on, as well as what should happen when it is triggered.

![Turn Alert Configuration dialog for a turn](https://f002.backblazeb2.com/file/cws-images/FVTT-Turn-Alert/turn_alert.webp)

- **Trigger on round:** here you can specify what round the alert will trigger on.
If **Absolute round number** is *unchecked*, this box will specify the number of rounds after the current one before the alert will be triggered.  
For instance, when **Absolute round number** is *checked*, entering "5" will cause the alert to be triggered *on round 5*.
However when **Absolute round number** is *unchecked*, entering "5" will cause the alert to be triggered *5 rounds from the current round*.
- **Absolute round number:** determines whether the round number entered above is considered *absolute*, or *relative* to the current round.
- **Repeating:** determines whether the alert should repeat even after being triggered.
This option is only available when using a *relative* round number, and that round number is greater than zero.
The alert will trigger on a cycle determined by the round box above.
If "1" is entered, it will trigger every round starting next round, whereas if "3" is entered, it will trigger every 3 rounds, starting 3 rounds from the current round.
- **Trigger at end of turn:** determines whether the alert triggers at the start of this combatant's turn or the end of this combatant's turn.

---

- **Chat Message:** text that should be sent to chat when this alert triggers.
Allows for HTML and inline roll syntax.
- **Whisper to:** here you can specify the users that should receive the above chat message.
If no users are selected, it will default to all users.
You can select multiple users by CTRL- or CMD-clicking on multiple users.

---

- **Macro**: the id or name of a macro that should be executed when the alert is triggered.

#### Top of Round Turn Alert

A turn alert can be set to trigger at the top of a round of combat, rather than on any individual combatant's turn. When creating a top of the round alert, the Turn Alert Configuration dialog looks like this:

![Turn Alert Configuration dialog for a top of the round alert](https://f002.backblazeb2.com/file/cws-images/FVTT-Turn-Alert/top_of_round_alert.webp)

There are a couple of notable differences:

1. The dialog does not show a turn preview, because the alert won't happen on a specific turn.
2. There is no "Trigger at end of turn" checkbox, because there is no "start" and "end" to the top of the round; it is a single event.

Other than that, it should behave the same way.

### Combat Alerts Window

The combat alerts window is where you can view, add, edit, or delete alerts for the current combat.

![The Combat Alerts window](https://f002.backblazeb2.com/file/cws-images/FVTT-Turn-Alert/combat_alerts.webp)

- **Current Turn Information:** for convenience, the current round, turn, and initiative are displayed in the top left corner of this window.
- **Delete All Alerts:** this button deletes all alerts in the current combat.
- **Turn items:** each turn in the combat gets an item in the list of turns.
Each turn shows the combatant's token image and name, the initiative of their turn, and a "+" button.
The "+" button opens the Turn Alert Configuration dialog to create an alert for that turn in the combat.
- **Alerts:** beneath each turn is a listing of all of the active alerts for that turn, each with several components.
  - **Alert Indicators:** first is a listing of several indicators to give a condensed summary of the alert.
  There are 3 indicators that can appear for each alert:
    - **Round indicator:** displays the round that this alert will trigger on, as well as an hourglass icon which indicates whether the alert will trigger at the start or end of the turn.
    Hovering your cursor over this tag will give a more verbose explanation of alert's trigger.  
    For repeating alerts, this will display the next round that the alert will trigger.
    - **Repeating indicator:** indicates that this alert repeats, as well as how frequently it repeats.
    An example of this indicator can be seen on the Dire Wolf's turn in the image above.
    - **Macro indicator:** indicates that a macro is set to execute when this alert triggers.
    Hovering your cursor over this tag will give the name of the macro that will execute.
  - **Chat Message:** shows a truncated version of the chat message that will be sent when the alert is triggered.
  If the chat message is too long to be displayed here, you can edit the alert to read the full message.
  - **Edit Alert Button:** pulls up the Turn Alert Configuration dialog so that you can view the full details, edit, and save the alert.
  - **Delete Alert Button:** deletes the alert.

Note that unless an alert is *repeating*, it will be deleted after it has been triggered.

## License

Licensed under the GPLv3 License (see [LICENSE](LICENSE)).

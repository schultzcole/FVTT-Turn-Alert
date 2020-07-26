# Turn Alert

Set alerts to trigger on a particular round of combat or on a particular token's turn.
Alerts can create a chat message or execute a macro, for endless possibilities.

## Use Cases

So when would you want to use this module, and what was this module designed for?
The intended use of this module is to allow a user to quickly set a reminder for an event or effect.
It was designed with my preferred play style in mind, which is a relatively low automation style, just with the need for a reminder every once in a while.
That is not to say that it won't integrate with a high automation style of play, but keep the intent in mind when trying to make it do whatever shenanigans you want.

On to the use cases. These are a few situations that come to mind as exemplary uses of this module:

1. Renee the barbarian uses rage, which expires in 1 minute (10 turns in dnd5e land).
You can set an alert that will trigger 10 turns from now at the end of the turn, reminding you that the rage effect has expired.
2. Brutus's Sword of Wounding inflicts a wound which causes his enemy to take damage at the start of each of its turns.
You can set a repeating alert that will trigger at that time.
The alert message can include an inline roll to roll the damage, or the alert can even trigger a macro that automatically deducts hit points from the target.
3. Olive casts *cause fear* on an enemy, which can make a save against the effect at the end of each of its turns.
You can set a repeating alert to trigger at the end of each of the enemy's turns, prompting you to make the save.
When the enemy successfully makes its save, you can easily delete the repeating alert through the Combat Alerts window.
4. Waldeck is about to be hit by an enemy, but casts shield, raising their AC by 5 until the start of their next turn.
You can set an alert to remind you to change the AC back when the time comes (or automatically change the AC back with a macro, if you fancy that).
5. Andrew the GM knows that a while his players are fighting a group of goblins, reinforcements are on their way and will arrive at the start of the 10th round of combat.
Andrew can set an alert for himself at the top of the 10th round, which will whisper him—and only him—a reminder that the reinforcements should arrive.

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

![Turn Alert Configuration dialog for a turn](https://f002.backblazeb2.com/file/cws-images/FVTT-Turn-Alert/turn_alert_2.webp)

- **Trigger round:** here you can specify what round the alert will trigger on.
If **Absolute round number** is *unchecked*, the alert will trigger this many rounds after the current round.  
For instance, when **Absolute round number** is *checked*, entering "5" will cause the alert to be triggered *on round 5*.
However when **Absolute round number** is *unchecked*, entering "5" will cause the alert to be triggered *5 rounds after the current round*.
- **Absolute round number:** determines whether the round number entered above is considered *absolute*, or *relative* to the current round.
- **Repeating:** determines whether the alert should repeat even after being triggered.
  - **Repeat frequency:** determines how often the repeating alert should trigger, in rounds.
  - **Expiration round:** determines what round a repeating alert will expire on, if any.
  When this is zero, the repeating alert will never expire.
  If **Absolute expiration round number** is *checked*, the alert will expire on exactly the round number entered here.
  If it is *unchecked*, the alert will expire this many rounds after the initial **Trigger round**, specified above.
  - **Absolute expiration round number:** specifies whether the expiration round is *absolute*, or *relative* to the initial trigger round of the alert.
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
- **Turns:** each turn in the combat is represented by an entry in the list of turns.
Each turn entry shows the combatant's token image and name, the initiative of their turn, and a "+" button.
The "+" button opens the Turn Alert Configuration dialog to create an alert for that turn in the combat.
- **Alerts:** beneath each turn is a listing of all of the active alerts for that turn, each with several components.
  - **Alert Indicators:** first is a listing of several indicators to give a condensed summary of the alert.
  There are 3 indicators that can appear for each alert:
    - **Round indicator:** displays the round that this alert will trigger on, as well as an hourglass icon which indicates whether the alert will trigger at the start or end of the turn.
    Hovering your cursor over this indicator will give a more verbose explanation of alert's trigger.  
    For repeating alerts, this will display the next round that the alert will trigger on.  
    An example of the hourglass icon indicating the end of the round can be seen on Olive's turn in the image above.
    - **Repeating indicator:** indicates that this alert repeats, as well as how frequently it repeats.  
    An example of this indicator can be seen on the Dire Wolf's turn in the image above.
    - **Macro indicator:** indicates that a macro is set to execute when this alert triggers.
    Hovering your cursor over this tag will give the name of the macro that will execute.  
    An example of this indicator can be seen on Renee's turn in the image above.
  - **Chat Message:** shows a truncated version of the chat message that will be sent when the alert is triggered.
  If the chat message is too long to be displayed here, you can edit the alert to read the full message.
  - **Edit Alert Button:** pulls up the Turn Alert Configuration dialog so that you can view the full details, edit, and save the alert.
  - **Delete Alert Button:** deletes the alert.

Note that unless an alert is *repeating*, it will be deleted after it has been triggered.

## Compatibility

This module should be compatible with almost any other module. However, as of yet, it is not compatible with Furnace advanced macros. Sorry. It is on the list of things to investigate, but I won't make any promises.

This module doesn't coordinate with about time, dynamic effects, minor QOL, etc., however it is likely compatible.

## License

Licensed under the GPLv3 License (see [LICENSE](LICENSE)).

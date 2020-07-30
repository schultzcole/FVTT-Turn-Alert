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

The user guide has moved to the [repository wiki](https://github.com/schultzcole/FVTT-Turn-Alert/wiki/User-Guide).

## Compatibility

This module should be compatible with almost any other module. However, as of yet, it is not compatible with Furnace advanced macros. Sorry. It is on the list of things to investigate, but I won't make any promises.

This module doesn't coordinate with about time, dynamic effects, minor QOL, etc., however it is likely compatible.

## License

Licensed under the GPLv3 License (see [LICENSE](LICENSE)).

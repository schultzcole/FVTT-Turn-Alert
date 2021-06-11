/**
 * Basic Message Turn Alert
 * Creates an alert that triggers on the current turn in
 *   the next round and displays a message.
 *
 * Author: Cole Schultz (cole#9640)
 * For other example macros and api reference,
 *   visit the Turn Alert wiki:
 *   https://github.com/schultzcole/FVTT-Turn-Alert/wiki
 */

const alertData = {
    round: 1,
    roundAbsolute: false,
    turnId: game.combat.combatant.id,
    message: "My Message",
};

TurnAlert.create(alertData);

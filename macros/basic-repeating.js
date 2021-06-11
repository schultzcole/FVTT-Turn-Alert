/**
 * Basic Repeating Turn Alert
 * Creates an alert that triggers on the current turn,
 *   repeats every round, and doesn't expire.
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
    repeating: {
        frequency: 1,
    },
    message: "Triggers every turn",
};

TurnAlert.create(alertData);

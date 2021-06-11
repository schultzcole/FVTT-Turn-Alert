/**
 * Delayed Trigger Repeating Turn Alert
 * Creates an alert that initially triggers on the current turn
 *   5 rounds from now, repeats every round, and expires 5 rounds
 *   after the initial trigger.
 *
 * Author: Cole Schultz (cole#9640)
 * For other example macros and api reference,
 *   visit the Turn Alert wiki:
 *   https://github.com/schultzcole/FVTT-Turn-Alert/wiki
 */

const alertData = {
    round: 5,
    roundAbsolute: false,
    turnId: game.combat.combatant.id,
    repeating: {
        frequency: 1,
        expire: 5,
        expireAbsolute: false,
    },
    message: "Will start triggering every round 5 rounds from now!",
};

TurnAlert.create(alertData);

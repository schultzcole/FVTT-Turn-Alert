/**
 * Specific Round Turn Alert
 * Creates an alert that triggers at the top of the round on
 *   a specific round of combat.
 *
 * Author: Cole Schultz (cole#9640)
 * For other example macros and api reference,
 *   visit the Turn Alert wiki:
 *   https://github.com/schultzcole/FVTT-Turn-Alert/wiki
 */

const alertData = {
    round: 10,
    roundAbsolute: true,
    turnId: null,
    message: "Top of the Round on Round 10!",
};

TurnAlert.create(alertData);

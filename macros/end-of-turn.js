/**
 * End of Turn Turn Alert
 * Creates an alert that triggers at the end of the current
 *   combatant's turn this round and displays a message.
 *
 * Author: Cole Schultz (cole#9640)
 * For other example macros and api reference,
 *   visit the Turn Alert wiki:
 *   https://github.com/schultzcole/FVTT-Turn-Alert/wiki
 */

const alertData = {
    round: 0,
    roundAbsolute: false,
    turnId: game.combat.combatant.id,
    endOfTurn: true,
    message: "End of Turn!",
};

TurnAlert.create(alertData);

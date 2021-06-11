/**
 * Whispered Message Turn Alert
 * Creates an alert that whispers all GM users a message at the
 *   top of the round in round 10.
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
    message: "So secret... shhhh",
    recipientIds: game.users.filter((u) => u.isGM).map((u) => u.data.id),
};

TurnAlert.create(alertData);

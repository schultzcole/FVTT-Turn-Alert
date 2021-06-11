/**
 * Configurable Basic Message Turn Alert
 * Opens the Turn Alert Configuration dialog for editing with
 *   some initial values.
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
    message: "Edit me!",
};

new TurnAlertConfig(alertData).render(true);

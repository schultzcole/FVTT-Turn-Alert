/**
 * Compares two round/turn pairs to determine which came earlier in the turn order.
 * Returns:
 * A negative number if turn A is earlier,
 * Zero if both turns are the same,
 * A positive number of turn B is earlier
 * @param {Number} roundA
 * @param {Number} turnA
 * @param {Number} roundB
 * @param {Number} turnB
 */
export function compareTurns(roundA, turnA, roundB, turnB) {
    return Math.max(roundA, 0) - Math.max(roundB, 0) || Math.max(turnA, 0) - Math.max(turnB, 0);
}

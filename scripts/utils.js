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
    const roundDelta = roundA - roundB;
    return roundDelta !== 0 ? roundDelta : turnA - turnB;
}

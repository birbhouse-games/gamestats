/**
 * Calculates the minimum, maximum, and average values from a list of measurements.
 *
 * @param measures The list of measures.
 * @returns An object with the calculated values.
 */
export function getMMA(measures: Array<number>) {
	let min = Number.POSITIVE_INFINITY
	let max = -Number.POSITIVE_INFINITY
	let average = 0

	for (const measure of measures) {
		if (measure < min) {
			min = measure
		}

		if (measure > max) {
			max = measure
		}

		average += measure
	}

	average /= measures.length

	return {
		average,
		max,
		min,
	}
}

/**
 * Generates a hex color code from a string.
 *
 * @param string The base string to generate the color from.
 * @returns The generated color.
 */
export function stringToColor(string: string) {
	let hash = 0
	let index = 0

	while (index < string.length) {
		hash = string.charCodeAt(index) + ((hash << 5) - hash)
		index += 1
	}

	const c = (hash & 0x00FFFFFF).toString(16).toUpperCase()

	return `#${'00000'.substring(0, 6 - c.length)}${c}`
}

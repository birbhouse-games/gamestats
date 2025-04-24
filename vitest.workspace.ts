// Module imports
import { defineWorkspace } from 'vitest/config'





export default defineWorkspace([
	{
		test: {
			exclude: ['./release.config.js'],
			include: ['test/**/*.test.ts'],
			pool: 'forks',
		},
	},
])

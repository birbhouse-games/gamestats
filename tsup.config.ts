/* eslint-disable */

// Module imports
import {
	defineConfig,
	type Format,
} from 'tsup'
import { umdWrapper } from 'esbuild-plugin-umd-wrapper'





// constants
const BASE_CONFIG = {
	clean: true,
	dts: false,
	entry: {
		gamestats: 'src/index.ts',
	},
	globalName: 'GameStats',
	outDir: 'lib',
	sourcemap: true,
	splitting: false,
}
const UMD_CONFIG = {
	...BASE_CONFIG,
	esbuildPlugins: [
		umdWrapper({
			external: 'inherit',
			libraryName: 'GameStats',
		}),
	],
	footer: () => ({ js: 'exports = GameStats;' }),
	format: ['umd'] as unknown as Array<Format>,
}





export default defineConfig([
	{
		...BASE_CONFIG,
		dts: true,
		format: ['esm'],
	},
	{
		...BASE_CONFIG,
		format: ['esm'],
		minify: true,
		outExtension: () => ({ js: '.min.js' }),
	},
	{
		...BASE_CONFIG,
		format: ['cjs'],
	},
	{
		...BASE_CONFIG,
		format: ['cjs'],
		minify: true,
		outExtension: () => ({ js: '.min.cjs' }),
	},
	{
		...UMD_CONFIG,
		outExtension: () => ({ js: '.browser.js' }),
	},
	{
		...UMD_CONFIG,
		minify: true,
		outExtension: () => ({ js: '.browser.min.js' }),
	},
])

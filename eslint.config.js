// Module imports
import configBirbhouseBase from '@birbhouse/eslint-config'
import configBirbhouseTypescript from '@birbhouse/eslint-config-typescript'
import tseslint from 'typescript-eslint'





export default tseslint.config(
	configBirbhouseBase,
	configBirbhouseTypescript,
	{ files: ['src/**/*.{ts,tsx}'] },
)

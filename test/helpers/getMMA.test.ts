// Module imports
import {
	describe,
	expect,
	it,
} from 'vitest'





// Local imports
import { getMMA } from '../../src/helpers/getMMA'





describe('getMMA', function() {
	it('should be a function', function() {
		return expect(getMMA).to.be.a('function')
	})
})

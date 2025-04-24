// Module imports
import {
	describe,
	expect,
	it,
} from 'vitest'





// Local imports
import { stringToColor } from '../../src/helpers/stringToColor'





describe('stringToColor', function() {
	it('should be a function', function() {
		return expect(stringToColor).to.be.a('function')
	})
})

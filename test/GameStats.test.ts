// Module imports
import {
	describe,
	expect,
	it,
} from 'vitest'





// Local imports
import { GameStats } from '../src/GameStats'





describe('GameStats', function() {
	it('should be a function', function() {
		return expect(GameStats).to.be.a('function')
	})
})

// Local imports
import { getMMA } from './helpers/getMMA'
import { IExtension } from './typedefs/IExtension'
import { IGameStatsOptions } from './typedefs/IGameStatsOptions'
import { IGraph } from './typedefs/IGraph'
import { stringToColor } from './helpers/stringToColor'





// Constants
const DEFAULT_GRAPHS = ['ms', 'fps', 'memory']
const TOMB = 1048576





export class GameStats {
	/****************************************************************************\
	 * Private instance properties
	\****************************************************************************/

	#baseCanvasWidth: number
	#baseCanvasHeight: number
	#canvas: HTMLCanvasElement
	#config: IGameStatsOptions = {
		autoPlace: true,
		maximumHistory: 100,
		memoryUpdateInterval: 1000,
		memoryMaxHistory: 60 * 10, // 10 minutes of memory measurements
		redrawInterval: 50,
		scale: 1.0,
		targetFPS: 60,

		// COLORS
		FONT_FAMILY: 'Arial',
		COLOR_BG:'#333333',
		COLOR_FPS_AVG: '#FFF',
		COLOR_FPS_BAR: '#34cfa2',
		COLOR_TEXT_BAD: '#d34646',
		COLOR_TEXT_LABEL: '#FFF',
		COLOR_TEXT_TARGET: '#d249dd',
		COLOR_TEXT_TO_LOW: '#eee207',
	}
	#ctx: CanvasRenderingContext2D
	#currentTime?: number
	#extensions: Record<string, IExtension> = {}
	#graphYOffset = 0
	#labelColors: Record<string, string>
	#labelOrder: Array<string> = []
	#labels: Record<string, Array<number>> = {}
	#lastMemoryMeasure = -Number.POSITIVE_INFINITY
	#memoryGraph: IGraph
	#msGraph: IGraph
	#previousAverageMS?: number
	#previousMaxMS?: number
	#prevTime?: number
	#shown = true





	/****************************************************************************\
	 * Public instance properties
	\****************************************************************************/

	dom: HTMLDivElement





	/****************************************************************************\
	 * Constructor
	\****************************************************************************/

	constructor(options: Partial<IGameStatsOptions> = {}) {
		Object.assign(this.#config, options)

		this.#baseCanvasWidth = 100 * this.#config.scale
		this.#baseCanvasHeight = 150 * this.#config.scale

		this.#labelColors = {
			ms: this.#config.COLOR_FPS_BAR,
			memory: this.#config.COLOR_FPS_BAR,
		}

		this.#msGraph = {
			width: this.#baseCanvasWidth,
			height: this.#baseCanvasHeight * 0.4,
			drawY: this.#baseCanvasHeight * 0.16,
			barWidth: this.#baseCanvasWidth / this.#config.maximumHistory,
		}

		this.#memoryGraph = {
			width: this.#baseCanvasWidth,
			height: this.#baseCanvasHeight * 0.2,
			drawY: this.#baseCanvasHeight * 0.76,
			barWidth: this.#baseCanvasWidth / this.#config.memoryMaxHistory
		}

		this.#canvas = document.createElement('canvas')
		this.#ctx = this.#canvas.getContext('2d', { willReadFrequently: true })!
		this.dom = document.createElement('div')

		this.#init()
	}





	/****************************************************************************\
	 * Private instance methods
	\****************************************************************************/

	#draw() {
		if (!this.#prevTime) {
			return
		}

		// shift everything to the left:
		const ctx = this.#ctx
		const imageData = ctx.getImageData(1, 0, ctx.canvas.width - this.#msGraph.barWidth, ctx.canvas.height)
		ctx.putImageData(imageData, 0, 0)
		ctx.clearRect(ctx.canvas.width - this.#msGraph.barWidth, 0, this.#msGraph.barWidth, ctx.canvas.height)

		// clear fps text
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height * 0.16)

		// clear memory if needed
		if ('memory' in performance) {
			ctx.clearRect(0, ctx.canvas.height * 0.6, ctx.canvas.width, ctx.canvas.height * 0.16)
		}

		this.#drawGraph('ms', 1000 / this.#config.targetFPS)
		this.#drawFPS()
		this.#graphYOffset = 0

		for (let label of this.#labelOrder) {
			this.#drawGraph(label, this.#previousMaxMS, true)
		}

		this.#drawLines()

		if (performance && 'memory' in performance) {
			this.#drawMemory()
		}
	}

	#drawFPS() {
		const ctx = this.#ctx
		const config = this.#config

		const fpsMeasures = this.#labels['fps']

		if (!fpsMeasures) {
			return
		}

		const {
			average,
			max,
			min,
		} = getMMA(fpsMeasures)

		const averageFPS = Math.round(1000 / average)
		const maxFPS = Math.round(1000 / min)
		const minFPS = Math.round(1000 / max)

		const msMeasures = this.#labels['ms']
		const ms = (msMeasures[msMeasures.length - 1]).toFixed(1)

		const FPS = Math.round(1000 / fpsMeasures[fpsMeasures.length - 1])

		// magic numbers :)
		const padding = this.#baseCanvasHeight * 0.01

		// avg min max
		ctx.textAlign = 'left'
		let fontSize = this.#baseCanvasWidth * 0.09
		ctx.font = `${fontSize}px ${config.FONT_FAMILY}`
		ctx.textBaseline = 'top'
		ctx.fillStyle = config.COLOR_TEXT_LABEL
		ctx.fillText('avg min max', padding, padding)

		// fps
		fontSize = this.#baseCanvasWidth * 0.12
		if (FPS < config.targetFPS * 0.33) {
			ctx.fillStyle = config.COLOR_TEXT_BAD
		} else if (FPS < config.targetFPS * 0.66) {
			ctx.fillStyle = config.COLOR_TEXT_TO_LOW
		}

		ctx.font = `${fontSize}px ${config.FONT_FAMILY}`
		ctx.textAlign = 'right'
		ctx.fillText(`${FPS} fps`, this.#baseCanvasWidth - padding, padding)

		// ms
		fontSize = this.#baseCanvasWidth * 0.1
		ctx.font = `${fontSize}px ${config.FONT_FAMILY}`
		const msYOffset = this.#baseCanvasWidth * 0.12
		ctx.fillText(`${ms}ms`, this.#baseCanvasWidth - padding, msYOffset + padding)

		// avg min max
		fontSize = this.#baseCanvasWidth * 0.09
		ctx.font = `${fontSize}px ${config.FONT_FAMILY}`

		const avgMinMaxOffsetX = this.#baseCanvasWidth * 0.175
		const avgMinMaxOffsetY = this.#baseCanvasWidth * 0.1

		const badFPS = config.targetFPS * 0.33
		const toLowFPS = config.targetFPS * 0.66

		ctx.fillStyle = config.COLOR_FPS_BAR
		if (averageFPS<badFPS) {
			ctx.fillStyle = config.COLOR_TEXT_BAD
		} else if (averageFPS < toLowFPS) {
			ctx.fillStyle = config.COLOR_TEXT_TO_LOW
		}
		ctx.fillText(`${averageFPS}`, avgMinMaxOffsetX - padding, avgMinMaxOffsetY + padding)

		ctx.fillStyle = config.COLOR_FPS_BAR;
		if (minFPS < badFPS) {
			ctx.fillStyle = config.COLOR_TEXT_BAD
		} else if (minFPS < toLowFPS) {
			ctx.fillStyle = config.COLOR_TEXT_TO_LOW
		}
		ctx.fillText(`${minFPS}`, avgMinMaxOffsetX * 2.1 - padding * 2, avgMinMaxOffsetY + padding)

		ctx.fillStyle = config.COLOR_FPS_BAR
		if (maxFPS < badFPS) {
			ctx.fillStyle = config.COLOR_TEXT_BAD
		} else if (maxFPS < toLowFPS) {
			ctx.fillStyle = config.COLOR_TEXT_TO_LOW
		}
		ctx.fillText(`${maxFPS}`, avgMinMaxOffsetX * 3.3 - padding * 3, avgMinMaxOffsetY + padding)
	}

	#drawGraph(label: string, minMaxValue?: number, doYOffsets?: boolean) {
		const labelMeasures = this.#labels[label]

		let {
			average,
			max,
		} = getMMA(labelMeasures)

		max = Math.max(average * 1.5, max)

		if (minMaxValue) {
			max = Math.max(minMaxValue, max)
		}

		const config = this.#config
		const ctx = this.#ctx

		const lastIndex = labelMeasures.length - 1
		const measure = labelMeasures[lastIndex]

		let yOffset = 0
		if (doYOffsets && this.#graphYOffset) {
			yOffset += this.#graphYOffset
		}

		let x = config.maximumHistory * this.#msGraph.barWidth - this.#msGraph.barWidth
		let y = this.#msGraph.drawY
		let w = this.#msGraph.barWidth
		let h = (measure / max) * this.#msGraph.height

		y += (this.#msGraph.height - h) - yOffset

		ctx.globalAlpha = 0.5
		ctx.fillStyle = this.#labelColors[label]
		ctx.fillRect(x, y, w, h)

		ctx.globalAlpha = 1.0
		ctx.fillRect(x, y, w, w)

		if (doYOffsets) {
			this.#graphYOffset = (this.#graphYOffset ?? 0) + h
		}

		if (label === 'ms') {
			this.#previousAverageMS = average
			this.#previousMaxMS = max
		}
	}

	#drawLines() {
		const config = this.#config
		const ctx = this.#ctx

		const targetFPS = 1000 / config.targetFPS

		// Both of these values will be set by #drawGraph, which is guaranteed to run before #drawLines
		// TODO: Refactor to make these explicit operators unnecessary.
		const average = this.#previousAverageMS!
		const max = this.#previousMaxMS!

		ctx.fillStyle = config.COLOR_FPS_AVG

		if (average > targetFPS * 1.66) {
			ctx.fillStyle = config.COLOR_TEXT_BAD
		} else if (average > targetFPS * 1.33) {
			ctx.fillStyle = config.COLOR_TEXT_TO_LOW
		}

		const averageH = (average / max) * this.#msGraph.height
		const averageY = this.#msGraph.drawY + this.#msGraph.height - averageH
		ctx.fillRect(this.#msGraph.width - this.#msGraph.barWidth, averageY, this.#msGraph.barWidth, this.#msGraph.barWidth)

		ctx.fillStyle = config.COLOR_TEXT_TARGET
		const targetH = (targetFPS / max) * this.#msGraph.height
		const targetY = this.#msGraph.drawY + this.#msGraph.height - targetH
		ctx.fillRect(this.#msGraph.width - this.#msGraph.barWidth, targetY, this.#msGraph.barWidth, this.#msGraph.barWidth)
	}

	#drawMemory() {
		const config = this.#config
		const ctx = this.#ctx

		// @ts-expect-error performance.memory is a non-standard API that only works in Chrome.
		const jsHeapSizeLimit = performance.memory.jsHeapSizeLimit
		// @ts-expect-error performance.memory is a non-standard API that only works in Chrome.
		const usedJSHeapSize = performance.memory.usedJSHeapSize

		const padding = this.#baseCanvasHeight * 0.01
		const memoryTextY = this.#baseCanvasHeight * 0.60

		// avg min max
		ctx.textAlign = 'left'
		let fontSize = this.#baseCanvasWidth * 0.09
		ctx.font = `${fontSize}px ${config.FONT_FAMILY}`
		ctx.textBaseline = 'top'
		ctx.fillStyle = config.COLOR_TEXT_LABEL
		ctx.fillText('reserved', padding, memoryTextY + padding)

		ctx.fillStyle = config.COLOR_TEXT_TARGET
		ctx.textAlign = 'right'

		const reservedMemory = Number((jsHeapSizeLimit / TOMB).toFixed(1))
		ctx.fillText(`${reservedMemory}MB`, this.#baseCanvasWidth-padding, memoryTextY + padding)

		ctx.textAlign = 'left'
		ctx.fillStyle = config.COLOR_TEXT_LABEL
		ctx.fillText('allocated', padding, memoryTextY * 1.12 + padding)

		ctx.textAlign = 'right'
		const allocatedMemory = Number((usedJSHeapSize / TOMB).toFixed(1))

		ctx.fillStyle = config.COLOR_FPS_BAR
		if (allocatedMemory > reservedMemory * .9) {
			ctx.fillStyle = config.COLOR_TEXT_BAD
		} else if (allocatedMemory > reservedMemory * .66) {
			ctx.fillStyle = config.COLOR_TEXT_TO_LOW
		}

		ctx.fillText(`${allocatedMemory}MB`, this.#baseCanvasWidth - padding, memoryTextY * 1.12 + padding)

		const targetMemory = (jsHeapSizeLimit / TOMB)
		const memoryMeasures = this.#labels['memory']
		const lastValue = memoryMeasures[memoryMeasures.length - 1]

		let x = this.#memoryGraph.width - this.#memoryGraph.barWidth * 6
		let y = this.#memoryGraph.drawY
		let w = this.#memoryGraph.barWidth * 6
		let h = (lastValue / targetMemory) * this.#memoryGraph.height
		y += (this.#memoryGraph.height - h)

		ctx.globalAlpha = 0.5
		ctx.fillStyle = this.#labelColors['memory']
		ctx.fillRect(x, y, w, h)

		ctx.globalAlpha = 1.0
		ctx.fillRect(x, y, w, w)

		const { average } = getMMA(this.#labels['memory'])

		ctx.fillStyle = config.COLOR_FPS_AVG
		if (average > targetMemory * 0.9) {
			ctx.fillStyle = config.COLOR_TEXT_BAD
		} else if (average > targetMemory * 0.66) {
			ctx.fillStyle = config.COLOR_TEXT_TO_LOW
		}

		const averageH = (average / targetMemory) * this.#memoryGraph.height
		const averageY = this.#memoryGraph.drawY + this.#memoryGraph.height - averageH
		ctx.fillRect(this.#memoryGraph.width - this.#memoryGraph.barWidth * 6, averageY, this.#memoryGraph.barWidth * 6, this.#memoryGraph.barWidth * 6)

		ctx.fillStyle = config.COLOR_TEXT_TARGET
		const targetH = this.#memoryGraph.height
		const targetY = this.#memoryGraph.drawY + this.#memoryGraph.height - targetH
		ctx.fillRect(this.#memoryGraph.width - this.#memoryGraph.barWidth * 6, targetY, this.#memoryGraph.barWidth * 6, this.#memoryGraph.barWidth * 6)
	}

	#init() {
		this.#canvas.width = this.#baseCanvasWidth
		this.#canvas.height = this.#baseCanvasHeight
		this.#canvas.style.cssText = `width:${this.#baseCanvasWidth}px; height:${this.#baseCanvasHeight}px; background-color:${this.#config.COLOR_BG}`

		this.dom.appendChild(this.#canvas)
		this.dom.setAttribute('data', 'gamestats')
		this.dom.style.cssText = `position: fixed; left: 0; top: 0; display: flex; flex-direction: column; gap: 5px;`

		if (this.#config.autoPlace) {
			document.body.appendChild(this.dom)
		}

		if (performance && 'memory' in performance) {
			this.#labels['memory'] = []
		}

		this.#update()
	}

	#update() {
		// don't draw if we are not #shown
		if (this.#shown) {
			this.#draw()
		}

		if (performance && 'memory' in performance && (performance.now() - this.#lastMemoryMeasure) > this.#config.memoryUpdateInterval) {
			const memoryMeasures = this.#labels['memory']

			// @ts-expect-error performance.memory is a non-standard API that only works in Chrome.
			const usedJSHeapSize = performance.memory.usedJSHeapSize

			memoryMeasures.push(usedJSHeapSize / TOMB)

			if (memoryMeasures.length > this.#config.memoryMaxHistory) {
				memoryMeasures.shift()
			}

			this.#lastMemoryMeasure = performance.now()
		}

		if (this.#canvas && this.#canvas.parentNode) {
			setTimeout(() => this.#update(), this.#config.redrawInterval)
		}

		for (const key in this.#extensions) {
			this.#extensions[key].update()
		}
	}





	/****************************************************************************\
	 * Public instance methods
	\****************************************************************************/

	/**
	 * Begins measurement for the current frame. If passed a label, will only
	 * begin measurements for that specific metric.
	 *
	 * @param label [OPTIONAL] The label for the metric.
	 * @param color [OPTIONAL] The color to be used for the metric.
	 */
	begin(label?: string, color?: string) {
		if (label && DEFAULT_GRAPHS.includes(label)) {
			throw `jsgraphy: label ${label} is reserved`
		}

		if (!label) {
			label = 'ms'
		}

		if (label === 'ms' && this.#currentTime) {
			this.#prevTime = this.#currentTime
		}

		if (label !== 'ms' && !this.#labelColors[label]) {
			// register new label
			this.#labelColors[label] = color || stringToColor(label)
			this.#labelOrder.push(label)
		}

		if (!this.#labels[label]) {
			this.#labels[label] = []
		}

		const labelMeasures = this.#labels[label]
		labelMeasures.push(performance.now())

		if (labelMeasures.length> this.#config.maximumHistory) {
			labelMeasures.shift()
		}

		if (label === 'ms') {
			this.#currentTime = performance.now()

			if (this.#prevTime) {
				if (!this.#labels['fps']) {
					this.#labels['fps'] = []
				}

				const fpsMeasures = this.#labels['fps']
				fpsMeasures.push(this.#currentTime - this.#prevTime)

				if (fpsMeasures.length> this.#config.maximumHistory) {
					fpsMeasures.shift()
				}
			}
		}
	}

	async enableExtension(name: string, params: Array<unknown>) {
		if (this.#extensions[name]) {
			return null
		}

		try {
			const module = await import(`./gamestats-${name}.module.js`)
			const extension = new module.default(this, ...params)
			this.#extensions[name] = extension
		} catch (error) {
			console.log(error)
			return null
		}
	}

	/**
	 * Ends measurement for the current frame. If passed a label, will only end
	 * measurements for that specific metric.
	 *
	 * @param label [OPTIONAL] The label for the metric.
	 */
	end(label: string = 'ms') {
		const labelMeasures = this.#labels[label]

		if (labelMeasures) {
			const beginTime = labelMeasures[labelMeasures.length-1]
			labelMeasures[labelMeasures.length-1] = performance.now() - beginTime
		}

		if (label === 'ms') {
			for (const key in this.#extensions) {
				this.#extensions[key].endFrame()
			}
		}
	}

	/**
	 * Toggles the visibility of the performance panel.
	 *
	 * @param isVisible Whether the performance panel will be visible.
	 */
	show(isVisible: boolean) {
		this.#shown = isVisible
		this.dom.style.display = isVisible ? 'flex' : 'none'
	}
}

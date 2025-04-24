# `gamestats.js`

> **Track performance stats in your game.**

[![Version][version-badge]][package]
[![BSD-3-Clause License][license-badge]][license]
[![Downloads][downloads-badge]][npmtrends]
[![Bundle size][bundlephobia-badge]][bundlephobia]

<!-- [![Code Coverage][coveralls-badge]][coveralls] -->

[![Build status][build-status-badge]][build-status]
[![Dependencies][libraries.io-badge]][libraries.io]
[![Maintainability][codeclimate-badge]][codeclimate]
[![Code of Conduct][code-of-conduct-badge]][code-of-conduct]
<!-- [![PRs Welcome][prs-badge]][prs] -->

[![Watch on GitHub][github-watch-badge]][github-watch]
[![Star on GitHub][github-star-badge]][github-star]

## Example
![Image of Gamestats](https://i.imgur.com/nCMwblD.gif)

For a live example click [here](https://birbhouse-games.github.io/gamestats/example/)

**Features**
- FPS counter, shows the average / min / max for the visible history
- MS milliseconds that where needed to render the last frame
- Memory usage maximum (reserved) and allocated memory for the context (*Chrome only*)
- Custom graphs

## Installation

With [npm](https://npmjs.org) do:

```bash
npm install gamestats.js
```

## Usage

```js
import { GameStats } from 'gamestats.js'

const stats = new GameStats()

document.body.appendChild( stats.dom )

function animate() {
	stats.begin()
	// game update goes here

	stats.begin('physics')
	// the graph will deterministically assign a color based on the label
	physics()
	stats.end('physics')

	stats.begin('render', '#6cc644')
	// optional second color parameter
	render()
	stats.end('render')

	stats.end()

	requestAnimationFrame( animate )
}

requestAnimationFrame( animate )
```
See also this code [example](https://github.com/eriksom/gamestats/blob/main/example/index.html)

**Optional configuration**

```js
const config = {
	autoPlace:true, /* auto place in the dom */
	targetFPS: 60, /* the target max FPS */
	redrawInterval: 50, /* the interval in MS for redrawing the FPS graph */
	maximumHistory: 100, /* the length of the visual graph history in frames */
	scale: 1.0, /* the scale of the canvas */
	memoryUpdateInterval: 1000, /* the interval for measuring the memory */
	memoryMaxHistory: 60 * 10, /* the max amount of memory measures */

	// Styling props
	FONT_FAMILY: 'Arial',
	COLOR_FPS_BAR: '#34cfa2',
	COLOR_FPS_AVG: '#FFF',
	COLOR_TEXT_LABEL: '#FFF',
	COLOR_TEXT_TO_LOW: '#eee207',
	COLOR_TEXT_BAD: '#d34646',
	COLOR_TEXT_TARGET: '#d249dd',
	COLOR_BG: '#333333',
}

const stats = new GameStats(config);
```

## Prior Art
* [gamestats.js](https://github.com/ErikSom/gamestats) was originally written by [ErikSom](https://github.com/ErikSom)
* [Stats.js](https://github.com/mrdoob/stats.js) by mr doob
* [Unity Graphy](https://github.com/Tayx94/graphy) by tayx94






[bundlephobia]: https://bundlephobia.com/result?p=gamestats.js
[bundlephobia-badge]: https://img.shields.io/bundlephobia/minzip/gamestats.js.svg?style=flat-square
[build-status]: https://github.com/eriksom/gamestats/actions
[build-status-badge]: https://img.shields.io/github/actions/workflow/status/eriksom/gamestats/release.yml?style=flat-square
[code-of-conduct]: CODE_OF_CONDUCT.md
[code-of-conduct-badge]: https://img.shields.io/badge/code%20of-conduct-ff69b4.svg?style=flat-square
[codeclimate]: https://codeclimate.com/github/eriksom/gamestats
[codeclimate-badge]: https://img.shields.io/codeclimate/maintainability/eriksom/gamestats.svg?style=flat-square
[coveralls]: https://coveralls.io/github/eriksom/gamestats
[coveralls-badge]: https://img.shields.io/coveralls/eriksom/gamestats.svg?style=flat-square
[downloads-badge]: https://img.shields.io/npm/dm/gamestats.js.svg?style=flat-square
[github-watch]: https://github.com/eriksom/gamestats/watchers
[github-watch-badge]: https://img.shields.io/github/watchers/eriksom/gamestats.svg?style=social
[github-star]: https://github.com/eriksom/gamestats/stargazers
[github-star-badge]: https://img.shields.io/github/stars/eriksom/gamestats.svg?style=social
[libraries.io]: https://libraries.io/npm/gamestats.js
[libraries.io-badge]: https://img.shields.io/librariesio/release/npm/gamestats.js.svg?style=flat-square
[license]: LICENSE
[license-badge]: https://img.shields.io/npm/l/gamestats.js.svg?style=flat-square
[npmtrends]: https://www.npmtrends.com/gamestats.js
[package]: https://npmjs.com/package/gamestats.js
[prs]: CONTRIBUTING.md
[prs-badge]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square
[version-badge]: https://img.shields.io/npm/v/gamestats.js.svg?style=flat-square

export interface IGameStatsOptions {
	autoPlace: boolean;
	maximumHistory: number;
	memoryMaxHistory: number;
	memoryUpdateInterval: number;
	redrawInterval: number;
	scale: number;
	targetFPS: number;

	COLOR_BG: string;
	COLOR_FPS_AVG: string;
	COLOR_FPS_BAR: string;
	COLOR_TEXT_BAD: string;
	COLOR_TEXT_LABEL: string;
	COLOR_TEXT_TARGET: string;
	COLOR_TEXT_TO_LOW: string;
	FONT_FAMILY: string;
}

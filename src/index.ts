import { Renderer, } from 'pixi.js'
import Game from './Game';

const canvas = document.getElementById('pixi-canvas') as HTMLCanvasElement;
let _width = window.innerWidth;
let _height = window.innerHeight;

declare global {
	interface Window { renderer: Renderer; }
}

window.renderer = new Renderer({
	view: canvas,
	resolution: window.devicePixelRatio || 1,
	autoDensity: true,
	width: _width,
	height: _height
});

addEventListener('load', handleLoadComplete);
addEventListener('resize', resize);
 function resize() {
	 _width = window.innerWidth;
	 _height = window.innerHeight;

	 window.renderer.resize(_width, _height);
 }

async function handleLoadComplete() {
	await new Game().loadLevel();
}

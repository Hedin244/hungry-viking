import { Texture, Sprite, } from 'pixi.js';
import { foodSpeed, } from './constants';

export default class FoodObject extends Sprite {
    speed: number;

    constructor(Texture : Texture, options: { startingWidth: number, }) {
        super(Texture);
        this.x = Math.floor(Math.random() * (options.startingWidth - 20));
        this.y = -20;
        this.scale.set(2);
        this.speed = foodSpeed;
    }

    drop(forcedSpeed?: number) {
        this.y += forcedSpeed || this.speed;
    }

}

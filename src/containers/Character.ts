import { AnimatedSprite, Container, Spritesheet, } from 'pixi.js';

export default class Character extends Container {
    spriteSheet: Spritesheet;
    animations: {
        idle: AnimatedSprite;
        moveLeft: AnimatedSprite;
        moveRight: AnimatedSprite;
    };

    constructor(characterSpritesheet : Spritesheet) {
        super();

        this.spriteSheet = characterSpritesheet;
        this.animations = {
            idle: this.createAnimation('char_idle', { animationSpeed: 0.03, visible: true, }),
            moveLeft: this.createAnimation('char_run left', { animationSpeed: 0.2, visible: false, }),
            moveRight: this.createAnimation('char_run right', { animationSpeed: 0.2, visible: false, }),
        };
    }

    createAnimation = (animationName: string, options: { visible: boolean, animationSpeed: number, }) => {
        const animation : AnimatedSprite = new AnimatedSprite(this.spriteSheet.animations[animationName]);
        animation.animationSpeed = options.animationSpeed;
        animation.visible = options.visible;
        animation.play();
        this.addChild(animation);
        return animation;
    }

    setIdle() {
        this.animations.idle.visible = true;
        this.animations.moveLeft.visible = false;
        this.animations.moveRight.visible = false;
    }

    move(amound: number) {
        if (amound === 0) return;
        const newPosition = this.x + amound;

        if (0 < newPosition && newPosition < window.renderer.screen.width) {
            this.x = newPosition;
        }

        this.animations.idle.visible = false;
        if (amound < 0) {
            this.animations.moveLeft.visible = true;
        } else {
            this.animations.moveRight.visible = true;
        }
    }
}

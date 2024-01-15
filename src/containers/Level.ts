import { Assets, Container, Sprite, Spritesheet, Ticker, Texture } from 'pixi.js';
import { Sound, } from '@pixi/sound';
import Character from './Character';
import FoodObject from '../FoodObject';
import LevelUI from './LevelUI';
import {
    foodTexturesUrl, collectSoundUrl,
    backgroundTextureAssetUrl, backgroundTexture2AssetUrl, backgroundTexture3AssetUrl,
    characterSpeed, characterTexturesUrl, delayBetweenFood, scoreToWin, } from '../constants';

export default class Level extends Container {
    activeKeys: any;
    player?: Character;
    gameLoop: Ticker;
    loader: Ticker;
    foodSenderTimer: number;
    foodSpritesheet?: Spritesheet;
    texturesArray: Texture[];
    fallingFood: Set<FoodObject>;
    gameState: 'waiting' | 'loading' | 'ready' | 'playing' | 'paused' | 'won' | 'lost';
    levelUI: LevelUI;
    collectSound?: Sound;

    constructor() {
        super();
        this.gameState = 'waiting';
        this.activeKeys = {};
        this.texturesArray = [];
        this.foodSenderTimer = 0;
        this.fallingFood = new Set;
        this.levelUI = new LevelUI();

        this.loader = new Ticker();
        this.loader.add(this.loaderKeyHandler.bind(this));
        this.loader.add(this._renderLevel.bind(this));
        this.loader.start();

        this.gameLoop = new Ticker();
        this.gameLoop.add(this.keyHandler.bind(this));
        this.gameLoop.add(this.handleFoodDroping.bind(this));
        this.gameLoop.add(this.foodSender.bind(this));
        this.gameLoop.add(this.checkGameState.bind(this));
        this.gameLoop.add(this._renderLevel.bind(this));

        window.renderer.addListener('resize', this._resize.bind(this));
        window.addEventListener('keydown', this.keysDown.bind(this));
        window.addEventListener('keyup', this.keysUp.bind(this));
        window.addEventListener('blur', this.pause.bind(this));
        window.addEventListener('focus', this.resume.bind(this));
    }

    async init() {
        this.gameState = 'loading';

        // Load assets
        const backgroundTexture: Texture = await Assets.load(backgroundTextureAssetUrl);
        const backgroundTexture2: Texture = await Assets.load(backgroundTexture2AssetUrl);
        const backgroundTexture3: Texture = await Assets.load(backgroundTexture3AssetUrl);
        const characterSpritesheet: Spritesheet = await Assets.load(characterTexturesUrl);
        this.collectSound = await Sound.from(collectSoundUrl);
        this.foodSpritesheet = await Assets.load(foodTexturesUrl);
        this.texturesArray = Object.values(this.foodSpritesheet.textures);

        // Background setup
        const background: Sprite = Sprite.from(backgroundTexture);
        background.y = 0;
        background.width = window.renderer.screen.width;
        background.height = window.renderer.screen.height;
        const background2: Sprite = Sprite.from(backgroundTexture2);
        background2.y = 0;
        background2.width = window.renderer.screen.width;
        background2.height = window.renderer.screen.height;
        const background3: Sprite = Sprite.from(backgroundTexture3);
        background3.y = 0;
        background3.width = window.renderer.screen.width;
        background3.height = window.renderer.screen.height;
        this.addChild(background3);
        this.addChild(background2);
        this.addChild(background);

        // Character setup
        this.player = new Character(characterSpritesheet);
        this._placePlayer();
        this.addChild(this.player);

        // Display setup
        this.addChild(this.levelUI);

        // Ready level
        window.renderer.render(this)
        this.gameState = 'ready';
    }

    start() {
        if (this.gameState === 'ready') {
            this.loader.stop();
            this.gameLoop.start();
            this.levelUI.hideStartingPage();
            this.gameState = 'playing';
        }
    }

    pause() {
        if (this.gameState === 'playing') {
            this.gameLoop.stop();
            this.levelUI.showPausePage();
            this.gameState = 'paused';
        }
    }

    resume() {
        if (this.gameState === 'paused') {
            this.gameLoop.start();
            this.levelUI.hidePausePage();
            this.gameState = 'playing';
        }
    }

    win() {
        this.gameLoop.stop();
        this.levelUI.showWinPage();
        this.gameState = 'won';
    }

    loose() {
        this.gameLoop.stop();
        this.levelUI.showLoosePage();
        this.gameState = 'lost';
    }

    checkGameState() {
        if (this.levelUI.score >= scoreToWin) {
            this.win();
        } else if (this.levelUI.health <= 0) {
            this.loose();
        }
    }

    /*
        **************************************
                    Key handlers
        **************************************
     */

    loaderKeyHandler() {
        if (this.gameState === 'ready') {
            if (this.activeKeys.Enter) {
                this.start();
            }
        }
    }

    keysDown(e: { key: string, }) {
        this.activeKeys[e.key] = true;
    }

    keysUp(e: { key: string, }) {
        this.activeKeys[e.key] = false;
    }

    keyHandler() {
        if (!this.player) return;
        this.player.setIdle();
        if (this.activeKeys.ArrowLeft) {
            this.player.move(-characterSpeed);
        }
        if (this.activeKeys.ArrowRight) {
            this.player.move(characterSpeed);
        }
    }

    /*
        **************************************
                    Food Code
        **************************************
     */

    foodSender(delta: any) {
        this.foodSenderTimer += delta;
        if (this.foodSenderTimer >= delayBetweenFood) {
            this.sendFood();
            this.foodSenderTimer = 0;
        }
    }

    sendFood() {
        if (!this.foodSpritesheet) return;
        const randomFoodTextureIndex: number = Math.floor(Math.random() * this.texturesArray.length);

        const foodObject = new FoodObject(this.texturesArray[randomFoodTextureIndex], { startingWidth: window.renderer.screen.width, });
        this.fallingFood.add(foodObject);
        this.addChild(foodObject);
    }

    handleFoodDroping() {
        this.fallingFood.forEach((foodObject) => {
            foodObject.drop();

            if (this.testForPlayerCollision(foodObject)) {
                this.levelUI.addScore(1);
                this.removeFoodObject(foodObject);
                if (this.collectSound) {
                    this.collectSound.play();
                }
            }

            if (foodObject.y >= window.renderer.screen.height) {
                this.levelUI.addHealth(-1);
                this.removeFoodObject(foodObject);
            }
        });
    }

    removeFoodObject(foodObject : FoodObject) {
        this.removeChild(foodObject);
        this.fallingFood.delete(foodObject);
    }

    testForPlayerCollision(foodObject: Sprite) {
        if (!this.player) return;

        const bounds1 = foodObject.getBounds();
        const bounds2 = this.player.getBounds();

        return bounds1.x < bounds2.x + bounds2.width
            && bounds1.x + bounds1.width > bounds2.x
            && bounds1.y < bounds2.y + bounds2.height
            && bounds1.y + bounds1.height > bounds2.y;
    }

    /*
        **************************************
                    Utils
        **************************************
     */

    _placePlayer() {
        if (this.player) {
            this.player.x = window.renderer.screen.width / 2;
            this.player.y = window.renderer.screen.height -200;
        }
    }

    _resize() {
        this._placePlayer();
        this._renderLevel();
    }

    _renderLevel() {
        window.renderer.render(this);
    }
}

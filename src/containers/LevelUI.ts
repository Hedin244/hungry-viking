import { Container, Text, } from 'pixi.js';
import { startingHealth, startingScore, } from '../constants';

export default class Level extends Container {
    score: number;
    health: number;
    isPaused: boolean;
    isPlaying: boolean;
    scoreDisplay: Text;
    healthDisplay: Text;
    glassCover: any;
    startBox: any;
    pauseBox: any;
    winBox: any;
    looseBox: any;

    constructor() {
        super();
        this.score = startingScore;
        this.health = startingHealth;
        this.isPaused = false;
        this.isPlaying = false;

        this.scoreDisplay = new Text(`SCORE: ${this.score}`, {
            fontFamily: 'Arial',
            fontSize: 24,
            fill: 0xff1010,
            align: 'center',
        });
        this.addChild(this.scoreDisplay);

        this.healthDisplay = new Text(`HEALTH: ${this.health}`, {
            fontFamily: 'Arial',
            fontSize: 24,
            fill: 'green',
            align: 'center',
        });
        this.healthDisplay.y = 24;
        this.addChild(this.healthDisplay);

        this.glassCover = document.getElementById('glass-cover');
        this.startBox = document.getElementById('start-box');
        this.pauseBox = document.getElementById('pause-box');
        this.winBox = document.getElementById('win-box');
        this.looseBox = document.getElementById('loose-box');
    }

    addScore(amound: number) {
        this.score += amound;

        if (this.score < 0) {
            this.score === 0;
        }

        this._writeScore();
    }

    addHealth(amound: number) {
        this.health += amound;

        if (this.health < 0) {
            this.health === 0;
        }

        this._writeHealth();
    }

    hideStartingPage() {
        this.isPlaying = true;
        this.glassCover.classList.add('hide');
        this.startBox.classList.add('hide');
    }

    showWinPage() {
        this.isPlaying = false;
        this.glassCover.classList.remove('hide');
        this.winBox.classList.remove('hide');
    }

    showLoosePage() {
        this.isPlaying = false;
        this.glassCover.classList.remove('hide');
        this.looseBox.classList.remove('hide');
    }

    showPausePage() {
        this.isPaused = true;
        this.glassCover.classList.remove('hide');
        this.pauseBox.classList.remove('hide');
    }

    hidePausePage() {
        this.isPaused = false;
        this.glassCover.classList.add('hide');
        this.pauseBox.classList.add('hide');
    }

    _writeScore() {
        this.scoreDisplay.text = `SCORE: ${this.score}`;
    }

    _writeHealth() {
        this.healthDisplay.text = `HEALTH: ${this.health}`;
    }
}

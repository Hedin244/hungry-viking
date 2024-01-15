import Level from './containers/Level';

export default class Game {
    activeLevel: Level;

    constructor() {
        this.activeLevel = new Level();
    }

    async loadLevel() {
        await this.activeLevel.init();
    }
}

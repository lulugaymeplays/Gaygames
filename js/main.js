import { BootScene } from './scenes/BootScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { GameScene } from './scenes/GameScene.js';

const config = {
    type: Phaser.AUTO,
    width: 1024,
    height: 600,
    parent: 'game-container',
    backgroundColor: '#0a0a0c',
    physics: {
        default: 'matter',
        matter: {
            gravity: { y: 1 },
            debug: false,
            enableSleeping: true
        }
    },
    scene: [BootScene, MenuScene, GameScene]
};

const game = new Phaser.Game(config);

game.settings = {
    playerCount: 2,
    charsPerTeam: 2,
    turnTime: 15
};

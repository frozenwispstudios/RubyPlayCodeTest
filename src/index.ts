import 'phaser';
import { GameScene } from './scenes/Game';

const gameConfig: Phaser.Types.Core.GameConfig = {
    width: window.innerWidth,
    height: window.innerHeight,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: { y: 0 }
        }
    },
    scene: GameScene
};

new Phaser.Game(gameConfig);
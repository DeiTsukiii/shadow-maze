import UIScene from "./scenes/UIScene.js";
import GameScene from "./scenes/GameScene.js";

const urlParams = new URLSearchParams(window.location.search);
const debug = urlParams.get('debug') === 'true';

export const CONFIG = {
    type: Phaser.AUTO,
    backgroundColor: '#000',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1750,
        height: 1050,
    },
    pixelArt: !debug,
    input: {
        activePointers: 3,
    },
    scene: [GameScene, UIScene],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: debug,
        }
    }
};

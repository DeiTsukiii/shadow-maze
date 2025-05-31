import UIScene from "./scenes/UIScene.js";
import GameScene from "./scenes/GameScene.js";
import BootScene from "./scenes/BootScene.js";

const urlParams = new URLSearchParams(window.location.search);
const debug = urlParams.get('debug') === 'true';

export const CONFIG = {
    type: Phaser.AUTO,
    backgroundColor: '#0e0e0e',
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
    scene: [BootScene, GameScene, UIScene],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: debug,
        }
    },
    plugins: {
        scene: [
            {
                key: 'rexVirtualJoystick',
                plugin: window.rexvirtualjoystickplugin,
                mapping: 'rexVirtualJoystick'
            }
        ]
    }
};
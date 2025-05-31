import Enemy from "../characters/enemy.js";
import Player from "../characters/player.js";
import { CONFIG } from "../config.js";
import { createMergedWalls } from "../functions/createMergedWalls.js";
import { pickRandomPos } from "../functions/pickRandomPos.js";

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    win() {
        this.uiScene.updateGoal();

        const exitPoss = [
            { x: 33, y: 17 },
            { x: 33, y: 3 },
            { x: 21, y: 19 },
            { x: 1, y: 17 },
            { x: 11, y: 1 }
        ];

        const chosen = Phaser.Utils.Array.GetRandom(exitPoss);
        const exitPos = {
            x: chosen.x * this.tileSize + this.tileSize / 2,
            y: chosen.y * this.tileSize + this.tileSize / 2
        };

        this.exit = this.physics.add
            .sprite(exitPos.x, exitPos.y, 'exit')
            .setCollideWorldBounds(true)
            .setDepth(10);

        this.physics.add.overlap(this.obj, this.exit, () => {
            setTimeout(() => {
                this.scene.pause();
                this.uiScene.win();
            }, 200);
        });
    }

    gameOver() {
        this.music.setRate(1);
        this.hasSpottedPlayer = false;
        this.enemy.pickRandomTarget();
        this.obj.rotation = -Math.PI / 2;
        this.obj.lastAngle = -Math.PI / 2;
        this.obj.setPosition(375, 175);
        if (!this.debug) this.cameras.main.setZoom(3);
        this.currentCameraZoom = 3;
        this.uiScene.gameOver();
    }

    create() {
        this.uiScene = this.scene.get('UIScene');
        this.debug = CONFIG.physics.arcade.debug;
        this.tileSize = 50;

        this.grid = [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,0,0,0,0,0,0,0,1,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,1],
            [1,0,1,1,1,1,1,0,1,0,1,1,1,0,1,0,1,1,1,1,1,1,1,0,1,1,1,0,1,0,1,1,1,0,1],
            [1,0,0,0,0,0,1,0,1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1],
            [1,0,1,1,1,0,1,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,0,1,1,1,1,0,1,1,1,0,1,1,1],
            [1,0,1,0,1,0,1,0,0,0,1,0,1,0,0,0,0,0,1,0,1,0,0,0,0,0,1,0,0,0,1,0,1,0,1],
            [1,0,1,0,1,0,1,1,1,0,1,0,1,0,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,1,0,0,0,1],
            [1,0,0,0,1,0,0,0,0,0,1,0,1,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,1,0,1],
            [1,1,1,0,1,1,1,0,1,1,1,0,1,0,1,1,0,1,1,1,1,1,1,0,1,0,1,0,1,0,1,0,1,0,1],
            [1,0,0,0,1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,1,0,1,0,0,0,0,0,1],
            [1,0,1,0,1,0,1,0,1,0,1,0,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1],
            [1,0,1,0,1,0,1,0,1,0,1,0,0,0,1,0,0,0,0,0,0,0,1,0,1,0,1,0,1,0,0,0,0,0,1],
            [1,0,1,0,1,0,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,0,0,0,1,0,1,0,1,1,1,1,1,0,1],
            [1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,1,0,1],
            [1,1,0,1,1,0,1,0,1,0,1,1,1,1,0,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,1,0,1,0,1],
            [1,0,0,0,1,0,1,0,1,0,1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
            [1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,1,1,0,1,0,1,1,1,1,1,0,1,1,1,0,1,0,1,1,1],
            [1,0,1,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,1],
            [1,0,1,0,1,0,1,1,1,1,1,1,1,1,1,0,1,0,1,0,1,1,1,1,1,0,1,0,1,1,1,0,1,0,1],
            [1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        ];

        this.wallRects = [];
        this.walls = this.physics.add.staticGroup();
        createMergedWalls.call(this, this.grid, this.tileSize, 'wood');

        this.darkness = this.add.graphics({ fillStyle: { color: 0x000000, alpha: 1 } });
        this.darkness.fillRect(0, 0, this.cameras.main.width / this.cameras.main.zoom, this.cameras.main.height / this.cameras.main.zoom);
        this.darkness.setScrollFactor(0).setDepth(100).setVisible(!this.debug);

        this.enemy = new Enemy(this, 450, 350, 'ennemy', this.grid, this.tileSize, this.debug);
        this.obj = new Player(this, 375, 175, 'player');

        this.cameras.main.startFollow(this.obj, true, 0.09, 0.09);
        if (!this.debug) this.cameras.main.setZoom(3);
        if (this.debug) this.cameras.main.setBounds(0, 0, 1750, 1050);

        this.physics.add.collider(this.obj, this.walls);
        this.physics.add.collider(this.enemy, this.walls);
        this.physics.add.overlap(this.obj, this.enemy, () => this.gameOver());

        this.keys = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            upAlt: Phaser.Input.Keyboard.KeyCodes.Z,
            leftAlt: Phaser.Input.Keyboard.KeyCodes.Q,
            flashLight: Phaser.Input.Keyboard.KeyCodes.F
        });

        this.goals = this.physics.add.staticGroup();
        this.nbGoals = 10;
        this.goalsColected = 0;

        const usedTiles = [];

        while (this.goals.getChildren().length < this.nbGoals) {
            const { x, y } = pickRandomPos(this.grid, this.tileSize);

            const key = `${x},${y}`;
            if (usedTiles.includes(key)) continue;

            usedTiles.push(key);
            this.goals.create(x, y, 'goal');
        }

        this.physics.add.overlap(this.obj, this.goals, (player, goal) => {
            this.goalsColected ++;
            this.obj.battery = 100;
            this.obj.lightRadius = this.obj.battery * 1.5;
            this.uiScene.updateScore(this.goalsColected);
            goal.destroy();
            if (this.goalsColected === this.nbGoals) {
                this.sound.play('exitOpen');
                this.win();
            } else this.sound.play('goal');
        });
        this.scene.launch('UIScene');
        this.music = this.sound.add('music', { loop: true, rate: 1 });
        this.music.play();
    }

    update(time, delta) {
        this.obj.update(this.keys, this.uiScene.joystick);
        this.enemy.update(this.obj, this.walls, delta);
    }
}
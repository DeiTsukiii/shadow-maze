import { castRayToWall } from "../functions/castRayToWall.js";

export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);

        this.scene = scene;

        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);

        this.setCollideWorldBounds(true).setDepth(1000);

        this.speed = 100
        const orientation = -Math.PI / 2
        this.lightAngle = 120;
        this.lightForwardOffset = this.width * 0.5;
        this.lightSideOffset = this.height * 0.35;
        this.rotateSpeed = 0.07;
        this.batteryTime = 1000;
        this.battery = 100;
        this.lightRadius = this.battery * 1.5;
        this.lightState = true;

        this.tempRayLine = new Phaser.Geom.Line();

        this.lastAngle = orientation;
        this.rotation = orientation;

        this.light = this.scene.make.graphics({ x: 0, y: 0, add: false }).fillStyle(0xffffff);

        this.lightMask = this.light.createGeometryMask();
        this.lightMask.invertAlpha = true;
        this.scene.darkness.setMask(this.lightMask).setDepth(101);

        if (this.battery) {
            const gameScene = this.scene.scene.get('GameScene');
            setInterval(() => {
                if (gameScene.scene.settings.status !== Phaser.Scenes.PAUSED) {
                    if (this.lightState && this.battery !== 0) {
                        this.battery --;
                        this.lightRadius = this.battery * 1.5;
                    } else if (this.lightState && this.battery === 0) {
                        this.battery = 100;
                        this.scene.gameOver();
                    }
                }
            }, 1500);
        }
    }

    move(keys, joystick) {
        this.speed = this.scene.enemy.hasSpottedPlayer ? 200 : 100;
        const body = this.body;

        let vx = 0;
        let vy = 0;

        if (keys.left.isDown || keys.leftAlt.isDown) vx = -1;
        else if (keys.right.isDown) vx = 1;

        if (keys.up.isDown || keys.upAlt.isDown) vy = -1;
        else if (keys.down.isDown) vy = 1;

        if (vx !== 0 || vy !== 0) {
            const len = Math.sqrt(vx * vx + vy * vy);
            vx = (vx / len) * this.speed;
            vy = (vy / len) * this.speed;

            const isStepPlaying =
                this.scene.sound.get('step1')?.isPlaying ||
                this.scene.sound.get('step2')?.isPlaying ||
                this.scene.sound.get('step3')?.isPlaying ||
                this.scene.sound.get('step4')?.isPlaying;

            if (!isStepPlaying) {
                const rdmStep = Math.floor(Math.random() * 4) + 1;
                this.scene.sound.play(`step${rdmStep}`, { volume: 0.3, rate: this.scene.enemy.hasSpottedPlayer ? 2.5 : 1.5 });
            }
        }

        body.setVelocity(vx, vy);

        let angle = this.lastAngle;

        if (body.velocity.x !== 0 || body.velocity.y !== 0) {
            const targetAngle = Math.atan2(body.velocity.y, body.velocity.x);
            this.rotation = Phaser.Math.Angle.RotateTo(this.rotation, targetAngle, this.rotateSpeed);
            angle = this.rotation;
            this.lastAngle = angle;
        }

        if (joystick && joystick.force > 0.1) {
            const angle = Phaser.Math.DegToRad(joystick.angle);
            vx = Math.cos(angle) * this.speed;
            vy = Math.sin(angle) * this.speed;

            const isStepPlaying =
                this.scene.sound.get('step1')?.isPlaying ||
                this.scene.sound.get('step2')?.isPlaying ||
                this.scene.sound.get('step3')?.isPlaying;

            if (!isStepPlaying) {
                const rdmStep = Math.floor(Math.random() * 3) + 1;
                this.scene.sound.play(`step${rdmStep}`, { volume: 0.2 });
            }

            body.setVelocity(vx, vy);

            const targetAngle = Math.atan2(vy, vx);
            this.rotation = Phaser.Math.Angle.RotateTo(this.rotation, targetAngle, this.rotateSpeed);
            this.lastAngle = this.rotation;
        }
    }

    updateLight() {
        this.light.clear();
        this.light.fillStyle(0xffffff);

        let angle = this.lastAngle;

        const origin = new Phaser.Math.Vector2(
            this.x + Math.cos(angle) * this.lightForwardOffset + Math.cos(angle + Math.PI / 2) * this.lightSideOffset,
            this.y + Math.sin(angle) * this.lightForwardOffset + Math.sin(angle + Math.PI / 2) * this.lightSideOffset
        );

        const fov = Phaser.Math.DegToRad(this.lightAngle);
        const rayCount = 60;
        const lightPoints = [];

        lightPoints.push(origin);

        for (let i = 0; i <= rayCount; i++) {
            const rayAngle = angle - fov / 2 + (fov * i) / rayCount;
            const hit = castRayToWall.call(this, origin.x, origin.y, rayAngle, this.lightRadius);
            lightPoints.push(hit);
        }

        this.light.beginPath();
        this.light.moveTo(lightPoints[0].x, lightPoints[0].y);
        for (let i = 1; i < lightPoints.length; i++) {
            this.light.lineTo(lightPoints[i].x, lightPoints[i].y);
        }
        this.light.closePath();
        this.light.fillPath();
    }

    update(keys, joystick) {
        this.move(keys, joystick);
        this.updateLight();

        if (keys.flashLight && Phaser.Input.Keyboard.JustDown(keys.flashLight)) {
            this.lightState = !this.lightState;
            this.lightRadius = this.lightState ? this.battery * 1.5 : 0;
        }
    }
}
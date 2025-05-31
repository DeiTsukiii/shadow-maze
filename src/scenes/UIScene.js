export default class UIScene extends Phaser.Scene {
    constructor() {
        super('UIScene');
    }

    preload() {}

    create() {
        this.gameScene = this.scene.get('GameScene');

        this.fpsText = this.add.text(30, 30, '', {
            font: '30px Monospace',
            fill: '#ffffff'
        }).setScrollFactor(0).setDepth(1000).setVisible(this.gameScene.debug);

        
        this.goalText = this.add.bitmapText(this.cameras.main.width - 30, 40, 'pixelFont', '', 40).setOrigin(1, 0).setScrollFactor(0).setDepth(1000);
        this.goalScoreText = this.add.bitmapText(this.cameras.main.width - 30, 90, 'pixelFont', '', 35).setOrigin(1, 0).setScrollFactor(0).setDepth(1000);

        this.blackBg = this.add.rectangle(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            this.cameras.main.width,
            this.cameras.main.height,
            0x000000,
            1
        ).setScrollFactor(0).setDepth(999).setVisible(false);
        
        this.jumpscare = this.physics.add.sprite(this.cameras.main.width / 2, this.cameras.main.height / 2, 'jumpscare').setDepth(1000).setScale(15).setVisible(false);
        this.anims.create({
            key: 'eyeOpen',
            frames: this.anims.generateFrameNumbers('jumpscare', {
                start: 0,
                end: 3
            }),
            frameRate: 5,
            repeat: 0
        });

        this.tweens.add({
            targets: this.jumpscare,
            x: this.jumpscare.x + 5,
            y: this.jumpscare.y + 5,
            duration: 50,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        if (!this.sys.game.device.os.desktop) {
            this.joystick = this.rexVirtualJoystick.add(this, {
                x: 150,
                y: this.cameras.main.height - 240,
                radius: 120,
                base: this.add.circle(0, 0, 120, 0x888888).setDepth(10000).setScrollFactor(0),
                thumb: this.add.circle(0, 0, 60, 0xcccccc).setDepth(10001).setScrollFactor(0),
                dir: '8dir',
                forceMin: 10
            });
        } else this.joystick = false;

        this.start();
    }

    start() {
        this.scene.pause('GameScene');
        if (this.joystick) {
            this.joystick.base.setVisible(false);
            this.joystick.thumb.setVisible(false);
        }
        this.goalScoreText.setText('');
        this.goalText.setText('');

        this.blackBg.setVisible(true);

        const title = this.add.bitmapText(this.cameras.main.width / 2, this.cameras.main.height / 2 - 100, 'pixelFont', 'Shadow Maze', 100).setOrigin(0.5).setScrollFactor(0).setDepth(1000);
        const restartButton = this.add.bitmapText(this.cameras.main.width / 2, this.cameras.main.height / 2 + 50, 'pixelFont', '[PLAY]', 50).setOrigin(0.5).setScrollFactor(0).setDepth(1000).setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
            this.blackBg.setVisible(false);
            restartButton.setVisible(false);
            title.setVisible(false);
            if (this.joystick) {
                this.joystick.base.setVisible(true);
                this.joystick.thumb.setVisible(true);
            }
            this.goalText.setText(`Catch ${this.gameScene.nbGoals} keys`);
            this.goalScoreText.setText(`Keys: 0/${this.gameScene.nbGoals}`);
            this.scene.resume('GameScene');
        });
    }

    updateScore(score) {
        this.goalScoreText.setText(`Keys: ${score}/${this.gameScene.nbGoals}`);
    }

    updateGoal() {
        this.goalScoreText.setText('');
        this.goalText.setText('Find the exit');
    }
    
    gameOver() {
        this.scene.pause('GameScene');
        this.blackBg.setVisible(true);
        this.jumpscare.setVisible(true);
        if (this.joystick) {
            this.joystick.base.setVisible(false);
            this.joystick.thumb.setVisible(false);
        }
        this.jumpscare.anims.play('eyeOpen', true);

        const jumpscareSound = this.sound.add('jumpscare');
        jumpscareSound.setVolume(2);
        jumpscareSound.play();

        setTimeout(() => {
            this.scene.resume('GameScene');
            if (this.joystick) {
                this.joystick.base.setVisible(true);
                this.joystick.thumb.setVisible(true);
            }
            this.blackBg.setVisible(false);
            this.jumpscare.setVisible(false);
            this.gameScene.obj.battery = 100;
            this.gameScene.obj.lightRadius = this.gameScene.obj.battery * 1.5;

            this.tweens.add({
                targets: jumpscareSound,
                volume: 0,
                duration: 200,
                ease: 'Sine.easeOut',
                onComplete: () => {
                    jumpscareSound.stop();
                }
            });
        }, 4000);
    }

    win() {
        this.scene.pause('GameScene');
        if (this.joystick) {
            this.joystick.base.setVisible(false);
            this.joystick.thumb.setVisible(false);
        }
        this.goalScoreText.setText('');
        this.goalText.setText('');

        this.blackBg.setVisible(true);

        this.add.bitmapText(this.cameras.main.width / 2, this.cameras.main.height / 2 - 100, 'pixelFont', 'You Win !', 100).setOrigin(0.5).setScrollFactor(0).setDepth(1000);
        this.add.bitmapText(this.cameras.main.width / 2, this.cameras.main.height / 2 + 50, 'pixelFont', '[REPLAY]', 50).setOrigin(0.5).setScrollFactor(0).setDepth(1000).setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
            window.location.reload();
        });
    }

    update() {
        this.fpsText.setText(`FPS: ${Math.floor(this.game.loop.actualFps)}`);
    }
}export default class UIScene extends Phaser.Scene {
    constructor() {
        super('UIScene');
    }

    preload() {}

    create() {
        this.gameScene = this.scene.get('GameScene');

        this.fpsText = this.add.text(30, 30, '', {
            font: '30px Monospace',
            fill: '#ffffff'
        }).setScrollFactor(0).setDepth(1000).setVisible(this.gameScene.debug);

        
        this.goalText = this.add.bitmapText(this.cameras.main.width - 30, 40, 'pixelFont', '', 40).setOrigin(1, 0).setScrollFactor(0).setDepth(1000);
        this.goalScoreText = this.add.bitmapText(this.cameras.main.width - 30, 90, 'pixelFont', '', 35).setOrigin(1, 0).setScrollFactor(0).setDepth(1000);

        this.blackBg = this.add.rectangle(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            this.cameras.main.width,
            this.cameras.main.height,
            0x000000,
            1
        ).setScrollFactor(0).setDepth(999).setVisible(false);
        
        this.jumpscare = this.physics.add.sprite(this.cameras.main.width / 2, this.cameras.main.height / 2, 'jumpscare').setDepth(1000).setScale(15).setVisible(false);
        this.anims.create({
            key: 'eyeOpen',
            frames: this.anims.generateFrameNumbers('jumpscare', {
                start: 0,
                end: 3
            }),
            frameRate: 5,
            repeat: 0
        });

        this.tweens.add({
            targets: this.jumpscare,
            x: this.jumpscare.x + 5,
            y: this.jumpscare.y + 5,
            duration: 50,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        if (!this.sys.game.device.os.desktop) {
            this.joystick = this.rexVirtualJoystick.add(this, {
                x: 150,
                y: this.cameras.main.height - 240,
                radius: 120,
                base: this.add.circle(0, 0, 120, 0x888888).setDepth(10000).setScrollFactor(0),
                thumb: this.add.circle(0, 0, 60, 0xcccccc).setDepth(10001).setScrollFactor(0),
                dir: '8dir',
                forceMin: 10
            });
        } else this.joystick = false;

        this.start();
    }

    start() {
        this.scene.pause('GameScene');
        if (this.joystick) {
            this.joystick.base.setVisible(false);
            this.joystick.thumb.setVisible(false);
        }
        this.goalScoreText.setText('');
        this.goalText.setText('');

        this.blackBg.setVisible(true);

        const title = this.add.bitmapText(this.cameras.main.width / 2, this.cameras.main.height / 2 - 100, 'pixelFont', 'Shadow Maze', 100).setOrigin(0.5).setScrollFactor(0).setDepth(1000);
        const restartButton = this.add.bitmapText(this.cameras.main.width / 2, this.cameras.main.height / 2 + 50, 'pixelFont', '[PLAY]', 50).setOrigin(0.5).setScrollFactor(0).setDepth(1000).setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
            this.blackBg.setVisible(false);
            restartButton.setVisible(false);
            title.setVisible(false);
            if (this.joystick) {
                this.joystick.base.setVisible(true);
                this.joystick.thumb.setVisible(true);
            }
            this.goalText.setText(`Catch ${this.gameScene.nbGoals} keys`);
            this.goalScoreText.setText(`Keys: 0/${this.gameScene.nbGoals}`);
            this.scene.resume('GameScene');
        });
    }

    updateScore(score) {
        this.goalScoreText.setText(`Keys: ${score}/${this.gameScene.nbGoals}`);
    }

    updateGoal() {
        this.goalScoreText.setText('');
        this.goalText.setText('Find the exit');
    }
    
    gameOver() {
        this.scene.pause('GameScene');
        this.blackBg.setVisible(true);
        this.jumpscare.setVisible(true);
        if (this.joystick) {
            this.joystick.base.setVisible(false);
            this.joystick.thumb.setVisible(false);
        }
        this.jumpscare.anims.play('eyeOpen', true);

        const jumpscareSound = this.sound.add('jumpscare');
        jumpscareSound.setVolume(2);
        jumpscareSound.play();

        setTimeout(() => {
            this.scene.resume('GameScene');
            if (this.joystick) {
                this.joystick.base.setVisible(true);
                this.joystick.thumb.setVisible(true);
            }
            this.blackBg.setVisible(false);
            this.jumpscare.setVisible(false);
            this.gameScene.obj.battery = 100;
            this.gameScene.obj.lightRadius = this.gameScene.obj.battery * 1.5;

            this.tweens.add({
                targets: jumpscareSound,
                volume: 0,
                duration: 200,
                ease: 'Sine.easeOut',
                onComplete: () => {
                    jumpscareSound.stop();
                }
            });
        }, 4000);
    }

    win() {
        this.scene.pause('GameScene');
        if (this.joystick) {
            this.joystick.base.setVisible(false);
            this.joystick.thumb.setVisible(false);
        }
        this.goalScoreText.setText('');
        this.goalText.setText('');

        this.blackBg.setVisible(true);

        this.add.bitmapText(this.cameras.main.width / 2, this.cameras.main.height / 2 - 100, 'pixelFont', 'You Win !', 100).setOrigin(0.5).setScrollFactor(0).setDepth(1000);
        this.add.bitmapText(this.cameras.main.width / 2, this.cameras.main.height / 2 + 50, 'pixelFont', '[REPLAY]', 50).setOrigin(0.5).setScrollFactor(0).setDepth(1000).setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
            window.location.reload();
        });
    }

    update() {
        this.fpsText.setText(`FPS: ${Math.floor(this.game.loop.actualFps)}`);
    }
}

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

        this.goalText = this.add.text(this.cameras.main.width - 30, 30, '', {
            font: '30px Monospace',
            fill: '#ffffff'
        }).setOrigin(1, 0).setScrollFactor(0).setDepth(1000);

        this.goalScoreText = this.add.text(this.cameras.main.width - 30, 70, '', {
            font: '30px Monospace',
            fill: '#ffffff'
        }).setOrigin(1, 0).setScrollFactor(0).setDepth(1000);

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

        this.start();
    }

    start() {
        this.goalScoreText.setText('');
        this.goalText.setText('');

        this.blackBg.setVisible(true);

        const title = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 - 100,
            'Shadow Maze',
            {
                font: '100px Monospace',
                fill: '#ffffff'
            }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(1000);

        const restartButton = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 + 50,
            'PLAY',
            {
                font: '50px Monospace',
                fill: '#ffffff',
                backgroundColor: '#222222',
                padding: { x: 20, y: 10 }
            }
        )
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(1000)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
            this.blackBg.setVisible(false);
            restartButton.setVisible(false);
            title.setVisible(false);
            this.goalText.setText(`Catch ${this.gameScene.nbGoals} keys`);
            this.goalScoreText.setText(`Keys: 0/${this.gameScene.nbGoals}`);
        })
        .on('pointerover', () => {
            restartButton.setStyle({ fill: '#000000' });
        })
        .on('pointerout', () => {
            restartButton.setStyle({ fill: '#ffffff' });
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
        this.blackBg.setVisible(true);
        this.jumpscare.setVisible(true);
        this.jumpscare.anims.play('eyeOpen', true);

        const jumpscareSound = this.sound.add('jumpscare');
        jumpscareSound.setVolume(2);
        jumpscareSound.play();

        setTimeout(() => {
            this.blackBg.setVisible(false);
            this.jumpscare.setVisible(false);

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
        this.goalScoreText.setText('');
        this.goalText.setText('');

        this.blackBg.setVisible(true);

        this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 - 100,
            'GAME WIN!',
            {
                font: '100px Monospace',
                fill: '#ffffff'
            }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(1000);

        const restartButton = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 + 50,
            'RESTART',
            {
                font: '50px Monospace',
                fill: '#ffffff',
                backgroundColor: '#222222',
                padding: { x: 20, y: 10 }
            }
        )
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(1000)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
            window.location.reload();
        })
        .on('pointerover', () => {
            restartButton.setStyle({ fill: '#000000' });
        })
        .on('pointerout', () => {
            restartButton.setStyle({ fill: '#ffffff' });
        });
    }

    update() {
        this.fpsText.setText(`FPS: ${Math.floor(this.game.loop.actualFps)}`);
    }
}

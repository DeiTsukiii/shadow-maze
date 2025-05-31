export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        this.cameras.main.setBackgroundColor('#000');
        const centerX = this.cameras.main.width / 2, centerY = this.cameras.main.height / 2;
        const loadingText = this.add.text(centerX, centerY - 50, 'Loading...', { font: '40px Monospace', fill: '#fff' }).setOrigin(0.5);
        const progressBar = this.add.graphics(), progressBox = this.add.graphics().fillStyle(0x222222, 0.8).fillRect(centerX - 160, centerY, 320, 50);
        this.load.on('progress', value => {
            progressBar.clear().fillStyle(0xffffff, 1).fillRect(centerX - 150, centerY + 10, 300 * value, 30);
        });
        this.load.once('complete', () => [progressBar, progressBox, loadingText].forEach(obj => obj.destroy()));

        this.load.image('wood', `src/assets/wood.png`);
        this.load.image('player', `src/assets/player.png`);
        this.load.image('ennemy', `src/assets/ennemy.png`);
        this.load.image('goal', `src/assets/goal.png`);
        this.load.image('exit', `src/assets/exit.png`);
        this.load.spritesheet('jumpscare', `src/assets/jumpscare.png`, { frameWidth: 50, frameHeight: 50 });

        this.load.audio('jumpscare', 'src/assets/jumpscare.wav');
        this.load.audio('exitOpen', 'src/assets/exitOpen.wav');

        this.load.audio('step1', 'src/assets/step1.wav');
        this.load.audio('step2', 'src/assets/step2.wav');
        this.load.audio('step3', 'src/assets/step3.wav');
        this.load.audio('step4', 'src/assets/step4.wav');

        this.load.audio('goal', 'src/assets/goal.mp3');
        this.load.audio('music', 'src/assets/music.mp3');

        
        this.load.bitmapFont('pixelFont', 'src/assets/pixel-font.png', 'src/assets/pixel-font.xml');
    }

    create() {
        this.scene.start('GameScene');
    }
}
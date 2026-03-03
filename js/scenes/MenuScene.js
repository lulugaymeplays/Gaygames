export class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Background
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x0a0a20, 0x0a0a20, 0x000000, 0x000000, 1);
        bg.fillRect(0, 0, width, height);

        // Title
        this.add.text(width / 2, 100, 'SHEEP BATTLE', {
            font: '72px Orbitron',
            fill: '#ffffff',
            stroke: '#00d4ff',
            strokeThickness: 8
        }).setOrigin(0.5);

        // Instructions
        this.add.text(width / 2, 220, 'PLAYER 1: W (Pulo), A/D (Mover), SPACE (Atirar)', { font: '20px Orbitron', fill: '#00d4ff' }).setOrigin(0.5);
        this.add.text(width / 2, 260, 'PLAYER 2: UP (Pulo), LEFT/RIGHT (Mover), 0 (Atirar)', { font: '20px Orbitron', fill: '#ff3e00' }).setOrigin(0.5);

        // Start Button
        const startBtn = this.add.container(width / 2, 400);
        const btnBg = this.add.rectangle(0, 0, 240, 60, 0xff3e00).setInteractive({ useHandCursor: true });
        const btnText = this.add.text(0, 0, 'START GAME', { font: '24px Orbitron', fill: '#ffffff' }).setOrigin(0.5);
        startBtn.add([btnBg, btnText]);

        btnBg.on('pointerover', () => {
            btnBg.setFillStyle(0xff5722);
            this.tweens.add({ targets: startBtn, scale: 1.1, duration: 200, ease: 'Back.easeOut' });
        });
        btnBg.on('pointerout', () => {
            btnBg.setFillStyle(0xff3e00);
            this.tweens.add({ targets: startBtn, scale: 1.0, duration: 200, ease: 'Back.easeOut' });
        });
        btnBg.on('pointerup', () => {
            this.cameras.main.fade(500, 0, 0, 0);
            this.time.delayedCall(500, () => this.scene.start('GameScene'));
        });

        this.add.text(width / 2, 550, 'Zerar a vida dele ou jogue-o do terreno para vencer!', {
            font: '16px Outfit',
            fill: '#888'
        }).setOrigin(0.5);
    }
}

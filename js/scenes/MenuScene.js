export class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Background (Procedural fallback)
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x0a0a1a, 0x0a0a1a, 0x000000, 0x000000, 1);
        bg.fillRect(0, 0, width, height);

        // Title
        this.add.text(width / 2, 100, 'SHEEP MAYHEM', {
            font: '72px Orbitron',
            fill: '#ffffff',
            stroke: '#00d4ff',
            strokeThickness: 8
        }).setOrigin(0.5);

        // Settings
        this.add.text(width / 2, 220, 'PLAYER COUNT', { font: '24px Orbitron', fill: '#00d4ff' }).setOrigin(0.5);

        const countText = this.add.text(width / 2, 270, this.game.settings.playerCount, {
            font: '48px Orbitron',
            fill: '#ffffff'
        }).setOrigin(0.5);

        this.createSmallButton(width / 2 - 80, 270, '-', () => {
            if (this.game.settings.playerCount > 2) {
                this.game.settings.playerCount--;
                countText.setText(this.game.settings.playerCount);
            }
        });

        this.createSmallButton(width / 2 + 80, 270, '+', () => {
            if (this.game.settings.playerCount < 4) {
                this.game.settings.playerCount++;
                countText.setText(this.game.settings.playerCount);
            }
        });

        // Start Button
        this.createButton(width / 2, 420, 'START GAME', () => {
            console.log("Starting GameScene...");
            this.scene.start('GameScene');
        });

        this.add.text(width / 2, 550, 'Drag sheep to shoot. Destroy terrain or knock them off!', {
            font: '18px Outfit',
            fill: '#888'
        }).setOrigin(0.5);
    }

    createSmallButton(x, y, label, callback) {
        const btn = this.add.rectangle(x, y, 50, 50, 0x333333).setInteractive({ useHandCursor: true });
        this.add.text(x, y, label, { font: '32px Orbitron', fill: '#fff' }).setOrigin(0.5);
        btn.on('pointerdown', callback);
        btn.on('pointerover', () => btn.setFillStyle(0x444444));
        btn.on('pointerout', () => btn.setFillStyle(0x333333));
    }

    createButton(x, y, label, callback) {
        const bg = this.add.rectangle(0, 0, 280, 70, 0xff3e00).setInteractive({ useHandCursor: true });
        const text = this.add.text(0, 0, label, { font: '28px Orbitron', fill: '#ffffff' }).setOrigin(0.5);
        const container = this.add.container(x, y, [bg, text]);

        bg.on('pointerover', () => bg.setFillStyle(0xff5722));
        bg.on('pointerout', () => bg.setFillStyle(0xff3e00));
        bg.on('pointerup', callback); // Use pointerup for better reliability

        return container;
    }
}

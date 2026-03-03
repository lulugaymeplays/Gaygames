export class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        this.add.image(width / 2, height / 2, 'sky').setDisplaySize(width, height).setAlpha(0.6);

        this.add.text(width / 2, 100, 'SHEEP MAYHEM', {
            font: '72px Orbitron',
            fill: '#ffffff',
            stroke: '#00d4ff',
            strokeThickness: 8
        }).setOrigin(0.5);

        this.add.text(width / 2, 220, 'PLAYER COUNT', { font: '20px Orbitron', fill: '#00d4ff' }).setOrigin(0.5);

        const countText = this.add.text(width / 2, 260, this.game.settings.playerCount, {
            font: '32px Orbitron',
            fill: '#ffffff'
        }).setOrigin(0.5);

        this.createSmallButton(width / 2 - 60, 260, '-', () => {
            if (this.game.settings.playerCount > 2) {
                this.game.settings.playerCount--;
                countText.setText(this.game.settings.playerCount);
            }
        });

        this.createSmallButton(width / 2 + 60, 260, '+', () => {
            if (this.game.settings.playerCount < 4) {
                this.game.settings.playerCount++;
                countText.setText(this.game.settings.playerCount);
            }
        });

        this.createButton(width / 2, 400, 'START GAME', () => {
            this.scene.start('GameScene');
        });

        this.add.text(width / 2, 550, 'Drag characters to shoot. Destroy terrain to win.', {
            font: '16px Outfit',
            fill: '#aaa'
        }).setOrigin(0.5);
    }

    createSmallButton(x, y, label, callback) {
        const btn = this.add.rectangle(x, y, 40, 40, 0x333333).setInteractive({ useHandCursor: true });
        this.add.text(x, y, label, { font: '24px Orbitron', fill: '#fff' }).setOrigin(0.5);
        btn.on('pointerdown', callback);
    }

    createButton(x, y, label, callback) {
        const btn = this.add.container(x, y);
        const bg = this.add.rectangle(0, 0, 240, 60, 0xff3e00)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => bg.setFillStyle(0xff5722))
            .on('pointerout', () => bg.setFillStyle(0xff3e00))
            .on('pointerdown', callback);
        const text = this.add.text(0, 0, label, { font: '24px Orbitron', fill: '#ffffff' }).setOrigin(0.5);
        btn.add([bg, text]);
        return btn;
    }
}

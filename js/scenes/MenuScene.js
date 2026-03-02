export class MenuScene extends Phaser.Scene {
    constructor() { super('MenuScene'); }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Mortal Kombat Background
        this.bg = this.add.image(width / 2, height / 2, 'kombat_bg').setDisplaySize(width, height);
        this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.4); // Darken overlay

        // Logo
        const logo = this.add.image(width / 2, height / 2 - 50, 'logo').setScale(0.3).setAlpha(0.6);
        this.tweens.add({
            targets: logo,
            scale: 0.35,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Title
        this.add.text(width / 2, 120, 'SLINGSHOT MAYHEM', {
            font: '84px "Metal Mania"',
            fill: '#8b0000',
            stroke: '#000',
            strokeThickness: 10
        }).setOrigin(0.5);

        this.add.text(width / 2, 125, 'SLINGSHOT MAYHEM', {
            font: '84px "Metal Mania"',
            fill: '#ff0000',
            alpha: 0.5
        }).setOrigin(0.5);

        // Player Selection
        this.add.text(width / 2, height - 200, 'CHOOSE YOUR DESTINY', {
            font: '24px "Shojumaru"',
            fill: '#d4af37'
        }).setOrigin(0.5);

        const countContainer = this.add.container(width / 2, height - 150);

        const countText = this.add.text(0, 0, this.game.settings.playerCount, {
            font: '48px "Metal Mania"',
            fill: '#ffffff'
        }).setOrigin(0.5);

        this.createSmallButton(countContainer, -80, 0, '-', () => {
            if (this.game.settings.playerCount > 2) {
                this.game.settings.playerCount--;
                countText.setText(this.game.settings.playerCount);
            }
        });

        this.createSmallButton(countContainer, 80, 0, '+', () => {
            if (this.game.settings.playerCount < 4) {
                this.game.settings.playerCount++;
                countText.setText(this.game.settings.playerCount);
            }
        });
        countContainer.add(countText);

        // Start Button - MK STYLE
        this.createKombatButton(width / 2, height - 70, 'FIGHT!', () => {
            console.log("Starting game...");
            this.scene.start('GameScene');
        });

        this.add.text(width / 2, height - 15, 'ONLY THE STRONGEST SURVIVE', {
            font: '12px "Shojumaru"',
            fill: '#666'
        }).setOrigin(0.5);
    }

    createSmallButton(container, x, y, label, callback) {
        const bg = this.scene.add.rectangle(x, y, 50, 50, 0x1a1a1b)
            .setStrokeStyle(2, 0x8b0000)
            .setInteractive({ useHandCursor: true });

        const txt = this.scene.add.text(x, y, label, {
            font: '32px "Metal Mania"', fill: '#fff'
        }).setOrigin(0.5);

        bg.on('pointerover', () => bg.setFillStyle(0x8b0000));
        bg.on('pointerout', () => bg.setFillStyle(0x1a1a1b));
        bg.on('pointerup', callback); // Use pointerup for better reliability

        container.add([bg, txt]);
    }

    createKombatButton(x, y, label, callback) {
        const bg = this.add.rectangle(0, 0, 300, 70, 0x1a1a1b)
            .setStrokeStyle(3, 0xd4af37)
            .setInteractive({ useHandCursor: true });

        const text = this.add.text(0, 0, label, {
            font: '42px "Metal Mania"',
            fill: '#ffffff'
        }).setOrigin(0.5);

        const btn = this.add.container(x, y, [bg, text]);

        bg.on('pointerover', () => {
            bg.setFillStyle(0x8b0000);
            bg.setStrokeStyle(3, 0xff0000);
            text.setScale(1.1);
        });

        bg.on('pointerout', () => {
            bg.setFillStyle(0x1a1a1b);
            bg.setStrokeStyle(3, 0xd4af37);
            text.setScale(1);
        });

        bg.on('pointerup', () => {
            this.tweens.add({
                targets: btn,
                scale: 0.9,
                duration: 50,
                yoyo: true,
                onComplete: callback
            });
        });

        return btn;
    }
}

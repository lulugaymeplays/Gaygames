export class BootScene extends Phaser.Scene {
    constructor() { super('BootScene'); }

    preload() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        this.add.text(width / 2, height / 2 - 50, 'Loading Slingshot Mayhem...', {
            font: '24px Orbitron',
            fill: '#ffffff'
        }).setOrigin(0.5);

        this.load.setBaseURL('https://labs.phaser.io/assets/');
        this.load.image('sky', 'skies/space3.png');
        this.load.image('particle', 'particles/red.png');
    }

    create() {
        this.generateTextures();
        this.scene.start('MenuScene');
    }

    generateTextures() {
        const graphics = this.add.graphics();
        graphics.fillStyle(0xffffff, 1);
        graphics.fillCircle(16, 16, 16);
        graphics.generateTexture('player', 32, 32);
        graphics.clear();

        graphics.fillStyle(0xffcc00, 1);
        graphics.fillCircle(8, 8, 8);
        graphics.generateTexture('stone', 16, 16);
        graphics.clear();

        graphics.fillStyle(0x44aa44, 1);
        graphics.fillRect(0, 0, 32, 32);
        graphics.generateTexture('ground', 32, 32);
        graphics.clear();
    }
}

export class BootScene extends Phaser.Scene {
    constructor() { super('BootScene'); }

    preload() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        this.add.text(width / 2, height / 2 - 50, 'Loading Slingshot Mayhem...', {
            font: '24px Shojumaru',
            fill: '#ffffff'
        }).setOrigin(0.5);

        this.load.image('kombat_bg', 'assets/kombat_bg.png');
        this.load.image('logo', 'assets/logo.png');
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

        // Player (Metallic/Crimson)
        graphics.fillStyle(0x1a1a1b, 1);
        graphics.fillCircle(16, 16, 16);
        graphics.lineStyle(2, 0x8b0000);
        graphics.strokeCircle(16, 16, 16);
        graphics.generateTexture('player', 32, 32);
        graphics.clear();

        // Projectile (Burning Ember)
        graphics.fillStyle(0xff3300, 1);
        graphics.fillCircle(8, 8, 8);
        graphics.generateTexture('stone', 16, 16);
        graphics.clear();

        // Ground (Dark Stone)
        graphics.fillStyle(0x1a1a1b, 1);
        graphics.fillRect(0, 0, 32, 32);
        graphics.lineStyle(1, 0x333333);
        graphics.strokeRect(0, 0, 32, 32);
        graphics.generateTexture('ground', 32, 32);
        graphics.clear();
    }
}

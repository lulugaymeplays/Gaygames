export class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Simple Loading Bar
        const loadingText = this.add.text(width / 2, height / 2 - 50, 'Carregando Ovelhas...', {
            font: '24px Orbitron',
            fill: '#ffffff'
        }).setOrigin(0.5);

        const progressBar = this.add.graphics();
        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0xff3e00, 1);
            progressBar.fillRect(width / 2 - 150, height / 2, 300 * value, 20);
        });

        // External assets (placeholders)
        this.load.setBaseURL('https://labs.phaser.io/assets/');
        this.load.image('sky', 'skies/space3.png');
        this.load.image('particle', 'particles/white-flare.png');
    }

    create() {
        this.generateTextures();
        console.log("Assets Gerados. Iniciando Menu...");
        this.scene.start('MenuScene');
    }

    generateTextures() {
        const graphics = this.add.graphics();

        // 🐑 Ovelha (Corpo Branco)
        graphics.fillStyle(0xffffff, 1);
        graphics.fillCircle(16, 16, 12);
        graphics.fillCircle(8, 14, 8);
        graphics.fillCircle(24, 14, 8);
        graphics.fillCircle(16, 8, 8);

        // Patas e Cabeça Pretas
        graphics.fillStyle(0x000000, 1);
        graphics.fillRect(10, 24, 3, 6);
        graphics.fillRect(19, 24, 3, 6);
        graphics.fillEllipse(28, 12, 10, 12);

        // Olho
        graphics.fillStyle(0xffffff, 1);
        graphics.fillCircle(30, 10, 2);

        // Ears
        graphics.fillStyle(0x000000, 1);
        graphics.fillEllipse(25, 6, 4, 6, 0.5);
        graphics.fillEllipse(35, 6, 4, 6, -0.5);

        graphics.generateTexture('sheep', 40, 32);
        graphics.clear();

        // 🧶 Bola de Lã (Projétil)
        graphics.fillStyle(0xffffff, 1);
        graphics.fillCircle(8, 8, 6);
        graphics.lineStyle(1, 0x000000, 0.3);
        graphics.strokeCircle(8, 8, 6);
        graphics.generateTexture('wool-ball', 16, 16);
        graphics.clear();

        // 🟩 Chão (Grama/Terra)
        graphics.fillStyle(0x33aa33, 1); // Grama
        graphics.fillRect(0, 0, 16, 4);
        graphics.fillStyle(0x664422, 1); // Terra
        graphics.fillRect(0, 4, 16, 12);
        graphics.generateTexture('ground', 16, 16);
        graphics.clear();
    }
}

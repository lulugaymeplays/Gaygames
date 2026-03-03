export class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // Create loading UI
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        const loadingText = this.make.text({
            x: width / 2,
            y: height / 2 - 50,
            text: 'Loading SHEEP MAYHEM...',
            style: {
                font: '28px Orbitron',
                fill: '#00d4ff'
            }
        }).setOrigin(0.5, 0.5);

        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width / 2 - 160, height / 2, 320, 30);

        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0xff3e00, 1);
            progressBar.fillRect(width / 2 - 150, height / 2 + 5, 300 * value, 20);
        });

        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            this.scene.start('MenuScene');
        });

        // Load placeholders or generated assets
        // Since I don't have real assets yet, I'll generate some textures in create()
        // But let's load some basic ones if needed
        this.load.setBaseURL('https://labs.phaser.io/assets/');
        this.load.image('sky', 'skies/space3.png');
        this.load.image('particle', 'particles/red.png');
    }

    create() {
        // Generate procedural textures for characters and terrain if not loaded
        this.generateTextures();
    }

    generateTextures() {
        // Create 2D Sheep Texture
        const graphics = this.add.graphics();

        // Sheep Body (Fluffy)
        graphics.fillStyle(0xffffff, 1);
        graphics.fillCircle(16, 16, 12);
        graphics.fillCircle(8, 14, 8);
        graphics.fillCircle(24, 14, 8);
        graphics.fillCircle(16, 8, 8);

        // Sheep Legs
        graphics.fillStyle(0x000000, 1);
        graphics.fillRect(10, 24, 3, 6);
        graphics.fillRect(19, 24, 3, 6);

        // Sheep Head
        graphics.fillStyle(0x000000, 1);
        graphics.fillEllipse(28, 12, 10, 12);

        // Eyes
        graphics.fillStyle(0xffffff, 1);
        graphics.fillCircle(30, 10, 2);

        graphics.generateTexture('sheep', 40, 32);
        graphics.clear();

        // Projectile (Wool Ball or Bomb)
        graphics.fillStyle(0xcccccc, 1);
        graphics.fillCircle(8, 8, 6);
        graphics.lineStyle(1, 0x888888, 1);
        graphics.strokeCircle(8, 8, 6);
        graphics.generateTexture('wool-ball', 16, 16);
        graphics.clear();

        // Ground chunk (Grass-topped)
        // Grass (Top 4px)
        graphics.fillStyle(0x33aa33, 1);
        graphics.fillRect(0, 0, 16, 4);
        // Dirt (Rest)
        graphics.fillStyle(0x664422, 1);
        graphics.fillRect(0, 4, 16, 12);
        graphics.generateTexture('ground', 16, 16);
        graphics.clear();

        // Background Gradient or Starfield (Space theme)
        // Handled via Phaser image in scenes or CSS
    }
}

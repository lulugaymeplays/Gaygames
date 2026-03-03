/**
 * SHEEP BRAWL - ZERO ASSET VERSION (EXTREMELY ROBUST)
 * No external images, no loading hangs.
 */

class TerrainManager {
    constructor(scene) {
        this.scene = scene;
        this.blockSize = 16;
        this.blocks = [];
    }

    generate() {
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;
        const groundLevel = height - 120;

        for (let x = 0; x < width; x += this.blockSize) {
            const h = Math.sin(x * 0.01) * 40 + groundLevel;
            for (let y = h; y < height; y += this.blockSize) {
                const block = this.scene.matter.add.image(x + this.blockSize / 2, y + this.blockSize / 2, 'ground', null, {
                    isStatic: true, label: 'terrain', friction: 0.9, restitution: 0
                });
                block.setDisplaySize(this.blockSize, this.blockSize);
                this.blocks.push(block);
                if (y > h + 150) break;
            }
        }
    }

    explode(x, y, radius) {
        for (let i = this.blocks.length - 1; i >= 0; i--) {
            const block = this.blocks[i];
            if (!block || !block.active) { this.blocks.splice(i, 1); continue; }
            const dist = Phaser.Math.Distance.Between(x, y, block.x, block.y);
            if (dist < radius) {
                block.destroy();
                this.blocks.splice(i, 1);
            }
        }
    }
}

class Player extends Phaser.GameObjects.Container {
    constructor(scene, x, y, id, color) {
        super(scene, x, y);
        this.scene = scene;
        this.id = id;
        this.color = color;
        this.hp = 100;
        this.alive = true;
        this.lastShotTime = 0;
        this.shootDelay = 400;

        this.bodySprite = scene.add.sprite(0, 0, 'sheep').setTint(color);
        this.add(this.bodySprite);
        if (id === 1) this.bodySprite.setFlipX(true);

        this.hpBar = scene.add.graphics();
        this.updateHPBar();
        this.add(this.hpBar);

        scene.add.existing(this);
        const body = scene.matter.add.gameObject(this, {
            shape: 'rectangle', width: 32, height: 28, friction: 0.05, label: 'player'
        });
        body.setFixedRotation();
        this.physicsBody = body;

        this.setupControls();
    }

    setupControls() {
        const { W, A, D, SPACE, UP, LEFT, RIGHT, ZERO, NUMPAD_ZERO } = Phaser.Input.Keyboard.KeyCodes;
        if (this.id === 0) {
            this.keys = this.scene.input.keyboard.addKeys({ jump: W, left: A, right: D, shoot: SPACE });
        } else {
            this.keys = this.scene.input.keyboard.addKeys({ jump: UP, left: LEFT, right: RIGHT, shoot: ZERO, num0: NUMPAD_ZERO });
        }
    }

    update() {
        if (!this.alive) return;
        const moveSpeed = 4;
        if (this.keys.left.isDown) { this.physicsBody.setVelocityX(-moveSpeed); this.bodySprite.setFlipX(true); }
        else if (this.keys.right.isDown) { this.physicsBody.setVelocityX(moveSpeed); this.bodySprite.setFlipX(false); }
        else { this.physicsBody.setVelocityX(0); }

        if (Phaser.Input.Keyboard.JustDown(this.keys.jump) && Math.abs(this.physicsBody.body.velocity.y) < 0.2) {
            this.physicsBody.setVelocityY(-8);
        }

        let isShooting = this.keys.shoot.isDown || (this.keys.num0 && this.keys.num0.isDown);
        if (isShooting) this.shoot();
    }

    shoot() {
        const now = this.scene.time.now;
        if (now - this.lastShotTime < this.shootDelay) return;
        this.lastShotTime = now;
        const dir = this.bodySprite.flipX ? -1 : 1;
        this.scene.launchProjectile(this.x + (dir * 25), this.y - 5, dir * 12, -3, this.id);
    }

    updateHPBar() {
        this.hpBar.clear().fillStyle(0x000, 0.5).fillRect(-20, -35, 40, 6);
        this.hpBar.fillStyle(this.hp > 30 ? 0x0f0 : 0xf00, 1).fillRect(-20, -35, 40 * (this.hp / 100), 6);
    }

    takeDamage(amount) {
        if (!this.alive) return;
        this.hp -= amount;
        this.updateHPBar();
        this.bodySprite.setTint(0xff0000);
        this.scene.time.delayedCall(150, () => { if (this.alive) this.bodySprite.setTint(this.color); });
        if (this.hp <= 0) this.die();
    }

    die() {
        if (!this.alive) return;
        this.alive = false;
        this.scene.handleExplosion(this.x, this.y, 50);
        this.setVisible(false);
        this.physicsBody.setStatic(true);
    }
}

class BootScene extends Phaser.Scene {
    constructor() { super('BootScene'); }
    preload() {
        // NO EXTERNAL LOADS HERE TO PREVENT HANGS
    }
    create() {
        const g = this.add.graphics();
        // 🐑 Sheep Texture
        g.fillStyle(0xffffff).fillCircle(16, 16, 12).fillCircle(8, 14, 8).fillCircle(24, 14, 8).fillCircle(16, 8, 8);
        g.fillStyle(0x000000).fillRect(10, 24, 3, 6).fillRect(19, 24, 3, 6).fillEllipse(28, 12, 10, 12);
        g.fillStyle(0xff0000).fillCircle(30, 9, 2); // Black cap head + red eye
        g.generateTexture('sheep', 40, 32); g.clear();

        // 🧶 Bullet Texture
        g.fillStyle(0xffffff).fillCircle(8, 8, 6).generateTexture('wool-ball', 16, 16); g.clear();

        // 🟩 Ground Texture
        g.fillStyle(0x33aa33).fillRect(0, 0, 16, 4).fillStyle(0x664422).fillRect(0, 4, 16, 12).generateTexture('ground', 16, 16); g.clear();

        // ✨ Particle Texture
        g.fillStyle(0xffffff).fillCircle(4, 4, 4).generateTexture('particle', 8, 8);

        console.log("Assets Gerados Offline. Indo para o Menu.");
        this.scene.start('MenuScene');
    }
}

class MenuScene extends Phaser.Scene {
    constructor() { super('MenuScene'); }
    create() {
        const { width, height } = this.scale;
        this.add.graphics().fillGradientStyle(0x0a0a20, 0x0a0a20, 0, 0, 1).fillRect(0, 0, width, height);
        this.add.text(width / 2, 150, 'SHEEP BRAWL', { font: 'bold 80px Arial', fill: '#fff' }).setOrigin(0.5);

        const btnBox = this.add.rectangle(width / 2, 350, 300, 80, 0xff3e00).setInteractive({ useHandCursor: true });
        this.add.text(width / 2, 350, 'START GAME', { font: 'bold 32px Arial', fill: '#fff' }).setOrigin(0.5);

        btnBox.on('pointerdown', () => {
            console.log("Botão clicado! Iniciando Jogo...");
            this.scene.start('GameScene');
        });

        btnBox.on('pointerover', () => btnBox.setFillStyle(0xff5722));
        btnBox.on('pointerout', () => btnBox.setFillStyle(0xff3e00));

        this.add.text(width / 2, 500, 'P1: WASD + SPACE | P2: SETAS + 0', { font: '20px Arial', fill: '#888' }).setOrigin(0.5);
    }
}

class GameScene extends Phaser.Scene {
    constructor() { super('GameScene'); }
    create() {
        const { width, height } = this.scale;
        this.add.graphics().fillGradientStyle(0x0a0a20, 0x0a0a20, 0, 0, 1).fillRect(0, 0, width, height);

        this.terrain = new TerrainManager(this);
        this.terrain.generate();

        this.players = [
            new Player(this, 200, 50, 0, 0x00d4ff),
            new Player(this, width - 200, 50, 1, 0xff3e00)
        ];

        this.gameOver = false;

        // Physics collisions
        this.matter.world.on('collisionstart', (e) => {
            e.pairs.forEach(p => {
                const b = p.bodyA.label === 'projectile' ? p.bodyA.gameObject : (p.bodyB.label === 'projectile' ? p.bodyB.gameObject : null);
                if (b && b.active) {
                    this.handleExplosion(b.x, b.y, 50);
                    b.destroy();
                }
            });
        });
    }

    launchProjectile(x, y, vx, vy, ownerId) {
        const p = this.matter.add.image(x, y, 'wool-ball', null, { shape: 'circle', radius: 6, label: 'projectile' });
        p.setVelocity(vx, vy);
        p.setTint(ownerId === 0 ? 0x00d4ff : 0xff3e00);
    }

    handleExplosion(x, y, radius) {
        this.terrain.explode(x, y, radius);
        this.cameras.main.shake(150, 0.005);
        this.players.forEach(p => {
            if (p.alive && Phaser.Math.Distance.Between(x, y, p.x, p.y) < radius) p.takeDamage(20);
        });

        // Explosion visual
        const emit = this.add.particles(x, y, 'particle', {
            speed: { min: 40, max: 200 },
            scale: { start: 1, end: 0 },
            lifespan: 600,
            quantity: 15,
            tint: 0xaaaaaa
        });
        this.time.delayedCall(600, () => emit.destroy());
    }

    update() {
        if (this.gameOver) return;
        this.players.forEach(p => p.update());

        const alive = this.players.filter(p => p.alive);
        if (alive.length <= 1) {
            this.gameOver = true;
            this.add.text(512, 300, 'FIM DE JOGO!', { font: 'bold 64px Arial', fill: '#fff' }).setOrigin(0.5);
            this.time.delayedCall(3000, () => this.scene.start('MenuScene'));
        }
    }
}

const config = {
    type: Phaser.AUTO, width: 1024, height: 600, parent: 'game-container',
    backgroundColor: '#000000',
    physics: { default: 'matter', matter: { gravity: { y: 1.2 }, debug: false } },
    scene: [BootScene, MenuScene, GameScene]
};

// Start the game
new Phaser.Game(config);
console.log("Jogo Reiniciado em Modo Offline (Zero Assets Externos).");

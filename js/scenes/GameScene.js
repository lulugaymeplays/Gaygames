import { TerrainManager } from '../systems/TerrainManager.js';
import { Player } from '../entities/Player.js';

export class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Background (Deep Space style)
        this.add.graphics()
            .fillGradientStyle(0x050510, 0x050510, 0x000000, 0x000000, 1)
            .fillRect(0, 0, width, height);

        // Terrain
        this.terrain = new TerrainManager(this);
        this.terrain.generate();

        // Players
        this.players = [];
        this.players.push(new Player(this, 200, 50, 0, 0x00d4ff)); // P1: Blue
        this.players.push(new Player(this, width - 200, 50, 1, 0xff3e00)); // P2: Red

        // Game State
        this.gameOver = false;
        this.cameras.main.flash(500, 0, 0, 0);

        // HUD
        this.hudText = this.add.text(width / 2, 40, 'BATALHA DE OVELHAS!', {
            font: '32px Orbitron',
            fill: '#ffffff',
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Controls indicators (fade out after 3s)
        const p1Hint = this.add.text(50, 80, 'P1: WASD + ESPAÇO', { font: '20px Orbitron', fill: '#00d4ff' });
        const p2Hint = this.add.text(width - 250, 80, 'P2: SETAS + 0', { font: '20px Orbitron', fill: '#ff3e00' });
        this.time.delayedCall(3000, () => {
            this.tweens.add({ targets: [p1Hint, p2Hint], alpha: 0, duration: 1000 });
        });

        // Setup Physics collisions
        this.setupPhysics();
    }

    setupPhysics() {
        this.matter.world.on('collisionstart', (e) => {
            e.pairs.forEach(pair => {
                const bA = pair.bodyA;
                const bB = pair.bodyB;

                if (bA.label === 'projectile' || bB.label === 'projectile') {
                    const proj = bA.label === 'projectile' ? bA.gameObject : bB.gameObject;
                    if (proj && proj.active) {
                        this.handleExplosion(proj.x, proj.y, 50);
                        proj.destroy();
                    }
                }
            });
        });
    }

    launchProjectile(x, y, vx, vy, ownerId) {
        const proj = this.matter.add.image(x, y, 'wool-ball', null, {
            shape: 'circle',
            radius: 6,
            label: 'projectile',
            friction: 0.1,
            restitution: 0.8
        });

        proj.setVelocity(vx, vy);
        proj.setTint(ownerId === 0 ? 0x00d4ff : 0xff3e00);

        // Camera follow (optional, maybe just shake)
        if (Math.random() > 0.5) this.cameras.main.shake(100, 0.002);
    }

    handleExplosion(x, y, radius) {
        this.terrain.explode(x, y, radius);
        this.cameras.main.shake(150, 0.005);

        this.players.forEach(p => {
            if (p.alive) {
                const dist = Phaser.Math.Distance.Between(x, y, p.x, p.y);
                if (dist < radius) {
                    const force = (1 - dist / radius);
                    p.takeDamage(force * 25);
                    const angle = Phaser.Math.Angle.Between(x, y, p.x, p.y);
                    p.physicsBody.applyForce({ x: Math.cos(angle) * 0.01, y: Math.sin(angle) * 0.01 });
                }
            }
        });

        // Smoke partclies
        const particles = this.add.particles(x, y, 'particle', {
            speed: { min: 40, max: 200 },
            scale: { start: 1.5, end: 0 },
            lifespan: 1000,
            quantity: 20,
            tint: 0xcccccc,
            blendMode: 'NORMAL'
        });
        this.time.delayedCall(1000, () => particles.destroy());
    }

    update() {
        if (this.gameOver) return;

        // Simultaneous updates for both playable sheep
        this.players.forEach(p => p.update());

        const alive = this.players.filter(p => p.alive);

        // Victory check
        if (alive.length <= 1) {
            this.gameOver = true;
            const winner = alive[0];
            const msg = winner ? `JOGADOR ${winner.id + 1} VENCEU!` : "EMPATE!";

            this.hudText.setText(msg).setScale(1.5).setFill('#fff');
            this.time.delayedCall(4000, () => this.scene.start('MenuScene'));
        }

        // Drop out of screen check
        this.players.forEach(p => {
            if (p.alive && p.y > this.cameras.main.height + 200) p.die();
        });
    }
}

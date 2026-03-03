import { TerrainManager } from '../systems/TerrainManager.js';
import { Player } from '../entities/Player.js';

export class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    create() {
        this.width = this.cameras.main.width;
        this.height = this.cameras.main.height;

        // Background
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x0a0a20, 0x0a0a20, 0x000000, 0x000000, 1);
        bg.fillRect(0, 0, this.width, this.height);

        // Terrain
        this.terrain = new TerrainManager(this);
        this.terrain.generate();

        // HUD
        this.setupHUD();

        // Game State
        this.gameOver = false;
        const colors = [0x00d4ff, 0xff3e00]; // P1: Blue, P2: Red

        // Spawn players
        this.players = [];
        this.players.push(new Player(this, 100, 100, 0, colors[0]));
        this.players.push(new Player(this, this.width - 100, 100, 1, colors[1]));

        // Physics
        this.setupPhysics();
    }

    setupHUD() {
        this.hudText = this.add.text(this.width / 2, 40, 'SHEEP BRAWL', {
            font: '32px Orbitron',
            fill: '#ffffff'
        }).setOrigin(0.5);

        this.add.text(20, 20, 'P1: WASD + SPACE', { font: '16px Orbitron', fill: '#00d4ff' });
        this.add.text(this.width - 180, 20, 'P2: ARROWS + 0', { font: '16px Orbitron', fill: '#ff3e00' });
    }

    setupPhysics() {
        this.matter.world.on('collisionstart', (event) => {
            event.pairs.forEach(pair => {
                const bodyA = pair.bodyA;
                const bodyB = pair.bodyB;

                if (bodyA.label === 'projectile' || bodyB.label === 'projectile') {
                    const proj = bodyA.label === 'projectile' ? bodyA.gameObject : bodyB.gameObject;
                    if (proj && proj.active) {
                        this.handleExplosion(proj.x, proj.y, 40);
                        proj.destroy();
                    }
                }
            });
        });
    }

    launchProjectile(x, y, vx, vy, ownerId) {
        if (this.gameOver) return;

        const projectile = this.matter.add.image(x, y, 'wool-ball', null, {
            shape: 'circle',
            radius: 6,
            label: 'projectile',
            friction: 0.1,
            restitution: 0.8
        });

        projectile.setVelocity(vx, vy);
        projectile.setTint(ownerId === 0 ? 0x00d4ff : 0xff3e00);

        // Auto-terminate
        this.time.delayedCall(5000, () => {
            if (projectile.active) projectile.destroy();
        });
    }

    handleExplosion(x, y, radius) {
        this.terrain.explode(x, y, radius);
        this.cameras.main.shake(100, 0.005);

        this.players.forEach(p => {
            if (p.alive) {
                const dist = Phaser.Math.Distance.Between(x, y, p.x, p.y);
                if (dist < radius) {
                    const damage = Math.round(30 * (1 - dist / radius));
                    p.takeDamage(damage);
                    const angle = Phaser.Math.Angle.Between(x, y, p.x, p.y);
                    p.physicsBody.applyForce({ x: Math.cos(angle) * 0.005, y: Math.sin(angle) * 0.005 });
                }
            }
        });

        // Dust
        const emitter = this.add.particles(x, y, 'particle', {
            speed: { min: 20, max: 120 },
            scale: { start: 0.6, end: 0 },
            lifespan: 500,
            quantity: 10,
            tint: 0xffffff
        });
        this.time.delayedCall(500, () => emitter.destroy());
    }

    update() {
        if (this.gameOver) return;

        // Manual update for players (platforming logic)
        this.players.forEach(p => p.update());

        // Victory condition
        const survivors = this.players.filter(p => p.alive);
        if (survivors.length <= 1) {
            this.gameOver = true;
            const winnerId = (survivors.length === 1) ? survivors[0].id + 1 : 0;
            const resultMsg = (winnerId > 0) ? `PLAYER ${winnerId} WINS!` : "DRAAAW!";

            this.hudText.setText(resultMsg).setScale(2).setFill('#ffffff');
            this.time.delayedCall(3000, () => this.scene.start('MenuScene'));
        }

        // Fall check
        this.players.forEach(p => {
            if (p.alive && p.y > this.height + 100) {
                p.die();
            }
        });
    }
}

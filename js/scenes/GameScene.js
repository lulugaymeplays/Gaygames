import { TerrainManager } from '../systems/TerrainManager.js';
import { Player } from '../entities/Player.js';

export class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    create() {
        this.width = this.cameras.main.width;
        this.height = this.cameras.main.height;

        // Procedural background just in case assets fail
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x050510, 0x050510, 0x000000, 0x000000, 1);
        bg.fillRect(0, 0, this.width, this.height);

        // Try to add sky image if it exists
        if (this.textures.exists('sky')) {
            this.add.image(this.width / 2, this.height / 2, 'sky').setDisplaySize(this.width, this.height).setAlpha(0.2);
        }

        // Systems
        this.terrain = new TerrainManager(this);
        this.terrain.generate();

        // Game State
        this.players = [];
        this.currentPlayerIndex = -1; // Set to -1 so first call starts at 0
        this.turnTimer = 15;
        this.isTurnActive = false;
        this.gameOver = false;

        this.setupMultiplayer();
        this.setupHUD();
        this.setupPhysics();

        // Small delay to ensure everything is ready
        this.time.delayedCall(500, () => {
            this.startNextTurn();
        });
    }

    setupMultiplayer() {
        const colors = [0xff3e00, 0x00d4ff, 0xffcc00, 0x00ff00];
        const numPlayers = this.game.settings.playerCount || 2;

        for (let i = 0; i < numPlayers; i++) {
            const startX = 150 + (this.width - 300) * (i / (numPlayers - 1));
            // Ensure they drop from high enough to land on terrain
            const player = new Player(this, startX, 50, i, colors[i]);
            this.players.push(player);
        }
    }

    setupHUD() {
        this.hudText = this.add.text(this.width / 2, 40, 'WAITING...', {
            font: '32px Orbitron',
            fill: '#ffffff',
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(0.5).setScrollFactor(0);

        this.timerText = this.add.text(this.width - 60, 40, '15s', {
            font: '32px Orbitron',
            fill: '#ff3e00',
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(0.5).setScrollFactor(0);

        this.time.addEvent({
            delay: 1000,
            callback: () => {
                if (this.isTurnActive && !this.gameOver) {
                    this.turnTimer--;
                    this.timerText.setText(this.turnTimer + 's');
                    if (this.turnTimer <= 0) this.endTurn();
                }
            },
            loop: true
        });
    }

    setupPhysics() {
        this.matter.world.on('collisionstart', (event) => {
            event.pairs.forEach(pair => {
                const bodyA = pair.bodyA;
                const bodyB = pair.bodyB;
                const labelA = bodyA.label;
                const labelB = bodyB.label;

                if (labelA === 'projectile' || labelB === 'projectile') {
                    const proj = labelA === 'projectile' ? bodyA.gameObject : bodyB.gameObject;
                    if (proj && proj.active) {
                        this.handleExplosion(proj.x, proj.y);
                        proj.destroy(); // Destroy immediately on hit
                    }
                }
            });
        });
    }

    startNextTurn() {
        if (this.gameOver) return;

        // Increment index
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;

        // Find next living player
        let safety = 0;
        let activePlayer = this.players[this.currentPlayerIndex];

        while ((!activePlayer || !activePlayer.active) && safety < this.players.length) {
            this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
            activePlayer = this.players[this.currentPlayerIndex];
            safety++;
        }

        if (safety >= this.players.length) {
            // No one left?
            return;
        }

        this.players.forEach(p => { if (p && p.active) p.isActive = false; });

        activePlayer.isActive = true;
        this.isTurnActive = true;
        this.turnTimer = 15;
        this.timerText.setText('15s');

        this.hudText.setText(`PLAYER ${this.currentPlayerIndex + 1} TURN`)
            .setFill('#' + activePlayer.color.toString(16).padStart(6, '0'));

        // Camera follow active player briefly
        this.cameras.main.startFollow(activePlayer, true, 0.1, 0.1);
    }

    endTurn() {
        if (!this.isTurnActive) return;
        this.isTurnActive = false;

        this.time.delayedCall(2000, () => {
            this.startNextTurn();
        });
    }

    launchProjectile(x, y, vx, vy) {
        if (this.gameOver) return;

        const projectile = this.matter.add.image(x, y, 'wool-ball', null, {
            shape: 'circle',
            radius: 8,
            label: 'projectile',
            friction: 0.01,
            restitution: 0.4
        });
        projectile.setVelocity(vx, vy);

        this.time.addEvent({
            delay: 10000,
            callback: () => { if (projectile && projectile.active) projectile.destroy(); }
        });

        this.cameras.main.startFollow(projectile, true, 0.1, 0.1);
    }

    handleExplosion(x, y) {
        const radius = 70;
        this.terrain.explode(x, y, radius);
        this.cameras.main.shake(300, 0.01);

        this.players.forEach(p => {
            if (p && p.active) {
                const dist = Phaser.Math.Distance.Between(x, y, p.x, p.y);
                if (dist < radius) {
                    const damage = Math.round(60 * (1 - dist / radius));
                    p.takeDamage(damage);
                    const angle = Phaser.Math.Angle.Between(x, y, p.x, p.y);
                    p.applyForce({ x: Math.cos(angle) * 0.02, y: Math.sin(angle) * 0.02 });
                }
            }
        });

        // Dust effect
        const emitter = this.add.particles(x, y, 'particle', {
            speed: { min: 30, max: 180 },
            scale: { start: 1, end: 0 },
            lifespan: 1000,
            quantity: 20,
            tint: 0xcccccc,
            blendMode: 'NORMAL'
        });
        this.time.delayedCall(1000, () => { if (emitter) emitter.destroy(); });
    }

    update() {
        if (this.gameOver) return;

        const alivePlayers = this.players.filter(p => p && p.active);

        if (alivePlayers.length <= 1 && this.players.length > 1) {
            this.gameOver = true;
            const winner = alivePlayers[0];
            const resultText = winner ? `PLAYER ${this.players.indexOf(winner) + 1} WINS!` : "GAME OVER";

            this.add.text(this.width / 2, this.height / 2, resultText, {
                font: '84px Orbitron',
                fill: '#ffffff',
                stroke: '#00d4ff',
                strokeThickness: 10
            }).setOrigin(0.5).setScrollFactor(0).setDepth(100);

            this.isTurnActive = false;
            this.time.delayedCall(5000, () => this.scene.start('MenuScene'));
        }

        this.players.forEach(p => {
            if (p && p.active && p.y > this.height + 200) {
                p.die();
            }
        });
    }
}

import { TerrainManager } from '../systems/TerrainManager.js';
import { Player } from '../entities/Player.js';

export class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    create() {
        this.width = this.cameras.main.width;
        this.height = this.cameras.main.height;

        this.add.image(this.width / 2, this.height / 2, 'sky').setDisplaySize(this.width, this.height).setAlpha(0.3);

        this.terrain = new TerrainManager(this);
        this.terrain.generate();

        this.players = [];
        this.currentPlayerIndex = 0;
        this.turnTimer = 15;
        this.isTurnActive = false;
        this.gameOver = false;

        this.setupMultiplayer();
        this.setupHUD();
        this.setupPhysics();

        this.startNextTurn();
    }

    setupMultiplayer() {
        const colors = [0xff3e00, 0x00d4ff, 0xffcc00, 0x00ff00];
        const numPlayers = this.game.settings.playerCount;
        for (let i = 0; i < numPlayers; i++) {
            const startX = 100 + (this.width - 200) * (i / (numPlayers - 1));
            const player = new Player(this, startX, 100, i, colors[i]);
            this.players.push(player);
        }
    }

    setupHUD() {
        this.hudText = this.add.text(this.width / 2, 30, 'TURN: PLAYER 1', { font: '24px Orbitron', fill: '#ffffff' }).setOrigin(0.5);
        this.timerText = this.add.text(this.width - 50, 30, '15s', { font: '24px Orbitron', fill: '#ff3e00' }).setOrigin(0.5);
        this.time.addEvent({
            delay: 1000,
            callback: () => {
                if (this.isTurnActive) {
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
                if (bodyA.label === 'projectile' || bodyB.label === 'projectile') {
                    const proj = bodyA.label === 'projectile' ? bodyA.gameObject : bodyB.gameObject;
                    if (proj) this.handleExplosion(proj.x, proj.y);
                }
            });
        });
    }

    startNextTurn() {
        if (this.gameOver) return;
        this.isTurnActive = true;
        this.turnTimer = 15;
        this.timerText.setText('15s');
        this.players.forEach(p => p.isActive = false);
        let safety = 0;
        do {
            this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
            safety++;
        } while (!this.players[this.currentPlayerIndex].active && safety < 10);
        const activePlayer = this.players[this.currentPlayerIndex];
        activePlayer.isActive = true;
        this.hudText.setText(`TURN: PLAYER ${this.currentPlayerIndex + 1}`).setFill('#' + activePlayer.color.toString(16).padStart(6, '0'));
    }

    endTurn() {
        if (!this.isTurnActive) return;
        this.isTurnActive = false;
        this.time.delayedCall(2000, () => {
            this.startNextTurn();
        });
    }

    launchProjectile(x, y, vx, vy) {
        const projectile = this.matter.add.image(x, y, 'wool-ball', null, {
            shape: 'circle',
            radius: 6,
            label: 'projectile',
            friction: 0.01,
            restitution: 0.6
        });
        projectile.setVelocity(vx, vy);
        this.time.addEvent({
            delay: 8000,
            callback: () => { if (projectile.active) projectile.destroy(); }
        });
        this.cameras.main.startFollow(projectile, true, 0.1, 0.1);
    }

    handleExplosion(x, y) {
        const radius = 60;
        this.terrain.explode(x, y, radius);
        this.cameras.main.shake(300, 0.01);
        this.players.forEach(p => {
            if (p.active) {
                const dist = Phaser.Math.Distance.Between(x, y, p.x, p.y);
                if (dist < radius) {
                    const damage = Math.round(50 * (1 - dist / radius));
                    p.takeDamage(damage);
                    const angle = Phaser.Math.Angle.Between(x, y, p.x, p.y);
                    p.applyForce({ x: Math.cos(angle) * 0.01, y: Math.sin(angle) * 0.01 });
                }
            }
        });
        const emitter = this.add.particles(x, y, 'particle', {
            speed: { min: 20, max: 150 },
            scale: { start: 0.8, end: 0 },
            lifespan: 800,
            quantity: 15,
            tint: 0xeeeeee,
            blendMode: 'NORMAL'
        });
        this.time.delayedCall(800, () => emitter.destroy());
    }

    update() {
        if (this.gameOver) return;
        const alivePlayers = this.players.filter(p => !!p.active);
        if (alivePlayers.length <= 1 && this.players.length > 1) {
            this.gameOver = true;
            const winner = alivePlayers[0];
            const resultText = winner ? `PLAYER ${this.players.indexOf(winner) + 1} WINS!` : "DRAW!";
            this.add.text(this.width / 2, this.height / 2, resultText, {
                font: '72px Orbitron',
                fill: '#ffffff',
                stroke: '#00d4ff',
                strokeThickness: 8
            }).setOrigin(0.5).setScrollFactor(0);
            this.isTurnActive = false;
            this.time.delayedCall(4000, () => this.scene.start('MenuScene'));
        }
        this.players.forEach(p => {
            if (p && p.active && p.y > this.height + 100) p.die();
        });
    }
}

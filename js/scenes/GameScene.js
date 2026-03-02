import { TerrainManager } from '../systems/TerrainManager.js';
import { Player } from '../entities/Player.js';

export class GameScene extends Phaser.Scene {
    constructor() { super('GameScene'); }

    create() {
        this.width = this.cameras.main.width;
        this.height = this.cameras.main.height;
        this.add.image(this.width / 2, this.height / 2, 'kombat_bg').setDisplaySize(this.width, this.height).setAlpha(0.2);

        this.terrain = new TerrainManager(this);
        this.terrain.generate();

        this.players = [];
        this.currentPlayerIndex = -1;
        this.turnTimer = 15;
        this.isTurnActive = false;

        this.setupMultiplayer();
        this.setupHUD();
        this.setupPhysics();

        this.levelText = this.add.text(this.width / 2, this.height / 2, `LEVEL ${this.game.settings.currentLevel}`, {
            font: '64px "Metal Mania"',
            fill: '#8b0000',
            stroke: '#000',
            strokeThickness: 5
        }).setOrigin(0.5);

        this.time.delayedCall(2000, () => {
            this.levelText.destroy();
            this.startNextTurn();
        });
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
        this.hudText = this.add.text(this.width / 2, 30, 'PREPARING...', { font: '28px "Metal Mania"', fill: '#ffffff' }).setOrigin(0.5);
        this.timerText = this.add.text(this.width - 50, 30, '15s', { font: '28px "Shojumaru"', fill: '#ff0000' }).setOrigin(0.5);

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
                if (pair.bodyA.label === 'projectile' || pair.bodyB.label === 'projectile') {
                    const proj = pair.bodyA.label === 'projectile' ? pair.bodyA.gameObject : pair.bodyB.gameObject;
                    if (proj && proj.active) {
                        this.handleExplosion(proj.x, proj.y);
                        proj.destroy();
                    }
                }
            });
        });
    }

    startNextTurn() {
        this.isTurnActive = true;
        this.turnTimer = 15;
        this.timerText.setText('15s');

        this.players.forEach(p => p.isActive = false);
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;

        const activePlayer = this.players[this.currentPlayerIndex];
        if (!activePlayer || !activePlayer.active) {
            this.startNextTurn(); // Skip dead players
            return;
        }

        activePlayer.isActive = true;
        this.hudText.setText(`TURN: PLAYER ${this.currentPlayerIndex + 1}`).setFill('#' + activePlayer.color.toString(16).padStart(6, '0'));
    }

    endTurn() {
        if (!this.isTurnActive) return;
        this.isTurnActive = false;
        this.time.delayedCall(2000, () => this.startNextTurn());
    }

    launchProjectile(x, y, vx, vy) {
        const projectile = this.matter.add.image(x, y, 'stone', null, { shape: 'circle', radius: 8, label: 'projectile' });
        projectile.setVelocity(vx, vy);
    }

    handleExplosion(x, y) {
        const radius = 60;
        this.terrain.explode(x, y, radius);
        this.players.forEach(p => {
            if (p.active) {
                const dist = Phaser.Math.Distance.Between(x, y, p.x, p.y);
                if (dist < radius) {
                    p.takeDamage(25);
                    const angle = Phaser.Math.Angle.Between(x, y, p.x, p.y);
                    p.physicsBody.applyForce({ x: Math.cos(angle) * 0.01, y: Math.sin(angle) * 0.01 });
                }
            }
        });
    }

    update() {
        this.players.forEach(p => {
            if (p.active && p.y > this.height + 50) p.die();
        });

        this.checkWinCondition();
    }

    checkWinCondition() {
        if (!this.isTurnActive) return;

        const alivePlayers = this.players.filter(p => p.active);
        const aliveTeams = [...new Set(alivePlayers.map(p => p.team))];

        if (aliveTeams.length <= 1 && this.players.length > 0) {
            this.handleMatchEnd(aliveTeams[0]);
        }
    }

    handleMatchEnd(winnerTeam) {
        this.isTurnActive = false;
        const winner = winnerTeam !== undefined ? `PLAYER ${winnerTeam + 1} WINS!` : 'DRAW!';

        this.add.text(this.width / 2, this.height / 2 - 50, winner, {
            font: '64px "Metal Mania"',
            fill: '#00ff00',
            stroke: '#000',
            strokeThickness: 5
        }).setOrigin(0.5);

        this.game.settings.currentLevel++;

        this.time.delayedCall(3000, () => {
            this.scene.restart();
        });
    }
}

/**
 * REBUILT SLINGSHOT MAYHEM
 * Focus: Reliability, Mechanics, and Kombat Aesthetic
 */

// Global state
const GameSettings = {
    playerCount: 2,
    currentLevel: 1,
    turnTime: 15
};

class BootScene extends Phaser.Scene {
    constructor() { super('BootScene'); }
    preload() {
        // Generate assets with code (no 404 errors)
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });

        // Player
        graphics.fillStyle(0x1a1a1b, 1);
        graphics.fillCircle(16, 16, 16);
        graphics.lineStyle(2, 0x8b0000);
        graphics.strokeCircle(16, 16, 16);
        graphics.generateTexture('player_base', 32, 32);
        graphics.clear();

        // Projectile
        graphics.fillStyle(0xff3300, 1);
        graphics.fillCircle(8, 8, 8);
        graphics.generateTexture('projectile', 16, 16);
        graphics.clear();

        // Ground block
        graphics.fillStyle(0x1a1a1b, 1);
        graphics.fillRect(0, 0, 16, 16);
        graphics.lineStyle(1, 0x333333, 0.5);
        graphics.strokeRect(0, 0, 16, 16);
        graphics.generateTexture('ground', 16, 16);

        // Load some particles from CDN for visual flair
        this.load.setBaseURL('https://labs.phaser.io/assets/');
        this.load.image('smoke', 'particles/smoke-puff.png');
    }
    create() {
        this.scene.start('MenuScene');
    }
}

class MenuScene extends Phaser.Scene {
    constructor() { super('MenuScene'); }
    create() {
        const { width, height } = this.scale;

        this.add.text(width / 2, 100, 'KOMBAT SLINGSHOT', {
            fontFamily: 'Metal Mania', fontSize: '80px', fill: '#8b0000'
        }).setOrigin(0.5);

        this.add.text(width / 2, 250, 'PLAYERS: ' + GameSettings.playerCount, {
            fontFamily: 'Shojumaru', fontSize: '30px', fill: '#d4af37'
        }).setOrigin(0.5);

        // Simple HTML-like button implementation using Phaser Text
        const startBtn = this.add.text(width / 2, 400, 'CHOOSE YOUR DESTINY', {
            fontFamily: 'Shojumaru', fontSize: '32px', fill: '#ffffff',
            backgroundColor: '#8b0000', padding: { x: 20, y: 10 }
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => startBtn.setStyle({ fill: '#d4af37' }))
            .on('pointerout', () => startBtn.setStyle({ fill: '#ffffff' }))
            .on('pointerdown', () => this.scene.start('GameScene'));
    }
}

class GameScene extends Phaser.Scene {
    constructor() { super('GameScene'); }

    create() {
        const { width, height } = this.scale;

        // Physics Setup
        this.matter.world.setBounds(0, -1000, width, height + 200);
        this.matter.world.setGravity(0, 1);

        // Terrain Manager
        this.blocks = [];
        this.generateTerrain();

        // Players Setup
        this.players = [];
        this.setupPlayers();

        // Turn Management
        this.currentPlayerIndex = -1;
        this.turnTimer = 0;
        this.isWaiting = false;

        // UI References
        this.turnText = document.getElementById('turn-indicator');
        this.timerText = document.getElementById('timer');

        // Collision Handler
        this.matter.world.on('collisionstart', (event) => {
            event.pairs.forEach(pair => {
                if (pair.bodyA.label === 'bullet' || pair.bodyB.label === 'bullet') {
                    const bulletBody = pair.bodyA.label === 'bullet' ? pair.bodyA : pair.bodyB;
                    if (bulletBody.gameObject) {
                        this.explode(bulletBody.gameObject.x, bulletBody.gameObject.y);
                        bulletBody.gameObject.destroy();
                    }
                }
            });
        });

        this.startNextTurn();
    }

    generateTerrain() {
        const { width, height } = this.scale;
        const groundLevel = height - 100;
        const blockSize = 16;
        const freq = 0.02 + (GameSettings.currentLevel * 0.01);
        const amp = 30 + (GameSettings.currentLevel * 10);

        for (let x = blockSize / 2; x < width; x += blockSize) {
            const h = Math.sin(x * freq) * amp + groundLevel;
            for (let y = h; y < height; y += blockSize) {
                const block = this.matter.add.image(x, y, 'ground', null, {
                    isStatic: true, label: 'terrain'
                });
                this.blocks.push(block);
            }
        }
    }

    setupPlayers() {
        const colors = [0x8b0000, 0xd4af37, 0x3333ff, 0x00ff00];
        const { width } = this.scale;

        for (let i = 0; i < GameSettings.playerCount; i++) {
            const x = 100 + (width - 200) * (i / (GameSettings.playerCount - 1));
            const y = 50;

            const playerSprite = this.add.sprite(0, 0, 'player_base').setTint(colors[i]);
            const container = this.add.container(x, y, [playerSprite]);

            // Health text
            container.hp = 100;
            container.hpLabel = this.add.text(0, -30, '100', { fontSize: '12px' }).setOrigin(0.5);
            container.add(container.hpLabel);

            this.matter.add.gameObject(container, {
                shape: 'circle', radius: 16, friction: 0.1, label: 'player'
            });

            container.team = i;
            container.color = colors[i];
            this.players.push(container);

            // Interaction
            playerSprite.setInteractive({ useHandCursor: true });
            playerSprite.on('pointerdown', (p) => this.handleDragStart(p, container));
        }
    }

    handleDragStart(pointer, player) {
        if (this.isWaiting || this.players[this.currentPlayerIndex] !== player) return;

        player.isDragging = true;
        player.dragStartX = pointer.x;
        player.dragStartY = pointer.y;

        this.trajectoryLine = this.add.graphics();
    }

    update() {
        const pointer = this.input.activePointer;
        if (this.players[this.currentPlayerIndex] && this.players[this.currentPlayerIndex].isDragging) {
            const player = this.players[this.currentPlayerIndex];
            this.trajectoryLine.clear();
            this.trajectoryLine.lineStyle(2, player.color, 1);

            const dx = player.dragStartX - pointer.x;
            const dy = player.dragStartY - pointer.y;

            // Draw slingshot line
            this.trajectoryLine.lineBetween(player.x, player.y, player.x + dx, player.y + dy);

            if (!pointer.isDown) {
                this.shoot(player, dx, dy);
            }
        }

        // Falling check
        this.players.forEach(p => {
            if (p.active && p.y > this.scale.height + 100) {
                this.eliminatePlayer(p);
            }
        });
    }

    shoot(player, dx, dy) {
        player.isDragging = false;
        this.trajectoryLine.destroy();
        this.isWaiting = true;

        const bullet = this.matter.add.image(player.x, player.y, 'projectile', null, {
            shape: 'circle', radius: 8, label: 'bullet'
        });
        bullet.setVelocity(dx * 0.15, dy * 0.15);

        // Auto end wait if bullet hangs
        this.time.delayedCall(4000, () => {
            if (this.isWaiting) this.startNextTurn();
        });
    }

    explode(x, y) {
        const radius = 50;

        // Destroy blocks
        for (let i = this.blocks.length - 1; i >= 0; i--) {
            const b = this.blocks[i];
            if (Phaser.Math.Distance.Between(x, y, b.x, b.y) < radius) {
                b.destroy();
                this.blocks.splice(i, 1);
            }
        }

        // Damage players
        this.players.forEach(p => {
            if (!p.active) return;
            const dist = Phaser.Math.Distance.Between(x, y, p.x, p.y);
            if (dist < radius) {
                p.hp -= Math.floor(40 * (1 - dist / radius));
                if (p.hp < 0) p.hp = 0;
                p.hpLabel.setText(p.hp);

                // Knockback
                const angle = Phaser.Math.Angle.Between(x, y, p.x, p.y);
                p.applyForce({ x: Math.cos(angle) * 0.05, y: Math.sin(angle) * 0.05 });

                if (p.hp === 0) this.eliminatePlayer(p);
            }
        });

        // Visual
        const emitter = this.add.particles(x, y, 'smoke', {
            speed: { min: -100, max: 100 },
            scale: { start: 0.5, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: 500,
            quantity: 10
        });
        this.time.delayedCall(500, () => {
            emitter.destroy();
            this.startNextTurn();
        });
    }

    eliminatePlayer(player) {
        player.setActive(false);
        player.setVisible(false);
        this.matter.world.remove(player.body);

        this.checkWinConditions();
    }

    checkWinConditions() {
        const alive = this.players.filter(p => p.active);
        if (alive.length <= 1 && this.players.length > 0) {
            const winner = alive.length === 1 ? 'PLAYER ' + (alive[0].team + 1) : 'DRAW';
            this.showEndMessage(winner);
        }
    }

    showEndMessage(msg) {
        const { width, height } = this.scale;
        this.add.text(width / 2, height / 2, msg + ' WINS!\nLEVEL UP', {
            fontFamily: 'Metal Mania', fontSize: '64px', fill: '#00ff00', align: 'center'
        }).setOrigin(0.5);

        GameSettings.currentLevel++;
        this.time.delayedCall(3000, () => this.scene.restart());
    }

    startNextTurn() {
        this.isWaiting = false;
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;

        while (!this.players[this.currentPlayerIndex].active) {
            this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        }

        const activePlayer = this.players[this.currentPlayerIndex];
        this.turnText.innerText = 'PLAYER ' + (activePlayer.team + 1) + ' TURN';
        this.turnText.style.color = '#' + activePlayer.color.toString(16).padStart(6, '0');

        this.turnTimer = GameSettings.turnTime;
        if (this.timerEvent) this.timerEvent.destroy();

        this.timerEvent = this.time.addEvent({
            delay: 1000,
            callback: () => {
                this.turnTimer--;
                this.timerText.innerText = this.turnTimer + 's';
                if (this.turnTimer <= 0) this.startNextTurn();
            },
            loop: true
        });
    }
}

// Phaser Config
const config = {
    type: Phaser.AUTO,
    width: 1024,
    height: 600,
    parent: 'phaser-game',
    backgroundColor: '#0a0a0c',
    physics: {
        default: 'matter',
        matter: { gravity: { y: 1 }, debug: false }
    },
    scene: [BootScene, MenuScene, GameScene]
};

const game = new Phaser.Game(config);

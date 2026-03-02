/**
 * SHEEP KOMBAT: SLINGSHOT MAYHEM
 * 2 Players - Sheep Warriors - Artillery Style
 */

class BootScene extends Phaser.Scene {
    constructor() { super('BootScene'); }
    preload() {
        // Load sheep sprites from assets folder
        this.load.image('sheep1', 'assets/sheep1.png');
        this.load.image('sheep2', 'assets/sheep2.png');

        // Generate other assets
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });

        // Ground block (Dark Stone)
        graphics.fillStyle(0x1a1a1b, 1);
        graphics.fillRect(0, 0, 16, 16);
        graphics.lineStyle(1, 0x444444, 0.8);
        graphics.strokeRect(0, 0, 16, 16);
        graphics.generateTexture('stone_block', 16, 16);
        graphics.clear();

        // Projectile (Fireball)
        graphics.fillStyle(0xff4500, 1);
        graphics.fillCircle(8, 8, 8);
        graphics.fillStyle(0xffff00, 0.6);
        graphics.fillCircle(8, 8, 4);
        graphics.generateTexture('fireball', 16, 16);
    }
    create() {
        this.scene.start('MenuScene');
    }
}

class MenuScene extends Phaser.Scene {
    constructor() { super('MenuScene'); }
    create() {
        const { width, height } = this.scale;

        this.add.text(width / 2, 120, 'SHEEP KOMBAT', {
            fontFamily: 'Metal Mania', fontSize: '90px', fill: '#8b0000',
            stroke: '#000', strokeThickness: 8
        }).setOrigin(0.5);

        this.add.text(width / 2, 220, 'SLINGSHOT MAYHEM', {
            fontFamily: 'Shojumaru', fontSize: '24px', fill: '#d4af37'
        }).setOrigin(0.5);

        const startBtn = this.add.text(width / 2, 450, 'START KOMBAT', {
            fontFamily: 'Metal Mania', fontSize: '48px', fill: '#ffffff',
            backgroundColor: '#8b0000', padding: { x: 40, y: 20 }
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.scene.start('GameScene'));

        // Decorative sheep
        this.add.image(width / 2 - 200, 350, 'sheep1').setScale(2);
        this.add.image(width / 2 + 200, 350, 'sheep2').setScale(2);
    }
}

class GameScene extends Phaser.Scene {
    constructor() { super('GameScene'); }

    create() {
        const { width, height } = this.scale;

        // Physics
        this.matter.world.setBounds(0, -500, width, height + 200);
        this.matter.world.setGravity(0, 1.2);

        // Terrain
        this.blocks = [];
        this.generateArena();

        // Players
        this.players = [];
        this.setupSheep();

        // State
        this.currentPlayerIndex = 0;
        this.isWaiting = false;
        this.turnTimer = 15;

        // UI Elements
        this.turnInfo = document.getElementById('turn-info');
        this.p1HPText = document.getElementById('p1-hp');
        this.p2HPText = document.getElementById('p2-hp');

        // Collisions
        this.matter.world.on('collisionstart', (event) => {
            event.pairs.forEach(pair => {
                const labels = [pair.bodyA.label, pair.bodyB.label];
                if (labels.includes('fireball')) {
                    const fireballBody = pair.bodyA.label === 'fireball' ? pair.bodyA : pair.bodyB;
                    if (fireballBody.gameObject) {
                        this.handleImpact(fireballBody.gameObject.x, fireballBody.gameObject.y);
                        fireballBody.gameObject.destroy();
                    }
                }
            });
        });

        this.startTurn();
    }

    generateArena() {
        const { width, height } = this.scale;
        const groundY = height - 120;
        const blockSize = 16;

        for (let x = blockSize / 2; x < width; x += blockSize) {
            const h = Math.sin(x * 0.015) * 40 + groundY;
            for (let y = h; y < height; y += blockSize) {
                const block = this.matter.add.image(x, y, 'stone_block', null, {
                    isStatic: true, label: 'terrain'
                });
                this.blocks.push(block);
            }
        }
    }

    setupSheep() {
        const { width } = this.scale;
        const positions = [200, width - 200];
        const textures = ['sheep1', 'sheep2'];
        const colors = ['#ff0000', '#ffff00'];

        for (let i = 0; i < 2; i++) {
            const sheep = this.add.container(positions[i], 100);
            const sprite = this.add.image(0, 0, textures[i]).setScale(1.2);
            sheep.add(sprite);

            this.matter.add.gameObject(sheep, {
                shape: 'rectangle', width: 48, height: 48, friction: 0.1, label: 'sheep'
            });

            sheep.hp = 100;
            sheep.team = i;
            sheep.color = colors[i];
            this.players.push(sheep);

            // Interaction
            sprite.setInteractive({ useHandCursor: true });
            sprite.on('pointerdown', (p) => this.startDrag(p, sheep));
        }
    }

    startDrag(pointer, sheep) {
        if (this.isWaiting || this.players[this.currentPlayerIndex] !== sheep) return;

        sheep.isDragging = true;
        sheep.dragStartX = pointer.x;
        sheep.dragStartY = pointer.y;

        this.trajectory = this.add.graphics();
    }

    update() {
        const pointer = this.input.activePointer;
        const activeSheep = this.players[this.currentPlayerIndex];

        if (activeSheep && activeSheep.isDragging) {
            this.trajectory.clear();
            this.trajectory.lineStyle(3, 0xffffff, 0.5);

            const dx = activeSheep.dragStartX - pointer.x;
            const dy = activeSheep.dragStartY - pointer.y;

            // Draw slingshot line
            this.trajectory.lineBetween(activeSheep.x, activeSheep.y, activeSheep.x + dx, activeSheep.y + dy);

            if (!pointer.isDown) {
                this.fire(activeSheep, dx, dy);
            }
        }

        // Falling check
        this.players.forEach(p => {
            if (p.active && p.y > this.scale.height + 50) {
                p.hp = 0;
                this.checkGameOver();
            }
        });
    }

    fire(sheep, dx, dy) {
        sheep.isDragging = false;
        this.trajectory.destroy();
        this.isWaiting = true;

        const fireball = this.matter.add.image(sheep.x, sheep.y, 'fireball', null, {
            shape: 'circle', radius: 8, label: 'fireball'
        });

        fireball.setVelocity(dx * 0.15, dy * 0.15);

        // Fail-safe to next turn if fireball gets lost
        this.time.delayedCall(4000, () => {
            if (this.isWaiting) this.nextTurn();
        });
    }

    handleImpact(x, y) {
        const radius = 60;

        // Destroy Terrain
        for (let i = this.blocks.length - 1; i >= 0; i--) {
            const b = this.blocks[i];
            if (Phaser.Math.Distance.Between(x, y, b.x, b.y) < radius) {
                b.destroy();
                this.blocks.splice(i, 1);
            }
        }

        // Damage Players
        this.players.forEach(p => {
            if (!p.active) return;
            const dist = Phaser.Math.Distance.Between(x, y, p.x, p.y);
            if (dist < radius) {
                const damage = Math.floor(35 * (1 - dist / radius));
                p.hp -= damage;
                if (p.hp < 0) p.hp = 0;
                this.updateUI();

                // Knockback
                const angle = Phaser.Math.Angle.Between(x, y, p.x, p.y);
                p.applyForce({ x: Math.cos(angle) * 0.08, y: Math.sin(angle) * 0.08 });
            }
        });

        // Effect
        const flash = this.add.circle(x, y, radius, 0xff8800, 0.6);
        this.tweens.add({
            targets: flash,
            scale: 1.5,
            alpha: 0,
            duration: 300,
            onComplete: () => {
                flash.destroy();
                this.nextTurn();
            }
        });
    }

    updateUI() {
        this.p1HPText.innerText = `SHEEP 1: ${this.players[0].hp}`;
        this.p2HPText = document.getElementById('p2-hp');
        this.p2HPText.innerText = `SHEEP 2: ${this.players[1].hp}`;
        this.checkGameOver();
    }

    checkGameOver() {
        if (this.players[0].hp <= 0 || this.players[1].hp <= 0) {
            this.isWaiting = true;
            const winner = this.players[0].hp > 0 ? 'SHEEP 1' : 'SHEEP 2';

            this.add.text(this.scale.width / 2, this.scale.height / 2, winner + '\nFATALITY', {
                fontFamily: 'Metal Mania', fontSize: '96px', fill: '#ff0000', align: 'center'
            }).setOrigin(0.5);

            this.time.delayedCall(3000, () => this.scene.restart());
        }
    }

    startTurn() {
        this.isWaiting = false;
        this.turnTimer = 15;
        this.turnInfo.innerText = `SHEEP ${this.currentPlayerIndex + 1}'S KOMBAT`;
        this.turnInfo.style.color = this.players[this.currentPlayerIndex].color;
    }

    nextTurn() {
        if (this.players[0].hp <= 0 || this.players[1].hp <= 0) return;
        this.currentPlayerIndex = 1 - this.currentPlayerIndex;
        this.startTurn();
    }
}

const config = {
    type: Phaser.AUTO,
    width: 1024,
    height: 600,
    parent: 'phaser-app',
    backgroundColor: '#050505',
    physics: {
        default: 'matter',
        matter: { gravity: { y: 1 }, debug: false }
    },
    scene: [BootScene, MenuScene, GameScene]
};

const game = new Phaser.Game(config);

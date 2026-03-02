/**
 * SHEEP KOMBAT: THE SHOOTER
 * P1: WASD + SPACE (Shoot)
 * P2: Arrows + ENTER (Shoot)
 */

class Boot extends Phaser.Scene {
    constructor() { super('Boot'); }
    preload() {
        this.load.image('sheep1', 'assets/sheep1.png');
        this.load.image('sheep2', 'assets/sheep2.png');
        this.load.image('heart', 'assets/heart.png');
        this.load.image('gun', 'assets/gun.png');

        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        graphics.fillStyle(0x1a1a1b, 1);
        graphics.fillRect(0, 0, 32, 32);
        graphics.lineStyle(1, 0x444444);
        graphics.strokeRect(0, 0, 32, 32);
        graphics.generateTexture('floor', 32, 32);

        graphics.clear();
        graphics.fillStyle(0xff0000, 1);
        graphics.fillCircle(4, 4, 4);
        graphics.generateTexture('bullet', 8, 8);
    }
    create() { this.scene.start('Menu'); }
}

class Menu extends Phaser.Scene {
    constructor() { super('Menu'); }
    create() {
        const { width, height } = this.scale;
        this.add.text(width / 2, 150, 'SHEEP KOMBAT', {
            fontFamily: 'Metal Mania', fontSize: '100px', fill: '#8b0000',
            stroke: '#000', strokeThickness: 10
        }).setOrigin(0.5);

        const startBtn = this.add.rectangle(width / 2, 400, 300, 80, 0x8b0000).setInteractive({ useHandCursor: true });
        this.add.text(width / 2, 400, 'START', {
            fontFamily: 'Shojumaru', fontSize: '40px', fill: '#ffffff'
        }).setOrigin(0.5);

        startBtn.on('pointerdown', () => this.scene.start('Play'));

        this.add.text(width / 2, 550, 'P1: WASD + SPACE | P2: ARROWS + ENTER', {
            fontFamily: 'Arial', fontSize: '20px', fill: '#777'
        }).setOrigin(0.5);
    }
}

class Play extends Phaser.Scene {
    constructor() { super('Play'); }

    create() {
        const { width, height } = this.scale;

        // World
        this.matter.world.setBounds(0, 0, width, height);
        this.matter.world.setGravity(0, 1.5);

        // Solid Ground
        const ground = this.matter.add.rectangle(width / 2, height - 20, width, 40, { isStatic: true });
        this.add.tileSprite(width / 2, height - 20, width, 40, 'floor');

        // Players
        this.p1 = this.createPlayer(200, height - 100, 'sheep1', 1);
        this.p2 = this.createPlayer(width - 200, height - 100, 'sheep2', 2);

        // HUD
        this.createHUD(1);
        this.createHUD(2);

        // Keys
        this.keys = this.input.keyboard.addKeys({
            w: 'W', a: 'A', d: 'D', space: 'SPACE',
            up: 'UP', left: 'LEFT', right: 'RIGHT', enter: 'ENTER'
        });

        // Collisions
        this.matter.world.on('collisionstart', (e) => {
            e.pairs.forEach(pair => {
                const { bodyA, bodyB } = pair;
                if ((bodyA.label === 'bullet' && bodyB.label === 'player') || (bodyB.label === 'bullet' && bodyA.label === 'player')) {
                    const bullet = bodyA.label === 'bullet' ? bodyA : bodyB;
                    const playerBody = bodyA.label === 'player' ? bodyA : bodyB;
                    if (bullet.gameObject && playerBody.gameObject !== bullet.owner) {
                        this.hitPlayer(playerBody.gameObject);
                        bullet.gameObject.destroy();
                    }
                }
            });
        });
    }

    createPlayer(x, y, texture, id) {
        const container = this.add.container(x, y);
        const sprite = this.add.image(0, 0, texture).setScale(1.2);
        const gun = this.add.image(20 * (id === 1 ? 1 : -1), 10, 'gun').setScale(0.8);
        if (id === 2) sprite.setFlipX(true);

        container.add([sprite, gun]);
        container.sprite = sprite;
        container.id = id;
        container.lives = 3;
        container.bullets = 3;
        container.canShoot = true;

        this.matter.add.gameObject(container, {
            shape: 'rectangle', width: 48, height: 48, friction: 0.1, restitution: 0, label: 'player'
        });
        container.setFixedRotation();

        return container;
    }

    createHUD(playerId) {
        const x = playerId === 1 ? 20 : this.scale.width - 200;
        const color = playerId === 1 ? '#ff0000' : '#ffff00';

        const label = this.add.text(x, 20, `SHEEP ${playerId}`, { fontFamily: 'Shojumaru', fontSize: '20px', fill: color });

        const hearts = [];
        for (let i = 0; i < 3; i++) {
            hearts.push(this.add.image(x + 20 + i * 35, 60, 'heart').setScale(0.8));
        }

        const ammo = this.add.text(x, 90, `AMMO: 3`, { fontFamily: 'Arial', fontSize: '18px', fill: '#fff' });

        if (playerId === 1) {
            this.p1HUD = { hearts, ammo };
        } else {
            this.p2HUD = { hearts, ammo };
        }
    }

    update() {
        // P1 Movement
        if (this.keys.a.isDown) this.p1.setVelocityX(-5);
        else if (this.keys.d.isDown) this.p1.setVelocityX(5);
        else this.p1.setVelocityX(0);

        if (Phaser.Input.Keyboard.JustDown(this.keys.w) && Math.abs(this.p1.body.velocity.y) < 0.1) {
            this.p1.setVelocityY(-15);
        }

        if (Phaser.Input.Keyboard.JustDown(this.keys.space)) this.shoot(this.p1);

        // P2 Movement
        if (this.keys.left.isDown) this.p2.setVelocityX(-5);
        else if (this.keys.right.isDown) this.p2.setVelocityX(5);
        else this.p2.setVelocityX(0);

        if (Phaser.Input.Keyboard.JustDown(this.keys.up) && Math.abs(this.p2.body.velocity.y) < 0.1) {
            this.p2.setVelocityY(-15);
        }

        if (Phaser.Input.Keyboard.JustDown(this.keys.enter)) this.shoot(this.p2);
    }

    shoot(player) {
        if (player.bullets <= 0 || !player.canShoot) return;

        player.canShoot = false;
        player.bullets--;

        const hud = player.id === 1 ? this.p1HUD : this.p2HUD;
        hud.ammo.setText(`AMMO: ${player.bullets}`);

        const dir = player.id === 1 ? 1 : -1;
        const b = this.matter.add.image(player.x + (30 * dir), player.y, 'bullet', null, {
            ignoreGravity: true, label: 'bullet'
        });
        b.owner = player;
        b.setVelocityX(15 * dir);

        this.time.delayedCall(500, () => player.canShoot = true);
    }

    hitPlayer(player) {
        player.lives--;
        const hud = player.id === 1 ? this.p1HUD : this.p2HUD;
        if (hud.hearts[player.lives]) {
            this.tweens.add({
                targets: hud.hearts[player.lives],
                scale: 0,
                duration: 200,
                onComplete: () => hud.hearts[player.lives].setVisible(false)
            });
        }

        if (player.lives <= 0) {
            this.gameOver(player.id === 1 ? 2 : 1);
        }
    }

    gameOver(winnerId) {
        this.scene.pause();
        const { width, height } = this.scale;
        this.add.text(width / 2, height / 2, `SHEEP ${winnerId} WINS!\nFATALITY`, {
            fontFamily: 'Metal Mania', fontSize: '80px', fill: '#ff0000', align: 'center'
        }).setOrigin(0.5);

        this.time.delayedCall(3000, () => this.scene.restart('Menu'));
    }
}

const config = {
    type: Phaser.AUTO,
    width: 1024,
    height: 600,
    parent: 'phaser-container',
    backgroundColor: '#0a0a0c',
    physics: {
        default: 'matter',
        matter: { gravity: { y: 1 }, debug: false }
    },
    scene: [Boot, Menu, Play]
};

const game = new Phaser.Game(config);

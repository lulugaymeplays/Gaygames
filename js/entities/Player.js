export class Player extends Phaser.GameObjects.Container {
    constructor(scene, x, y, id, color) {
        super(scene, x, y);
        this.scene = scene;
        this.id = id; // 0 for P1, 1 for P2
        this.color = color;
        this.hp = 100;
        this.alive = true;
        this.lastShotTime = 0;
        this.shootDelay = 400; // ms

        // Visuals
        this.bodySprite = scene.add.sprite(0, 0, 'sheep').setTint(color);
        this.add(this.bodySprite);
        if (id === 1) this.bodySprite.setFlipX(true);

        // HP Bar
        this.hpBar = scene.add.graphics();
        this.updateHPBar();
        this.add(this.hpBar);

        // Physics (Matter.js)
        scene.add.existing(this);
        this.physicsBody = scene.matter.add.gameObject(this, {
            shape: 'rectangle',
            width: 32,
            height: 28,
            friction: 0.2, // Some friction to stop sliding
            restitution: 0,
            label: 'player'
        });
        this.physicsBody.setFixedRotation();

        // Inputs
        this.setupControls();
    }

    setupControls() {
        const { W, A, D, SPACE } = Phaser.Input.Keyboard.KeyCodes;
        const { UP, LEFT, RIGHT, ZERO, NUMPAD_ZERO } = Phaser.Input.Keyboard.KeyCodes;

        if (this.id === 0) {
            // Player 1: WASD + Space
            this.keys = this.scene.input.keyboard.addKeys({
                jump: W,
                left: A,
                right: D,
                shoot: SPACE
            });
        } else {
            // Player 2: Arrows + 0 (both top row and numpad)
            this.keys = this.scene.input.keyboard.addKeys({
                jump: UP,
                left: LEFT,
                right: RIGHT,
                shoot: ZERO,
                num0: NUMPAD_ZERO
            });
        }
    }

    update() {
        if (!this.alive) return;

        const moveSpeed = 4;
        const jumpForce = -7;

        // Horizontal movement
        if (this.keys.left.isDown) {
            this.physicsBody.setVelocityX(-moveSpeed);
            this.bodySprite.setFlipX(true);
        } else if (this.keys.right.isDown) {
            this.physicsBody.setVelocityX(moveSpeed);
            this.bodySprite.setFlipX(false);
        } else {
            this.physicsBody.setVelocityX(0);
        }

        // Jump (only if near ground level for simplicity)
        if (Phaser.Input.Keyboard.JustDown(this.keys.jump)) {
            // Check vertical velocity is low enough (grounded)
            if (Math.abs(this.physicsBody.body.velocity.y) < 0.2) {
                this.physicsBody.setVelocityY(jumpForce);
            }
        }

        // Shoot
        let shooting = this.keys.shoot.isDown;
        if (this.id === 1 && this.keys.num0.isDown) shooting = true;

        if (shooting) {
            this.shoot();
        }
    }

    shoot() {
        const now = this.scene.time.now;
        if (now - this.lastShotTime < this.shootDelay) return;
        this.lastShotTime = now;

        const direction = this.bodySprite.flipX ? -1 : 1;
        const startX = this.x + (direction * 25);
        const startY = this.y - 5;

        const vx = direction * 12;
        const vy = -3; // Slight upward arc

        this.scene.launchProjectile(startX, startY, vx, vy, this.id);
    }

    updateHPBar() {
        this.hpBar.clear();
        this.hpBar.fillStyle(0x000000, 0.5);
        this.hpBar.fillRect(-20, -35, 40, 6);
        this.hpBar.fillStyle(this.hp > 30 ? 0x00ff00 : 0xff0000, 1);
        this.hpBar.fillRect(-20, -35, 40 * (this.hp / 100), 6);
    }

    takeDamage(amount) {
        if (!this.alive) return;
        this.hp -= amount;
        if (this.hp < 0) this.hp = 0;
        this.updateHPBar();

        // Red flash feedback
        this.bodySprite.setTint(0xff0000);
        this.scene.time.delayedCall(150, () => {
            if (this.alive) this.bodySprite.setTint(this.color);
        });

        if (this.hp <= 0) {
            this.die();
        }
    }

    die() {
        if (!this.alive) return;
        this.alive = false;
        this.scene.handleExplosion(this.x, this.y, 50);
        this.setVisible(false);
        this.physicsBody.setStatic(true);
        this.active = false;
    }
}

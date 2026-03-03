export class Player extends Phaser.GameObjects.Container {
    constructor(scene, x, y, team, color) {
        super(scene, x, y);
        this.scene = scene;
        this.team = team;
        this.color = color;
        this.hp = 100;
        this.isActive = false;

        this.bodySprite = scene.add.sprite(0, 0, 'sheep').setTint(color);
        this.add(this.bodySprite);
        if (team % 2 === 1) this.bodySprite.setFlipX(true);

        this.hpBar = scene.add.graphics();
        this.updateHPBar();
        this.add(this.hpBar);

        scene.add.existing(this);
        this.physicsBody = scene.matter.add.gameObject(this, {
            shape: 'rectangle',
            width: 40,
            height: 32,
            friction: 0.8,
            restitution: 0.1,
            label: 'player'
        });
        this.physicsBody.setFixedRotation();

        this.isDragging = false;
        this.dragStart = new Phaser.Math.Vector2();
        this.trajectoryLine = scene.add.graphics();

        this.setupInteraction();
    }

    setupInteraction() {
        this.bodySprite.setInteractive({ useHandCursor: true });
        this.bodySprite.on('pointerdown', (pointer) => {
            if (!this.isActive) return;
            this.isDragging = true;
            this.dragStart.set(pointer.x, pointer.y);
            this.scene.cameras.main.startFollow(this, true, 0.1, 0.1);
        });
        this.scene.input.on('pointermove', (pointer) => {
            if (this.isDragging) this.updateTrajectory(pointer);
        });
        this.scene.input.on('pointerup', (pointer) => {
            if (this.isDragging) this.shoot(pointer);
        });
    }

    updateHPBar() {
        this.hpBar.clear();
        this.hpBar.fillStyle(0x000000, 0.5);
        this.hpBar.fillRect(-20, -35, 40, 6);
        this.hpBar.fillStyle(this.hp > 30 ? 0x00ff00 : 0xff0000, 1);
        this.hpBar.fillRect(-20, -35, 40 * (this.hp / 100), 6);
    }

    updateTrajectory(pointer) {
        this.trajectoryLine.clear();
        const dx = this.dragStart.x - pointer.x;
        const dy = this.dragStart.y - pointer.y;
        this.trajectoryLine.lineStyle(2, 0xffffff, 0.3);
        this.trajectoryLine.beginPath();
        this.trajectoryLine.moveTo(0, 0);
        this.trajectoryLine.lineTo(-dx, -dy);
        this.trajectoryLine.strokePath();

        this.trajectoryLine.lineStyle(3, this.color, 0.8);
        let tx = 0, ty = 0;
        let vx = dx * 0.15, vy = dy * 0.15;
        const gravity = this.scene.matter.world.localWorld.gravity.y * 0.1;
        this.trajectoryLine.beginPath();
        this.trajectoryLine.moveTo(tx, ty);
        for (let i = 0; i < 30; i++) {
            tx += vx; ty += vy; vy += gravity;
            this.trajectoryLine.lineTo(tx, ty);
        }
        this.trajectoryLine.strokePath();
    }

    shoot(pointer) {
        if (!this.isDragging) return;
        this.isDragging = false;
        this.trajectoryLine.clear();
        const dx = this.dragStart.x - pointer.x;
        const dy = this.dragStart.y - pointer.y;
        const power = 0.15;
        this.scene.launchProjectile(this.x, this.y, dx * power, dy * power);
        this.scene.endTurn();
        this.physicsBody.applyForce({ x: -dx * 0.0001, y: -dy * 0.0001 });
    }

    takeDamage(amount) {
        this.hp -= amount;
        if (this.hp < 0) this.hp = 0;
        this.updateHPBar();
        this.bodySprite.setTint(0xff0000);
        this.scene.time.delayedCall(200, () => this.bodySprite.setTint(this.color));
        if (this.hp === 0) this.die();
    }

    die() {
        this.scene.handleExplosion(this.x, this.y);
        this.scene.matter.world.remove(this.body);
        this.destroy();
    }
}

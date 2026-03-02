export class Player extends Phaser.GameObjects.Container {
    constructor(scene, x, y, team, color) {
        super(scene, x, y);
        this.scene = scene;
        this.team = team;
        this.color = color;
        this.hp = 100;
        this.isActive = false;

        this.bodySprite = scene.add.sprite(0, 0, 'player').setTint(color);
        this.add(this.bodySprite);

        this.hpBar = scene.add.graphics();
        this.updateHPBar();
        this.add(this.hpBar);

        scene.add.existing(this);
        this.physicsBody = scene.matter.add.gameObject(this, {
            shape: 'circle', radius: 16, friction: 0.5, restitution: 0.1, label: 'player'
        });

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
        this.hpBar.fillRect(-20, -30, 40, 6);
        this.hpBar.fillStyle(this.hp > 30 ? 0x00ff00 : 0xff0000, 1);
        this.hpBar.fillRect(-20, -30, 40 * (this.hp / 100), 6);
    }

    updateTrajectory(pointer) {
        this.trajectoryLine.clear();
        const dx = this.dragStart.x - pointer.x;
        const dy = this.dragStart.y - pointer.y;

        this.trajectoryLine.lineStyle(2, this.color, 0.8);
        let tx = this.x;
        let ty = this.y;
        let vx = dx * 0.15;
        let vy = dy * 0.15;
        const gravity = this.scene.matter.world.localWorld.gravity.y * 0.1;

        this.trajectoryLine.beginPath();
        this.trajectoryLine.moveTo(tx, ty);
        for (let i = 0; i < 20; i++) {
            tx += vx; ty += vy; vy += gravity;
            this.trajectoryLine.lineTo(tx, ty);
        }
        this.trajectoryLine.strokePath();
    }

    shoot(pointer) {
        this.isDragging = false;
        this.trajectoryLine.clear();
        const dx = this.dragStart.x - pointer.x;
        const dy = this.dragStart.y - pointer.y;
        this.scene.launchProjectile(this.x, this.y, dx * 0.15, dy * 0.15);
        this.scene.endTurn();
    }

    takeDamage(amount) {
        this.hp -= amount;
        this.updateHPBar();
        if (this.hp <= 0) this.die();
    }

    die() {
        if (!this.active) return;
        this.scene.matter.world.remove(this.body);
        this.destroy();
    }
}

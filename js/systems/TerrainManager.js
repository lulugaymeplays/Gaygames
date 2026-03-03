export class TerrainManager {
    constructor(scene) {
        this.scene = scene;
        this.blockSize = 16;
        this.blocks = [];
    }

    generate() {
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;
        const groundLevel = height - 120;
        for (let x = 0; x < width; x += this.blockSize) {
            const h1 = Math.sin(x * 0.005) * 60;
            const h2 = Math.sin(x * 0.02) * 20;
            const h = h1 + h2 + groundLevel;
            for (let y = h; y < height; y += this.blockSize) {
                const block = this.scene.matter.add.image(x + this.blockSize / 2, y + this.blockSize / 2, 'ground', null, {
                    isStatic: true,
                    label: 'terrain',
                    friction: 0.9,
                    restitution: 0
                });
                block.setDisplaySize(this.blockSize, this.blockSize);
                this.blocks.push(block);
            }
        }
    }

    explode(x, y, radius) {
        for (let i = this.blocks.length - 1; i >= 0; i--) {
            const block = this.blocks[i];
            if (!block) continue;
            const dist = Phaser.Math.Distance.Between(x, y, block.x, block.y);
            if (dist < radius) {
                block.destroy();
                this.blocks.splice(i, 1);
            }
        }
    }
}

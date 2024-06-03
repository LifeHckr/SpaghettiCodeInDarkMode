class Pickup extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, frame, rand) {
        super(scene, x, y, texture, frame);
        this.rand = rand;
        this.scene = scene;
        scene.add.existing(this);

        this.pickItem();
        return this;
    }
    pool = {
        0: {
            weight: 1,
            name: "nothing",
            func: () => {
               this.destroy();
            },
        },
        1: {
            weight: .75,
            name: "key",
            func: () => {
                this.setTexture("texturesAtlas", 'tile_0027.png');
                this.setScale(SCALE);
                this.scene.physics.world.enable(this, Phaser.Physics.Arcade.STATIC_BODY);
                this.scene.keyGroup.add(this);
            },
        },
        2: {
            weight: .25,
            name: "Chest",
            func: () => {
                let newTreasure = new Sign(this.scene, this.x, this.y, "kenny-chest", undefined, null, "chest");
                this.destroy();
            },
        }
    }
    totalItems = 3;
    pickItem() {
        let itemWeight = this.rand.frac();
        let item = this.pool[this.rand.integerInRange(0, this.totalItems - 1)];
        while (item.weight < itemWeight) {
            item = this.pool[this.rand.integerInRange(0, this.totalItems - 1)];
        }
        item.func();
    }
}
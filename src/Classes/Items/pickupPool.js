class PickupPool extends Phaser.GameObjects.Sprite {
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
            weight: .4,
            name: "key",
            func: () => {
                this.setTexture("texturesAtlas", 'tile_0027.png');
                this.setScale(SCALE);
                this.scene.physics.world.enable(this, Phaser.Physics.Arcade.STATIC_BODY);
                this.scene.keyGroup.add(this);
            },
        },
        2: {
            weight: .20,
            name: "Chest",
            func: () => {
                let newTreasure = new Sign(this.scene, this.x, this.y, "kenny-chest", undefined, null, "chest");
                this.destroy();
            },
        },
        3: {
            weight: .5,
            name: "ammo",
            func: () => {
                let newAmmo = new Ammo(this.scene, this.x, this.y, "kenny-cheese");
                this.destroy();
            },
        },
        4: {
            weight: .4,
            name: "slice",
            func: () => {
                let newAmmo = new pizzaSlice(this.scene, this.x, this.y, "kenny-pizza");
                this.destroy();
            },
        }
    }
    totalItems = 5;
    pickItem() {
        let itemWeight = this.rand.frac();
        let item = this.pool[this.rand.integerInRange(0, this.totalItems - 1)];
        while (item.weight < itemWeight) {
            item = this.pool[this.rand.integerInRange(0, this.totalItems - 1)];
        }
        if (game.config.physics.arcade.debug) {
            let d = new Date();
            my.log.push({
                message: "DB: Pickup Creation",
                timeStamp: d.toLocaleTimeString(undefined, {hour: "2-digit", minute: "2-digit", second: "2-digit"}) + `.${d.getMilliseconds()}`,
                item: item.name,
                currentWeight: itemWeight,
                x: this.x,
                y: this.y
            });
        }
        item.func();
    }
}
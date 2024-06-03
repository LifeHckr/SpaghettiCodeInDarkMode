class PickupItem extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame);
        this.scene = scene;
        this.setScale(SCALE);
        scene.add.existing(this);
        scene.physics.world.enable(this, Phaser.Physics.Arcade.STATIC_BODY);

        //add overlap overlap
        this.addOverlap();
        scene.physics.add.overlap(scene.playerGroup, this, (obj1, obj2) => {
            if (obj1.gun.currentAmmo < obj1.maxAmmo) {
                obj1.gun.reloadBullet(1);
                obj2.destroy();
            }
        });
        return this;
    }

    addOverlap() {
        this.scene.physics.add.overlap(this.scene.playerGroup, this, (obj1, obj2) => {
           console.log("Base overlap, should be replaced.")
        });
    }
}


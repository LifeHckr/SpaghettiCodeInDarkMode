class Gun extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame);

        this.setOrigin(0, 1);


        this.scene.add.existing(this);
        return this;
    }
}
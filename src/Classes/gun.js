class Gun extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, frame, followBody) {
        super(scene, x, y, texture, frame);
        this.followBody = followBody;

        this.setOrigin(0, .5);
        this.target = 0;

        //Mouse move listener
        this.scene.input.on('pointermove', (pointer) => {
            this.target = Phaser.Math.Angle.Between(this.x, this.y, pointer.worldX, pointer.worldY);
            
        });

        this.scene.add.existing(this);
        return this;
    }

    update() {
        this.x = this.followBody.center.x;
        this.y = this.followBody.center.y;

        this.rotation = this.target;
        this.flipY = Math.abs(this.target) > Math.PI/2;
    }
}

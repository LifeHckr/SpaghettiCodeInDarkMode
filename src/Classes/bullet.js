class Bullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, frame, speed = 300) {        
        super(scene, x, y, texture, frame);
        this.scene = scene;
        this.speed = speed;
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.visible = false;
        this.active = false;
        this.body.setAllowGravity(false);
        
        scene.physics.add.collider(this, scene.collidesTrue, () => {
            this.makeInactive();

        });
        return this;
    }

    update() {
    }

    fire(trajectoryVector, pos) {
        this.makeActive();
        this.x = pos.x;
        this.y = pos.y;
        this.body.setVelocity(trajectoryVector.x * -1 * this.speed, trajectoryVector.y * -1 * this.speed);
    }

    makeActive() {
        this.visible = true;
        this.active = true;
    }

    makeInactive() {
        this.body.setVelocity(0, 0);
        this.x = -9000;
        this.y = -9000;
        this.visible = false;
        this.active = false;
        this.destroy();
    }

}
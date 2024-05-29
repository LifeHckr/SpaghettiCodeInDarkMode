class Bullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, frame) {        
        super(scene, x, y, texture, frame);
        this.visible = false;
        this.active = false;
        this.scene = scene;
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.body.gravity.y = -this.scene.physics.world.gravity.y;
        scene.mapCollider = scene.physics.add.collider(this, scene.collidesTrue);
        return this;
    }

    update() {
        if (this.active) {
            
            /*
            this.y -= this.speed;
            if (this.y < -(this.displayHeight/2)) {
                this.makeInactive();
            }
            */
        }
    }

    fire(pointerX, pointerY) {
        this.body.setVelocity((pointerX - this.x) * 3.5, (pointerY - this.y) * 3.5);
    }

    makeActive() {
        this.visible = true;
        this.active = true;
    }

    makeInactive() {
        this.visible = false;
        this.active = false;
    }

}
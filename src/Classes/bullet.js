class Bullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, frame, speed = 500, damage = 1) {
        super(scene, x, y, texture, frame);
        this.scene = scene;
        this.speed = speed;
        this.damage = damage;
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.body.setAllowGravity(false);
        
        scene.physics.add.collider(this, scene.collidesTrue, () => {
            this.makeInactive();
        });

        scene.physics.add.overlap(this, scene.enemygroup, (bullet, enemy) => {
            enemy.doDamage(this.damage);
            bullet.destroy();
        });

        return this;
    }

    update() {
    }

    fire(trajectoryVector, pos, damage) {
        this.makeActive();
        this.damage = damage;
        this.x = pos.x;
        this.y = pos.y;
        this.body.setVelocity(trajectoryVector.x * -1 * this.speed, trajectoryVector.y * -1 * this.speed);
    }

    makeActive() {
        this.visible = true;
        this.active = true;
    }

    makeInactive() {
        this.destroy();
    }

}
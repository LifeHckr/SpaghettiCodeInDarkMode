class EnemyTemplate extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame);

        this.scene = scene;
        this.visible = true;
        this.active = true;
        this.setDepth(1);
        this.scale = SCALE;
        this.state = "idle";
        this.canJump = true;
        this.moving = false;

        this.dashKillable = false;

        //The amount of time that should be taken off the player when hit
        this.hitTime = 10;

        //the amount of hp that the enemy has
        this.hp = 5;

        scene.add.existing(this);
        scene.physics.world.enable(this, Phaser.Physics.Arcade.DYNAMIC_BODY);
        this.body.setAllowGravity(false);
        this.setMaxVelocity(1200, 1200);


        //Player Collision handling
        scene.physics.add.overlap(scene.playerGroup, this, (obj1, obj2) => {

            //kill enemy and dont knock back
            if (this.dashKillable && obj1.running > 1) {
                obj2.death();
                return;
            }

            //Only kill if running and do particles
            if (!obj1.hitStun) {
                //Push player away, first remove current momentum, and set flag
                obj1.body.setAccelerationX(0);
                obj1.hitStun = true;
                scene.time.delayedCall(
                    1000,                // ms
                    () => {
                        obj1.hitStun = false;
                    });
                obj1.knockback = true;
                obj1.running = 1;
                obj1.setAngularVelocity(0);
                //Determine knockback vector
                if (obj1.x < obj2.x) {
                    obj1.body.setVelocity(-900, -600);
                } else {
                    obj1.body.setVelocity(900, -600);
                }
                //Give player a nudge to slowdown a bit
                obj1.body.setDragX(scene.sprite.player.DRAG);
                obj1.body.setAccelerationY(10);
                scene.timer.time -= this.hitTime;
                scene.sound.play("bwah", {rate: 1.5, detune: 200});
                //Either remove knockback after timer or on grounded
                scene.time.delayedCall(
                    475,                // ms
                    () => {
                        scene.sprite.player.knockback = false;
                    });
                this.scene.cameras.main.shake(75, 0.01);
                this.scene.cameras.main.setZoom(game.config.width / 1200 * 1.20 + 0.2, game.config.height / 700 * 1.20 + 0.2);
                this.scene.cameras.main.zoomTo(game.config.width / 1200 * 1.20, 500);
            }
        });

        //Enemy Collision handling
        this.mapCollider = scene.physics.add.collider(this, scene.collidesTrue);

        //Enemy OneWay handling
        this.extraCollider = scene.physics.add.collider(this, scene.oneWays, null, function (enemy, tile) {
            return((enemy.body.y + enemy.displayHeight/2 - 5) <= (tile.layer.tilemapLayer.tileToWorldY(tile.y)));
        });

        return this;
    }

    doDamage(damage) {
        this.hp -= damage;
        if (this.hp <= 0) {
            this.death();
        }
    }

    death() {
        this.scene.add.particles(this.x, this.y, 'x', {
            angle: {min: 0, max: 360},
            gravityY: 600,
            delay: 10,
            speed: 100,
            lifespan: 300,
            quantity: 10,
            scale: {start: 2, end: 0},
            emitting: true,
            emitZone: {type: 'random', source: this, quantity: 10, scale: {start: 2, end: 0}},
            duration: 10
        });
        let newPickup = new PickupPool(this.scene, this.x, this.y, null, null, this.scene.levelMap.rand);
        this.scene.sound.play("bwah");
        this.visible = false;
        this.active = false;
        this.destroy();
    }
}
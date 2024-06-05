class Blind extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame);
        this.scene = scene;
        this.visible = true;
        this.active = true;
        this.setDepth(0);
        this.scale = SCALE;
        this.hp = 2;
        this.state = "idle";
        this.speed = 300;
        this.jumpSpeed = -500;
        this.canJump = true;

        this.lastFacing = enumList.LEFT;
        this.changes = 0;
        this.signals = scene.events;
        this.noiseListen = false;
        this.BASERANGE = 200;
        this.activeRange = this.BASERANGE;
        this.noiseRange = this.BASERANGE * 2;


        scene.add.existing(this);
        scene.physics.world.enable(this, Phaser.Physics.Arcade.DYNAMIC_BODY);
        this.body.setAllowGravity(true);
        this.setMaxVelocity(600, 600);
        this.body.setSize(this.displayWidth/3, this.displayHeight/3, true);
        this.body.setOffset(4.5, 7);

        //enemyoverlap
        scene.physics.add.overlap(scene.playerGroup, this, (obj1, obj2) => {
            //Only kill if running and do particles
            if (obj1.running > 1) {
                obj2.death();
                //Dont reknockback, invince frames
            } else if (!obj1.hitStun) {
                //Push player away, first remove current momentum, and set flag
                obj1.body.setAccelerationX(0);
                obj1.hitStun = true;
                scene.time.delayedCall(
                    1000,                // ms
                    ()=>{
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
                scene.timer.time -= 3;
                scene.sound.play("bwah", { rate: 1.5, detune: 200});
                //Either remove knockback after timer or on grounded
                scene.time.delayedCall(
                    475,                // ms
                    ()=>{
                        scene.sprite.player.knockback = false;
                });
                this.scene.cameras.main.shake(75, 0.01);
                this.scene.cameras.main.setZoom(game.config.width/1200 * 1.20 + 0.2, game.config.height/700 * 1.20 + 0.2);
                this.scene.cameras.main.zoomTo(game.config.width/1200 * 1.20, 500);
            }
        });
        //enemyOverlap--------------------------------------------

        //PlayerCollisions
        this.mapCollider = scene.physics.add.collider(this, scene.collidesTrue);
        //LockWallcollider
        this.lockWallCollider = scene.physics.add.collider(this, scene.lockWallGroup);
        //OneWayCollisions- Checks if player is sufficiently above a one way to enable
        this.extraCollider = scene.physics.add.collider(this, scene.oneWays, null, function (obj1, tile) {
            return((obj1.y + obj1.displayHeight/3) <= (tile.layer.tilemapLayer.tileToWorldY(tile.y)));
        });

        //Check Timer
        this.listen = this.scene.time.addEvent({
            delay: 500,
            repeat: -1,
            callback: () => {
                if (!this.noiseListen) {
                    this.checkNearby(this.scene.sprite.player);
                }
            }
        });
        //Noise timer
        this.noiseTimer = this.scene.time.addEvent({
            paused: true,
            delay: 1,                // ms
            callback: ()=>{
            this.noiseListen = false;
        }});

        this.signals.on("noise", (noiseMaker) => {
            if (this.active) {
                this.checkNoise(noiseMaker);
            }
        });

        return this;
    }

    update() {


        if (this.state === "chase") {
            let dif = this.scene.sprite.player.x - this.body.x;
            this.facing = Math.sign(dif);
            if (Math.abs(dif) < 10) {
                this.facing = 0;
            }
            this.body.setVelocityX(this.facing * this.speed);
            if (this.scene.sprite.player.y < this.y && this.canJump) {
                this.body.setVelocityY(this.jumpSpeed);
                this.canJump = false;
            }
        }

        if (this.body.blocked.down) {
            this.canJump = true;
        }

        this.changeDir(this.facing !== enumList.LEFT);

        if (this.noiseListen && this.noiseTimer.getRemaining() == 0) {
            this.transitionState(this.state, "idle");
            this.noiseTimer.paused = true;
        }
    }

    transitionState(cur, next) {
        if (next === "chase") {
            if (cur === "idle") {
                this.state = "chase";
                this.anims.play('blindWalk');
                this.activeRange = this.BASERANGE * 2.5;
                this.noiseRange = this.BASERANGE * 3;
            }
        } else if (next === "idle") {
            if (cur === "chase") {
                this.state = "idle";
                this.noiseListen = false;
                this.anims.play('blindIdle');
                this.body.setVelocityX(0);
            } else if (cur === "idle") {
                this.activeRange = this.BASERANGE;
                this.noiseRange = this.BASERANGE * 2;
            }

        }
    }

    changeDir(bool) {
        if (this.changes < 5) {
            this.setFlip(bool, false);
            if (this.lastFacing !== this.facing) {
                this.changes++;
                this.scene.time.delayedCall(
                    334,                // ms
                    () => {
                        this.changes = 0;
                    }
                );
            }
            this.lastFacing = this.facing;
        }
    }

    doDamage(damage) {
        this.hp -= damage;
        if (this.hp <= 0) {
            this.death();
        }
    }

    death() {
        delete this.listen;
        this.noiseTimer.remove();
        delete this.listen;
        this.scene.add.particles(this.x, this.y, 'x', {
            angle: { min: 0, max: 360 },
            gravityY: 600,
            delay: 10,
            speed: 100,
            lifespan: 300,
            quantity: 10,
            scale: { start: 2, end: 0 },
            emitting: true,
            emitZone: { type: 'random', source: this, quantity:10, scale: { start: 2, end: 0 } },
            duration: 10
        });
        let newPickup = new PickupPool(this.scene, this.x, this.y, null, null, this.scene.levelMap.rand);
        this.scene.sound.play("bwah");
        this.visible = false;
        this.active = false;
        this.destroy();
    }

    checkNearby() {
        if (Phaser.Math.Distance.Between(this.scene.sprite.player.x, this.scene.sprite.player.y, this.x, this.y) <= this.activeRange && this.scene.sprite.player.body.velocity.x !== 0) {
            this.transitionState(this.state, "chase");
        } else {
            this.transitionState(this.state, "idle");
        }
    }

    checkNoise(noiseMaker) {
        if (Phaser.Math.Distance.Between(noiseMaker.x, noiseMaker.y, this.x, this.y) <= this.noiseRange) {
            this.transitionState(this.state, "chase");
            this.noiseListen = true;
            this.noiseTimer.reset({
                delay: 1500
            });
        } else {
            this.transitionState(this.state, "idle");
        }
    }
}
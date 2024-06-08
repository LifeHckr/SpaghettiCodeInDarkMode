class BlindEnemy extends EnemyTemplate {
    constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame);

        this.lastFacing = enumList.LEFT;
        this.changes = 0;
        this.signals = scene.events;
        this.noiseListen = false;
        this.BASERANGE = 200;
        this.activeRange = this.BASERANGE;
        this.noiseRange = this.BASERANGE * 2;

        this.body.setAllowGravity(true);

        this.speed = 300;
        this.acceleration = 1;
        this.jumpSpeed = -500;
        this.hp = 2;

        this.body.setSize(this.displayWidth / 3, this.displayHeight / 3, true);
        this.body.setOffset(4.5, 7);
        this.searchLength = 1500;
        this.name = "blind";

        //Check Timer
        this.listen = this.scene.time.addEvent({
            delay: 600,
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
            callback: () => {
                this.noiseListen = false;
            }
        });

        this.signals.on("noise", (noiseMaker) => {
            if (this.active) {
                this.checkNoise(noiseMaker);
            }
        });

        return this;
    }

    update() {


        if (this.state !== "idle" && this.noiseListen) {
            let dif = this.scene.sprite.player.x - this.body.x;

            if (!this.moving || this.facing !== Math.sign(dif)) {
                this.moving = true;
                this.facing = Math.sign(dif);
                if (Math.abs(dif) < 10) {
                    this.facing = 0;
                }
                this.body.setVelocityX(this.facing * this.speed);
            }
            this.body.setAccelerationX(this.facing * this.acceleration);
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
                this.anims.play(this.name + 'Walk');
                this.activeRange = this.BASERANGE * 2.5;
                this.noiseRange = this.BASERANGE * 3;
            }
        } else if (next === "idle") {
            if (cur === "chase") {
                this.state = "idle";
            } else if (cur === "idle") {
                this.anims.play(this.name + 'Idle');
                this.body.setVelocityX(0);
                this.body.setAccelerationX(0);
                this.moving = false;
                this.noiseListen = false;
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

    death() {
        this.listen.remove();
        this.noiseTimer.remove();
        delete this.listen;
        super.death();
    }

    checkNearby() {
        if (Phaser.Math.Distance.Between(this.scene.sprite.player.x, this.scene.sprite.player.y, this.x, this.y) <= this.activeRange && this.scene.sprite.player.body.velocity.x !== 0) {
            this.transitionState(this.state, "chase");
            this.noiseListen = true;
            this.noiseTimer.reset({
                delay: this.searchLength
            });
        } else {
            this.transitionState(this.state, "idle");
        }
    }

    checkNoise(noiseMaker) {
        if (Phaser.Math.Distance.Between(noiseMaker.x, noiseMaker.y, this.x, this.y) <= this.noiseRange) {
            this.transitionState(this.state, "chase");
            this.noiseListen = true;
            this.noiseTimer.reset({
                delay: this.searchLength
            });
        } else {
            this.transitionState(this.state, "idle");
        }
    }
}
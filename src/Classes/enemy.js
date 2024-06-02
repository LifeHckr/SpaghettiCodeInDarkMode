class Enemy extends Phaser.GameObjects.PathFollower {
    constructor(scene, x, y, texture, frame, duration = 4000, pathLength = 500, periods = 4, amplitude = 60, type = 'sine') {        
        super(scene, 'Path', x, y, texture, frame);
        this.visible = true;
        this.active = true;
        this.setDepth(0);
        this.scale = SCALE;
        


        this.startFollowOBJ1 = {
            
            from: 0,
            to: 1,
            delay: 0,
            duration: duration,
            ease: 'Quadratic',
            repeat: -1,
            yoyo: true,
            
            onYoyo: () => {
                this.changeDir();
            },
            onRepeat:  () => {
                this.changeDir();
            }
            
        };

        this.points1 = [];//original this.x, this.y, this.x - 216, this.y
        if (type = 'sine') {
            this.buildSinePath(this.points1, pathLength, periods, amplitude, this.x, this.y);
        }
        this.curve1 = new Phaser.Curves.Spline(this.points1);
        this.setPath(this.curve1);
        this.startFollow(this.startFollowOBJ1);

        scene.add.existing(this);
        scene.physics.world.enable(this, Phaser.Physics.Arcade.DYNAMIC_BODY);
        this.body.setAllowGravity(false);
        this.body.setSize(this.displayWidth/3, this.displayHeight/3);
        this.anims.play("enemyFly");

    //enemyoverlap
        scene.physics.add.overlap(scene.playerGroup, this, (obj1, obj2) => {
            //Only kill if running and do particles
            if (obj1.running > 1) {
                scene.add.particles(obj2.x, obj2.y, 'x', { 
                    angle: { min: 0, max: 360 },
                    gravityY: 600,
                    delay: 10,
                    speed: 100,
                    lifespan: 300,
                    quantity: 10,
                    scale: { start: 2, end: 0 },
                    emitting: true,
                    emitZone: { type: 'random', source: scene.sprite.player, quantity:10, scale: { start: 2, end: 0 } },
                    duration: 10
                });
                scene.sound.play("bwah");
                obj2.destroy();
            //Dont reknockback, invince frames
            } else if (!obj1.knockback) {
                //Push player away, first remove current momentum, and set flag
                obj1.body.setAccelerationX(0);
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

        return this;
    }

    update() {
    }

    changeDir() {
        if (this.facing == enumList.LEFT) {
            this.facing = enumList.RIGHT;
            this.setFlip(true, false);
        } else {
            this.facing = enumList.LEFT;
            this.resetFlip();
        }
    }


    selfEnd() {
        this.stopFollow();
        this.active =  false;
        this.destroy();
    }

    //Approximate a sine curve, takes steps at 1/8 period
    buildSinePath(array, length, numPeriods, amplitude, startX, startY) {
        /*for(let i = 0; i < length; i += length/numPeriods/8) {
            array.push(startX - i);
            array.push(Math.min(amplitude * Math.sin(((i*Math.PI)/(length/numPeriods*.5)) + (Math.PI * .5)) + startY, startY));         
       }*/
       for (let i = 0; i<numPeriods; i++) {
            //Start
            array.push(startX - i*length/numPeriods);
            array.push(startY);

            array.push(startX - i*length/numPeriods - length/numPeriods/8);
            array.push(startY);

            array.push(startX - i*length/numPeriods - 2*length/numPeriods/8);
            array.push(startY);

            array.push(startX - i*length/numPeriods - 3*length/numPeriods/8);
            array.push(startY - amplitude/1.4);

            //1/2 period at peak
            array.push(startX - i*length/numPeriods - 4*length/numPeriods/8);
            array.push(startY - amplitude);

            array.push(startX - i*length/numPeriods - 5*length/numPeriods/8);
            array.push(startY - amplitude/1.4);

            array.push(startX - i*length/numPeriods - 6*length/numPeriods/8);
            array.push(startY);

            array.push(startX - i*length/numPeriods - 7*length/numPeriods/8);
            array.push(startY);
            //And repeat
       }
    }
}
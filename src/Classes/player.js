class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame);
        this.setScale(SCALE);
        this.scene = scene;

        scene.add.existing(this);
        scene.physics.add.existing(this);

        //Init Vars
        this.ACCELERATION = 80;
        this.DRAG = 1500;    // DRAG < ACCELERATION = icy slide
        this.RUNTHRESHOLD = 500;
        this.RUNMULTI = 3;
        this.STARTVELOCITY = 300;
        this.MAXVELOCITYX = 1000;
        this.MAXVELOCITYY = 1000;
        this.JUMP_VELOCITY = -650;
        this.TEMP_JUMPVELOCITY = -1975;
        this.DASHVELOCITY = 2000;
        this.DASHLENGTH = 600; //in ms
        this.FRAMEFUDGE = game.config.physics.arcade.fps / 30;//I wanted to get 60 & 30 fps to work

        //States
        this.moving = false; //is player "moving"
        this.running = 1;//running acceleration multiplyer, running should always be >1
        this.facing = enumList.RIGHT;//direction facing
        this.air = enumList.GROUNDED; //GROUNDED, INAIR, NOJUMP, or JUMPING
        this.animating = false;//is player doing change direction animation, dont use
        this.signTouch = false;//false = init, otherwise is last touched sign
        this.knockback = false;//is player under enemy knockback
        this.bumpTimed = false;//did the player bonk

        //Physics Set up
        this.setCollideWorldBounds(true);
        this.body.setMaxVelocity(this.MAXVELOCITYX, this.MAXVELOCITYY);



        return this;
    }

    update() {

//SCHMOOVEMENT
    //Stop if animating/knocking
        if (this.animating || this.knockback) {
            
    //Explicit behaviour for both pressed and no press
        } else if ((cursors.left.isDown || my.keyA.isDown) == (cursors.right.isDown || my.keyD.isDown)) {
                    
            //Set drag and determine if player is still "moving" this is the soul of crazy jumps
            this.body.setAccelerationX(0);
            this.body.setDragX(this.DRAG*1.5);
            if (this.air != enumList.GROUNDED) {
                this.body.setDragX(this.DRAG * 1.25);
            }
            if (this.body.deltaAbsX() < (20/this.FRAMEFUDGE) && this.air == enumList.GROUNDED) {
                this.moving = false;
            } else if (this.body.deltaAbsX() < (10/this.FRAMEFUDGE) && this.air != enumList.GROUNDED) {
                this.moving = false;
            }
    //Do horizontal movement
        } else {
            //LeftMove
            if(cursors.left.isDown || my.keyA.isDown) {
                this.doRizMove(enumList.LEFT);
            
            }
            //RightMove
            if(cursors.right.isDown || my.keyD.isDown) {
                this.doRizMove(enumList.RIGHT);
                
            }
            this.moving = true;

        //If a player got stopped while running, only remove running if they continue to be slow
            if (this.running > 1 && Math.abs(this.body.velocity.x) <= this.RUNTHRESHOLD) {
                if (!this.bumpTimed) {
                    this.bumpTimed = true;
                    this.bumpTime = this.scene.time.addEvent({
                        delay: 100,                // ms
                        callback: () =>  {
                            if (this.body.blocked.right || this.body.blocked.left) {
                                this.running = 1;
                                this.anims.play('idle');
                                }
                            this.bumpTimed = false;
                        },
                    });
                }
            }
        } 

//DASHMOVE
        if(Phaser.Input.Keyboard.JustDown(my.keyE)) {
            if (this.running > 1 && !this.knockback) {
                this.doDash();
            }
        }
        
// PLAYER JUMP
    // note that we need body.blocked rather than body.touching b/c the former applies to tilemap tiles and the latter to the "ground"
        //Afraid to remove this, because it doesnt need to be here
        if (this.animating) {
            
        //Player is not blocked below
        } else if(!this.body.blocked.down) {
            if (this.running > 1) {
                this.anims.play('fastJump');
            } else {
                this.anims.play('jump');
            }
        //Set timer for Coyote time if player was just on ground
            if (this.air == enumList.GROUNDED) {
                this.coyoteTimer = this.scene.time.delayedCall(
                    134,                // ms
                    ()=>{
                        this.air = enumList.NOJUMP
                    }
                );
        //Reset y momentum if in air
            } else if (this.air == enumList.INAIR || this.air == enumList.NOJUMP) {
                this.body.setAccelerationY(0);
                    
            }
                
        }
    
    //Simple case, player is "on ground," set to grounded
        if(this.body.blocked.down) {
        //If player was just in air play fall tween
            if (this.running > 1) {
                this.anims.play('fast');
            } else {
                this.anims.play('idle');
            }
            if (this.air != enumList.GROUNDED) {
            //Fall Tween
                if (this.body.deltaAbsY() > 15) {
                    this.scene.sound.play("landSound", {mute: false, volume: .5, rate: 1.5, detune: -600});
                    //More squish when landing from a slightly higher height
                    //Also funny stuff to keep the hitbox from deforming
                    this.scene.tweens.add({
                        onUpdate: () => {this.setBodySize(24 *(SCALE/this.scaleX), 24*(SCALE/this.scaleY))},
                        targets     : this,
                        scaleY      : 1.3,
                        ease        : 'Quart.Out',
                        duration    : 100,
                        yoyo: true,
                        onYoyo: () => {true},
                        onComplete: () => {
                            this.setBodySize(24, 24); 
                            this.scale = SCALE;
                        },
                    });
                } else {
                    this.scene.tweens.add({
                        onUpdate: () => {this.setBodySize(24 *(SCALE/this.scaleX), 24*(SCALE/this.scaleY))},
                        targets     : this,
                        scaleY      : 1.5,
                        ease        : 'Quart.Out',
                        duration    : 100,
                        yoyo: true,
                        onYoyo: () => {true},
                        onComplete: () => {
                            this.setBodySize(24, 24); 
                            this.scale = SCALE;
                        },
                    }); 
                }
    
            }
            this.air = enumList.GROUNDED;
            //this.knockback = false;
            //this.doubleJump = true; 
        }
    
//Jump
        //Disable if knockback
        if (this.knockback) {
    
        //As long as a jump is left accept key press
        } else if((this.air != enumList.NOJUMP /*|| this.doubleJump*/) && (cursors.up.isDown||my.keySpace.isDown)) {
            //If player was just grounded, set to in air, set up velocity, and play anims
            if (this.air == enumList.GROUNDED) {
                this.scene.sound.play("landSound", {mute: false, volume: .75, rate: .5});
                this.air = enumList.INAIR;
                this.body.setVelocityY(this.JUMP_VELOCITY);
    
            //jump particle
                this.scene.add.particles(this.x, this.y+this.displayHeight/1.9, 'particle', { 
                    angle: { min: 0, max: 360 },
                    radial: true,
                    delay: 10,
                    active: true,
                    speed: 100,
                    lifespan: 200,
                    quantity: 7,
                    scale: { start: 1, end: 0 },
                    emitting: true,
                    emitZone: { type: 'random', source: this, quantity:20 },
                    duration: 10,
                });
    
            //Jump Tween
                this.scene.tweens.add({
                    onUpdate: () => {this.setBodySize(24 *(SCALE/this.scale), 24*(SCALE/this.scale))},
                    targets     : this,
                    scale      : 3,
                    ease        : 'Bounce.In',
                    duration    : 100,
                    yoyo: true,
                    onComplete: () => {
                        this.setBodySize(24, 24); 
                        this.scale = SCALE;
                    },
                });
                    
            //Give the player some leeway before disabling jump, for extra height
                this.sillyTime = this.scene.time.delayedCall(
                    130,                // ms
                    ()=>{
                        this.air = enumList.NOJUMP
                });
                    
            }
    
            //While player is jumping and has some sillytime left, nudge some height
            if (this.air == enumList.INAIR) {
                this.body.setAccelerationY(this.TEMP_JUMPVELOCITY);
                
            }
        }
        this.body.setAllowGravity(!this.animating); //OH boi
//------------Base Movement--------------------------------------------------

//Dust Particles---------------------------------
        if (this.moving && this.air == enumList.GROUNDED && Math.abs(this.body.velocity.x) > 700) {
            //run particle
                this.scene.add.particles(this.x, this.y+this.displayHeight/1.9, 'particle', { 
                    active: true,
                    speedX: 100,
                    speedY: -40,
                    lifespan: (Math.abs(this.body.velocity.x)-500)/5,
                    quantity: 2,
                    rotate: { min: 160, max: 200 },
                    scale: { start: .5, end: 2 },
                    alpha: { start: .4, end: 0 },
                    emitting: true,
                    emitZone: { type: 'edge', source: this, quantity:2 },
                    duration: 10
                });
            }
//----------------------------------------------------

//Extra Checks------------------------

    //setAngularVelocity hack
        this.body.setAngularVelocity(this.body.velocity.x);

    /*Reset knockback once stable on ground --NAH--
         if (this.knockback && this.body.velocity.y == 0) {
            this.knockback = false;
        } */

    //Trigger Running - If over run threshold and not running
        if (!this.knockback && Math.abs(this.body.velocity.x) > this.RUNTHRESHOLD) {
            this.running = this.RUNMULTI;
            this.anims.play('fast');
        //Remove Running    
        } else if (Math.abs(this.body.velocity.x) < this.RUNTHRESHOLD) {
            if (this.air != enumList.GROUNDED) {
                this.anims.play('jump');
            } else {
                this.anims.play('idle');
            }
            
            this.running = 1;
        }
//------------------------------------------------------

    }

    //WIP
    doDash() {
        this.knockback = true;
        this.setAccelerationX(0);
        this.setMaxVelocity(this.RUNMULTI * this.MAXVELOCITYX, this.MAXVELOCITYY);
        let tempVec = new Phaser.Math.Vector2(1, (1 * (cursors.down.isDown || my.keyS.isDown)) - (1 * (cursors.up.isDown || my.keySpace.isDown))).normalize().setLength(Math.abs(this.body.velocity.x) * this.RUNMULTI); //Hi Thomas
        this.setVelocity(this.facing * tempVec.x, tempVec.y);

        this.scene.tweens.add({
            targets: this.body.velocity,
            duration: this.DASHLENGTH,                // ms
            x: this.facing * this.STARTVELOCITY,
            ease: 'Linear',
            onComplete: () => {   
                this.running = 1;
                this.setMaxVelocity(this.MAXVELOCITYX, this.MAXVELOCITYY);
                this.knockback = false;
            }
        });
    }

    doTurn() {
        /*Cases: 
        Player is running and not alreayd animating/turning: Do a speed turn (preserve more momentum)
        Player is not running or currently animating: Do a more lossy turn
        */
        if (this.running > 1 && !this.animating) {
            this.animating = true;
            this.scene.time.addEvent({
                delay: 100,                // ms
                callback: ()=>{
                    //Instead of specifically changing direction of momentum, orients it to current direction, should help prevent future issues
                    this.body.setVelocityX(.95*this.facing * Math.abs(this.body.velocity.x));
                    this.animating = false;
                    this.body.velocity.y += 69;
                },
                loop: false
            });
        } else {
            this.body.setVelocityX(.85*this.facing * Math.abs(this.body.velocity.x));
        }
    }

    //Do Horizontal movement
    doRizMove(moveDir) {
        //If the move direction is different than facing do a turn
        if (this.facing != moveDir && this.moving) {
            this.facing = moveDir;
            this.doTurn();
        //Else if current velo is < startVelo give starting velo
        }else if (Math.abs(this.body.velocity.x) <= Math.abs(this.STARTVELOCITY)) {
            this.facing = moveDir;
            this.body.setVelocityX(this.facing  * this.STARTVELOCITY);
        }
        //Finally apply accelration and correct flip
        this.body.setAccelerationX(this.facing * this.ACCELERATION * this.running);
        this.setFlip(moveDir == enumList.RIGHT, false); //facing left = default 
    }
}
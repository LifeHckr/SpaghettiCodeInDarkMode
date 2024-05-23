class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");
    }

    init() {
        // variables and settings
        this.scene = this;//I dont have to do this, but I didnt know how not to
        
        this.ACCELERATION = 80;
        this.DRAG = 1500;    // DRAG < ACCELERATION = icy slide
        this.RUNTHRESHOLD = 500;
        this.RUNMULTI = 3;
        this.STARTVELOCITY = 300;
        this.MAXVELOCITYX = 1000;
        this.MAXVELOCITYY = 1000;
        this.JUMP_VELOCITY = -650;
        this.TEMP_JUMPVELOCITY = -1975;
        this.FRAMEFUDGE = game.config.physics.arcade.fps / 30;//I wanted to get 60 & 30 fps to work
        
        this.physics.world.gravity.y = 1900;

        this.worldBoundsX = SCALE * 18 * (215); //scale = 2, 18 = width of tile, x = num tiles
        this.worldBoundsY = SCALE * 18 * (40);
        this.physics.world.setBounds(0, 0, this.worldBoundsX, this.worldBoundsY, 64, true, true, false, true);
        my.camera = this.cameras.main;
    }

    preload() {
        this.load.scenePlugin('AnimatedTiles', './lib/AnimatedTiles.js', 'animatedTiles', 'animatedTiles');   
    }

    create() {
//SPRITES------------------------------------------------------------
    //xMark for Signs
        my.sprite.xMark = this.add.sprite(0, 0, "x");
        my.sprite.xMark.scale = SCALE;
        my.sprite.xMark.visible =false;
        my.sprite.xMark.setDepth(1);
    //SignText
        my.signText = this.add.text(30, 70, 'Placeholder', { fontFamily: 'font1', fontSize: '32px', fill: '#000000', wordWrap: {width: 600},  stroke: '#FFFFFF', strokeThickness: 10});
        my.signText.setOrigin(.5, 0);
        my.signText.x = 600;
        my.signText.setScrollFactor(0);
        my.signText.visible = false;
        my.signText.setDepth(5);
    //HintText
        my.sprite.hintText = this.add.text(0, 0, 'A and D to move', { fontFamily: 'font1', fontSize: '42px', fill: '#FFFFFFF',  stroke: '#FFFFFF', strokeThickness: 10}).setOrigin(.5).setPosition(game.config.width/2, game.config.height - 160).setDepth(1).setAngle(-20);
        my.sprite.hintText.setScrollFactor(0);
    //signBoard       
        my.sprite.signBoard = this.add.sprite(600, 110, "sign");
        my.sprite.signBoard.angle = 180;
        my.sprite.signBoard.setDepth(4);
        my.sprite.signBoard.setScale(50, 15);
        my.sprite.signBoard.setScrollFactor(0);
        my.sprite.signBoard.visible = false;
    //Timer Text
        my.sprite.timerText = this.add.text(0, 0, '999', { fontFamily: 'font1', fontSize: '37px', fill: '#FFFFFFF', stroke: '#FFFFFF', strokeThickness: 10 }).setOrigin(1).setScrollFactor(0).setPosition(game.config.width - 121, 115).setDepth(2);
        //Timer vars
        my.timer = 999;
        my.timerTimer = this.time.addEvent({
            delay: 1000,  // approx 1 sec
            callback: () => {
                my.timer -= 1; 
            },
            loop: true,
            paused: true
        });
        
//----------------------------------------------------------------

//TILEMAP--------------------------------------------------------------
    //initMap
        this.map = this.add.tilemap("platformer-level-1", 18, 18, 45, 25);
        this.tileset = this.map.addTilesetImage("kenny_tilemap_packed", "tilemap_tiles");
    //groundLayer
        this.groundLayer = this.map.createLayer("Ground-n-Platforms", this.tileset, 0, 0);
        this.groundLayer.setScale(SCALE);
    //topLayer
        this.topLayer = this.map.createLayer("Above-Ground", this.tileset, 0, 0);
        this.topLayer.setScale(SCALE);
        this.topLayer.setAlpha(.8).setDepth(1);
        this.animatedTiles.init(this.map);
    //collision layer
        this.colLayer = this.map.createLayer("Collision-Layer", this.tileset, 0, 0);
        this.colLayer.setScale(SCALE);
        this.colLayer.setAlpha(0);
        this.colLayer.setCollisionByProperty({
            collides: true
        });
    //oneWay
        this.oneWLayer = this.map.createLayer("One-Layer", this.tileset, 0, 0);
        this.oneWLayer.setScale(SCALE);
        this.oneWLayer.setAlpha(0);
        this.oneWLayer.setCollisionByProperty({
            oneWay: true
        });
    //Background- have to change tileset before creating
        this.tileset = this.map.addTilesetImage("tilemap-backgrounds_packed", "background_tiles");
        this.botLayer = this.map.createLayer("Below-Ground", this.tileset, 0, 0);
        this.botLayer.setScale(5);
        this.botLayer.setDepth(-1);
        this.botLayer.setScrollFactor(.2);
    //Collection Layer------------------------------------------------------------------------
        //COINS
        my.coins = this.map.createFromObjects("Objects", {
            type: "coin",
            key: "coin"
        });
        my.coins.map((coin) => {
            coin.scale = SCALE;
            coin.x *= SCALE;
            coin.y *= SCALE;
            this.physics.world.enable(coin, Phaser.Physics.Arcade.STATIC_BODY);
            coin.play('coinTurn');
        });
        my.coinGroup = this.add.group(my.coins);

        //SIGNS
        my.signs = this.map.createFromObjects("Objects", {
            type: "sign",
            key: "sign"
        });
        my.signs.map((sign) => {
            sign.scale = SCALE;
            sign.x *= SCALE;
            sign.y *= SCALE;
            this.physics.world.enable(sign, Phaser.Physics.Arcade.STATIC_BODY);
        });
        my.signGroup = this.add.group(my.signs);

        //Player Spawn
        my.playerSpawn = this.map.createFromObjects("Objects", {
            type: "player",
            key: "coin"
        });
        my.playerSpawn.map((spawn) => {
            spawn.scale = SCALE;
            spawn.x *= SCALE;
            spawn.y *= SCALE;
            spawn.visible = false;

        });
        //Enemy
        my.enemygroup = this.add.group({
            classType: Enemy,
            maxSize: 100,
            // activate update calls
            runChildUpdate: true,
        });
        my.enemySpawn = this.map.createFromObjects("Objects", {
            type: "enemSpawn",
            key: "platformer_characters",
            frame: "tile_0024.png",
        });
        my.enemySpawn.map((enemy) => {
            enemy.scale = SCALE;
            enemy.x *= SCALE;
            enemy.y *= SCALE;

            let newEnemy = new Enemy(this, enemy.x, enemy.y, "platformer_characters", "tile_0024.png");
            newEnemy.facing = enumList.LEFT;
            newEnemy.anims.play("enemyFly");
            my.enemygroup.add(newEnemy);
            enemy.destroy();//Refactor possibility
        });
        //Water
        my.waterPool = this.map.createFromObjects("Objects", {
            type: "waterPool",
            key: ""
        });
        my.waterPool.map((water) => {
            water.scale = SCALE;
            water.x *= SCALE;
            water.y *= SCALE;
            water.displayHeight = 36;
            water.displayWidth = 180;
            water.visible = false;
            this.physics.world.enable(water, Phaser.Physics.Arcade.STATIC_BODY);
        });

    //-----------------------------------------------------------------------------
//-------------------------------------------------------------------------------------

// PlayerInit---------------------------------
        my.sprite.player = this.physics.add.sprite(my.playerSpawn[0].x, my.playerSpawn[0].y, "platformer_characters", "tile_0000.png").setScale(SCALE);
        my.sprite.player.body.setMaxVelocity(this.MAXVELOCITYX, this.MAXVELOCITYY);

        my.sprite.player.moving = false; //is player "moving"
        my.sprite.player.running = 1;//running acceleration multiplyer, running should always be >1
        my.sprite.player.facing = enumList.RIGHT;//direction facing
        my.sprite.player.air = enumList.GROUNDED; //GROUNDED, INAIR, NOJUMP, or JUMPING
        my.sprite.player.animating = false;//is player doing change direction animation, dont use
        my.sprite.player.signTouch = false;//false = init, otherwise is last touched sign
        my.sprite.player.knockback = false;//is player under enemy knockback
        my.sprite.player.bumpTimed = false;//did the player bonk
        //my.sprite.player.doubleJump = true; //egh
//PlayerCollisions
        my.sprite.player.setCollideWorldBounds(true);
        my.mapCollider = this.physics.add.collider(my.sprite.player, this.colLayer);
    //OneWayCollisions- Checks if player is sufficiently above a one way to enable
        my.extraCollider = this.physics.add.collider(my.sprite.player, this.oneWLayer, null, function (obj1, obj2) {
            return((obj1.y + obj1.displayHeight/2) <= (obj2.y*18*SCALE + 5));
        });
    //coinoverlap
        this.physics.add.overlap(my.sprite.player, my.coinGroup, (obj1, obj2) => {
            obj2.destroy();
            this.sound.play("jingle");
            let tempText = this.add.text(0, 0, 'Coin GET!!!', { fontFamily: 'font1', fontSize: '42px', fill: '#5ad28c',  stroke: '#FFFFFF', strokeThickness: 15}).setOrigin(.5).setPosition(game.config.width/2, game.config.height/2).setDepth(10).setAngle(20).setScrollFactor(0);
                this.tweens.add({
                    targets     : tempText,
                    alpha     : 0,
                    ease        : 'Cubic.In',
                    duration    : 2000,
            });
        });
    //signoverlap
        this.physics.add.overlap(my.sprite.player, my.signGroup, (obj1, obj2) => {
            my.sprite.player.signTouch = obj2;
            if (my.signTouchTimer == undefined) {
                my.signTouchTimer = this.time.addEvent({
                    delay: 100
                });
            } else {
                my.signTouchTimer.reset({delay: 100});
            }
        });
    //enemyoverlap
        this.physics.add.overlap(my.sprite.player, my.enemygroup, (obj1, obj2) => {
            //Only kill if running and do particles
            if (obj1.running > 1) {
                this.add.particles(obj2.x, obj2.y, 'x', { 
                    angle: { min: 0, max: 360 },
                    gravityY: 600,
                    delay: 10,
                    speed: 100,
                    lifespan: 300,
                    quantity: 10,
                    scale: { start: 2, end: 0 },
                    emitting: true,
                    emitZone: { type: 'random', source: my.sprite.player, quantity:10, scale: { start: 2, end: 0 } },
                    duration: 10
                });
                this.sound.play("bwah");
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
                obj1.body.setDragX(this.DRAG);
                obj1.body.setAccelerationY(10);
                my.timer -= 3;
                this.sound.play("bwah", { rate: 1.5, detune: 200});
                //Either remove knockback after timer or on grounded
                this.time.delayedCall(
                    475,                // ms
                    ()=>{
                        my.sprite.player.knockback = false;
                });
            }
        });
    //enemyOverlap--------------------------------------------
    //WaterOverlap
        this.physics.add.overlap(my.sprite.player, my.waterPool, (obj1, obj2) => {
            
            if (my.timerTimer) {
                this.sound.play("jingle");
                let tempText = this.add.text(0, 0, 'YOU WIN!!!', { fontFamily: 'font1', fontSize: '42px', fill: '#5ad28c',  stroke: '#FFFFFF', strokeThickness: 15}).setOrigin(.5).setPosition(game.config.width/2, game.config.height/2).setDepth(10).setAngle(-20).setScrollFactor(0);
                this.tweens.add({
                    targets     : tempText,
                    alpha     : 0,
                    ease        : 'Cubic.In',
                    duration    : 2000,
                });
                my.timerTimer.destroy();
                my.timerTimer = false;//:)
            }
            
        });
//-----------------------------------------------

// Controls
        cursors = this.input.keyboard.createCursorKeys();
        my.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        my.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        my.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        my.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    //debug key listener (assigned to D key)
        if (game.config.physics.arcade.debug) {
            this.input.keyboard.on('keydown-G', () => {
                my.sprite.player.setDepth(0);
                this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true
                this.physics.world.debugGraphic.clear()
            }, this);
            this.input.keyboard.on('keydown-L', () => {
                my.timer = 0;
                my.sprite.player.y = 0;
            }, this);
        }
        
    //Signbutton- Set signtext, toggle sign text visibility
        this.input.keyboard.on('keydown-X', () => {
            my.signText.text = my.sprite.player.signTouch.name;
            my.signText.visible = !my.signText.visible;
            my.sprite.signBoard.visible = !my.sprite.signBoard.visible;
        }, this);
//--------------------------------------

//Camera------------------------------------
        my.camera.startFollow(my.sprite.player, true, .1, .1);
        my.camera.width = game.config.width;
        my.camera.height = game.config.height;
        //doesnt work this.displayHeight = my.camera.height;
        //this.displayWidth = my.camera.Width;
        my.camera.setViewport(0, 0, game.config.width, game.config.height);
        my.camera.setBounds(0, 0, this.worldBoundsX, this.worldBoundsY);
        my.camera.setZoom(game.config.width/1200 * 1.20, game.config.height/700 * 1.20);
        //my.camera.setDeadzone(100, 100);
//-----------------------------------------

//Tweens---------------------------------

    //xMark grow/shrink, just constantly on, might technically be performance loss idk
        this.tweens.add({
            targets     : my.sprite.xMark,
            scale     : 1.5,
            ease        : 'Linear',
            duration    : 600,
            yoyo: true,
            repeat: -1
        });

    //Starting hint text tween, bouncy, also i assume this ends and gets destroyed when text does
        this.tweens.add({
            targets     : my.sprite.hintText,
            angle      : 20,
            ease        : 'Cubic.In',
            duration    : 500,
            repeat: -1,
            yoyo: true
        });
//---------------------------------------------
//Particles?------------------------------------
        
//-----------------------------------------------

//Start Musics Music Playback
        this.sound.play("jingle");
        this.time.delayedCall(
            734,                // ms
            ()=>{
                my.bgm.play({ loop:true, seek: 100, rate: 1});
            }
        )
        my.bgm.rateVar = 1;

//-------------------------------------    
    }

    update() {

//SCHMOOVEMENT
    //Stop if animating/knocking
        if (my.sprite.player.animating || my.sprite.player.knockback) {
        
    //Explicit behaviour for both pressed and no press
        } else if ((cursors.left.isDown || my.keyA.isDown) == (cursors.right.isDown || my.keyD.isDown)) {
        //If under runthreshold stop running
            if (Math.abs(my.sprite.player.body.velocity.x) < this.RUNTHRESHOLD) {
                if (my.sprite.player.air != enumList.GROUNDED) {
                    my.sprite.player.anims.play('jump');
                } else {
                    my.sprite.player.anims.play('idle');
                }
                
                my.sprite.player.running = 1;
            }
            
        //Set drag and determine if player is still "moving" this is the soul of crazy jumps
            my.sprite.player.body.setAccelerationX(0);
            my.sprite.player.body.setDragX(this.DRAG*1.5);
            if (my.sprite.player.air != enumList.GROUNDED) {
                my.sprite.player.body.setDragX(this.DRAG * 1.25);
            }
            if (my.sprite.player.body.deltaAbsX() < (20/this.FRAMEFUDGE) && my.sprite.player.air == enumList.GROUNDED) {
                my.sprite.player.moving = false;
            } else if (my.sprite.player.body.deltaAbsX() < (10/this.FRAMEFUDGE) && my.sprite.player.air != enumList.GROUNDED) {
                my.sprite.player.moving = false;
            }
    //Do horizontal movement
        } else {
        //LeftMove
            if(cursors.left.isDown || my.keyA.isDown) {
            //TurnLeft
                if (my.sprite.player.facing == enumList.RIGHT && my.sprite.player.moving) {
                    my.sprite.player.facing = enumList.LEFT;
                    if (my.sprite.player.running > 1 && !my.sprite.player.animating) {
                        my.sprite.player.animating = true;
                        this.time.addEvent({
                            delay: 100,                // ms
                            callback: ()=>{
                                my.sprite.player.body.setVelocityX(-.95*my.sprite.player.body.velocity.x);
                                my.sprite.player.animating = false;
                                my.sprite.player.body.velocity.y += 69;
                            },
                            loop: false
                        });
                    } else {
                        my.sprite.player.body.setVelocityX(-.85*my.sprite.player.body.velocity.x);
                    }
                }
            //Just Started moving, assert moving left, and minimum velocity, and housekeep
                if (!my.sprite.player.moving) {  
                    my.sprite.player.body.setVelocityX(-this.STARTVELOCITY);
                    my.sprite.player.facing = enumList.LEFT;                  
                }
                if (Math.abs(my.sprite.player.body.velocity.x) <= Math.abs(this.STARTVELOCITY)) {
                    my.sprite.player.body.setVelocityX(-this.STARTVELOCITY);
                }
                my.sprite.player.body.setAccelerationX(-this.ACCELERATION * my.sprite.player.running);
                my.sprite.player.resetFlip();
    
            }
        //RightMove
            if(cursors.right.isDown || my.keyD.isDown) {
            //TurnRight
                if (my.sprite.player.facing == enumList.LEFT && my.sprite.player.moving) {
                    my.sprite.player.facing = enumList.RIGHT;
                    if (my.sprite.player.running > 1 && !my.sprite.player.animating) {
                        my.sprite.player.animating = true;
                        this.time.addEvent({
                            delay: 100,                // ms
                            callback: ()=>{
                                my.sprite.player.body.setVelocityX(-.95*my.sprite.player.body.velocity.x);
                                my.sprite.player.animating = false;
                                my.sprite.player.body.velocity.y += 70;
                                
                            },
                            loop: false
                        });

                    } else {
                        my.sprite.player.body.setVelocityX(-.85*my.sprite.player.body.velocity.x);
                    }
                    
                }
                if (!my.sprite.player.moving) {
                    my.sprite.player.body.setVelocityX(this.STARTVELOCITY);
                    my.sprite.player.facing = enumList.RIGHT;
                }
                if (Math.abs(my.sprite.player.body.velocity.x) <= Math.abs(this.STARTVELOCITY)) {
                    my.sprite.player.body.setVelocityX(this.STARTVELOCITY);
                }
                my.sprite.player.body.setAccelerationX(this.ACCELERATION * my.sprite.player.running);
                my.sprite.player.setFlip(true, false);
    
            }
            my.sprite.player.moving = true;
            if (Math.abs(my.sprite.player.body.velocity.x) > this.RUNTHRESHOLD) {
                my.sprite.player.running = this.RUNMULTI;
                my.sprite.player.anims.play('fast');
            }
            if (my.sprite.player.running > 1 && Math.abs(my.sprite.player.body.velocity.x) <= this.RUNTHRESHOLD) {
                if (!my.sprite.player.bumpTimed) {
                    my.sprite.player.bumpTimed = true;
                    my.bumpTime = this.time.addEvent({
                        delay: 100,                // ms
                        args: [this.scene],
                        callback: function (scene) {
                            if (my.sprite.player.body.blocked.right || my.sprite.player.body.blocked.left) {
                                my.sprite.player.running = 1;
                                my.sprite.player.anims.play('idle');
                                }
                            my.sprite.player.bumpTimed = false;
                        },
                    });
                }
            }
        //DashMove
            if (Math.abs(my.sprite.player.body.velocity.x) > this.RUNTHRESHOLD) {
                if(Phaser.Input.Keyboard.JustDown(my.keyE)) {
                    my.sprite.player.setMaxVelocity(1000000, this.MAXVELOCITYY);
                    if (cursors.right.isDown || my.keyD.isDown) {
                        my.sprite.player.setVelocityX(2000);
                    } else if (cursors.left.isDown || my.keyA.isDown) {
                        my.sprite.player.setVelocityX(-2000);
                    }
                    this.time.addEvent({
                        delay: 100,                // ms
                        callback: ()=>{
                            my.sprite.player.setMaxVelocity(this.MAXVELOCITYX, this.MAXVELOCITYY);
                            if (cursors.right.isDown || my.keyD.isDown) {
                                my.sprite.player.setVelocityX(100);
                            } else if (cursors.left.isDown || my.keyA.isDown) {
                                my.sprite.player.setVelocityX(-100);
                            }  
                            if (!my.sprite.player.body.blocked.down) {
                                my.sprite.player.anims.play('jump');
                            } else {
                                my.sprite.player.anims.play('idle');
                            }   
                            my.sprite.player.running = 1;
                        },
                        loop: false
                    });
                }
            }
        }
         
        

    // PLAYER JUMP
    // note that we need body.blocked rather than body.touching b/c the former applies to tilemap tiles and the latter to the "ground"
        //Afraid to remove this, because it doesnt need to be here
        if (my.sprite.player.animating) {

        //Player is not blocked below
        } else if(!my.sprite.player.body.blocked.down) {
            if (my.sprite.player.running > 1) {
                my.sprite.player.anims.play('fastJump');
            } else {
                my.sprite.player.anims.play('jump');
            }
        //Set timer for Coyote time if player was just on ground
            if (my.sprite.player.air == enumList.GROUNDED) {
                my.coyoteTimer = this.time.delayedCall(
                    134,                // ms
                    ()=>{
                        my.sprite.player.air = enumList.NOJUMP
                    }
                );
        //Reset y momentum if in air
            } else if (my.sprite.player.air == enumList.INAIR || my.sprite.player.air == enumList.NOJUMP) {
                my.sprite.player.body.setAccelerationY(0);
                
            }
            
        }

        //Simple case, player is "on ground," set to grounded
        if(my.sprite.player.body.blocked.down) {
        //If player was just in air play fall tween
            if (my.sprite.player.running > 1) {
                my.sprite.player.anims.play('fast');
            } else {
                my.sprite.player.anims.play('idle');
            }
            if (my.sprite.player.air != enumList.GROUNDED) {
            //Fall Tween
                if (my.sprite.player.body.deltaAbsY() > 15) {
                    this.sound.play("landSound", {mute: false, volume: .5, rate: 1.5, detune: -600});
                    //More squish when landing from a slightly higher height
                    this.tweens.add({
                        onUpdate: function () {my.sprite.player.setBodySize(24 *(SCALE/my.sprite.player.scaleX), 24*(SCALE/my.sprite.player.scaleY))},
                        targets     : my.sprite.player,
                        scaleY      : 1.3,
                        ease        : 'Quart.Out',
                        duration    : 100,
                        yoyo: true,
                        onYoyo: function () {true},
                        onComplete: function () {
                            my.sprite.player.setBodySize(24, 24); 
                            my.sprite.player.scale = SCALE;
                        },
                    });
                } else {
                    this.tweens.add({
                        onUpdate: function () {my.sprite.player.setBodySize(24 *(SCALE/my.sprite.player.scaleX), 24*(SCALE/my.sprite.player.scaleY))},
                        targets     : my.sprite.player,
                        scaleY      : 1.5,
                        ease        : 'Quart.Out',
                        duration    : 100,
                        yoyo: true,
                        onYoyo: function () {true},
                        onComplete: function () {
                            my.sprite.player.setBodySize(24, 24); 
                            my.sprite.player.scale = SCALE;
                        },
                    }); 
                }

            }
            my.sprite.player.air = enumList.GROUNDED;
            //my.sprite.player.knockback = false;
            //my.sprite.player.doubleJump = true; 
        }

    //Jump
        //Disable if knockback
        if (my.sprite.player.knockback) {

        //As long as a jump is left accept key press
        } else if((my.sprite.player.air != enumList.NOJUMP /*|| my.sprite.player.doubleJump*/) && (cursors.up.isDown||my.keySpace.isDown)) {
            //If player was just grounded, set to in air, set up velocity, and play anims
            if (my.sprite.player.air == enumList.GROUNDED) {
                this.sound.play("landSound", {mute: false, volume: .75, rate: .5});
                my.sprite.player.air = enumList.INAIR;
                my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);

            //jump particle
                this.add.particles(my.sprite.player.x, my.sprite.player.y+my.sprite.player.displayHeight/1.9, 'particle', { 
                    angle: { min: 0, max: 360 },
                    radial: true,
                    delay: 10,
                    active: true,
                    speed: 100,
                    lifespan: 200,
                    quantity: 7,
                    scale: { start: 1, end: 0 },
                    emitting: true,
                    emitZone: { type: 'random', source: my.sprite.player, quantity:20 },
                    duration: 10,
                });

            //Jump Tween
                this.tweens.add({
                    onUpdate: function () {my.sprite.player.setBodySize(24 *(SCALE/my.sprite.player.scale), 24*(SCALE/my.sprite.player.scale))},
                    targets     : my.sprite.player,
                    scale      : 3,
                    ease        : 'Bounce.In',
                    duration    : 100,
                    yoyo: true,
                    onComplete: function () {
                        my.sprite.player.setBodySize(24, 24); 
                        my.sprite.player.scale = SCALE;
                    },
                });
                
            //Give the player some leeway before disabling jump, for extra height
                my.sillyTime = this.time.delayedCall(
                130,                // ms
                ()=>{
                    my.sprite.player.air = enumList.NOJUMP
                });
                
            }

            //While player is jumping and has some sillytime left, nudge some height
            if (my.sprite.player.air == enumList.INAIR) {
                my.sprite.player.body.setAccelerationY(this.TEMP_JUMPVELOCITY);
                
            }

        }
        my.sprite.player.body.setAllowGravity(!my.sprite.player.animating); //OH boi
//----------------------------------------------        
//Dust Particles---------------------------------
        if (my.sprite.player.moving && my.sprite.player.air == enumList.GROUNDED && Math.abs(my.sprite.player.body.velocity.x) > 700) {
        //run particle
            this.add.particles(my.sprite.player.x, my.sprite.player.y+my.sprite.player.displayHeight/1.9, 'particle', { 
                active: true,
                speedX: 100,
                speedY: -40,
                lifespan: (Math.abs(my.sprite.player.body.velocity.x)-500)/5,
                quantity: 2,
                rotate: { min: 160, max: 200 },
                scale: { start: .5, end: 2 },
                alpha: { start: .4, end: 0 },
                emitting: true,
                emitZone: { type: 'edge', source: my.sprite.player, quantity:2 },
                duration: 10
            });
        }
//----------------------------------------------------
//Extra Checks------------------------

    //setAngularVelocity hack
        my.sprite.player.body.setAngularVelocity(my.sprite.player.body.velocity.x);
    //SignTimer- Tricky to get signs to disapear reasonably, I had alot of flickering
        //While touching sign create/reset timer, once its gone thing should go away
        if (my.signTouchTimer != undefined && my.signTouchTimer.getRemaining() != 0) {
            my.sprite.xMark.x = my.sprite.player.signTouch.x;
            my.sprite.xMark.y = my.sprite.player.signTouch.y - 50;
            my.sprite.xMark.visible = true;
            my.sprite.xMark.alpha = 1;
        } else {
            this.tweens.add({
                targets     : my.sprite.xMark,
                alpha      : 0,
                ease        : 'Linear',
                duration    : 180
            });
            my.signText.visible = false;
            my.sprite.signBoard.visible = false;
        }

    //Reset knockback once stable on ground
        if (my.sprite.player.knockback && my.sprite.player.body.velocity.y == 0) {
            my.sprite.player.knockback =  false;
        }

    //Remove hint once move
        if (my.sprite.hintText && (my.sprite.player.moving || (cursors.up.isDown||my.keySpace.isDown))) {
            if (my.timerTimer.paused == true) {
                my.timerTimer.paused = false;
            }
            //my.sprite.hintText
            this.tweens.add({
                targets     : my.sprite.hintText,
                alpha      : 0,
                ease        : 'Quart.Out',
                duration    : 600,
                onComplete: function () {
                    my.sprite.hintText.destroy();
                },
            });
        }
    //Camera Offset
    if (my.sprite.player.running > 1) {
        this.add.tween({
            targets: my.camera.followOffset,
            x: -300 * my.sprite.player.facing * ((Math.abs(my.sprite.player.body.velocity.x) / (this.MAXVELOCITYX + 100))),
            duration: 400,
            ease: 'Linear'
        });
    } else {
        this.add.tween({
            targets: my.camera.followOffset,
            x: 0,
            duration: 200,
            ease: 'LinearOut'
        });
    }
    //Timer
    my.sprite.timerText.text = my.timer;
    if (my.timer % 100 == 0 && my.timer != 0) {
        my.sprite.timerText.setStroke('#F00000', 10);
        my.bgm.rate *= 1.01;
        my.bgm.rateVar = -(Math.ceil(my.timer/100)/20) + 1.5;
    } else {
        my.bgm.rate = my.bgm.rateVar;
        my.sprite.timerText.setStroke('#FFFFFF', 10);
        console.log(my.bgm.rate);
    }
    if (my.timer <= 99) {
        my.bgm.rateVar = 1.5;
        my.sprite.timerText.setFill("#F00000");
    }
    if (my.timer < 0) {
        my.bgm.stop();
        game.scene.stop('platformerScene');
        game.scene.start('GameOver');
    }        

//------------------------------------------------------
    }
}
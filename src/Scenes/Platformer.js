class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");
    }

    init() {
        my.bgm = this.sound.add("music");
        // variables and settings        
        this.physics.world.gravity.y = 1900;

        this.worldBoundsX = SCALE * 18 * (215); //scale = 2, 18 = width of tile, x = num tiles
        this.worldBoundsY = SCALE * 18 * (40);
        this.physics.world.setBounds(0, 0, this.worldBoundsX, this.worldBoundsY, 64, true, true, false, true);
        this.camera = this.cameras.main;
        this.sprite = {};
    }

    preload() {
        this.load.scenePlugin('AnimatedTiles', './lib/AnimatedTiles.js', 'animatedTiles', 'animatedTiles');
    }

    create() {
//SPRITES------------------------------------------------------------
    //xMark for Signs
        this.sprite.xMark = this.add.sprite(0, 0, "x");
        this.sprite.xMark.scale = SCALE;
        this.sprite.xMark.visible = false;
        this.sprite.xMark.setDepth(1);
    //SignText
        this.signText = this.add.text(30, 70, 'Placeholder', { fontFamily: 'font1', fontSize: '32px', fill: '#000000', wordWrap: {width: 600},  stroke: '#FFFFFF', strokeThickness: 10}).setOrigin(.5, 0).setScrollFactor(0).setDepth(5);
        this.signText.x = 600;
        this.signText.visible = false;
    //HintText
        this.sprite.hintText = this.add.text(0, 0, 'A and D to move', { fontFamily: 'font1', fontSize: '42px', fill: '#FFFFFFF',  stroke: '#FFFFFF', strokeThickness: 10}).setOrigin(.5).setPosition(game.config.width/2, game.config.height - 160).setDepth(1).setAngle(-20);
        this.sprite.hintText.setScrollFactor(0);
    //signBoard       
        this.sprite.signBoard = this.add.sprite(600, 110, "sign").setDepth(4).setScale(50, 15).setScrollFactor(0);
        this.sprite.signBoard.angle = 180;
        this.sprite.signBoard.visible = false;
    //Timer Text
        this.timer = new LevelTimer(this, 0, 0, '999', { fontFamily: 'font1', fontSize: '37px', fill: '#FFFFFFF', stroke: '#FFFFFF', strokeThickness: 10 }, 999);
        
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
        this.coins = this.map.createFromObjects("Objects", {
            type: "coin",
            key: "coin"
        });
        this.coins.map((coin) => {
            coin.scale = SCALE;
            coin.x *= SCALE;
            coin.y *= SCALE;
            this.physics.world.enable(coin, Phaser.Physics.Arcade.STATIC_BODY);
            coin.play('coinTurn');
        });
        this.coinGroup = this.add.group(this.coins);

        //SIGNS
        this.signs = this.map.createFromObjects("Objects", {
            type: "sign",
            key: "sign"
        });
        this.signs.map((sign) => {
            sign.scale = SCALE;
            sign.x *= SCALE;
            sign.y *= SCALE;
            this.physics.world.enable(sign, Phaser.Physics.Arcade.STATIC_BODY);
        });
        this.signGroup = this.add.group(this.signs);

        //Player Spawn
        this.playerSpawn = this.map.createFromObjects("Objects", {
            type: "player",
            key: "coin"
        });
        this.playerSpawn.map((spawn) => {
            spawn.scale = SCALE;
            spawn.x *= SCALE;
            spawn.y *= SCALE;
            spawn.visible = false;

        });
        //Enemy
        this.enemygroup = this.add.group({
            classType: Enemy,
            maxSize: 100,
            // activate update calls
            runChildUpdate: true,
        });
        this.enemySpawn = this.map.createFromObjects("Objects", {
            type: "enemSpawn",
            key: "platformer_characters",
            frame: "tile_0024.png",
        });
        this.enemySpawn.map((enemy) => {
            enemy.scale = SCALE;
            enemy.x *= SCALE;
            enemy.y *= SCALE;

            let newEnemy = new Enemy(this, enemy.x, enemy.y, "platformer_characters", "tile_0024.png");
            newEnemy.facing = enumList.LEFT;
            newEnemy.anims.play("enemyFly");
            this.enemygroup.add(newEnemy);
            enemy.destroy();//Refactor possibility
        });
        //Water
        this.waterPool = this.map.createFromObjects("Objects", {
            type: "waterPool",
            key: ""
        });
        this.waterPool.map((water) => {
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

        this.sprite.player = new Player(this, this.playerSpawn[0].x, this.playerSpawn[0].y, "platformer_characters", "tile_0000.png");

//PlayerCollisions
        this.mapCollider = this.physics.add.collider(this.sprite.player, this.colLayer);
    //OneWayCollisions- Checks if player is sufficiently above a one way to enable
        this.extraCollider = this.physics.add.collider(this.sprite.player, this.oneWLayer, null, function (obj1, obj2) {
            return((obj1.y + obj1.displayHeight/2) <= (obj2.y*18*SCALE + 5));
        });
    //coinoverlap
        this.physics.add.overlap(this.sprite.player, this.coinGroup, (obj1, obj2) => {
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
        this.physics.add.overlap(this.sprite.player, this.signGroup, (obj1, obj2) => {
            this.sprite.player.signTouch = obj2;
            if (this.signTouchTimer == undefined) {
                this.signTouchTimer = this.time.addEvent({
                    delay: 100
                });
            } else {
                this.signTouchTimer.reset({delay: 100});
            }
        });
    //enemyoverlap
        this.physics.add.overlap(this.sprite.player, this.enemygroup, (obj1, obj2) => {
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
                    emitZone: { type: 'random', source: this.sprite.player, quantity:10, scale: { start: 2, end: 0 } },
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
                obj1.body.setDragX(this.sprite.player.DRAG);
                obj1.body.setAccelerationY(10);
                this.timer.time -= 3;
                this.sound.play("bwah", { rate: 1.5, detune: 200});
                //Either remove knockback after timer or on grounded
                this.time.delayedCall(
                    475,                // ms
                    ()=>{
                        this.sprite.player.knockback = false;
                });
            }
        });
    //enemyOverlap--------------------------------------------
    //WaterOverlap
        this.physics.add.overlap(this.sprite.player, this.waterPool, (obj1, obj2) => {
            
            if (this.timer.timerTimer) {
                this.sound.play("jingle");
                let tempText = this.add.text(0, 0, 'YOU WIN!!!', { fontFamily: 'font1', fontSize: '42px', fill: '#5ad28c',  stroke: '#FFFFFF', strokeThickness: 15}).setOrigin(.5).setPosition(game.config.width/2, game.config.height/2).setDepth(10).setAngle(-20).setScrollFactor(0);
                this.tweens.add({
                    targets     : tempText,
                    alpha     : 0,
                    ease        : 'Cubic.In',
                    duration    : 2000,
                });
                this.timer.timerTimer.destroy();
                this.timer.timerTimer = false;//:)
            }
            
        });
//-----------------------------------------------
// Controls-------------------------
        cursors = this.input.keyboard.createCursorKeys();
        my.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        my.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        my.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        my.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        my.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    //debug key listener (assigned to D key)
        if (game.config.physics.arcade.debug) {
            this.input.keyboard.on('keydown-G', () => {
                this.sprite.player.setDepth(0);
                this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true
                this.physics.world.debugGraphic.clear()
            }, this);
            this.input.keyboard.on('keydown-L', () => {
                this.timer.time = 0;
                this.sprite.player.y = 0;
            }, this);
        }
        
    //Signbutton- Set signtext, toggle sign text visibility
        this.input.keyboard.on('keydown-X', () => {
            this.signText.text = this.sprite.player.signTouch.name;
            this.signText.visible = !this.signText.visible;
            this.sprite.signBoard.visible = !this.sprite.signBoard.visible;
        }, this);
//--------------------------------------

//Camera------------------------------------
        this.camera.startFollow(this.sprite.player, true, .1, .1);
        this.camera.width = game.config.width;
        this.camera.height = game.config.height;
        //doesnt work this.displayHeight = this.camera.height;
        //this.displayWidth = this.camera.Width;
        this.camera.setViewport(0, 0, game.config.width, game.config.height);
        this.camera.setBounds(0, 0, this.worldBoundsX, this.worldBoundsY);
        this.camera.setZoom(game.config.width/1200 * 1.20, game.config.height/700 * 1.20);
        //this.camera.setDeadzone(100, 100);
//-----------------------------------------

//Tweens---------------------------------

    //xMark grow/shrink, just constantly on, might technically be performance loss idk
        this.tweens.add({
            targets     : this.sprite.xMark,
            scale     : 1.5,
            ease        : 'Linear',
            duration    : 600,
            yoyo: true,
            repeat: -1
        });

    //Starting hint text tween, bouncy, also i assume this ends and gets destroyed when text does
        this.tweens.add({
            targets     : this.sprite.hintText,
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

    this.sprite.player.update();         
        

    
//----------------------------------------------        

//Extra Checks------------------------

    //SignTimer- Tricky to get signs to disapear reasonably, I had alot of flickering
        //While touching sign create/reset timer, once its gone thing should go away
        if (this.signTouchTimer != undefined && this.signTouchTimer.getRemaining() != 0) {
            this.sprite.xMark.x = this.sprite.player.signTouch.x;
            this.sprite.xMark.y = this.sprite.player.signTouch.y - 50;
            this.sprite.xMark.visible = true;
            this.sprite.xMark.alpha = 1;
        } else {
            this.tweens.add({
                targets     : this.sprite.xMark,
                alpha      : 0,
                ease        : 'Linear',
                duration    : 180
            });
            this.signText.visible = false;
            this.sprite.signBoard.visible = false;
        }

    //Remove hint once move
        if (this.sprite.hintText && (this.sprite.player.moving || (cursors.up.isDown||my.keySpace.isDown))) {
            if (this.timer.timerTimer.paused == true) {
                this.timer.timerTimer.paused = false;
            }
            //this.sprite.hintText
            this.tweens.add({
                targets     : this.sprite.hintText,
                alpha      : 0,
                ease        : 'Quart.Out',
                duration    : 600,
                onComplete: () => {
                    this.sprite.hintText.destroy();
                },
            });
        }
    //Camera Offset
    if (this.sprite.player.running > 1) {
        this.add.tween({
            targets: this.camera.followOffset,
            x: -300 * this.sprite.player.facing * ((Math.abs(this.sprite.player.body.velocity.x) / (this.sprite.player.MAXVELOCITYX + 100))),
            duration: 400,
            ease: 'Linear'
        });
    } else {
        this.add.tween({
            targets: this.camera.followOffset,
            x: 0,
            duration: 200,
            ease: 'LinearOut'
        });
    }
    
    this.timer.update();

//------------------------------------------------------
    }
}
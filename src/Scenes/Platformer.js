class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");

    }

    init() {

        my.bgm = this.sound.add("music");
        this.signInit = false;
        // variables and settings
        this.physics.world.gravity.y = 1900;
        //this.worldBoundsX = SCALE * 18 * (215); //scale = 2, 18 = width of tile, x = num tiles
        //this.worldBoundsY = SCALE * 18 * (40);
        //this.physics.world.setBounds(0, 0, this.worldBoundsX, this.worldBoundsY, 64, true, true, false, true);

        this.camera = this.cameras.main;
        this.minimap;
        this.sprite = {};
        //------ETC-----------------------------
        this.roomWidth = 60;
        this.roomHeight = 30;
        this.levelMap = new LevelMap(my.levelConfig.width, my.levelConfig.height);
        this.levelMap.generateLevel(my.levelConfig.minLength, my.levelConfig.maxLength, my.levelConfig.branches, my.levelConfig.maxRooms, my.levelConfig.treasures, my.levelConfig.openWeight, my.levelConfig.closedWeight, my.levelConfig.seed);
        this.itemPool = new ItemPool((this.levelMap.rand));

        //debug
        if(game.config.physics.arcade.debug){
            console.log("DB: Generated level map: ");
            console.log(this.levelMap);
        }

        //-----------------------------------
    }

    preload() {
        this.load.scenePlugin('AnimatedTiles', './lib/AnimatedTiles.js', 'animatedTiles', 'animatedTiles');
    }

    create() {
//SPRITES------------------------------------------------------------
        //xMark for Signs
        this.sprite.xMark = this.add.sprite(0, 0, "x").setScale(SCALE).setVisible(true).setDepth(1).setAlpha(0);
        //HintText
        this.sprite.hintText = this.add.text(0, 0, 'A and D to move', { fontFamily: 'font1', fontSize: '42px', fill: '#FFFFFFF',  stroke: '#FFFFFF', strokeThickness: 10}).setOrigin(.5).setPosition(game.config.width/2, game.config.height - 160).setDepth(10).setAngle(-20).setScrollFactor(0);
        //Timer Text
        this.timer = new LevelTimer(this, 0, 0, '999', { fontFamily: 'font1', fontSize: '37px', fill: '#FFFFFFF', stroke: '#FFFFFF', strokeThickness: 10 }, 999);
        //Background
        this.bg1 = this.add.tileSprite(game.config.width, -500, game.config.width, game.config.height, 'bgGrass').setScale(4).setScrollFactor(.05).setScale(5).setDepth(-10);

//----------------------------------------------------------------

//TILEMAP--------------------------------------------------------------
        //initMap
        this.protoRoomConfig = {
            key: "platformer-level-1",
            tileWidth: 18,
            tileHeight: 18,
            width: 45,
            height: 25

        }
        this.enemygroup = this.add.group({
            classType: Enemy,
            maxSize: 100,
            // activate update calls
            runChildUpdate: true
        });
        this.playerGroup = this.add.group();
        this.coingroup = this.add.group();
        this.signGroup = this.add.group();
        this.collidesTrue = this.add.group();
        this.oneWays = this.add.group();
        this.lockWallGroup = this.add.group();
        this.treasureGroup = this.add.group();
        this.keyGroup = this.add.group();
        this.activeKeyGroup = this.add.group({
            runChildUpdate: true
        });


        //this.map = this.createOldRoom("platformer-level-1", 18, 18, 45, 25);

        //this.room2 = this.createRoom("Room1", 18, 18, 0, -20*18*2);
        //this.room1 = this.createRoom("Room2", 18, 18, 20*18*2, 0);
        //this.room3 = this.createRoom("Room1", 18, 18, 0, 0);
        //this.room4 = this.createRoom("ORoom", 18, 18, 20*18*2, -20*18*2);
        //comment
        this.levelFromLevel(this.levelMap.data);


        //-----------------------------------------------------------------------------
//-------------------------------------------------------------------------------------
// PlayerInit---------------------------------

        this.sprite.player = new Player(this, this.playerSpawn[0].x, this.playerSpawn[0].y, "platformer_characters", "tile_0000.png");
        //this.sprite.player = new Player(this, this.playerSpawn[0].x, this.playerSpawn[0].y, "pizza.png");

        this.playerGroup.add(this.sprite.player);

        //Keyoverlap
        this.physics.add.overlap(this.keyGroup, this.playerGroup, (obj1, obj2) => {
            obj1.destroy();
            let newKey = new Key(this, obj1.x, obj1.y, "texturesAtlas", 'tile_0027.png', obj2);
            this.sprite.player.keys.push(newKey);
            this.activeKeyGroup.add(newKey);
        });

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
// Controls--------------------------
        cursors = this.input.keyboard.createCursorKeys();
        my.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        my.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        my.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        my.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        my.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);



//--------------------------------------
//Debug---------------------------------
        //debug key listener (assigned to G key) Only available if debug was on on game load
        if (game.config.physics.arcade.debug) {
            this.input.keyboard.on('keydown-G', () => {

                //toggle debug
                game.config.physics.arcade.debug = game.config.physics.arcade.debug ? false : true;
                this.physics.world.drawDebug = game.config.physics.arcade.debug;

                if(game.config.physics.arcade.debug){
                    console.log(debugText);
                }else{
                    console.log("Debug mode deactivated!");
                }

                //remove old bounding box if it exists
                this.physics.world.debugGraphic.clear();
            }, this);
        }



        //P key to teleport to the map
        this.input.keyboard.on('keydown-P', () => {
            //return if not debug
            if (!game.config.physics.arcade.debug) {
                return;
            }

            this.camera.removeBounds();
            this.sprite.player.y = -1000;
            this.sprite.player.x = -1000;
            this.mapCollider.destroy();
        }, this);

        //M key to show the entire map
        this.input.keyboard.on('keydown-M', () => {
            //return if not debug
            if (!game.config.physics.arcade.debug) {
                return;
            }

            this.minimap.renderAll();
        }, this);

        //C key to show current player map coordinates
        this.input.keyboard.on('keydown-C', () => {
            //return if not debug
            if (!game.config.physics.arcade.debug) {
                return;
            }

            //show the player coordinates
            console.log("DB: Player map coordinate: X:" + this.sprite.player.mapX + " Y:" + this.sprite.player.mapY);
        }, this);

        //U key to make gun OP
        this.input.keyboard.on('keydown-U', () => {
            //return if not debug
            if (!game.config.physics.arcade.debug) {
                return;
            }

            console.log("DB: Gun cooldown disabled");
            this.sprite.player.reloadLength = 1;
            this.sprite.player.shootCooldown = 0;
            this.sprite.player.doItemPickup([(player) => {
                player.maxAmmo += 2;
            }])
        }, this);

        //O key to spawn a key
        this.input.keyboard.on('keydown-O', () => {
            //return if not debug
            if (!game.config.physics.arcade.debug) {
                return;
            }

            //let newKey = new Key(this, 0, 0, "texturesAtlas", 'tile_0027.png', this.sprite.player);
            let newTreasure = new PickupPool(this, this.sprite.player.x + (60 * this.sprite.player.facing), this.sprite.player.y, null, null, this.levelMap.rand);

            console.log("DB: Key and Chest Spawned");
        }, this);

        //0 key to reduce timer
        this.input.keyboard.on('keydown-ZERO', () => {
            //return if not debug
            if (!game.config.physics.arcade.debug) {
                return;
            }

            this.timer.time -= 75;
            console.log("DB: Timer reduced by 75");
        }, this)

        //0 key to print log
        this.input.keyboard.on('keydown-ONE', () => {
            //return if not debug
            if (!game.config.physics.arcade.debug) {
                return;
            }

            console.log("DB:Print Log");
            console.log(my.log);
        }, this);

//--------------------------------------

//Camera------------------------------------
        this.camera.startFollow(this.sprite.player, true, .1, .1);
        this.camera.width = game.config.width;
        this.camera.height = game.config.height;
        this.camera.setViewport(0, 0, game.config.width, game.config.height);
        this.camera.setBounds(0, 0, this.levelMap.width * SCALE * 18 * this.roomWidth,  this.levelMap.height * SCALE * 18 * this.roomHeight);
        this.camera.setZoom(game.config.width/1200 * 1.20, game.config.height/700 * 1.20);
        //this.camera.setDeadzone(100, 100);
//-----------------------------------------

//Tweens---------------------------------

        //xMark grow/shrink, just constantly on, might technically be performance loss idk
        this.sprite.xMark.tween = this.tweens.add({
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
                my.bgm.play({ loop:true, seek: 100, rate: 1, volume: 0.75});
            }
        )
        my.bgm.rateVar = 1;

        this.minimap = new Minimap(this, -1000, -1000, 200, 200, this.levelMap);
    }

    update() {

        this.sprite.player.update();

//Extra Checks------------------------

        //SignTimer- Tricky to get signs to disapear reasonably, I had alot of flickering
        //While touching sign create/reset timer, once its gone thing should go away
        if (this.signInit && this.signTouchTimer.getRemaining() != 0) {
            this.sprite.xMark.x = this.sprite.player.signTouch.x;
            this.sprite.xMark.y = this.sprite.player.signTouch.y - 50;
            this.sprite.xMark.visible = true;
            this.sprite.xMark.alpha = 1;
            this.sprite.xMark.tween.resume();
        } else if (this.signInit) {
            this.tweens.add({
                targets     : this.sprite.xMark,
                alpha      : 0,
                ease        : 'Linear',
                duration    : 180,
                onComplete: () => {
                    this.sprite.xMark.tween.pause();
                }
            });
            if (this.sprite.signText) {
                this.sprite.signText.visible = false;
                this.sprite.signBoard.visible = false;
            }

        }

        //Remove hint once move
        if (this.sprite.hintText && (Math.abs(this.sprite.player.body.velocity.x) > 0 || (cursors.up.isDown||my.keySpace.isDown))) {
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

    /*Notes so far:
    Layers have to be known on demand, creating a layer the map doenst have give an error. --Got layer by layer stuff working
    Objects are NOT the same, if an object doesn't exist, its fine to check anyways.

    Current needs for a room: key, x, y, tile x, tile y,
    Probably will want: room width, room height, spritesheets needed, ?doors?,

    */
    createRoom(key, tileWidth, tileHeight, x, y, type) {
        let map = this.add.tilemap(key, tileWidth, tileHeight);
        map.addTilesetImage("kenny_tilemap_packed", "tilemap_tiles");
        //map.addTilesetImage("tilemap-backgrounds_packed", "background_tiles");
        map.layers.forEach(layer => {

            let curLayer = map.createLayer(layer.name, ["kenny_tilemap_packed"], x, y, null, true);
            curLayer.setScale(SCALE);
            //curLayer.active = false; //doesnt change anything
            if (layer.name == "Collision-Layer") {
                curLayer.visible = false;
                curLayer.setCollisionByProperty({
                    collides: true
                });
                this.collidesTrue.add(curLayer);
                /*curLayer.setActive(false);
                curLayer.tilemap.active = false;
                console.log(curLayer.active);//curLayer.tilemap
                curLayer.removeFromUpdateList(true);//curLayer.layer.data
                curLayer.layer.data.forEach((array) => array.forEach((tile) => tile.collides = false));
                console.log(curLayer);
                console.log(curLayer.active);*/

            } else if (layer.name == "One-Layer") {
                curLayer.visible = false;
                curLayer.setCollisionByProperty({
                    oneWay: true
                });
                this.oneWays.add(curLayer);

            } else if (layer.name == "Top-Layer") {
                curLayer.setDepth((1));
            }
        });
        this.animatedTiles.init(map);

        //Collection Layer------------------------------------------------------------------------

        //Treasure rooms
        if (type == "treasure") {

            //Treasure rooms always hae an extra collectable
            let coins = map.createFromObjects("Objects", {
                type: "spawner",
                key: "coin"
            });

            coins.map((key) => {
                key.setScale(SCALE);
                key.x *= SCALE;
                key.y *= SCALE;
                key.x += x;
                key.y += y;

                let newKey = new PickupPool(this, key.x, key.y, null, null, this.levelMap.rand);
                key.destroy();
            });

            //lockWall
            let lockWall = map.createFromObjects("Objects", {
                type: "lockWall",
                key: "texturesAtlas",
                frame: 'tile_0028.png'
            });

            lockWall.map((lockWall) => {
                lockWall.scale = SCALE;
                lockWall.scaleY = SCALE * 4;
                lockWall.x *= SCALE;
                lockWall.y *= SCALE;
                lockWall.x += x;
                lockWall.y += y;
                lockWall.unlocking = false;
                this.physics.world.enable(lockWall, Phaser.Physics.Arcade.STATIC_BODY);
                this.lockWallGroup.add(lockWall);
            });

            //treasure
            let treasure = map.createFromObjects("Objects", {
                type: "treasure",
                key: "kenny-chest"
            });

            treasure.map((treasure) => {
                treasure.scale = SCALE;
                treasure.x *= SCALE;
                treasure.y *= SCALE;
                treasure.x += x;
                treasure.y += y;
                let newTreasure = new Sign(this, treasure.x, treasure.y, "kenny-chest", undefined, null, "chest");
                this.physics.world.enable(newTreasure, Phaser.Physics.Arcade.STATIC_BODY);
                this.treasureGroup.add(newTreasure);
                treasure.destroy();
            });
        }

        //General Pickups
        let keys = map.createFromObjects("Objects", {
            type: "keySpawn",
            key: "texturesAtlas",
            frame: 'tile_0027.png'
        });
        let chancesToFail = keys.length;
        keys.map((key) => {

            //Allow rooms to have multiple collectible spots
            //Currently each spot has a 1/(number of spots) chance to spawn a pickup
            //Each unsuccessful spawn increases the chance, up to guaranteeing atleast 1 pickup spawns in each room
            let chance = this.levelMap.rand.integerInRange(1, chancesToFail);
            if (chance == 1) {
                chancesToFail--;
                key.setScale(SCALE);
                key.x *= SCALE;
                key.y *= SCALE;
                key.x += x;
                key.y += y;

                let newKey = new PickupPool(this, key.x, key.y, null, null, this.levelMap.rand);
            } else {
                chancesToFail++;
            }

            key.destroy();
        });

        //"Coins"
        /*let coins = map.createFromObjects("Objects", {
            type: "coin",
            key: "coin"
        });

        //REMEMBER TO TURN COINS BACK TO COINS
        coins.map((coin) => {
            coin.scale = SCALE;
            coin.x *= SCALE;
            coin.y *= SCALE;
            coin.x += x;
            coin.y += y;
            //this.physics.world.enable(coin, Phaser.Physics.Arcade.STATIC_BODY);
            //coin.play('coinTurn');
            //this.coingroup.add(coin);
            let newSign = new Sign(this, coin.x, coin.y, "sign", undefined, coin.name);
            this.signGroup.add(newSign);
            coin.destroy();
        });*/

        //SIGNS
        let signs = map.createFromObjects("Objects", {
            type: "sign",
            key: "sign"
        });
        signs.map((sign) => {
            sign.setScale(SCALE);
            sign.x *= SCALE;
            sign.y *= SCALE;
            sign.x += x;
            sign.y += y;

            let newSign = new Sign(this, sign.x, sign.y, "sign", undefined, sign.name);
            this.signGroup.add(newSign);
            sign.destroy();
        });

        //Player Spawn
        if (type == "startRoom") {
            if (!this.playerSpawn){
                this.playerSpawn = map.createFromObjects("Objects", {
                    type: "spawner",
                    key: "coin"
                });
                this.playerSpawn.map((spawn) => {
                    spawn.scale = SCALE;
                    spawn.x *= SCALE;
                    spawn.y *= SCALE;
                    spawn.x += x;
                    spawn.y += y;
                    spawn.visible = false;

                });
            }
        }

        //Enemy
        let enemySpawn = map.createFromObjects("Objects", {
            type: "enemSpawn",
            key: "platformer_characters",
            frame: "tile_0024.png",
        });
        enemySpawn.map((enemy) => {
            enemy.scale = SCALE;
            enemy.x *= SCALE;
            enemy.y *= SCALE;
            enemy.x += x;
            enemy.y += y;

            let newEnemy = new Enemy(this, enemy.x, enemy.y, "platformer_characters", "tile_0024.png");
            newEnemy.facing = enumList.LEFT;
            this.enemygroup.add(newEnemy);
            enemy.destroy();
        });

        //Water
        if (type == "endRoom") {
            this.waterPool = map.createFromObjects("Objects", {
                type: "spawner",
                key: ""
            });
            this.waterPool.map((water) => {
                water.scale = SCALE;
                water.x *= SCALE;
                water.y *= SCALE;
                water.x += x;
                water.y += y;
                water.displayHeight = 36;
                water.displayWidth = 180;
                water.visible = false;
                this.physics.world.enable(water, Phaser.Physics.Arcade.STATIC_BODY);
            });
        }

        return(map);
    }//end createRoom

    createEmpty(key, tileWidth, tileHeight, x, y, type) {
        let map = this.add.tilemap(key, tileWidth, tileHeight);
        map.addTilesetImage("kenny_tilemap_packed", "tilemap_tiles");
        map.layers.forEach(layer => {
            let curLayer = map.createLayer(layer.name, ["kenny_tilemap_packed"], x, y, null, true);
            curLayer.setScale(SCALE);
        });
    }

    levelFromLevel(tileArr){
        for (let i = 0; i < this.levelMap.height; i++) { //y val
            for (let j = 0; j < this.levelMap.width; j++) { //x val
                let tile = tileArr[i][j];
                if (tile.name == "empty") {
                    this.createEmpty(tile.name, 18, 18, tile.x * this.roomWidth * SCALE * 18, tile.y * this.roomHeight * SCALE * 18, tile.type);
                } else {
                    this.createRoom(tile.name, 18, 18, tile.x * this.roomWidth * SCALE * 18, tile.y * this.roomHeight * SCALE * 18, tile.type);
                }
            }
        }
    }

}

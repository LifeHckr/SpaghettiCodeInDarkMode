class Load extends Phaser.Scene {
    constructor() {
        super("loadScene");
    }

    preload() {
        this.load.setPath("./assets/");

        // Load characters spritesheet
        this.load.atlas("platformer_characters", "tilemap-characters-packed.png", "tilemap-characters-packed.json");
        this.load.atlas("texturesAtlas", "platformer_spritesheet.png", "tilemap-background.json");
        this.load.spritesheet('textures', 'platformer_spritesheet.png', { frameWidth: 18, frameHeight: 18 });

        // Load tilemap information
        this.load.image("tilemap_tiles", "./rooms/tilemap_packed.png");
        this.load.image("background_tiles", "./rooms/tilemap-backgrounds_packed.png");

        //General Sprites     
        this.load.image("particle", "tile_0154.png");
        this.load.image("coin", "tile_0152.png"); 
        this.load.image("coin2", "tile_0151.png");
        this.load.image("sign", "sign.png");   
        this.load.image("x", "x.png");
        this.load.image("c1", "cloud1.png");
        this.load.image("c2", "cloud2.png");
        this.load.image("fondoodler", "cheesegun.png");
        this.load.image("pizza", "pizza.png");
        this.load.image("pizza-face", "pizza-face.png");
        this.load.image("kenny-pizza", "tile_0106.png");
        this.load.image("kenny-cheese", "tile_0105.png");
        this.load.image("kenny-chest", "tile_0061.png");

        //Game Over
        this.load.image("meteor1", "spaceMeteors_004.png");
        this.load.image("spackBack", "darkPurple.png");                  
        // Packed tilemap

        // Packed tilemap
        //Maps and Rooms
        this.load.tilemapTiledJSON("platformer-level-1", "./rooms/platformer-level-1.tmj");   // Tilemap in JSON
        this.load.tilemapTiledJSON("Room1", "./rooms/roomExample.tmj");
        this.load.tilemapTiledJSON("Room2", "./rooms/roomExample2.tmj");
        this.load.tilemapTiledJSON("ORoom", "./rooms/ORoom.tmj");
        this.load.image("bgGrass", "bgmap1.png");  

        //Load Spam
        this.load.tilemapTiledJSON("OOOO", "./rooms/OOOO.tmj");
        this.load.tilemapTiledJSON("OOOC", "./rooms/OOOC.tmj");
        this.load.tilemapTiledJSON("OOCO", "./rooms/OOCO.tmj");
        this.load.tilemapTiledJSON("OOCC", "./rooms/OOCC.tmj");
        this.load.tilemapTiledJSON("OCOO", "./rooms/OCOO.tmj");
        this.load.tilemapTiledJSON("OCOC", "./rooms/OCOC.tmj");
        this.load.tilemapTiledJSON("OCCO", "./rooms/OCCO.tmj");
        this.load.tilemapTiledJSON("OCCC", "./rooms/OCCC.tmj");
        //Second Half
        this.load.tilemapTiledJSON("COOO", "./rooms/COOO.tmj");
        this.load.tilemapTiledJSON("COOC", "./rooms/COOC.tmj");
        this.load.tilemapTiledJSON("COCO", "./rooms/COCO.tmj");
        this.load.tilemapTiledJSON("COCC", "./rooms/COCC.tmj");
        this.load.tilemapTiledJSON("CCOO", "./rooms/CCOO.tmj");
        this.load.tilemapTiledJSON("CCOC", "./rooms/CCOC.tmj");
        this.load.tilemapTiledJSON("CCCO", "./rooms/CCCO.tmj");
        this.load.tilemapTiledJSON("empty", "./rooms/CCCC.tmj");

        //AUDIO
        this.load.audio("bwah", "audio/404775__owlstorm__retro-video-game-sfx-bwah.wav");
        this.load.audio("jingle", "audio/448261__henryrichard__sfx-begin.wav");
        this.load.audio("music", "audio/335571__magntron__gamemusic.mp3");
        //this.load.audio("jumpSound", "audio/383240__jofae__bounce.wav");
        this.load.audio("landSound", "audio/701084__8bitmyketison__multimedia-water-drop-lo-fi.wav");
        this.load.audio("blast", "audio/footstep_snow_004.ogg");

    }

    create() {
        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNames('platformer_characters', {
                prefix: "tile_",
                start: 0,
                end: 1,
                suffix: ".png",
                zeroPad: 4
            }),
            frameRate: 15,
            repeat: -1
        });

        this.anims.create({
            key: 'idle',
            /*
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0000.png" }
            ],
            */
            frames: [
                { key: 'pizza', frame: null }
            ],
            repeat: -1
        });

        this.anims.create({
            key: 'jump',
            /*
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0001.png" }
            ],
            */
            frames: [
                { key: 'pizza', frame: null }
            ],
        });

        this.anims.create({
            key: 'fast',
            frames: [
                { key: "pizza-face", frame: null }
            ],
            repeat: -1
        });
        this.anims.create({
            key: 'fastJump',
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0007.png" }
            ],
            repeat: -1
        });

        this.anims.create({
            key: 'coinTurn',
            frames: [
                { key: 'coin', frame: null },
                { key: 'coin2', frame: null }

            ],
            repeat: -1,
            frameRate: 4
        });
        this.anims.create({
            key: 'enemyFly',
            frames: [
                { key: 'platformer_characters', frame: "tile_0024.png" },
                { key: 'platformer_characters', frame: "tile_0025.png" },
                { key: 'platformer_characters', frame: "tile_0026.png" }

            ],
            yoyo: true,
            repeat: -1,
            frameRate: 6
        });


         // ...and pass to the next Scene
         
         this.texty = this.add.text(0, 0, 'Type 3 numbers: width, height, maxbranches', { fontFamily: 'font1', fontSize: '42px', fill: '#FFFFFFF',  stroke: '#FFFFFF', strokeThickness: 10}).setOrigin(.5).setPosition(game.config.width/2, game.config.height - 400).setDepth(1).setAngle(-30).setScrollFactor(0);
         

         this.input.keyboard.on('keyup', function (event) {
            if (experimental.width == -1) {
                experimental.width = parseInt(event.key);
            } else if (experimental.height == -1) {
                experimental.height = parseInt(event.key);
            } else if (experimental.height != -1 && experimental.branches == -1) {
                experimental.branches = parseInt(event.key);
            }

            //debug
            if (game.config.physics.arcade.debug) {
                console.log("DB: Map settings changed!\nNew Width: " + experimental.width + "\nNew Height: " + experimental.height + "\nNew Branches: " + experimental.branches);
            }
         });
    }

    // Never get here since a new scene is started in create()
    update() {

        if (experimental.branches != -1) {
            this.scene.start("platformerScene");
        }

    }
}
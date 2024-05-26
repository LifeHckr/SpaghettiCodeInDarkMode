class Load extends Phaser.Scene {
    constructor() {
        super("loadScene");
    }

    preload() {
        this.load.setPath("./assets/");

        // Load characters spritesheet
        this.load.atlas("platformer_characters", "tilemap-characters-packed.png", "tilemap-characters-packed.json");

        // Load tilemap information
        this.load.image("tilemap_tiles", "./rooms/tilemap_packed.png");
        this.load.image("background_tiles", "./rooms/tilemap-backgrounds_packed.png");        
        this.load.image("particle", "tile_0154.png");
        this.load.image("coin", "tile_0152.png"); 
        this.load.image("coin2", "tile_0151.png");
        this.load.image("sign", "sign.png");   
        this.load.image("x", "x.png");
        //Game Over
        this.load.image("meteor1", "spaceMeteors_004.png");
        this.load.image("spackBack", "darkPurple.png");                  
        // Packed tilemap

        //Maps and Rooms
        this.load.tilemapTiledJSON("platformer-level-1", "./rooms/platformer-level-1.tmj");   // Tilemap in JSON
        this.load.tilemapTiledJSON("Room1", "./rooms/roomExample.tmj");
        this.load.tilemapTiledJSON("Room2", "./rooms/roomExample2.tmj");
        this.load.image("bgGrass", "bgmap1.png");  

        //AUDIO
        this.load.audio("bwah", "audio/404775__owlstorm__retro-video-game-sfx-bwah.wav");
        this.load.audio("jingle", "audio/448261__henryrichard__sfx-begin.wav");
        this.load.audio("music", "audio/335571__magntron__gamemusic.mp3");
        //this.load.audio("jumpSound", "audio/383240__jofae__bounce.wav");
        this.load.audio("landSound", "audio/701084__8bitmyketison__multimedia-water-drop-lo-fi.wav");

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
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0000.png" }
            ],
            repeat: -1
        });

        this.anims.create({
            key: 'jump',
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0001.png" }
            ],
        });

        this.anims.create({
            key: 'fast',
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0006.png" }
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
         this.scene.start("platformerScene");
    }

    // Never get here since a new scene is started in create()
    update() {
    }
}
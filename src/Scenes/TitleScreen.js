class TitleScreen extends Phaser.Scene {

    constructor(){
        super("TitleScreen");
    }
    //Also whatevs
    preload() {
          
    }

    create() {
        this.background = this.add.tileSprite(game.config.width/2, game.config.height/2, game.config.width, game.config.height, 'spackBack').setDepth(-1000);
        this.sprite = {};
        this.bgm = this.sound.add("music");
        this.bgm.play({ loop:true, seek: 100, rate: 1, volume: 0.75}); //music is 120 bpm, aka 500 ms anims are synced
        this.bgmTune = 1;


        //game.scene.stop('GameOver');
        //game.scene.start('Start');

        this.sprite.title = this.add.text(0, 0, "Pizza With Gun", { align: "center", fontFamily: 'font1', fontSize: '60px', fill: '#F00000', wordWrap: {width: 800},  stroke: '#d4af37', strokeThickness: 20}).setOrigin(.5).setDepth(5).setScale(1).setPosition(game.config.width/2, 50).setInteractive({ draggable: true });
        this.sprite.easy = this.add.text(0, 0, 'Easy', { fontFamily: 'font1', fontSize: '40px', fill: '#000000', stroke: '#FFFFFF', strokeThickness: 14 }).setOrigin(.5).setPosition(game.config.width/2, 150).setDepth(1).setInteractive({ draggable: true });
        this.sprite.medium = this.add.text(0, 0, 'Medium', { fontFamily: 'font1', fontSize: '40px', fill: '#000000', stroke: '#FFFFFF', strokeThickness: 14 }).setOrigin(.5).setPosition(game.config.width/2, 250).setDepth(1).setInteractive({ draggable: true });
        this.sprite.hard = this.add.text(0, 0, 'Hard', { fontFamily: 'font1', fontSize: '40px', fill: '#000000', stroke: '#FFFFFF', strokeThickness: 14 }).setOrigin(.5).setPosition(game.config.width/2, 350).setDepth(1).setInteractive({ draggable: true });
        this.sprite.uhoh = this.add.text(0, 0, 'Uh Oh', { fontFamily: 'font1', fontSize: '40px', fill: '#F00000', stroke: '#FFFFFF', strokeThickness: 14 }).setOrigin(.5).setPosition(game.config.width/2, 525).setDepth(1).setScale(1).setInteractive({ draggable: true });
        this.sprite.warning = this.add.text(0, 0, 'Warning: "Uh Oh" mode is moderately temperamental and probably laggy.', { align: "center", wordWrap: {width: 800}, fontFamily: 'font1', fontSize: '30px', fill: '#F00000', stroke: '#FFFFFF', strokeThickness: 14 }).setOrigin(.5).setPosition(game.config.width/2, 625).setDepth(1);
        
        this.tweens.add({
            targets     : this.sprite.title,
            scale      : 1.25,
            ease        : 'Cubic.Out',
            duration    : 250,
            repeat: -1,
            yoyo: true
        });

        this.tweens.add({
            targets     : [this.sprite.easy,this.sprite.medium, this.sprite.hard],
            y      : "+= 5",
            ease        : 'Linear',
            duration    : 1000,
            repeat: -1,
            yoyo: true
        });

        this.tweens.add({
            //delay: 500,
           // repeatDelay: 500,
            targets     : this.sprite.uhoh,
            scale      : .8,
            ease        : 'Cubic.In',
            duration    : 500,
            repeat: -1,
            yoyo: true

        });






        this.input.on('dragend', (pointer, object) =>{
            if (game.config.physics.arcade.debug) {
                console.log("DB: Ignoring Selection starting with test config: ");
                my.levelConfig = {minLength: 5, maxLength: 7, branches : 9, maxRooms: undefined, treasures: 3, openWeight: undefined, closedWeight: undefined, seed: undefined, width: 9, height: 9, duration: 999};
                console.log((my.levelConfig));
                this.bgm.stop();
                game.scene.stop('TitleScreen');
                this.scene.get('platformerScene').scene.restart();
                return;
            } else if(object === this.sprite.uhoh){
                my.levelConfig = {minLength: 1, maxLength: 1, branches : 800, maxRooms: 700, treasures: 40, openWeight: 1, closedWeight: .1, seed: ["possible?"], width: 30, height: 30, duration: 999};
            } else if (object === this.sprite.easy){
                my.levelConfig = {minLength: 5, maxLength: 7, branches : 7, maxRooms: 20, treasures: 2, openWeight: 1, closedWeight: 0, seed: undefined, width: 4, height: 5, duration: 299};

            } else if (object === this.sprite.medium){
                my.levelConfig = {minLength: 6, maxLength: 10, branches : 7, maxRooms: 35, treasures: 2, openWeight: .75, closedWeight: .1, seed: undefined, width: 8, height: 7, duration: 299};

            } else if (object === this.sprite.hard){
                my.levelConfig = {minLength: 99, maxLength: 99, branches : 9, maxRooms: undefined, treasures: 3, openWeight: .75, closedWeight: 0, seed: undefined, width: 10, height: 10, duration: 199};
            } else if (object === this.sprite.title){
                this.bgm.stop();
                if (this.bgmTune === 1) {
                    this.bgm = this.sound.add("stereotypicalitalianmusic");
                    this.bgmTune = 2;
                    this.bgm.play({ loop:true, rate: 1, seek: .31});

                } else {
                    this.bgm = this.sound.add("music");
                    this.bgmTune = 1;
                    this.bgm.play({ loop:true, rate: 1, seek: 100});

                }
                return;
            }
            this.bgm.stop();
            game.scene.stop('TitleScreen');
            game.scene.start('Start');
        });
    }

    update() {
        this.background.tilePositionY -= .5;
        this.background.tilePositionX -= .2;

    }

}
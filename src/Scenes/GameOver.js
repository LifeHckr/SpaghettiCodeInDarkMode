class GameOver extends Phaser.Scene {

    constructor(){
        super("GameOver");
    }
    //Also whatevs
    preload() {
          
    }

    create() {
        this.background = this.add.tileSprite(game.config.width/2, game.config.height/2, game.config.width, game.config.height, 'spackBack').setDepth(-1000);
        my.sprite.meteors = this.add.group({
            active: true,
            defaultKey: "pizza",
            maxSize: 4,
            runChildUpdate: true
            }
        )

        my.sprite.meteors.createMultiple({
            classType: screenLoop,
            active: true,
            key: my.sprite.meteors.defaultKey,
            repeat: my.sprite.meteors.maxSize-1
        });

        //game.scene.stop('GameOver');
        //game.scene.start('Start');

        my.sprite.rst = this.add.text(0, 0, 'Press Enter to Restart', { fontFamily: 'font1', fontSize: '40px', fill: '#000000', stroke: '#FFFFFF', strokeThickness: 10 }).setOrigin(.5).setPosition(game.config.width/2, game.config.height - 150).setDepth(1).setAngle(20);
        if (my.gameWin) {
            my.sprite.gO = this.add.text(0, 0, "You Won!", { fontFamily: 'font1', fontSize: '45px', fill: '#F00000', stroke: '#FFFFFF', strokeThickness: 14 }).setOrigin(.5).setPosition(game.config.width/2, game.config.height/2 + 50);
        } else {
            my.sprite.g1 = this.add.text(0, 0, "Your Pizza Got Cold!", { fontFamily: 'font1', fontSize: '45px', fill: '#F00000', stroke: '#FFFFFF', strokeThickness: 14 }).setOrigin(.5).setPosition(game.config.width/2, game.config.height/2 + 50);
        }
        my.sprite.credits = this.add.text(0, 50, "Credits!\nJarod Spangler: Lead Programmer and Game Designer\nThomas Wessel: Level Designer, General Programming, Enemy Programmer\nJack Wilhelm: Gun Design/Programming, Dash Design/Programming, Credits, End Screen\nKenny Assests: Sounds, Particles, Assests", { fontFamily: 'font1', fontSize: '24px', fill: '#000000', wordWrap: {width: 1000},  stroke: '#FFFFFF', strokeThickness: 10}).setOrigin(.5).setPosition(game.config.width/2-50, game.config.height/2 - 200);

        this.tweens.add({
            targets     : my.sprite.rst,
            angle      : -20,
            ease        : 'Cubic.In',
            duration    : 600,
            repeat: -1,
            yoyo: true
        });

        this.input.keyboard.on('keydown-ENTER', () => {
            game.scene.stop('GameOver');
            game.scene.start('TitleScreen');
            this.bgm.stop();
        }, this);
        this.woah = new screenLoop(this, 0, 0, "fondoodler", "tile_0000.png");
        this.woah.scale = 3;
        this.bgm = this.sound.add("stereotypicalitalianmusic");
        this.bgm.play({ loop:true, rate: 1});

    }

    update() {
        this.background.tilePositionY -= .5;
        this.background.tilePositionX -= .2;
        this.woah.update();
    }

}
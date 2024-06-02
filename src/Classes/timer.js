class LevelTimer extends Phaser.GameObjects.Text {
    constructor(scene, x, y, text, style, duration) {
        super(scene, x, y, text, style);
        this.scene = scene;

        this.setOrigin(1).setScrollFactor(0).setPosition(game.config.width - 121, 115).setDepth(2);
        this.time = duration;

        this.timerTimer = this.scene.time.addEvent({
            delay: 1000,  // approx 1 sec
            callback: () => {
                this.time -= 1; 
            },
            loop: true,
            paused: true
        });

        this.scene.add.existing(this);
    }

    update() {
        this.text = this.time;
        if (this.time % 100 == 0 && this.time != 0) {
            this.setStroke('#F00000', 10);
            my.bgm.rate *= 1.01;
            my.bgm.rateVar = -(Math.ceil(this.time/100)/20) + 1.5;
        } else {
            my.bgm.rate = my.bgm.rateVar;
            this.setStroke('#FFFFFF', 10);
        }
        if (this.time <= 99) {
            my.bgm.rateVar = 1.5;
            this.setFill("#F00000");
        }
        if (this.time < 0) {
            my.bgm.stop();
            this.scene.events.removeListener("hasShot");
            delete this.scene.playerSpawn;
            game.scene.stop('platformerScene');
            game.scene.start('GameOver');
        }  
    }
    
}
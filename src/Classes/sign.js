class Sign extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, frame, name) {        
        super(scene, x, y, texture, frame);
        this.active = true;
        if (!scene.sprite.hasOwnProperty('signText')) {
            //SignText
            scene.sprite.signText = scene.add.text(30, 70, 'Placeholder', { fontFamily: 'font1', fontSize: '32px', fill: '#000000', wordWrap: {width: 600},  stroke: '#FFFFFF', strokeThickness: 10}).setOrigin(.5, 0).setScrollFactor(0).setDepth(5);
            scene.sprite.signText.x = 600;
            scene.sprite.signText.visible = false;
        }

        if (!scene.sprite.hasOwnProperty('signBoard')) {
            //signBoard       
            scene.sprite.signBoard = scene.add.sprite(600, 110, "sign").setDepth(4).setScale(50, 15).setScrollFactor(0);
            scene.sprite.signBoard.angle = 180;
            scene.sprite.signBoard.visible = false;
        }
        this.name = name;
        //this.setDepth(1);
        this.setScale(SCALE);
        scene.add.existing(this);
        scene.physics.world.enable(this, Phaser.Physics.Arcade.STATIC_BODY);

        //signoverlap
        scene.physics.add.overlap(scene.playerGroup, this, (obj1, obj2) => {
            scene.sprite.player.signTouch = obj2;
            if (scene.signTouchTimer == undefined) {
                scene.signTouchTimer = scene.time.addEvent({
                    delay: 100
                });
            } else {
                scene.signTouchTimer.reset({delay: 100});
            }
        });
        return this;
    }
}
class Sign extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, frame, name = null, type = "sign") {
        super(scene, x, y, texture, frame);
        this.active = true;
        this.type = type;

        if (!scene.signInit) {
            scene.signInit = true;
            //SignText
            scene.sprite.signText = scene.add.text(30, 70, 'Placeholder', { fontFamily: 'font1', fontSize: '32px', fill: '#000000', wordWrap: {width: 600},  stroke: '#FFFFFF', strokeThickness: 10}).setOrigin(.5, 0).setScrollFactor(0).setDepth(5);
            scene.sprite.signText.x = 600;
            scene.sprite.signText.visible = false;
            //signBoard
            scene.sprite.signBoard = scene.add.sprite(600, 110, "sign").setDepth(4).setScale(50, 15).setScrollFactor(0);
            scene.sprite.signBoard.angle = 180;
            scene.sprite.signBoard.visible = false;
            //Timer, causes interactable sprites to hide when not touching
            scene.signTouchTimer = scene.time.addEvent({
                delay: 100
            });

            //Signbutton- Set signtext, toggle sign text visibility
            scene.input.keyboard.on('keydown-X', () => {

                if (scene.sprite.player.signTouch.type === "sign") {
                    scene.sprite.signText.text = scene.sprite.player.signTouch.name;
                    scene.sprite.signText.visible = !scene.sprite.signText.visible;
                    scene.sprite.signBoard.visible = !scene.sprite.signBoard.visible;

                } else if (scene.sprite.player.signTouch.type === "chest") {
                    scene.sprite.player.signTouch.chestOpen();
                }

            }, this);
        }
        this.name = name;
        if (name === null) {
            this.generateLoot();
        }
        //this.setDepth(1);
        this.setScale(SCALE);
        scene.add.existing(this);
        scene.physics.world.enable(this, Phaser.Physics.Arcade.STATIC_BODY);

        //signoverlap
        scene.physics.add.overlap(scene.playerGroup, this, (obj1, obj2) => {
            scene.sprite.player.signTouch = obj2;
            if (scene.signTouchTimer == undefined) {

            } else {
                scene.signTouchTimer.reset({delay: 100});
            }
        });
        return this;
    }

    generateLoot() {
        let num = this.scene.levelMap.rand.between(0, 2);
        let array = ["hello", "item1", "testtesttest"];
        this.name = array[num];
    }

    chestOpen() {
        let itemName = this.scene.add.text(600, 70, this.name, { align: "center", fontFamily: 'font1', fontSize: '40px', fill: '#d4af37', wordWrap: {width: 600},  stroke: '#FFFFFF', strokeThickness: 13}).setOrigin(.5, 0).setScrollFactor(0).setDepth(5).setAlpha(.75);
        let subtitle = this.scene.add.text(600, 150, "little blurb about the thing", { align: "center", fontFamily: 'font1', fontSize: '28px', fill: '#d4af37', wordWrap: {width: 600},  stroke: '#FFFFFF', strokeThickness: 9}).setOrigin(.5, 0).setScrollFactor(0).setDepth(5).setAlpha(.75);


        this.scene.tweens.add({
            delay: 1000,
            targets     : [itemName, subtitle],
            alpha      : 0,
            ease        : 'Quad.easeOut',
            duration    : 500,
            onComplete: () => {
                itemName.destroy();
                subtitle.destroy();
            }
        });
        this.scene.sprite.player.signTouch = false;
        this.destroy();

    }
}
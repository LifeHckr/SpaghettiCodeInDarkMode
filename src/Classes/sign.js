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
                    scene.sprite.signText.visible = !scene.sprite.signText.visible;
                    scene.sprite.signBoard.visible = !scene.sprite.signBoard.visible;

                } else if (scene.sprite.player.signTouch.type === "chest") {
                    scene.sprite.signText.visible = false;
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
            scene.sprite.signText.text = obj2.name;
            if (scene.signTouchTimer !== undefined) {
                scene.signTouchTimer.reset({delay: 100});

            }
            if (obj2.type === "chest") {
                scene.sprite.signText.visible = true;
            }
        });
        return this;
    }

    generateLoot() {
        this.loot = this.scene.itemPool.pickItem();
        this.name = this.loot.name;
        if (game.config.physics.arcade.debug) {
            let d = new Date();
            my.log.push({
                message: "DB: Treasure Generation",
                timeStamp: d.toLocaleTimeString(undefined, {hour: "2-digit", minute: "2-digit", second: "2-digit"}) + `.${d.getMilliseconds()}`,
                item: this.loot.name,
                x: this.x,
                y: this.y
            });
        }
    }

    chestOpen() {
        let itemName = this.scene.add.text(600, 70, this.name, { align: "center", fontFamily: 'font1', fontSize: '40px', fill: '#d4af37', wordWrap: {width: 600},  stroke: '#FFFFFF', strokeThickness: 13}).setOrigin(.5, 0).setScrollFactor(0).setDepth(5).setAlpha(.75);
        let subtitle = this.scene.add.text(600, 150, this.loot.description, { align: "center", fontFamily: 'font1', fontSize: '28px', fill: '#d4af37', wordWrap: {width: 600},  stroke: '#FFFFFF', strokeThickness: 9}).setOrigin(.5, 0).setScrollFactor(0).setDepth(5).setAlpha(.75);


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
        this.scene.sprite.player.doItemPickup(this.loot.funcs);

        this.scene.add.particles(this.x, this.y - 20, "texturesAtlas", {
            frame: ["tile_0153.png", "tile_0155.png"],
            gravityY: 400,
            delay: 0,
            active: true,
            speedY: {random: [-200, -280]},
            speedX: {random: [-120, 120]},
            lifespan: 1200 ,
            quantity: { min: 1, max: 10 },
            tint: [0xff6666, 0xffa700, 0xffff66, 0x00ff7f, 0x3399ff, 0xffffff],
            rotate: {random: [0, 360]},
            scale: { start: 1, end: 0, ease: "Quad.easeIn" },
            duration: 100,

        });

        //Placeholder
        let jingle = this.scene.sound.add("music");
        jingle.play({rate: 1.75, seek: 32, detune: 0});
        this.scene.time.delayedCall(
            860,                // ms
            ()=>{
                jingle.stop();
            }
        )
        this.destroy();

    }
}
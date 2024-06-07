class BigBlind extends Blind {
    constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame);
    }

    init() {
        this.speed = 10;
        this.acceleration = 150;
        this.jumpSpeed = -200;
        this.BASERANGE = 250;
        this.hp = 5;
        //this.body.setSize(this.displayWidth/3, this.displayHeight/3, true);
        //this.body.setOffset(4.5, 7);
        this.searchLength = 2000;
        this.name = "big";
        //enemyoverlap
        this.scene.physics.add.overlap(this.scene.playerGroup, this, (obj1, obj2) => {
            if (!obj1.hitStun) {
                //Push player away, first remove current momentum, and set flag
                obj1.body.setAccelerationX(0);
                obj1.hitStun = true;
                this.scene.time.delayedCall(
                    1000,                // ms
                    ()=>{
                        obj1.hitStun = false;
                    });
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
                obj1.body.setDragX(this.scene.sprite.player.DRAG);
                obj1.body.setAccelerationY(10);
                this.scene.timer.time -= 10;
                this.scene.sound.play("bwah", { rate: 1.5, detune: 200});
                //Either remove knockback after timer or on grounded
                this.scene.time.delayedCall(
                    475,                // ms
                    ()=>{
                        this.scene.sprite.player.knockback = false;
                    });
                this.scene.cameras.main.shake(75, 0.01);
                this.scene.cameras.main.setZoom(game.config.width/1200 * 1.20 + 0.2, game.config.height/700 * 1.20 + 0.2);
                this.scene.cameras.main.zoomTo(game.config.width/1200 * 1.20, 500);
            }
        });
        //enemyOverlap--------------------------------------------

    }

}
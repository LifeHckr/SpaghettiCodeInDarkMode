class Enemy extends Phaser.GameObjects.PathFollower {
    constructor(scene, x, y, texture, frame) {        
        super(scene, 'Path', x, y, texture, frame);
        this.visible = true;
        this.active = true;
        this.setDepth(0);
        this.scale = SCALE;
        


        this.startFollowOBJ1 = {
            
            from: 0,
            to: 1,
            delay: 0,
            duration: 2000,
            ease: 'Linear',
            repeat: -1,
            yoyo: true,
            onLoop: function (tween, obj) {
                //obj.changeDir();
            },
            onYoyoParams: this,
            onYoyo: function (tween, unknown, unknown1, unknown2, unknown3, obj) {
                //console.log(obj);
                obj.changeDir();
            },
            onRepeatParams: this,
            onRepeat: function (tween, unknown, unknown1, unknown2, unknown3, obj) {
                //console.log(obj);
                obj.changeDir();
            }
            
        };


        this.points1 = [
            this.x, this.y,
            this.x - 216, this.y,
        ];
        this.curve1 = new Phaser.Curves.Spline(this.points1);
        this.setPath(this.curve1);
        this.startFollow(this.startFollowOBJ1);
        



        //this.group.create(Phaser.Math.RND.between(50, 200), 0);


        scene.add.existing(this);
        scene.physics.world.enable(this, Phaser.Physics.Arcade.DYNAMIC_BODY);
        this.body.setAllowGravity(false);
        this.body.setSize(this.displayWidth/3, this.displayHeight/3);


        return this;
    }

    update() {

        


    }

    changeDir() {
        if (this.facing == enumList.LEFT) {
            this.facing = enumList.RIGHT;
            this.setFlip(true, false);
        } else {
            this.facing = enumList.LEFT;
            this.resetFlip();
        }
    }


    selfEnd() {
        this.stopFollow();
        this.active =  false;
        this.destroy();
    }
}
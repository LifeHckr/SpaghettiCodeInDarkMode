class Enemy extends Phaser.GameObjects.PathFollower {
    constructor(scene, x, y, texture, frame, duration = 4000, pathLength = 500, periods = 4, amplitude = 60, type = 'sine') {        
        super(scene, 'Path', x, y, texture, frame);
        this.visible = true;
        this.active = true;
        this.setDepth(0);
        this.scale = SCALE;
        


        this.startFollowOBJ1 = {
            
            from: 0,
            to: 1,
            delay: 0,
            duration: duration,
            ease: 'Quadratic',
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


        this.points1 = [];//original this.x, this.y, this.x - 216, this.y
        if (type = 'sine') {
            this.buildSinePath(this.points1, pathLength, periods, amplitude, this.x, this.y);
        }
        console.log(this.points1);
        this.curve1 = new Phaser.Curves.Spline(this.points1);
        this.setPath(this.curve1);
        this.startFollow(this.startFollowOBJ1);
        



        //this.group.create(Phaser.Math.RND.between(50, 200), 0);


        scene.add.existing(this);
        scene.physics.world.enable(this, Phaser.Physics.Arcade.DYNAMIC_BODY);
        this.body.setAllowGravity(false);
        this.body.setSize(this.displayWidth/3, this.displayHeight/3);
        this.anims.play("enemyFly");

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

    //Approximate a sine curve, takes steps at 1/8 period
    buildSinePath(array, length, numPeriods, amplitude, startX, startY) {
        /*for(let i = 0; i < length; i += length/numPeriods/8) {
            array.push(startX - i);
            array.push(Math.min(amplitude * Math.sin(((i*Math.PI)/(length/numPeriods*.5)) + (Math.PI * .5)) + startY, startY));         
       }*/
       for (let i = 0; i<numPeriods; i++) {
            //Start
            array.push(startX - i*length/numPeriods);
            array.push(startY);

            array.push(startX - i*length/numPeriods - length/numPeriods/8);
            array.push(startY);

            array.push(startX - i*length/numPeriods - 2*length/numPeriods/8);
            array.push(startY);

            array.push(startX - i*length/numPeriods - 3*length/numPeriods/8);
            array.push(startY - amplitude/1.4);

            //1/2 period at peak
            array.push(startX - i*length/numPeriods - 4*length/numPeriods/8);
            array.push(startY - amplitude);

            array.push(startX - i*length/numPeriods - 5*length/numPeriods/8);
            array.push(startY - amplitude/1.4);

            array.push(startX - i*length/numPeriods - 6*length/numPeriods/8);
            array.push(startY);

            array.push(startX - i*length/numPeriods - 7*length/numPeriods/8);
            array.push(startY);
            //And repeat
       }
    }
}
class Key extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, frame, attachedSprite) {
        super(scene, x, y, texture, frame);
        this.following = attachedSprite;
        this.scene = scene;
        this.followCD = 10;
        this.followTimer = 0;
        this.offsetX = Math.floor(Math.random()*60) - 30;
        this.offsetY = Math.floor(Math.random()*40) - 20;
        this.closeTween = this.scene.tweens.add({
            targets: this,
            x: this.x,
            duration: 1
        });
        this.farTween = this.scene.tweens.add({
            targets: this,
            x: this.x,
            duration: 1
        });

        scene.add.existing(this);
        return this;
    }

    update() {
        this.followTimer--;
        let dist = Phaser.Math.Distance.Between(this.following.body.x, this.following.body.y, this.x, this.y);
        if (dist > 70) {
            //this.moving = "far";
            this.closeTween.stop();
            this.farTween = this.scene.tweens.add({
                targets     : this,
                x:  this.following.body.x + this.offsetX,
                y: this.following.body.y + this.offsetY,
                ease        : 'Linear.Out',
                duration    : 10000/dist
            });
        } else if (this.followTimer <= 0) {
            this.followTimer = this.followCD;
            //this.moving = "close";
            this.farTween.stop();
            this.closeTween.stop();
            this.closeTween = this.scene.tweens.add({
                targets     : this,
                x:  (this.following.body.x - 30) + Math.    floor(Math.random()*90),
                y: (this.following.body.y - 40) + Math.floor(Math.random()*20),
                ease        : 'Linear.Out',
                duration    : 10000/dist,
            });
        }


    }

    unlockAnim(wall) {
        this.active = false;
        this.farTween.stop();
        this.closeTween.stop();
        this.active = false;
        this.closeTween = this.scene.tweens.add({
            targets     : this,
            x:  wall.x + 50,
            y: wall.y,
            ease        : 'Linear.Out',
            duration    : 1000,
            onComplete: () => {
                this.scene.tweens.add({
                    targets     : this,
                    x:  wall.x - 50,
                    y: wall.y,
                    ease        : 'Linear.Out',
                    duration    : 60,
                    onComplete: () => {
                        this.scene.tweens.add(  {
                            targets     : wall,
                            x:  wall.x - 2000,
                            y: wall.y,
                            ease        : 'Linear.Out',
                            duration    : 300,
                            onUpdate: () => {
                                wall.angle += 20;
                            },
                            onComplete: () => {
                                wall.destroy();
                            }
                        });
                        this.destroy();
                    }
                });
            }
        });

    }
}
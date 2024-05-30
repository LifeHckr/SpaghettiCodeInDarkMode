class Gun extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, frame, attachedSprite) {
        super(scene, x, y, texture, frame);
        this.player = attachedSprite;
        this.shootCooldown = 500; //ms
        this.onCooldown = false;
        this.shootSignal = scene.events;

        this.setOrigin(0, .5);
        this.target = 0;

        //Mouse move listener
        this.scene.input.on('pointermove', (pointer) => {
            this.target = Phaser.Math.Angle.Between(this.x, this.y, pointer.worldX, pointer.worldY);
            
        });

    //BulletGroupInit---------------------------------
        this.bulletGroup = scene.add.group({
            classType: Bullet,
            active: true,
            defaultKey: "x",
            //maxSize: 2
        });

        /*this.bulletGroup.createMultiple({
            classType: Bullet,
            active: false,
            key: this.bulletGroup.defaultKey,
            repeat: this.bulletGroup.maxSize-1
        });
        scene.bulletGroup.propertyValueSet("speed", 1);*/
    //-----------------------------------------------

    //Shoot--------------------------------------------
        scene.input.on('pointerdown', function (pointer)   {    
            this.shoot(pointer); 
        }, this);

    //------------------------------------------------

        this.scene.add.existing(this);
        return this;
    }

    update() {
        this.x = this.player.body.center.x;
        this.y = this.player.body.center.y;

        this.rotation = this.target;
        this.flipY = Math.abs(this.target) > Math.PI/2;

    }

    shoot(pointer) {
        if (!this.onCooldown) {
            //let bullet = this.bulletGroup.getFirstDead();
            let bullet = this.bulletGroup.create(this.x,this.y);
            if (bullet != null) {
                this.onCooldown = true;

                //Time till player can shoot again
                this.scene.time.addEvent({
                    delay: this.shootCooldown,                // ms
                    callback: () =>  {
                        this.onCooldown = false;
                    },
                });

                //Create a normalized vector to give things consistent speed
                let tempVec = new Phaser.Math.Vector2((game.config.width/2 - game.input.mousePointer.x), (game.config.height/2 - game.input.mousePointer.y)).normalize();

                bullet.fire(tempVec, this.getRightCenter());

                this.player.setVelocity(tempVec.x * this.player.MAXVELOCITYX * 2, tempVec.y * this.player.MAXVELOCITYY);

                this.shootSignal.emit("hasShot", this);

                this.scene.add.particles(this.getRightCenter().x, this.getRightCenter().y, "texturesAtlas", {
                    frame: ["tile_0153.png", "tile_0155.png"], 
                    delay: 10,
                    active: true,
                    angle: { min: -45, max: 45 },
                    speedY: {random: [(-1 * tempVec.y * 300) - 100, (-1 * tempVec.y * 300) + 100]},
                    speedX: {random: [(-1 * tempVec.x * 300) - 100, (-1 * tempVec.x * 300) + 100]},
                    lifespan: 300,
                    quantity: { min: 3, max: 5 },
                    rotate: this.angle,//TODO: Make these flip
                    scale: { start: 1, end: 0, ease: "Quad.easeIn" },
                    duration: 10,

                });
                this.scene.sound.play("blast");
            }
        }
    }
}
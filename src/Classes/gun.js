class Gun extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, frame, attachedSprite) {
        super(scene, x, y, texture, frame);
        this.player = attachedSprite;
        this.shootCooldown = 750; //ms
        this.onCooldown = false;
        this.shootSignal = scene.events;

        this.startingAmmo = 3;
        this.currentAmmo = this.startingAmmo;
        this.maxAmmo = this.currentAmmo;
        this.reloadLength = 90 //ticks ms = #/60 * 1000
        this.reloadTimer = 0;
        this.interruptReload = false;

        this.newOriginY = 1;
        this.setOrigin(0, 1);
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

    //Create Ammo Sprites----------------------------------------
        //Ammo Sprites
        this.scene.sprite.ammo = [];
        for (let i = 0; i < this.maxAmmo; i++) {
            this.scene.sprite.ammo.push(this.scene.add.sprite(150 + (50 * i), 600, "sign").setDepth(10).setScrollFactor(0).setScale(SCALE + .5));
        }
    //-----------------------------------------------

        this.scene.add.existing(this);
        return this;
    }

    update() {
        this.x = this.player.body.center.x;
        this.y = this.player.body.center.y;

        this.rotation = this.target;
        this.flipY = Math.abs(this.target) > Math.PI/2;
        

        this.setOrigin(0, this.newOriginY);
        this.scene.tweens.add({
            targets     : this,
            newOriginY: (1 * !(Math.abs(this.target) > Math.PI/2)),
            ease        : 'Linear.In',
            duration    : 30
        });
        
        if(this.currentAmmo != this.maxAmmo) {
            this.reloadTimer += 1;
            if (this.reloadTimer >= this.reloadLength) {
                this.currentAmmo += 1;
                for (let i = 0; i < this.currentAmmo; i++) {
                    this.scene.sprite.ammo[i].visible = true;
                }
                this.reloadTimer = 0;
                console.log("reloaded");
            }
        }

    }

    shoot(pointer) {
        if (!this.onCooldown && this.currentAmmo > 0) {
            //let bullet = this.bulletGroup.getFirstDead();
            let bullet = this.bulletGroup.create(this.x,this.y);
            bullet.setTint(0xffc524);
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

                //signals:
                //Make a var: (thing) = scene.events;
                //Emit: (thing).emit("name", any parameters, , ...);
                //Listen: (thing).on("name", (any params, ...) => {code});
                this.shootSignal.emit("hasShot", this, tempVec);

                //Shoot Particles
                this.doParticle(tempVec);
                this.scene.sound.play("blast");

                this.currentAmmo -= 1;
                this.scene.sprite.ammo[this.currentAmmo].visible = false;
                if (this.interruptReload) {
                    this.reloadTimer = 0;
                }
            }
        }
    }

    doParticle(directionVec) {
        this.scene.add.particles(this.getRightCenter().x, this.getRightCenter().y, "texturesAtlas", {
            frame: ["tile_0153.png", "tile_0155.png"], 
            delay: 10,
            active: true,
            angle: { min: -45, max: 45 },
            speedY: {random: [(-1 * directionVec.y * 300) - 100, (-1 * directionVec.y * 300) + 100]},
            speedX: {random: [(-1 * directionVec.x * 300) - 100, (-1 * directionVec.x * 300) + 100]},
            lifespan: 300,
            quantity: { min: 3, max: 5 },
            tint: 0xffc524,
            rotate: this.angle,//TODO: Make these flip
            scale: { start: 1, end: 0, ease: "Quad.easeIn" },
            duration: 10,

        });
    }
}
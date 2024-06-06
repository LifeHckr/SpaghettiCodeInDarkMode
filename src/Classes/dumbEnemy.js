class Block extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame);
        this.scene = scene;
        this.visible = true;
        this.active = true;
        this.setDepth(0);
        this.scale = SCALE;
        this.hp = 5;
        this.state = "idle";
        this.acceleration = 300;
        this.directions = ["left", "up", "down", "right"]; //up, down, left, right
        this.activeRange = 600;

        this.left = null;
        this.up = null;
        this.down = null;
        this.right = null;


        scene.add.existing(this);
        scene.physics.world.enable(this, Phaser.Physics.Arcade.DYNAMIC_BODY);
        this.body.setAllowGravity(false);
        this.setMaxVelocity(1200, 1200);
        this.body.setSize(this.displayWidth/3, this.displayHeight/3, true);

        //enemyoverlap
        scene.physics.add.overlap(scene.playerGroup, this, (obj1, obj2) => {
            //Only kill if running and do particles
            if (!obj1.hitStun) {
                //Push player away, first remove current momentum, and set flag
                obj1.body.setAccelerationX(0);
                obj1.hitStun = true;
                scene.time.delayedCall(
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
                obj1.body.setDragX(scene.sprite.player.DRAG);
                obj1.body.setAccelerationY(10);
                scene.timer.time -= 10;
                scene.sound.play("bwah", { rate: 1.5, detune: 200});
                //Either remove knockback after timer or on grounded
                scene.time.delayedCall(
                    475,                // ms
                    ()=>{
                        scene.sprite.player.knockback = false;
                    });
                this.scene.cameras.main.shake(75, 0.01);
                this.scene.cameras.main.setZoom(game.config.width/1200 * 1.20 + 0.2, game.config.height/700 * 1.20 + 0.2);
                this.scene.cameras.main.zoomTo(game.config.width/1200 * 1.20, 500);
            }
        });
        //enemyOverlap--------------------------------------------

        //PlayerCollisions
        this.mapCollider = scene.physics.add.collider(this, scene.collidesTrue);
        //LockWallcollider
        this.lockWallCollider = scene.physics.add.collider(this, scene.lockWallGroup);
        //OneWays
        this.extraCollider = scene.physics.add.collider(this, scene.oneWays, null, function (obj1, tile) {
            return((obj1.y + obj1.displayHeight/3) <= (tile.layer.tilemapLayer.tileToWorldY(tile.y)));
        });

        this.rayGroup = scene.add.group({
            active: true,
            runChildUpdate: true,
            maxSize: 4
        });

        this.doNotCasts();
        return this;
    }

    update() {

        if (this.state === "idle" && Phaser.Math.Distance.Between(this.scene.sprite.player.x, this.scene.sprite.player.y, this.x, this.y) <= this.activeRange) {
            //Pick a direction to move in
            //Change state
            //Set moving direction
        }

        if (this.state !== "idle" && this.body.blocked[this.state]) {
            this.transitionState(this.state, "idle");
        }

    }

    transitionState(cur, next) {
        if (next === "idle") {
            this.state = "idle";
            this.anims.play('blockIdle');
            this.setAcceleration(0, 0);
            this.doNotCasts();
        } else {
            this.state = next;
            this.anims.play('blockMove');
            switch (next){
                case "left":
                    this.setAcceleration(-1 * this.acceleration, 0);
                    break;
                case "right":
                    this.setAcceleration(this.acceleration, 0);
                    break;
                case "up":
                    this.setAcceleration(0, -1 * this.acceleration);
                    break;
                case "down":
                    this.setAcceleration(0,this.acceleration);
                    break;
            }
        }
    }

    doNotCasts() {
        for (let direction of this.directions) {
            if (!this.body.blocked[direction]) {
                this[direction] = new notRayCast(this.scene, this.x, this.y, null, null, direction, this);
                this.rayGroup.add(this[direction]);
            }
        }

    }

    doDamage(damage) {
        this.hp -= damage;
        if (this.hp <= 0) {
            this.death();
        }
    }

    death() {
        this.rayGroup.destroy(true, true);
        this.scene.add.particles(this.x, this.y, 'x', {
            angle: { min: 0, max: 360 },
            gravityY: 600,
            delay: 10,
            speed: 100,
            lifespan: 300,
            quantity: 10,
            scale: { start: 2, end: 0 },
            emitting: true,
            emitZone: { type: 'random', source: this, quantity:10, scale: { start: 2, end: 0 } },
            duration: 10
        });
        let newPickup = new PickupPool(this.scene, this.x, this.y, null, null, this.scene.levelMap.rand);
        this.scene.sound.play("bwah");
        this.visible = false;
        this.active = false;
        this.destroy();
    }


    triggered(direction) {
        this.rayGroup.clear(true, true);
        for (let direction of this.directions) {
            this[direction] = null;
        }
        this.transitionState(this.state, direction);
    }
}

class notRayCast extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, frame, direction, magician) {
        super(scene, x, y, texture, frame);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.caster = magician; //self-explanatory
        this.visible = false;
        scene.physics.world.enable(this, Phaser.Physics.Arcade.DYNAMIC_BODY);
        this.body.setAllowGravity(false);
        this.direction = direction;
        switch (direction){
            case "left":
                this.setVelocityX(-1);
                this.setOrigin(1, .5);
                this.YScaling = 0;
                this.XScaling = 2;
                break;
            case "right":
                this.setVelocityX(1);
                this.setOrigin(0, .5);
                this.YScaling = 0;
                this.XScaling = 2;
                break;
            case "up":
                this.setVelocityY(-1);
                this.setOrigin(.5, 1);
                this.YScaling = 2;
                this.XScaling = 0;
                break;
            case "down":
                this.setVelocityY(1);
                this.setOrigin(.5, 0);
                this.YScaling = 2;
                this.XScaling = 0;
                break;
        }



        //PlayerCollisions
        this.mapCollider = scene.physics.add.collider(this, scene.collidesTrue, () => {
            this.hitWall();
        });
        //LockWallcollider
        this.LockWallcollider = scene.physics.add.collider(this, scene.lockWallGroup, () => {
            this.hitWall();
        });
        //OneWays
        this.oneways = scene.physics.add.collider(this, scene.oneWays, (obj1, obj2) => {
            this.hitWall();
        });
        //YEll
        this.playerYell = scene.physics.add.overlap(this, scene.playerGroup, (obj1, obj2) => {
            this.caster.triggered(this.direction);
        });
        this.extending = true;


        return this;
    }

    update() {
        if (this.extending) {
            this.scaleX += this.XScaling;
            this.scaleY += this.YScaling;

        }
    }

    hitWall() {
        this.extending = false;
        this.setVelocity(0, 0);
    }

}
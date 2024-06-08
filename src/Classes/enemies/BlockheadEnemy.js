class BlockheadEnemy extends EnemyTemplate {
    constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame);

        this.acceleration = 300;
        this.directions = ["left", "up", "down", "right"]; //up, down, left, right
        this.activeRange = 600;

        this.left = null;
        this.up = null;
        this.down = null;
        this.right = null;

        this.body.setSize(this.displayWidth / 3, this.displayHeight / 3, true);

        this.rayGroup = scene.add.group({
            active: true,
            runChildUpdate: true,
            maxSize: 4
        });

        this.doNotCasts();

        return this;
    }

    update() {
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
            switch (next) {
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
                    this.setAcceleration(0, this.acceleration);
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

    death() {
        this.rayGroup.destroy(true, true);
        super.death();
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
        switch (direction) {
            case "left":
                this.setVelocityX(-1);
                this.setOrigin(1, .5);
                this.YScaling = 0;
                this.XScaling = 1;
                break;
            case "right":
                this.setVelocityX(1);
                this.setOrigin(0, .5);
                this.YScaling = 0;
                this.XScaling = 1;
                break;
            case "up":
                this.setVelocityY(-1);
                this.setOrigin(.5, 1);
                this.YScaling = 1;
                this.XScaling = 0;
                break;
            case "down":
                this.setVelocityY(1);
                this.setOrigin(.5, 0);
                this.YScaling = 1;
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
class pathEnemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame);
        this.setOrigin(0, 0);
        this.scene = scene;
        this.visible = true;
        this.active = true;
        this.setDepth(0);
        this.scale = SCALE;
        this.hp = 5;
        this.state = "idle";
        this.activeTween = null;


        this.finder = new EasyStar.js();
        this.finder.setGrid(pathfindingArr);
        this.finder.setAcceptableTiles([1]);
        this.finder.setTileCost(1, 1);


        scene.add.existing(this);
        scene.physics.world.enable(this, Phaser.Physics.Arcade.DYNAMIC_BODY);
        this.body.setAllowGravity(false);
        this.setMaxVelocity(1200, 1200);

        //enemyoverlap
        scene.physics.add.overlap(scene.playerGroup, this, (obj1, obj2) => {
            //Only kill if running and do particles
            if (!obj1.hitStun) {
                //Push player away, first remove current momentum, and set flag
                obj1.body.setAccelerationX(0);
                obj1.hitStun = true;
                scene.time.delayedCall(
                    1000,                // ms
                    () => {
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
                scene.sound.play("bwah", {rate: 1.5, detune: 200});
                //Either remove knockback after timer or on grounded
                scene.time.delayedCall(
                    475,                // ms
                    () => {
                        scene.sprite.player.knockback = false;
                    });
                this.scene.cameras.main.shake(75, 0.01);
                this.scene.cameras.main.setZoom(game.config.width / 1200 * 1.20 + 0.2, game.config.height / 700 * 1.20 + 0.2);
                this.scene.cameras.main.zoomTo(game.config.width / 1200 * 1.20, 500);
            }
        });
        //enemyOverlap--------------------------------------------

        //PlayerCollisions
        this.mapCollider = scene.physics.add.collider(this, scene.collidesTrue);

        return this;
    }

    update() {
        if (this.state === "idle") {
            this.moveEnemy();
        }
    }

    moveEnemy() {
        //get the coordinates we are gonna travel between
        //player pos

        let playerX = Math.floor(this.scene.sprite.player.x / 36);
        let playerY = Math.floor(this.scene.sprite.player.y / 36);

        //enemy pos
        let enemyX = Math.floor(this.x / 36);
        let enemyY = Math.floor(this.y / 36);

        if (enemyX == null) {
            return;
        }
        //get the path
        this.finder.findPath(enemyX, enemyY, playerX, playerY, (foundPath) => {
            if (foundPath === null) {
                console.warn("Path was not found. Returning.");
            } else {

                if (game.config.physics.arcade.debug) {
                    console.log(foundPath);
                }
                this.doEnemyTweenWithPath(foundPath, this);
            }
        });
        //Actually find the path because AAAAAAAAAAAAAAAAA why doesn't javascript just do this for me
        this.finder.calculate();

    }

    doEnemyTweenWithPath(path, enemy) {
        //set up the tweens for the player
        this.state = "moving";
        let tweens = [];

        let desiredIndex = 1;
        if (path.length < 2) {
            desiredIndex = 0;
        }

        if (path.length == 0) {
            this.activeTween.stop();
            this.state = "idle";
            return;
        }

        let ex = path[desiredIndex].x;
        let ey = path[desiredIndex].y;
        tweens.push({
            x: ex * 36,
            y: ey * 36,
            duration: 150,
            onComplete: () => {
                this.activeTween.stop();
                this.state = "idle";
            }
        });


        this.activeTween = this.scene.tweens.chain({
            targets: enemy,
            tweens: tweens,
        });
    }

    doDamage(damage) {
        this.hp -= damage;
        if (this.hp <= 0) {
            this.scene.add.particles(this.x, this.y, 'x', {
                angle: {min: 0, max: 360},
                gravityY: 600,
                delay: 10,
                speed: 100,
                lifespan: 300,
                quantity: 10,
                scale: {start: 2, end: 0},
                emitting: true,
                emitZone: {type: 'random', source: this, quantity: 10, scale: {start: 2, end: 0}},
                duration: 10
            });
            let newPickup = new PickupPool(this.scene, this.x, this.y, null, null, this.scene.levelMap.rand);
            this.scene.sound.play("bwah");
            this.visible = false;
            this.active = false;
            this.destroy();
        }
    }
}
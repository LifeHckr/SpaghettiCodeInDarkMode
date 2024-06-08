class PathEnemy extends EnemyTemplate {
    constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame);

        this.setOrigin(0, 0);

        this.activeTween = null;

        this.finder = new EasyStar.js();
        this.finder.setGrid(pathfindingArr);
        this.finder.setAcceptableTiles([1]);
        this.finder.setTileCost(1, 1);
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
}
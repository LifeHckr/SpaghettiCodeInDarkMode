class screenLoop extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, frame) {        
        super(scene, x, y, texture, frame);
        this.visible = true;
        this.active = true;
        this.speedX = Math.floor(Math.random() * (4 - -4 + 1) + -4);
        this.speedY = Math.floor(Math.random() * (4 - -4 + 1) + -4);
        this.x = Math.floor(Math.random() * (game.config.width - 0 + 1) + 0),
        this.y = Math.floor(Math.random() * (game.config.height - 0 + 1) + 0),
        this.setDepth(-1);
        this.setScale(8);
        this.scene.add.existing(this);
        return this;
    }

    update() {
        if (this.active) {
            this.y -= this.speedY;
            this.x -= this.speedX;
            this.angle -= (this.speedX + this.speedY)/2;
            if (this.y < (0 - this.displayHeight/2) || this.y > (game.config.height + this.displayHeight/2)) {
                this.y = game.config.height - this.y;
                //this.speedY *= -1;
            }
            if (this.x < (0 - this.displayHeight/2) || this.x > (game.config.width + this.displayHeight/2)) {
                this.x = game.config.width - this.x;
                //this.speedX *= -1;

            }
        }
    }
}
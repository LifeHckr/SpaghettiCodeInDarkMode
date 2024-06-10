class BigBlind extends BlindEnemy {
    constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame);

        this.speed = 10;
        this.acceleration = 150;
        this.jumpSpeed = -200;
        this.BASERANGE = 250;
        this.hp = 5;
        this.dashKillable =  false;

        this.searchLength = 2000;
        this.name = "big";
    }
}
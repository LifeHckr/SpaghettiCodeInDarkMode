class ItemPool {
    constructor(rand) {
        this.rand = rand;
    }
    pool = {
        0: {
            weight: 1,
            name: "Lightweight Dough",
            funcs: [(player) => {
                if (player.JUMP_VELOCITY > -1500) { //decide on max stats eventually
                    player.JUMP_VELOCITY -= 60;
                }
            },],
            description: "Streamlined and aerodynamic."
        },
        1: {
            weight: 1,
            name: "Fast Trigger",
            funcs: [(player) => {
                if (player.shootCooldown > 110) { //temp make minimum normal shootCooldown 10
                    player.shootCooldown -= 100;
                }
            },],
            description: "Fondoodler for everyone!"
        },
        2: {
            weight: .5,
            name: "Cheese Bandolier",
            funcs: [(player) => {
                if (player.maxAmmo < 20) { //temp make max ammo 20
                    player.maxAmmo += 1;
                }
            },],
            description: "Fondoodler for everyone!"
        },
        3: {
            weight: 1, //loosely the probability of appearing
            name: "Kitchen Gun",
            funcs: [(player) => {
                if (player.reloadLength > 255) { //temp make minimum normal length 5
                    player.reloadLength -= 250;
                }
            },],
            description: "Bang! Bang! Bang! In stores now!"
        },
        4: {
            weight: 1,
            name: "Chilly Peppers",
            funcs: [(player) => {
                player.STARTVELOCITY += 20;
                player.ACCELERATION += 40;

                if (player.RUNTHRESHOLD < player.MAXVELOCITYX - 20) {
                    player.RUNTHRESHOLD += 15;
                }
            },],
            description: "Keeps you on your toes."
        },
        5: {
            weight: .75,
            name: "Aged Cheddar",
            funcs: [(player) => {
                player.MAXVELOCITYX += 60;
                player.MAXVELOCITYY += 30;
            },],
            description: "More oomph, aged like.. cheddar."
        },
        6: {
            weight: .25,
            name: "Quarter System",
            funcs: [(player) => {
                player.scene.timer.timerTimer.timeScale *= 2;
                if (player.shootCooldown > 10) { //temp make minimum normal shootCooldown 10
                    player.shootCooldown *= .5;
                }
                if (player.reloadLength > 5) { //temp make minimum normal length 5
                    player.reloadLength *= .5;
                }
            },],
            description: "Twice as fast, twice as bold, right?"
        }
    }
    totalItems = 7;
    pickItem() {
        let itemWeight = this.rand.frac();
        let item = this.pool[this.rand.integerInRange(0, this.totalItems - 1)];
        while (item.weight < itemWeight) {
            item = this.pool[this.rand.integerInRange(0, this.totalItems - 1)];
        }
        return item;
    }
}

class LevelTile {
    /*Types: unfinished, 
    Wall states: undef - undeclared, closed, open, 
    */
    constructor(type = 'unfinished', left = 'undef', top = 'undef', right = 'undef', bottom = 'undef') {
        this.left = left;
        this.right = right;
        this.top = top;
        this.bottom = bottom;
        this.type = type;
        this.walls = 0;
        this.pathSize = 0;
        this.name = "";
        this.x = -1;
        this.y = -1;
        /*this.list = {
           //B: "B", //begin, assume walls: t, l, r
            //W: "W", //end, water, assume walls, b, l, r
            O: "O", //Open, no wall
            A: "A", //A walls: top 
            K: "K", //k walls: left
            Y: "Y", //y walls: bottom
            I: "I", //I walls: right
            R: "R", //walls: t, r
            J: "J", //walls: r, b
            L: "L", //walls: l, b
            F: "F", //walls: l, t
            Z: "Z", //walls: t, b
            H: "H", //walls: l, r
            U: "U", //walls: l, b, r
            E: "E", //walls: t, r, b
            N: "N", //walls: l, t, r
            C: "C", //walls: l, t, b
            X: "X", //walls: all                     
        }*/
        return this;
    }

    updateWalls() {
        let closed = ["left", "right", "top", "bottom"].filter((entry) => this[entry] == "closed");
        this.walls = closed.length;
    }

    observeTile() {
        if (this.left == "closed") {
            this.closeLeft();
        }
        if (this.right == "closed") {
            this.closeRight();
        }
        if (this.top == "closed") {
            this.closeTop();
        }
        if (this.bottom == "closed") {
            this.closeBottom();
        }

        if (this.left == "open") {
            this.openLeft();
        }
        if (this.right == "open") {
            this.openRight();
        }
        if (this.top == "open") {
            this.openTop();
        }
        if (this.bottom == "open") {
            this.openBottom();
        }
    }

    closeLeft() {
        //console.log(this);
        /*delete this.list.O;
        delete this.list.A;
        delete this.list.Y;
        delete this.list.I;
        delete this.list.R;
        delete this.list.J;
        delete this.list.Z;
        delete this.list.E;*/
        this.left = "closed";
        this.updateWalls();
    }

    closeRight() {
        /*delete this.list.O;
        delete this.list.A;
        delete this.list.Y;
        delete this.list.K;
        delete this.list.L;
        delete this.list.F;
        delete this.list.Z;
        delete this.list.C;*/
        this.right = "closed";
        this.updateWalls();
    }

    closeTop() {
        /*delete this.list.O;
        delete this.list.K;
        delete this.list.Y;
        delete this.list.I;
        delete this.list.J;
        delete this.list.L;
        delete this.list.H;
        delete this.list.U;
        delete this.list.B;*/
        this.top = "closed";
        this.updateWalls();
    }

    closeBottom() {
        /*delete this.list.O;
        delete this.list.A;
        delete this.list.K;
        delete this.list.I;
        delete this.list.R;
        delete this.list.F;
        delete this.list.H;
        delete this.list.N;
        delete this.list.W;*/
        this.bottom = "closed";
        this.updateWalls();
    }

    /*closeBranching() {
        delete this.list.O;
        delete this.list.A;
        delete this.list.W;
        delete this.list.K;
        delete this.list.Y;
        delete this.list.I;
    }*/

    /*closeOpen() {
        delete this.list.O;
    }*/

    closeAll(){
        this.closeBottom();
        this.closeRight();
        this.closeLeft();
        this.closeTop();
        this.walls = 4;
    }

    openLeft() {
        /*delete this.list.K;
        delete this.list.L;
        delete this.list.F;
        delete this.list.H;
        delete this.list.U;
        delete this.list.B;
        delete this.list.W;
        delete this.list.N;
        delete this.list.C;
        delete this.list.X;*/
        this.left = "open";
    }

    openRight() {
        /*delete this.list.I;
        delete this.list.R;
        delete this.list.J;
        delete this.list.H;
        delete this.list.U;
        delete this.list.W;
        delete this.list.B;
        delete this.list.N;
        delete this.list.E;
        delete this.list.X;*/
        this.right = "open";
    }

    openTop() {
        /*delete this.list.A;
        delete this.list.R;
        delete this.list.F;
        delete this.list.Z;
        delete this.list.E;
        delete this.list.W;
        delete this.list.N;
        delete this.list.C;
        delete this.list.X;*/
        this.top = "open";
    }

    openBottom() {
        /*delete this.list.Y;
        delete this.list.J;
        delete this.list.L;
        delete this.list.Z;
        delete this.list.U;
        delete this.list.E;
        delete this.list.C;
        delete this.list.X;
        delete this.list.B;*/
        this.bottom = "open";
    }

    openAll() {
        this.left = "open";
        this.right = "open";
        this.top = "open";
        this.bottom = "open";
        this.walls = 0;
    }
    
}

class LevelMap {
    constructor(width = 1, height = 2) {
        this.width = Math.max(width, 1);
        this.height = Math.max(height, 2);
        if (this.height == 2) {
            this.width = 1;
        }
        this.data = Array.apply(null, Array(this.height)).map(e => Array(this.width));
        this.rooms = this.width * this.height;
        return this;
    }
    openWeight = .75;
    closedWeight = 0;

    createFromMap(tileMap, x, y) {
        let newTile = new LevelTile();
        if (tileMap.properties) {
            newTile.type = tileMap.properties[0].value;
            newTile.left = tileMap.properties[1].value;
            newTile.top = tileMap.properties[2].value;
            newTile.right = tileMap.properties[3].value;
            newTile.bottom = tileMap.properties[4].value;
        }
        this.setTile(x, y, newTile);
    }

    setTile(x, y, data = new LevelTile()) {
        data.x = x;
        data.y = y;
        this.data[y][x] = data;
    }

    getTile(x, y) {
        return this.data[y][x];
    }

    /*An attempt at wave function collapse, note: Javascript is not made for this kinda thing
    Error if: size is < 1x2
    */
    generateLevel(minLength = (this.width + this.height - 2), maxLength = (this.width + this.height - 2), branches = 2, maxRooms = -1) {
        //Go across rows then next column
        //All levels need a start, an end, a start to end path
        //Optional: special rooms, branches, maxRooms
        this.levelMinLength = Math.max(1, minLength);
        this.levelMaxLength = Math.min(this.rooms, maxLength);
        if (maxRooms == -1) {
            this.levelMaxRooms = this.rooms;
        } else {
            this.levelMaxRooms = Math.min(Math.max(maxRooms, 2), this.rooms); //clamp, thing to clamp, min, max
        }
        this.completeRooms = 0;
        this.startRoom = false;
        this.endRoom = false;
        this.path = -1;
        this.branchCounter = branches;

        //init tiles and draw outer walls
        for (let i = 0; i < this.height; i++) { //y val
            for (let j = 0; j < this.width; j++) { //x val
                if (this.getTile(j, i) == null) {
                    let newTile = new LevelTile();
                    this.setTile(j, i, newTile);
                    if (i == 0) {
                        newTile.closeTop();
                    } 
                    if (i == this.height - 1) {
                        newTile.closeBottom();
                    }

                    if (j == 0) {
                        newTile.closeLeft();
                    } 
                    if (j == this.width - 1) {
                        newTile.closeRight();
                    }
                }

            }
        }

        while (this.completeRooms < this.rooms) {
            let curTile = this.getTile(Math.floor(Math.random() * this.width), Math.floor(Math.random() * this.height));
            if (curTile.type == 'unfinished') {
                this.collapseRoom(curTile, this.branchCounter);
                this.updateNeighbors(curTile);
            }

        }
        this.adjustPaths();


    }

    collapseRoom(room = null, branchCounter) {

        //branch manager
        if (branchCounter <= 1) {
            // bc = 0, bm = 0, walls < 2; bc = 1, bm = 1 walls < 3
            //room.closeBranching();
            let wallNum = room.walls;
            let attempts = 0;
            while(wallNum < 2 - branchCounter ) {
                let open = ["left", "right", "top", "bottom"].filter((entry) => room[entry] != "closed");
                let wall = open[Math.floor(Math.random()*open.length)];
                if (Math.random() < .5) {
                    if (this.getNeighbor(room, wall).type == "unfinished" || attempts > 8) {
                        room[wall] = "closed";
                        wallNum++;
                    }
                    
                }
                attempts++;
            }
        }

        room.observeTile();

        //Randomly decide whether to close or open an undef wall or not
        for (let key in room) {
            if (room[key] == "undef") {
                if (Math.random() * (this.openWeight + this.closedWeight) <= this.closedWeight) {
                    room[key] = "closed"
                } else {
                    room[key] = "open"
                }
            }
        }


        room.observeTile();

        if (room.walls == 4 || this.completeRooms >= this.levelMaxRooms) {
            //delete room.list;
            room.type = "X";
            room.pathSize = 1;
            room.closeAll();
            this.completeRooms++;
            return;
        }

        
        if (true || Object.keys(room.list).length <= 1) {
            //room.name = room.list[0];
            room.type = "test";
            this.completeRooms++;
            this.pathSize = 1;
            if (room.walls < 2) {
                this.branchCounter -= (2 - room.walls);
            }
            //delete room.list;
            return;
        }


    }

    updateNeighbors(room) {
        //Update Top
        if (room.y > 0) {
            let accTile = this.getTile(room.x, room.y - 1);
            accTile.bottom = room.top;
            accTile.observeTile();
        }
        //Update Right
        if (room.x < this.width - 1) {
            let accTile = this.getTile(room.x + 1, room.y);
            accTile.left = room.right;
            accTile.observeTile();
        }
        //Update bottom
        if (room.y < this.height - 1) {
            let accTile = this.getTile(room.x, room.y + 1);
            accTile.top = room.bottom;
            accTile.observeTile();
        }
        //Update left
        if (room.x > 0) {
            let accTile = this.getTile(room.x - 1, room.y);
            accTile.right = room.left;
            accTile.observeTile();

            /*if (room.left == "open") {
                accTile.pathSize++;
                room.pathSize = Math.max(accTile.pathSize, room.pathSize);
                accTile.pathSize = room.pathSize;
            }*/
        }
    }

    getNeighbor(room, direction = "top") {
        let accTile = null;
        if (direction == "top") {
            if (room.y > 0) {
                accTile = this.getTile(room.x, room.y - 1);
            }
        } else if (direction == "left") {
            if (room.x > 0) {
                accTile = this.getTile(room.x - 1, room.y);
            }
            
        } else if (direction == "bottom") {
            if (room.y < this.height - 1) {
                accTile = this.getTile(room.x, room.y + 1);
            }
            
        } else if (direction == "right") {
            if (room.x < this.width - 1) {
                accTile = this.getTile(room.x + 1, room.y);
            }
            
        }
        return accTile;
    }

    adjustPaths() {

    }

}
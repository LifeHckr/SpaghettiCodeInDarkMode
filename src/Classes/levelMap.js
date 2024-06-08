
class LevelTile {
    /*Types: unfinished, queued, done
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
        this.section = -1;
        this.name = "empty";
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
        this.updateWalls();
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
        this.updateWalls();
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
        this.updateWalls();
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
        this.updateWalls();
    }

    openAll() {
        this.left = "open";
        this.right = "open";
        this.top = "open";
        this.bottom = "open";
        this.walls = 0;
    }
    
} //end of levelTile

class LevelMap {
    constructor(width = 1, height = 2) {
        //Force size to be valid
        this.width = Math.max(width, 1);
        this.height = Math.max(height, 2);
        //Creates the arrays, sets everything to null
        this.data = Array.apply(null, Array(this.height)).map(e => Array(this.width));//x by y arrays
        this.rooms = this.width * this.height;

        //Directions
        this.directions = ["left", "top", "bottom", "right"];

        //Properties For Level Generation
        this.seed;
        this.rand;
        this.levelMinLength;
        this.levelMaxLength;
        this.openWeight;
        this.closedWeight;
        this.levelMaxRooms;
        this.levelPathLen;
        this.completeRooms = 0;
        this.startRoom = null;
        this.endRoom = null;
        this.branches;
        this.branchCounter;
        this.sectionCount = 0;
        this.treasureRooms;
        this.roomsToComplete;

        //Sections
        this.mainSection; //The designated section to draw a level from
        this.sections; // An array to hold the generated sections  
        /*
        Section construction:
        Should make a class lol
        this.sections[i] = {}; //Holding object
        this.sections[i].number = i; //Index/id
        this.sections[i].branches = 0; //Number of branches, post checked for accuracy
        this.sections[i].count = 0; //Num of tiles
        this.sections[i].tiles = []; //Array of tiles in section
        this.sections[i].deadEnds = []; //Array of deadends, may be empty
        */        



        return this;
    }

    //Will not currently work with overall level generation
    //From a tiled tilemap, populates a tiles properties
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

    //Setter, sets what is held at x,y
    setTile(x, y, data = new LevelTile()) {
        data.x = x;
        data.y = y;
        this.data[y][x] = data;
    }

    //Getter
    getTile(x, y) {
        return this.data[y][x];
    }

    /*Peviously was an attempt at wave function collapse
        Initializes room, assumes a fresh levelMap
    */
    generateLevel(minLength = (this.width + this.height - 2), maxLength = (this.width + this.height - 2), branches = 2, maxRooms = -1, treasures = 2, openWeight = .75, closedWeight = .10, seed = null) {
        //Go across rows then next column
        //All levels need a start, an end, a start to end path
        //Optional: special rooms, branches, maxRooms

        //Create the rng
        if (seed == null) {
            this.seed = [(Date.now() * Math.random()).toString()];
        } else {
            this.seed = seed;
        }
        this.rand = new Phaser.Math.RandomDataGenerator(this.seed);

        //Generate the estimate for the level path length
        //Length is square distance, not actual path distance
        this.levelMinLength = Math.max(1, minLength);
        this.levelMaxLength = Math.min(this.rooms, maxLength);
        this.levelPathLen = Math.floor((this.rand.frac() * this.levelMaxLength) + this.levelMinLength);

        //Weights for prioritizing opening or closing doors
        this.openWeight = openWeight;
        this.closedWeight = closedWeight;

        //Max rooms in level
        //Level may end up much less
        if (maxRooms == -1) {
            this.levelMaxRooms = this.rooms;
        } else {
            this.levelMaxRooms = Math.min(Math.max(maxRooms, 2), this.rooms); //clamp, thing to clamp, min, max
        }

        //Debug
        if (game.config.physics.arcade.debug) {
            console.log("DB: Level Minimum Length: " + this.levelMinLength);
            console.log("DB: Level Maximum Length: " + this.levelMaxLength);
            console.log("DB: Level Path Length: " + this.levelPathLen);
        }

        this.path = -1; //Placeholder

        //Init special categories
        this.branches = branches;
        this.branchCounter = branches;
        this.treasureRooms = treasures;

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


        //Start generating rooms
        //While there are remaining rooms
        //Section:  A self-contained section of a level map
        //1. pick a random tile
        //2. From the random tile queue tiles open to it, and generate those next
        //3. When a new random is picked, the section is walled, so get new tile and increase section counter
        while (this.completeRooms < this.rooms) {
            this.roomsToComplete = [];
            let curTile = this.getTile(Math.floor(this.rand.frac() * this.width), Math.floor(this.rand.frac() * this.height));
            if (curTile.type == 'unfinished') {
                this.roomsToComplete.push(curTile);
                curTile.type = "queued";
                this.sectionCount++;
                while(this.roomsToComplete.length > 0) {
                    curTile = this.roomsToComplete.pop();
                    curTile.section = this.sectionCount;
                    this.collapseRoom(curTile, this.branchCounter);
                    this.updateNeighbors(curTile);
                }
                //this.collapseRoom(curTile, this.branchCounter);
                //this.updateNeighbors(curTile);

            }
        }
        this.sectionify();

        //-----------------Pathfinding system initialization-----------------
        //might do this better later, idk
        //each element in this 2d array represents a 30x60 room. Create a 2D array to hold all of that
        pathfindingArr = new Array(this.data.length * 30);

        for(let i = 0; i < pathfindingArr.length; i++){
            pathfindingArr[i] = new Array(this.data[0].length * 60).fill(1);
        }
        //-------------------------------------------------------------------

    }


    //Decide whether a room's undef walls should be open or closed
    //1st. Make sure branches haven't been exceeded.
        //Draw walls first to make sure branches stay 0 <= x <= branches
        //Initially prioritize only closing undef walls in neighbors that aren't done
        //If that can't be done, prioritize keeping branches below max, so close an already finished neighbor
    //2nd. Based on open and closed weight randomly open or close remaining undef walls
    //3rd. If max room tiles has been hit, close all remaining walls.
    //4th. Finalize the tile
    collapseRoom(room = null) {

        //branch manager
        if (this.branchCounter <= 1) {
            // bc = 0, bm = 0, walls < 2; bc = 1, bm = 1 walls < 3
            //room.closeBranching();
            let wallNum = room.walls;
            let attempts = 0;
            while(wallNum < 2 - this.branchCounter ) {
                let open = ["left", "right", "top", "bottom"].filter((entry) => room[entry] != "closed");
                let wall = open[Math.floor(this.rand.frac()*open.length)];
                if (this.rand.frac() < .5) {
                    if (this.getNeighbor(room, wall).type != "done" || attempts > 8) {
                        room[wall] = "closed";
                        wallNum++;
                    }
                    
                }
                attempts++;
            }
        }

        room.observeTile();

        //Randomly decide whether to close or open an undef wall or not
        for (let key of this.directions) {
            if (room[key] == "undef") {
                if (this.rand.frac() * (this.openWeight + this.closedWeight) <= this.closedWeight) {
                    room[key] = "closed"
                } else {
                    room[key] = "open"
                }
            }
        }


        room.observeTile();

        if (room.walls == 4 || this.completeRooms >= this.levelMaxRooms) {
            //delete room.list;
            room.type = "done";
            //room.pathSize = 1;
            room.closeAll();
            this.completeRooms++;
            return;
        }

        
        if (true || Object.keys(room.list).length <= 1) {
            //room.name = room.list[0];
            room.type = "done";
            this.completeRooms++;
            //this.pathSize = 1;
            if (room.walls < 2) {
                this.branchCounter -= (2 - room.walls);
            }
            //delete room.list;
            return;
        }
    }


    //Update neighbors' wall types and queue if needed
    updateNeighbors(room) {
        //Update Top
        if (room.y > 0) {
            let accTile = this.getTile(room.x, room.y - 1);
            accTile.bottom = room.top;
            accTile.observeTile();
            if (room.top == "open" && accTile.type == "unfinished") {
                this.roomsToComplete.push(accTile);
                accTile.type = "queued";
            }
        }
        //Update Right
        if (room.x < this.width - 1) {
            let accTile = this.getTile(room.x + 1, room.y);
            accTile.left = room.right;
            accTile.observeTile();
            if (room.right == "open" && accTile.type == "unfinished") {
                this.roomsToComplete.push(accTile);
                accTile.type = "queued";

            }
        }
        //Update bottom
        if (room.y < this.height - 1) {
            let accTile = this.getTile(room.x, room.y + 1);
            accTile.top = room.bottom;
            accTile.observeTile();
            if (room.bottom == "open" && accTile.type == "unfinished") {
                this.roomsToComplete.push(accTile);
                accTile.type = "queued";
            }
        }
        //Update left
        if (room.x > 0) {
            let accTile = this.getTile(room.x - 1, room.y);
            accTile.right = room.left;
            accTile.observeTile();
            if (room.left == "open" && accTile.type == "unfinished") {
                this.roomsToComplete.push(accTile);
                accTile.type = "queued";
            }

            /*if (room.left == "open") {
                accTile.pathSize++;
                room.pathSize = Math.max(accTile.pathSize, room.pathSize);
                accTile.pathSize = room.pathSize;
            }*/
        }
    }

    //Get neighbor at direction, verifies that neighbor exists, else returns null
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

    //Checks if two tiles are neighbors, and returns the direction, or null
    isNeighbor(tile1, tile2) {
        for (let dir of this.directions) {
            if (this.getNeighbor(tile1, dir) == tile2) {
                return dir;
            }
        }
        /*if (this.getNeighbor(tile1, "top") == tile2) {
            return "top";
        } else if (this.getNeighbor(tile1, "right") == tile2) {
            return "right";
        } else if (this.getNeighbor(tile1, "bottom") == tile2) {
            return "bottom";
        } else if (this.getNeighbor(tile1, "left") == tile2) {
            return "left";
        }*/
        return null;
    }

    //Gets "square distance" between 2 tiles
    //Square dist is change in x + change in y
    //Very inaccrurate for actual path distance, but can approximate minimum distance 2 tiles are
    getSquareDistBetween(tile1, tile2) {
        let dist = -1;
        if (tile1 != null && tile2 != null) {
            dist = Math.abs(tile1.x - tile2.x) + Math.abs(tile1.y - tile2.y);
        }
        return dist;
    }

    //Maybe one day
    getPathDistBetween(tile1, tile2) {
        let tempSection = [];
        this.getTilesInSection(tile1, tempSection);
        if (!tempSection.includes(tile2)) {
            return -1;
        }
        let traversed = [];
        traversed.push(tile1);
        return gPDHelper(tile1, tile2, traversed, 0);
    }

    //Maybe One day
    gPDHelper(curTile, target, traversed, curDist) {
        let dist = curDist;
        for (let prop of this.directions) {
            if (curTile[prop] == "open") {
                let newTile = this.getNeighbor(startTile, prop);
                dist++;
                if (newTile == target) {
                    return dist;
                }
                if (!traversed.includes(newTile)) {
                    traversed.push(newTile);
                    dist++;
                    gPDHelper(newTile, traversed, dist);
                }
            }
        }
    }

    //Section Corp
    //Branch Manager sometimes gets overzealous and closes a previously allowed branch
    //Or breaks sections apart
    //Sectionify 1. initializes the sections of a level map
    //2. Picks a main section, prioritizing the largest and most branching section
    //3. Checks if Branch manager broke the section, if it did rejoins the sections, breaking the fewest walls
        //This can sometimes push branches over maxbranches
    //4. Assigns rooms, currently: Start, end, and treasure
    sectionify() {
        this.sectionInit();
        let bestWeight = -1;
        let designatedSection = -1;
        for(let i = 1; i <= this.sectionCount; i++) {
            let currentWeight = this.sections[i].count + (2 * this.sections[i].branches);
            if (currentWeight > bestWeight) {
                bestWeight = currentWeight;
                designatedSection = i;
            }
        }
        this.mainSection = this.sections[designatedSection];
        this.validateSection(this.mainSection);
        //AssignRooms
        this.assignRooms(this.mainSection);
    }

    //From a generated tilemap gets sections, based on the tile's section value
    //Requires *this* to have generated a level first
    sectionInit() {
        //Gets tiles based on their assigned section at birth (asab) value, does not open adjacency validate
        this.sections = [];
        for (let i = 1; i <= this.sectionCount; i++) {
            this.sections[i] = {};
            this.sections[i].number = i;
            this.sections[i].branches = 0;
            this.sections[i].count = 0;
            this.sections[i].tiles = [];
            this.sections[i].deadEnds = [];
            for (let k = 0; k < this.height; k++) { //y val
                for (let j = 0; j < this.width; j++) { //x val
                    let curTile = this.getTile(j, k);
                    if (curTile.section == i) {
                        this.sections[i].tiles.push(curTile);
                        this.sections[i].count++;
                        if (curTile.walls < 2) {
                            this.sections[i].branches += 2 - curTile.walls;
                        } else if (curTile.walls > 2) {
                            this.sections[i].deadEnds.push(curTile);
                        }
                    }
                }
            }
        }
    }

    //trickyCounter = 0;
    //Checks the given section for any walled off subsections
    //If one is found, finds the seperated sections, and joins them to the larger section
    //Only does this by breaking neighboring walls, to minimize walls broken
    //If subsections are seperated by more then a neighboring wall will not join them
    validateSection(section) {
        //Start with any tile
        let startTile = section.tiles[0];
        //Traverse every tile it is open to
        let touchedTiles = [];
        this.getTilesInSection(startTile, touchedTiles);
        //Find any remaining
        if (touchedTiles.length != section.tiles.length) {
            let difference = section.tiles.filter(x => !touchedTiles.includes(x));
            //Draw paths to remaining
            difference.some(difTile => {
                return touchedTiles.some(mainTile => {
                    if (this.getSquareDistBetween(difTile, mainTile) == 1) {
                        let direction = this.isNeighbor(difTile, mainTile);
                        difTile[direction] = "open";
                        this.updateNeighbors(difTile);
                        this.validateSection(section);

                        return true;
                    }
                })
            });
        }
        //TODO maybe: If longer path is needed, bulldoze other tiles
    }

    //Get tiles by adjacency
    //Populates tileSection with all tiles openly connected to startTile
    //Ignores assigned sections at birth
    getTilesInSection(startTile, tileSection) {
        if (!tileSection.includes(startTile) && startTile != null) {
            tileSection.push(startTile);
            for (let prop of this.directions) {
                if (startTile[prop] == "open") {
                    this.getTilesInSection(this.getNeighbor(startTile, prop),tileSection);
                }
            }
        }
    }

    //Gives tile its name
    //And determines if it will be a start, end, or (treasure) tile
    assignRooms(levelSection) { //Name :lefttoprightbottom
        for (let tile of levelSection.tiles) {
            let name = "";
            if (tile.left == "closed") {
                name = "C";
            } else {
                name = "O";
            }

            if (tile.top == "closed") {
                name += "C";
            } else {
                name += "O";
            }

            if (tile.right == "closed") {
                name += "C";
            } else {
                name += "O";
            }

            if (tile.bottom == "closed") {
                name += "C";
            } else {
                name += "O";
            }
            tile.name = name;
            if (game.config.physics.arcade.debug) {
                console.log("DB: Added room \"" + tile.name + "\" to section " + tile.section);
            }
        }

        //Pick Start Room if one is not already assigned
        //Prioritizes a random deadend
        //Else picks last tile in levelSection
            //This is generally tiles towards the bottom and right
        if (this.startRoom == null) {
            if (levelSection.deadEnds.length > 0) {
                this.startRoom = levelSection.deadEnds[Math.floor(this.rand.frac() * levelSection.deadEnds.length)];
            } else {
                this.startRoom = levelSection.tiles[levelSection.tiles.length -1];
            }
            this.startRoom.type = "startRoom";
        }

        //Pick Final Room
        //Prioritizes making the end room a tile that is levelPathLen sq. dist away
        //If there are no tiles at that distance puts it at the first found tile at the farthest sq. dist
        let maxLen = 0;
        let backupTile = null;
        for (let tile of levelSection.tiles) {
            let len = this.getSquareDistBetween(this.startRoom, tile);
            if (len > maxLen) {
                maxLen = len;
                backupTile = tile;
            }
            if (len == this.levelPathLen) {
                backupTile = tile;
                break;
            }
        }
        this.endRoom = backupTile;
        this.endRoom.type = "endRoom";


        //Pick Treasure Rooms
        //Can't also be start/end room
        //Currently: Treasure rooms prioritize dead ends, then rooms in descending square dist order from start
        //Treasure rooms cannot be adjacent, neither along an open nor closed wall.
        let treasureCount = this.treasureRooms;
        let checkDist = this.width + this.height;
        while (treasureCount > 0) {
            //First check deadends
            let checkTile = levelSection.deadEnds[Math.floor(this.rand.frac() * levelSection.deadEnds.length)];
            if(levelSection.deadEnds.length > 0 && checkTile != this.endRoom && checkTile != this.startRoom && checkTile.type != "treasure") {
                treasureCount--;
                checkTile.type = "treasure";
            } else {
                //Check rooms far from start, prioritize in decreasing dist from start
                let setTreasureRoom = false;
                for (let i = this.mainSection.tiles.length -1; i >= 0; i--) {
                    let tile = this.mainSection.tiles[i];
                    let isValid = true;

                    //No adjacent open treasure rooms
                    for (let key of this.directions) {
                        if (tile[key] == "open" || tile[key] == "closed") {
                            let neighbor = this.getNeighbor(tile, key);
                            if (neighbor != null && neighbor.type == "treasure") {
                                isValid = false; //if neighbor is treasure
                                break;
                            }
                        }
                    }

                    if(isValid && tile != this.endRoom && tile != this.startRoom && this.getSquareDistBetween(this.startRoom, tile) == checkDist && tile.type != "treasure") {
                        treasureCount--;
                        tile.type = "treasure";
                        setTreasureRoom = true;
                        break;
                    }
                }
                if (setTreasureRoom == false) {
                    checkDist--;
                }
            }
            if (checkDist < 0) {
                treasureCount--;
            }
        }
    }//end of assignRooms
} //end of class declaration: levelMap
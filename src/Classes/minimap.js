class Minimap extends Phaser.Cameras.Scene2D.Camera {
    constructor(scene, x, y, width, height, levelMap) {
        super(0, 0, 200, 200);
        this.WIDTH = 200;
        this.HEIGHT = 200;
        this.rectWidth = 70;
        this.offset = -1000;
        this.tilesRendered = 5;

        scene.cameras.addExisting(this);

        this.scene = scene;

        this.setName('mini');
        this.drawLevel(levelMap);

        //Temp
        scene.input.keyboard.on('keydown-J', () => {
            this.scrollX -= this.rectWidth;
        }, scene);
        scene.input.keyboard.on('keydown-K', () => {
            this.scrollY += this.rectWidth;
        }, scene);
        scene.input.keyboard.on('keydown-I', () => {
            this.scrollY -= this.rectWidth;
        }, scene);
        scene.input.keyboard.on('keydown-L', () => {
            this.scrollX += this.rectWidth;
        }, scene);
        return this;
    }


    drawLevel(levelMap) {
        this.widthInTiles = levelMap.width;
        this.heightInTiles = levelMap.height;

        this.miniMapbg = this.scene.add.rectangle(this.offset, this.offset, this.rectWidth * levelMap.width, this.rectWidth * levelMap.width, 0x000000, 0.5).setOrigin(0, 0);

        this.tiles = Array.apply(null, Array(levelMap.height)).map(e => Array(levelMap.width));//x by y arrays

        for (let curTile of levelMap.mainSection.tiles) { //x val
            let color = 0x000000;
            let miniTile = new RoomTile();

            if (curTile == levelMap.startRoom) {
                color = 0x00FF00;
                this.playerRect = this.scene.add.text(curTile.x * (this.rectWidth) + this.offset + (this.rectWidth/2), curTile.y * (this.rectWidth)+ this.offset+(this.rectWidth/2), "._.", { fontFamily: 'font1', fontSize: '30px', fill: '#FFFFFFF',  stroke: '#FFFFFF', strokeThickness: 10}).setDepth(3).setOrigin(.5, .5);
                this.centerOn(curTile.x * (this.rectWidth) + this.offset + (this.rectWidth/2), curTile.y * (this.rectWidth)+ this.offset+(this.rectWidth/2));
            }
            if (curTile == levelMap.endRoom) {
                color = 0x0000FF; //Blue
            }
            if (curTile.type == "treasure") {
                color = 0xCD7F32; //Brownish orange
            }

            miniTile.rectangle = this.scene.add.rectangle(curTile.x * (this.rectWidth) + this.offset, curTile.y * (this.rectWidth)+ this.offset, this.rectWidth, this.rectWidth, color).setOrigin(0, 0).setVisible(false);

            color = Math.floor(Math.random() * 9999999999 + 99999); //Pick a random color for walls

            //Debug Text
            //let temp5 = this.add.text(curTile.x * (this.rectWidth)+ this.offset, curTile.y  * (this.rectWidth)+ this.offset, curTile.section, {color: "#fff", fontSize: '48px', fontFamily: 'font1'}).setDepth(3);

            if (curTile.left == "closed" && curTile.section == levelMap.mainSection.number) {
                miniTile.left = this.scene.add.rectangle(curTile.x * (this.rectWidth)+ this.offset, curTile.y * (this.rectWidth)+ this.offset, 5, this.rectWidth,color ).setOrigin(0, 0).setVisible(false);
            }
            if (curTile.top == "closed" && curTile.section == levelMap.mainSection.number) {
                miniTile.top = this.scene.add.rectangle(curTile.x * (this.rectWidth)+ this.offset, curTile.y * (this.rectWidth)+ this.offset, this.rectWidth, 5, color).setOrigin(0, 0).setVisible(false);
            }
            if (curTile.right == "closed" && curTile.section == levelMap.mainSection.number) {
                miniTile.right = this.scene.add.rectangle((curTile.x+1) * (this.rectWidth)+ this.offset, curTile.y * (this.rectWidth)+ this.offset, -5, this.rectWidth, color).setOrigin(0, 0).setVisible(false);
            }
            if (curTile.bottom == "closed" && curTile.section == levelMap.mainSection.number) {
                miniTile.bottom = this.scene.add.rectangle(curTile.x * (this.rectWidth)+ this.offset, (curTile.y+1) * (this.rectWidth)+ this.offset, this.rectWidth, -5, color).setOrigin(0, 0).setVisible(false);
            }
            this.tiles[curTile.y][curTile.x] = miniTile;
        }


        this.setZoom(this.WIDTH/(this.tilesRendered*this.rectWidth));
        this.setAlpha(.55);
        this.setBounds(this.offset, this.offset, levelMap.width * this.rectWidth, levelMap.height * this.rectWidth).ignore(this.scene.bg1);
        
    }

    renderTile(x, y) {
        let tile = this.tiles[y][x];
        if (tile != null) { 
            tile.render();
        }
    }

    renderAroundTile(x, y) {
        this.renderTile(x, y);
        console.log(x);
        console.log(y);
        if (this.tiles[y][x] == null) {
            return;
        }
        if (x > 0 && this.tiles[y][x].wallIsOpen("left")) {
            this.renderTile(x-1, y);
        }

        if (x < this.widthInTiles && this.tiles[y][x].wallIsOpen("right")) {
            this.renderTile(x+1, y);
        }

        if (y > 0 && this.tiles[y][x].wallIsOpen("top")) {
            this.renderTile(x, y-1);
        }

        if (y < this.heightInTiles && this.tiles[y][x].wallIsOpen("bottom")) {
            this.renderTile(x, y+1);
        }

    }

    //Debug only
    renderAll() {
        for (let i = 0; i < this.heightInTiles; i++) { //y val
            for (let j = 0; j < this.widthInTiles; j++) { //x val
                this.renderTile(j, i);
            }
        }
    }

    mapUpdate(x, y) {
        this.centerOn(x * (this.rectWidth) + this.offset + (this.rectWidth/2), y * (this.rectWidth)+ this.offset+(this.rectWidth/2));
        this.playerRect.x = x * (this.rectWidth) + this.offset + (this.rectWidth/2);
        this.playerRect.y = y * (this.rectWidth) + this.offset + (this.rectWidth/2);

        if (x < this.widthInTiles && x >= 0 && y < this.heightInTiles && y >= 0) {
            this.renderAroundTile(x, y);
        }
    }
}

class RoomTile {
    constructor() {
        this.rendered = false;
        this.x = -1;
        this.y = -1;
        this.rectangle = null;
        this.left = null;
        this.right = null;
        this.top = null;
        this.bottom = null;
    }

    render() {
        this.rendered = true;

        if (this.rectangle != null) {
            this.rectangle.setVisible(true);
        }
        if (this.left != null) {
            this.left.setVisible(true);
        }
        if (this.right != null) {
            this.right.setVisible(true);
        }
        if (this.top != null) {
            this.top.setVisible(true);
        }
        if (this.bottom != null) {
            this.bottom.setVisible(true);
        }
        
    }

    wallIsOpen(wall) {
        return this[wall] == null;
    }
}
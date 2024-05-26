
class levelTile {
    constructor( type = 'unfinished', left = 'wall', top = 'wall', right = 'wall', bottom = 'wall') {
        this.left = left;
        this.right = right;
        this.top = top;
        this.right = right;
        this.type = type;
        return this;
    }
}

class LevelMap {
    constructor(sizeX = 1, sizeY = 1) {
        this.data = Array.apply(null, Array(sizeY)).map(e => Array(sizeX));

        return this;
    }

    createFromMap(tileMap, x, y) {
        let newTile = new levelTile();
        if (tileMap.properties) {
            newTile.type = tileMap.properties[0].value;
            newTile.left = tileMap.properties[1].value;
            newTile.top = tileMap.properties[2].value;
            newTile.right = tileMap.properties[3].value;
            newTile.bottom = tileMap.properties[4].value;
        }
        this.set(x, y, newTile);
    }

    set(x, y, data = null) {
        this.data[y][x] = data;
    }
}
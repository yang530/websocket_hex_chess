/*This is a file containing all custom classes for chess pieces*/

//#region Piece
export class Piece {

    #type;
    #color;
    #container; //visual container of the piece on screen

    //tile is the starting tile the piece is on
    //index is the the object's index in the array
    constructor(typeName, colorName, tile, index){

        this.#type = typeName;
        if(colorName == "black" || colorName == "white"){
            this.#color = colorName
        }else{
            return Promise.reject(new Error("invalid color! Has to be either black or white"));
        }
        this.#container = document.createElement("div");
        this.#container.classList.add("piece");
        this.#container.style.backgroundImage = `url(assets/${this.#color}/${this.#type}.svg)`;
        this.#container.setAttribute("id", `${colorName.charAt(0)}-${index.toString()}`);

        tile.prepend(this.#container);

    }

    //get the piece (Container) from target tile
    //returns null if no piece is found on the tile
    getPContFromTile(targetTile){

        let array = targetTile.children;
        let loopEnd = array.length;
        for(let i=0; i<loopEnd; i++){
            if(array[i].classList.contains("piece") == true){
                return array[i];
            }
        }
        return null

    }

    //get the piece (object) from target tile
    //returns null if no piece is found on the tile
    getPieceFromTile(targetTile, wht_pieces, blk_pieces){

        let contFound = this.getPContFromTile(targetTile);
        if(contFound != null){
            let p_id = contFound.id.split("-");
            if(p_id[0] == "w"){
                return wht_pieces[p_id[1]];
            }else if(p_id[0] == "b"){
                return blk_pieces[p_id[1]];
            }
        }
        return null
    }

    //check if the target tile provided is a valid capture move
    isCaptureValid(targetTile){

        if(targetTile.childElementCount > 1){
            let targetPiece = this.getPContFromTile(targetTile);
            
            if(targetPiece == null){
                return false;
            }else if(targetPiece.id.split("-")[0] != this.#color.charAt(0)){
                //if they are not the same color
                return true;
            }

        }
        return false;
        
    }

    //reposition the piece to the given tile
    //tile needs to be an element container
    reposition(tile){
        tile.appendChild(this.#container);
    }

    //return type of this piece
    showType(){
        return this.#type;
    }

    //returns the color of the piece
    showColor(){
        return this.#color;
    }

    //return a POINTER to the container
    returnContainer(){
        return this.#container;
    }

    //returns {x: cx, y: cy} of a given pointer to a tile CONTAINER on map
    cont2coord(tileCont){
        let coordText = tileCont.id.split("-");
        return {x: parseInt(coordText[0]), y: parseInt(coordText[1])};
    }

    //return a collection of ALL valid tiles (pointers to containers) NORTH of the given coordinate
    //up to a distance of dist
    //currentTile is a pointer to current tile container
    //needs an ARRAY[][] of the pointers to all tiles containers on map
    returnRayN(currentTile, map, dist){

        let cXY = this.cont2coord(currentTile);
        let loopEnd = 0;
        let result = [];
        
        if(dist){
            //if distance (dist) is provided
            loopEnd = Math.min(map[cXY.x].length-1, (cXY.y + dist));
        }else{
            loopEnd = map[cXY.x].length-1;
        }

        if(dist == 0){
            console.log("returning empty array");
            return [];
        }else{
            for(let i=cXY.y+1; i<=loopEnd; i++){
                
                if(map[cXY.x][i] != null){
                    if(map[cXY.x][i].childElementCount <= 1){
                        result.push(map[cXY.x][i]);
                    }else if(this.isCaptureValid(map[cXY.x][i]) == true){
                        result.push(map[cXY.x][i]);
                        break;
                    }
                    else{
                        break;
                    }
                }else{
                    break;
                }
            }
            console.log(result);
            return result;

        }


    }

    //return a collection of ALL valid tiles (pointers to containers) SOUTH of the given coordinate
    //up to a distance of dist
    //currentTile is a pointer to current tile container
    //needs an ARRAY[][] of the pointers to all tiles containers on map
    returnRayS(currentTile, map, dist){
        
        let cXY = this.cont2coord(currentTile);
        let loopEnd = 0;
        let result = [];
        
        if(dist){
            //if distance (dist) is provided
            loopEnd = Math.max(0, (cXY.y - dist));
        }
        if(dist == 0){
            console.log("returning empty array");
            return [];
        }else{
            for(let i=cXY.y-1; i>=loopEnd; i--){
                if(map[cXY.x][i] != null){
                    if(map[cXY.x][i].childElementCount <= 1){
                        result.push(map[cXY.x][i]);
                    }else if(this.isCaptureValid(map[cXY.x][i]) == true){
                        result.push(map[cXY.x][i]);
                        break;
                    }
                    else{
                        break;
                    }
                }else{
                    break;
                }
            }
            console.log(result);
            return result;
        }

    }

    //return a collection of ALL valid tiles (pointers to containers) NORTHEAST of the given coordinate
    //up to a distance of dist
    //currentTile is a pointer to current tile container
    //needs an ARRAY[][] of the pointers to all tiles containers on map
    returnRayNE(currentTile, map, dist){

        let cXY = this.cont2coord(currentTile);
        let loopEnd = 0;
        let result = [];

        if(dist){
            //if distance (dist) is provided
            loopEnd = Math.min(map.length-1, (cXY.x + dist));
        }else{
            loopEnd = map.length-1;
        }

        if(dist == 0){
            console.log("returning empty array");
            return [];
        }else{
            for(let i=cXY.x+1; i<=loopEnd; i++){
                
                if(map[i][cXY.y] != null){
                    if(map[i][cXY.y].childElementCount <= 1){
                        result.push(map[i][cXY.y]);
                    }else if(this.isCaptureValid(map[i][cXY.y]) == true){
                        result.push(map[i][cXY.y]);
                        break;
                    }
                    else{
                        break;
                    }
                }else{
                    break;
                }
            }
            console.log(result);
            return result;

        }

    }

    //return a collection of ALL valid tiles (pointers to containers) SOUTHWEST of the given coordinate
    //up to a distance of dist
    //currentTile is a pointer to current tile container
    //needs an ARRAY[][] of the pointers to all tiles containers on map
    returnRaySW(currentTile, map, dist){
        
        let cXY = this.cont2coord(currentTile);
        let loopEnd = 0;
        let result = [];
        
        if(dist){
            //if distance (dist) is provided
            loopEnd = Math.max(0, (cXY.x - dist));
        }
        if(dist == 0){
            console.log("returning empty array");
            return [];
        }else{
            for(let i=cXY.x-1; i>=loopEnd; i--){
                if(map[i][cXY.y] != null){
                    if(map[i][cXY.y].childElementCount <= 1){
                        result.push(map[i][cXY.y]);
                    }else if(this.isCaptureValid(map[i][cXY.y]) == true){
                        result.push(map[i][cXY.y]);
                        break;
                    }
                    else{
                        break;
                    }
                }else{
                    break;
                }
            }
            console.log(result);
            return result;
        }

    }

    //return a collection of ALL valid tiles (pointers to containers) NORTHWEST of the given coordinate
    //up to a distance of dist
    //currentTile is a pointer to current tile container
    //needs an ARRAY[][] of the pointers to all tiles containers on map
    returnRayNW(currentTile, map, dist){

        let cXY = this.cont2coord(currentTile);
        let loopEnd = 0;
        let result = [];
        let cR = 0 - (cXY.x + cXY.y);

        if(dist){
            //if distance (dist) is provided
            loopEnd = Math.max(0, (cXY.x - dist));
        }
        if(dist == 0){
            console.log("returning empty array");
            return [];
        }else{
            for(let i=cXY.x-1; i>=loopEnd; i--){
                let cY = 0 - cR - i;
                if(map[i][cY] != null){
                    if(map[i][cY].childElementCount <= 1){
                        result.push(map[i][cY]);
                    }else if(this.isCaptureValid(map[i][cY]) == true){
                        result.push(map[i][cY]);
                        break;
                    }
                    else{
                        break;
                    }
                }else{
                    break;
                }
            }
            console.log(result);
            return result;
        }

    }

    //return a collection of ALL valid tiles (pointers to containers) SOUTHEAST of the given coordinate
    //up to a distance of dist
    //currentTile is a pointer to current tile container
    //needs an ARRAY[][] of the pointers to all tiles containers on map
    returnRaySE(currentTile, map, dist){

        let cXY = this.cont2coord(currentTile);
        let loopEnd = 0;
        let result = [];
        let cR = 0 - (cXY.x + cXY.y);

        if(dist){
            //if distance (dist) is provided
            loopEnd = Math.min(map.length-1, (cXY.x + dist));
        }else{
            loopEnd = map.length-1;
        }

        if(dist == 0){
            console.log("returning empty array");
            return [];
        }else{
            for(let i=cXY.x+1; i<=loopEnd; i++){
                let cY = 0 - cR - i;
                if(map[i][cY] != null){
                    if(map[i][cY].childElementCount <= 1){
                        result.push(map[i][cY]);
                    }else if(this.isCaptureValid(map[i][cY]) == true){
                        result.push(map[i][cY]);
                        break;
                    }
                    else{
                        break;
                    }
                }else{
                    break;
                }
            }
            console.log(result);
            return result;

        }

    }

    //return the POINTER to the Nth tile (container) to the NORTH of given tile
    //currentTile is a pointer to current tile container
    //needs an ARRAY[][] of the pointers to all tiles containers on map
    //function returns null if result is not a valid tile
    returnNthN(currentTile, map, nth=null){

        let cXY = this.cont2coord(currentTile);

        if(nth == null || nth == 0 || nth < 0){
            return null;
        }else{
            let newY = cXY.y + nth;
            if(newY >= map[cXY.x].length){
                return null;
            }
            return map[cXY.x][newY];
        }

    }

    //return the POINTER to the Nth tile (container) to the SOUTH of given tile
    //currentTile is a pointer to current tile container
    //needs an ARRAY[][] of the pointers to all tiles containers on map
    //function returns null if result is not a valid tile
    returnNthS(currentTile, map, nth=null){

        let cXY = this.cont2coord(currentTile);

        if(nth == null || nth == 0 || nth < 0){
            return null;
        }else{
            let newY = cXY.y - nth;
            if(newY < 0){
                return null;
            }
            return map[cXY.x][newY];
        }

    }

    //return the POINTER to the Nth tile (container) to the NORTHEAST of given tile
    //currentTile is a pointer to current tile container
    //needs an ARRAY[][] of the pointers to all tiles containers on map
    //function returns null if result is not a valid tile
    returnNthNE(currentTile, map, nth=null){

        let cXY = this.cont2coord(currentTile);

        if(nth == null || nth == 0 || nth < 0){
            return null;
        }else{
            let newX = cXY.x + nth;
            if(newX >= map.length){
                return null;
            }
            return map[newX][cXY.y];
        }

    }

    //return the POINTER to the Nth tile (container) to the SOUTHWEST of given tile
    //currentTile is a pointer to current tile container
    //needs an ARRAY[][] of the pointers to all tiles containers on map
    //function returns null if result is not a valid tile
    returnNthSW(currentTile, map, nth=null){

        let cXY = this.cont2coord(currentTile);

        if(nth == null || nth == 0 || nth < 0){
            return null;
        }else{
            let newX = cXY.x - nth;
            if(newX < 0){
                return null;
            }
            return map[newX][cXY.y];
        }

    }

    //return the POINTER to the Nth tile (container) to the SOUTHEAST of given tile
    //currentTile is a pointer to current tile container
    //needs an ARRAY[][] of the pointers to all tiles containers on map
    //function returns null if result is not a valid tile
    returnNthSE(currentTile, map, nth=null){

        let cXY = this.cont2coord(currentTile);
        let cR = 0 - (cXY.x + cXY.y);

        if(nth == null || nth == 0 || nth < 0){
            return null;
        }else{
            let newX = cXY.x + nth;
            let newY = 0 - cR - newX;
            if(newX >= map.length){
                return null;
            }else if(newY >= map[newX].length || newY < 0){
                return null;
            }
            return map[newX][newY];
        }

    }

    //return the POINTER to the Nth tile (container) to the NORTHWEST of given tile
    //currentTile is a pointer to current tile container
    //needs an ARRAY[][] of the pointers to all tiles containers on map
    //function returns null if result is not a valid tile
    returnNthNW(currentTile, map, nth=null){

        let cXY = this.cont2coord(currentTile);
        let cR = 0 - (cXY.x + cXY.y);

        if(nth == null || nth == 0 || nth < 0){
            return null;
        }else{
            let newX = cXY.x - nth;
            let newY = 0 - cR - newX
            if(newX < 0){
                return null;
            }else if(newY >= map[newX].length || newY < 0){
                return null;
            }
            return map[newX][newY];
        }

    }

    //return the Nth DIAGONAL tile (container) to the NORTHWEST of given tile
    //currentTile is a pointer to current tile container
    //returns the POINTER (of container) to a valid tile, null if no valid tile is found
    returnNthDiagonalNW(currentTile, map, nth=null){

        let waypoint = this.returnNthN(currentTile, map, nth);
        let result = null; 

        if(waypoint != null){

            result = this.returnNthNW(waypoint, map, nth);   

        }
        return result;

    }

    //return the Nth DIAGONAL tile (container) to the NORTHEAST of given tile
    //currentTile is a pointer to current tile container
    //returns the POINTER (of container) to a valid tile, null if no valid tile is found
    returnNthDiagonalNE(currentTile, map, nth=null){

        let waypoint = this.returnNthN(currentTile, map, nth);
        let result = null; 

        if(waypoint != null){

            result = this.returnNthNE(waypoint, map, nth);   

        }
        return result;

    }

    //return the Nth DIAGONAL tiles (container) to the SOUTHWEST of given tile
    //currentTile is a pointer to current tile container
    //returns the POINTER (of container) to a valid tile, null if no valid tile is found
    returnNthDiagonalSW(currentTile, map, nth=null){

        let waypoint = this.returnNthS(currentTile, map, nth);
        let result = null;

        if(waypoint != null){
            
            result = this.returnNthSW(waypoint, map, nth);

        }
        return result;

    }

    //return the Nth DIAGONAL tiles (container) to the SOUTHEAST of given tile
    //currentTile is a pointer to current tile container
    //returns the POINTER (of container) to a valid tile, null if no valid tile is found
    returnNthDiagonalSE(currentTile, map, nth=null){

        let waypoint = this.returnNthS(currentTile, map, nth);
        let result = null

        if(waypoint != null){
            
            result = this.returnNthSE(waypoint, map, nth);

        }
        return result;

    }

    //return the POINTERS to the Nth DIAGONAL tiles (container) to the WEST of given tile
    //currentTile is a pointer to current tile container
    //needs an ARRAY[][] of the pointers to all tiles containers on map
    //needs to specified N th tile
    returnNthDiagonalW(currentTile, map, nth=null){

        let waypoint = this.returnNthNW(currentTile, map, nth);
        let result = null;

        if(waypoint != null){
            result = this.returnNthSW(waypoint, map, nth);
        }
        return result;

    }

    //return the POINTERS to the Nth DIAGONAL tiles (container) to the EAST of given tile
    //currentTile is a pointer to current tile container
    //needs an ARRAY[][] of the pointers to all tiles containers on map
    //needs to specified N th tile
    returnNthDiagonalE(currentTile, map, nth=null){

        let waypoint = this.returnNthNE(currentTile, map, nth);
        let result = null;

        if(waypoint != null){
            result = this.returnNthSE(waypoint, map, nth);
        }
        return result;

    }

    //return ALL the valid diagonal movement tiles NORTH of the given coordinate
    //this accounts for blocking
    //up to a distance of dist
    //currentTile is a pointer to current tile container
    //needs an ARRAY[][] of the pointers to all tiles containers on map
    returnDiagonalsN(currentTile, map, dist=null){

        let cXY = this.cont2coord(currentTile);
        let result = [];
        let loopEnd = 0;

        if(dist == null){
            loopEnd = map[cXY.x].length - 1 - cXY.y;
        }else if(dist <= 0){
            return result;
        }else{
            loopEnd = Math.min(dist, map[cXY.x].length - 1 - cXY.y);
        }

        //NORTHWEST TILES
        for(let i=1; i<=loopEnd; i++){

            let newTile = this.returnNthDiagonalNW(currentTile, map, i);

            if(newTile != null){
                if(newTile.childElementCount > 1){
                    if(this.isCaptureValid(newTile) == true){
                        result.push(newTile);
                    }
                    break;
                }else{
                    result.push(newTile);
                }
            }else{
                break;
            }

        }

        //NORTHEAST TILES
        for(let i=1; i<=loopEnd; i++){

            let newTile = this.returnNthDiagonalNE(currentTile, map, i);

            if(newTile != null){
                if(newTile.childElementCount > 1){
                    if(this.isCaptureValid(newTile) == true){
                        result.push(newTile);
                    }
                    break;
                }else{
                    result.push(newTile);
                }
            }else{
                break;
            }

        }
        return result;

    }

    //return ALL the valid diagonal movement tiles SOUTH of the given coordinate
    //this accounts for blocking
    //up to a distance of dist
    //currentTile is a pointer to current tile container
    //needs an ARRAY[][] of the pointers to all tiles containers on map
    returnDiagonalsS(currentTile, map, dist=null){

        let cXY = this.cont2coord(currentTile);
        let result = [];
        let loopEnd = 0;

        if(dist == null){
            loopEnd = cXY.y;
        }else if(dist <= 0){
            return result;
        }else{
            loopEnd = Math.min(dist, cXY.y);
        }

        //SOUTHWEST TILES
        for(let i=1; i<=loopEnd; i++){

            let newTile = this.returnNthDiagonalSW(currentTile, map, i);

            if(newTile != null){
                if(newTile.childElementCount > 1){
                    if(this.isCaptureValid(newTile) == true){
                        result.push(newTile);
                    }
                    break;
                }else{
                    result.push(newTile);
                }
            }else{
                break;
            }

        }

        //SOUTHEAST TILES
        for(let i=1; i<=loopEnd; i++){

            let newTile = this.returnNthDiagonalSE(currentTile, map, i);

            if(newTile != null){
                if(newTile.childElementCount > 1){
                    if(this.isCaptureValid(newTile) == true){
                        result.push(newTile);
                    }
                    break;
                }else{
                    result.push(newTile);
                }
            }else{
                break;
            }

        }

        return result;

    }

    //return ALL the valid diagonal movement tiles EAST of the given coordinate
    //this accounts for blocking
    //up to a distance of dist
    //currentTile is a pointer to current tile container
    //needs an ARRAY[][] of the pointers to all tiles containers on map
    returnDiagonalsE(currentTile, map, dist=null){

        let cXY = this.cont2coord(currentTile);
        let result = [];
        let loopEnd = 0;

        if(dist == null){
            loopEnd = map.length - 1 - cXY.x;
        }else if(dist <= 0){
            return result;
        }else{
            loopEnd = Math.min(dist, map.length - 1 - cXY.x);
        }

        for(let i=1; i<=loopEnd; i++){

            let tile = this.returnNthDiagonalE(currentTile, map, i);
            if(tile == null){
                break;
            }else{
                if(tile.childElementCount > 1){
                    if(this.isCaptureValid(tile) == true){
                        result.push(tile);
                    }
                    break;    
                }
                else{
                    result.push(tile);
                }
            }

        }
        return result;

    }

    //return ALL the valid diagonal movement tiles WEST of the given coordinate
    //up to a distance of dist
    //currentTile is a pointer to current tile container
    //needs an ARRAY[][] of the pointers to all tiles containers on map
    returnDiagonalsW(currentTile, map, dist=null){

        let cXY = this.cont2coord(currentTile);
        let result = [];
        let loopEnd = 0;

        if(dist == null){
            loopEnd = cXY.x;
        }else if(dist <= 0){
            return result;
        }else{
            loopEnd = Math.min(dist, cXY.x);
        }

        for(let i=1; i<=loopEnd; i++){

            let tile = this.returnNthDiagonalW(currentTile, map, i);
            if(tile == null){
                break;
            }else{
                if(tile.childElementCount > 1){
                    if(this.isCaptureValid(tile) == true){
                        result.push(tile);
                    }
                    break;    
                }
                else{
                    result.push(tile);
                }
            }

        }
        return result;

    }

}
//#endregion

//classes for diffrent types of pieces
//#region King
export class King extends Piece {

    //needs a pointer to current tile container
    //needs an ARRAY[][] of the pointers to all tiles containers on map
    findViableTiles(currentTile, map){

        let result = [];
        let newPush = null;
        let nth = 1;

        //find all adjacent tiles
        newPush = this.returnNthN(currentTile, map, nth);
        if(newPush != null){
            if(newPush.childElementCount <= 1){
                result.push(newPush);
            }else if(this.isCaptureValid(newPush) == true){
                result.push(newPush);
            }
        }
        newPush = this.returnNthS(currentTile, map, nth);
        if(newPush != null){
            if(newPush.childElementCount <= 1){
                result.push(newPush);
            }else if(this.isCaptureValid(newPush) == true){
                result.push(newPush);
            }
        }
        newPush = this.returnNthNE(currentTile, map, nth);
        if(newPush != null){
            if(newPush.childElementCount <= 1){
                result.push(newPush);
            }else if(this.isCaptureValid(newPush) == true){
                result.push(newPush);
            }
        }
        newPush = this.returnNthSW(currentTile, map, nth);
        if(newPush != null){
            if(newPush.childElementCount <= 1){
                result.push(newPush);
            }else if(this.isCaptureValid(newPush) == true){
                result.push(newPush);
            }
        }
        newPush = this.returnNthSE(currentTile, map, nth);
        if(newPush != null){
            if(newPush.childElementCount <= 1){
                result.push(newPush);
            }else if(this.isCaptureValid(newPush) == true){
                result.push(newPush);
            }
        }
        newPush = this.returnNthNW(currentTile, map, nth);
        if(newPush != null){
            if(newPush.childElementCount <= 1){
                result.push(newPush);
            }else if(this.isCaptureValid(newPush) == true){
                result.push(newPush);
            }
        }

        //find the diagonal tiles
        result.push(...this.returnDiagonalsN(currentTile, map, nth));
        result.push(...this.returnDiagonalsS(currentTile, map, nth));
        result.push(...this.returnDiagonalsW(currentTile, map, nth));
        result.push(...this.returnDiagonalsE(currentTile, map, nth));
        
        return result;
    }

}
//#endregion

//#region Queen
export class Queen extends Piece {

    //needs a pointer to current tile container
    //needs an ARRAY[][] of the pointers to all tiles containers on map
    findViableTiles(currentTile, map){

        let result = [];
        //all straight movements
        result.push(...this.returnRayN(currentTile, map));
        result.push(...this.returnRayS(currentTile, map));
        result.push(...this.returnRayNE(currentTile, map));
        result.push(...this.returnRaySW(currentTile, map));
        result.push(...this.returnRayNW(currentTile, map));
        result.push(...this.returnRaySE(currentTile, map));
        //diagonal movements
        result.push(...this.returnDiagonalsN(currentTile, map));
        result.push(...this.returnDiagonalsS(currentTile, map));
        result.push(...this.returnDiagonalsE(currentTile, map));
        result.push(...this.returnDiagonalsW(currentTile, map));
        return result;

    }

}
//#endregion

//#region Bishop
export class Bishop extends Piece {

    //needs a pointer to current tile container
    //needs an ARRAY[][] of the pointers to all tiles containers on map
    findViableTiles(currentTile, map){

        let result = [];

        result.push(...this.returnDiagonalsN(currentTile, map));
        result.push(...this.returnDiagonalsS(currentTile, map));
        result.push(...this.returnDiagonalsE(currentTile, map));
        result.push(...this.returnDiagonalsW(currentTile, map));

        return result;
    }

    //this is an experimental function, for test only
    //needs a pointer to current tile container
    //needs an ARRAY[][] of the pointers to all tiles containers on map
    findViableTilesEX(currentTile, map){

        let result = [];
        let newPush = null;
        let nth = 3;

        newPush = this.returnNthN(currentTile, map, nth);
        if(newPush != null){
            result.push(newPush);
        }

        newPush = this.returnNthS(currentTile, map, nth);
        if(newPush != null){
            result.push(newPush);
        }

        newPush = this.returnNthNE(currentTile, map, nth);
        if(newPush != null){
            result.push(newPush);
        }

        newPush = this.returnNthSW(currentTile, map, nth);
        if(newPush != null){
            result.push(newPush);
        }

        newPush = this.returnNthSE(currentTile, map, nth);
        if(newPush != null){
            result.push(newPush);
        }

        newPush = this.returnNthNW(currentTile, map, nth);
        if(newPush != null){
            result.push(newPush);
        }

        return result;
    }

}
//#endregion

//#region Knight
export class Knight extends Piece {

    findViableTiles(currentTile, map){

        let result = [];
        let waypoint = null;

        //north tiles (left and right)
        waypoint = this.returnNthN(currentTile, map, 2);
        if(waypoint != null){
            let left = this.returnNthNW(waypoint, map, 1);
            let right = this.returnNthNE(waypoint, map, 1);
            if(left != null){
                if(left.childElementCount <= 1){
                    result.push(left);
                }else if(this.isCaptureValid(left) == true){
                    result.push(left);
                }
            }
            if(right != null){
                if(right.childElementCount <= 1){
                    result.push(right);
                }else if(this.isCaptureValid(right) == true){
                    result.push(right);
                }
            }
        }
        //south tiles (left and right)
        waypoint = this.returnNthS(currentTile, map, 2);
        if(waypoint != null){
            let left = this.returnNthSW(waypoint, map, 1);
            let right = this.returnNthSE(waypoint, map, 1);
            if(left != null){
                if(left.childElementCount <= 1){
                    result.push(left);
                }else if(this.isCaptureValid(left) == true){
                    result.push(left);
                }
            }
            if(right != null){
                if(right.childElementCount <= 1){
                    result.push(right);
                }else if(this.isCaptureValid(right) == true){
                    result.push(right);
                }
            }
        }

        //northeast tiles (left and right)
        waypoint = this.returnNthNE(currentTile, map, 2);
        if(waypoint != null){
            let left = this.returnNthN(waypoint, map, 1);
            let right = this.returnNthSE(waypoint, map, 1);
            if(left != null){
                if(left.childElementCount <= 1){
                    result.push(left);
                }else if(this.isCaptureValid(left) == true){
                    result.push(left);
                }
            }
            if(right != null){
                if(right.childElementCount <= 1){
                    result.push(right);
                }else if(this.isCaptureValid(right) == true){
                    result.push(right);
                }
            }
        }

        //northwest tiles (left and right)
        waypoint = this.returnNthNW(currentTile, map, 2);
        if(waypoint != null){
            let left = this.returnNthN(waypoint, map, 1);
            let right = this.returnNthSW(waypoint, map, 1);
            if(left != null){
                if(left.childElementCount <= 1){
                    result.push(left);
                }else if(this.isCaptureValid(left) == true){
                    result.push(left);
                }
            }
            if(right != null){
                if(right.childElementCount <= 1){
                    result.push(right);
                }else if(this.isCaptureValid(right) == true){
                    result.push(right);
                }
            }
        }

        //southeast tiles (left and right)
        waypoint = this.returnNthSE(currentTile, map, 2);
        if(waypoint != null){
            let left = this.returnNthNE(waypoint, map, 1);
            let right = this.returnNthS(waypoint, map, 1);
            if(left != null){
                if(left.childElementCount <= 1){
                    result.push(left);
                }else if(this.isCaptureValid(left) == true){
                    result.push(left);
                }
            }
            if(right != null){
                if(right.childElementCount <= 1){
                    result.push(right);
                }else if(this.isCaptureValid(right) == true){
                    result.push(right);
                }
            }
        }
        
        //southwest tiles (left and right)
        waypoint = this.returnNthSW(currentTile, map, 2);
        if(waypoint != null){
            let left = this.returnNthNW(waypoint, map, 1);
            let right = this.returnNthS(waypoint, map, 1);
            if(left != null){
                if(left.childElementCount <= 1){
                    result.push(left);
                }else if(this.isCaptureValid(left) == true){
                    result.push(left);
                }
            }
            if(right != null){
                if(right.childElementCount <= 1){
                    result.push(right);
                }else if(this.isCaptureValid(right) == true){
                    result.push(right);
                }
            }
        }

        return result;
    }

}
//#endregion

//#region Rook
export class Rook extends Piece {

    findViableTiles(currentTile, map){

        let result = [];
        
        result.push(...this.returnRayN(currentTile, map));
        result.push(...this.returnRayS(currentTile, map));
        result.push(...this.returnRayNE(currentTile, map));
        result.push(...this.returnRaySW(currentTile, map));
        result.push(...this.returnRayNW(currentTile, map));
        result.push(...this.returnRaySE(currentTile, map));

        return result;

    }

}
//#endregion

//#region Pawn
export class Pawn extends Piece {

    //variable to hold special tiles for pawns
    #epCapturable = false; //denote whether this pawn can be captured by an en passant action
    #startRows = null;
    #wht_startTiles = [{x: 1, y: 4}, {x: 2, y: 4}, {x: 3, y: 4}, {x: 4, y: 4}, {x: 5, y: 4}, {x: 6, y: 3}, {x: 7, y: 2}, {x: 8, y: 1}, {x: 9, y: 0}];
    #blk_startTiles = [{x: 1, y: 10}, {x: 2, y: 9}, {x: 3, y: 8}, {x: 4, y: 7}, {x: 5, y: 6}, {x: 6, y: 6}, {x: 7, y: 6}, {x: 8, y: 6}, {x: 9, y: 6}];
    #promoRow = null;
    #wht_endTiles = [{x: 0, y: 10}, {x: 1, y: 10}, {x: 2, y: 10}, {x: 3, y: 10}, {x: 4, y: 10}, {x: 5, y: 10}, {x: 6, y: 9}, {x: 7, y: 8}, {x: 8, y: 7}, {x: 9, y: 6}, {x: 10, y: 5}];
    #blk_endTiles = [{x: 0, y: 5}, {x: 1, y: 4}, {x: 2, y: 3}, {x: 3, y: 2}, {x: 4, y: 1}, {x: 5, y: 0}, {x: 6, y: 0}, {x: 7, y: 0}, {x: 8, y: 0}, {x: 9, y: 0}, {x: 10, y: 0}];

    constructor(typeName, colorName, tile, index){

        super(typeName, colorName, tile, index);

        if(colorName == "white"){
            this.#startRows = this.#wht_startTiles;
            this.#promoRow = this.#wht_endTiles;
        }else if(colorName == "black"){
            this.#startRows = this.#blk_startTiles;
            this.#promoRow = this.#blk_endTiles;
        }

    }

    getStartRows(){
        return this.#startRows;
    }

    getPromoRow(){
        return this.#promoRow;
    }

    //set the value of epCapturable
    //param be either true or false
    setEPCapturable(bool){

        if(bool == true || bool == false){
            this.#epCapturable = bool;
        } 

    }

    //return if the pawn is epCapturable
    isEPCapturable(){
        return this.#epCapturable;
    }

    //reposition the pawn to given tile
    //tile needs to be an element container
    //return true if the pawn is good to promote after reposition
    reposition(tile){
        //set pawn to be epCapturable if it just made a double move
        let old_tile = this.returnContainer().parentElement;
        if(Math.abs(parseInt(old_tile.id.split("-")[1]) - parseInt(tile.id.split("-")[1])) == 2){
            this.setEPCapturable(true);
        }
        //reposition the piece
        super.reposition(tile);        
        return this.canPromote(tile);

    }

    //find out if a double move is valid for the given tile
    //needs currentTile (pointer to container)
    //returns true if double move is allowed, false if not
    canDoubleMove(currentTile){
        let cXY = this.cont2coord(currentTile);
        let search = this.#startRows.find(obj => obj.x===cXY.x && obj.y===cXY.y);

        if(search != undefined){
            return true;
        }
        return false;
    }

    //find out if the given tile is a tile where promotion is allowed
    //needs currentTile (pointer to container)
    //return true if it is good to promote else returns false
    canPromote(currentTile){
        let cXY = this.cont2coord(currentTile);
        let search = this.#promoRow.find(obj => obj.x===cXY.x && obj.y===cXY.y);
        
        if(search != undefined){
            return true;
        }

        return false;
    }

    //findViableTiles function for pawn is special because it need to know the type of target piece
    findViableTiles(currentTile, map, wht_pieces, blk_pieces){

        let result = [];
        let newTile = null;
        let enPassant = null;

        if(this.showColor() == "white"){
            //if it is white
            //forward move (north)
            newTile = this.returnNthN(currentTile, map, 1);
            if(newTile != null && newTile.childElementCount <= 1){
                result.push(newTile);
                //if double move is allowed
                if(this.canDoubleMove(currentTile) == true){
                    newTile = this.returnNthN(currentTile, map, 2);
                    if(newTile != null && newTile.childElementCount <= 1){
                        result.push(newTile);
                    }
                }
            }
            //diagonal capture move NORTHEAST
            newTile = this.returnNthNE(currentTile, map, 1);
            enPassant = this.returnNthSE(currentTile, map, 1);
            if(newTile != null && this.isCaptureValid(newTile) == true){
                //if there is an enemy on the diagonal tile
                result.push(newTile);
            }else if(enPassant != null && this.isCaptureValid(enPassant) == true && newTile.childElementCount < 2){
                //check for en passant move 
                let targetPiece = this.getPieceFromTile(enPassant, wht_pieces, blk_pieces);
                if(targetPiece.showType() == "pawn" && targetPiece.isEPCapturable() == true){
                    result.push(newTile);
                }
            }
            //diagonal capture move NORTHWEST
            newTile = this.returnNthNW(currentTile, map, 1);
            enPassant = this.returnNthSW(currentTile, map, 1);
            if(newTile != null && this.isCaptureValid(newTile) == true){
                //if there is an enemy on the diagonal tile
                result.push(newTile);
            }else if(enPassant != null && this.isCaptureValid(enPassant) == true && newTile.childElementCount < 2){
                //check for en passant move
                let targetPiece = this.getPieceFromTile(enPassant, wht_pieces, blk_pieces);
                if(targetPiece.showType() == "pawn" && targetPiece.isEPCapturable() == true){
                    result.push(newTile);
                }
            }

        }else if(this.showColor() == "black"){
            //if it is black
            //forward move (south)
            newTile = this.returnNthS(currentTile, map, 1);
            if(newTile != null && newTile.childElementCount <= 1){
                result.push(newTile);
                //if double move is allowed
                if(this.canDoubleMove(currentTile) == true){
                    newTile = this.returnNthS(currentTile, map, 2);
                    if(newTile != null && newTile.childElementCount <= 1){
                        result.push(newTile);
                    }
                }
            }
            //diagonal capture move SOUTHEAST
            newTile = this.returnNthSE(currentTile, map, 1);
            enPassant = this.returnNthNE(currentTile, map, 1);
            if(newTile != null && this.isCaptureValid(newTile) == true){
                //if there is an enemy on the diagonal tile
                result.push(newTile);
            }else if(enPassant != null && this.isCaptureValid(enPassant) == true && newTile.childElementCount < 2){
                //check for en passant move 
                let targetPiece = this.getPieceFromTile(enPassant, wht_pieces, blk_pieces);
                if(targetPiece.showType() == "pawn" && targetPiece.isEPCapturable() == true){
                    result.push(newTile);
                }
            }
            //diagonal capture move SOUTHWEST
            newTile = this.returnNthSW(currentTile, map, 1);
            enPassant = this.returnNthNW(currentTile, map, 1);
            if(newTile != null && this.isCaptureValid(newTile) == true){
                //if there is an enemy on the diagonal tile
                result.push(newTile);
            }else if(enPassant != null && this.isCaptureValid(enPassant) == true && newTile.childElementCount < 2){
                //check for en passant move 
                let targetPiece = this.getPieceFromTile(enPassant, wht_pieces, blk_pieces);
                if(targetPiece.showType() == "pawn" && targetPiece.isEPCapturable() == true){
                    result.push(newTile);
                }
            }
        }
        return result;
    }

}
//#endregion
/*This is a js script for the game*/

//imports
import {Bishop, King, Knight, Pawn, Queen, Rook} from "./piece.js";

let socket = io();
let username = "";
let isPlayer = true; //indicate if the current user is a player
let game_id = null; //record which game session this user is in

//taget elements on the page
//landing page dom elements
const input1 = document.getElementById("input1");
const input2 = document.getElementById("input2");
const form1 = document.getElementById("form1");
const info1 = document.getElementById("info1");
const sect_landing = document.getElementById("landing_page");
const sect_game = document.getElementById("game_page");
//game page dom elements
const gui = document.getElementById("gui");
const gStateUI = document.getElementById("gState");
const gConsole = document.getElementById("gConsole");
const chatForm = document.getElementById("chatbar");
const chatInput = document.getElementById("chatInput");
const gameboard = document.getElementById("gameboard");
const infoTable = document.getElementById("info_table");
//modal window dom elements 
const openModalBtn = document.getElementById("openModalBtn");
const modal = document.getElementById("modal");
const modal_form = document.getElementById("modal_form");
const closeBtn = document.getElementsByClassName("close")[0];

//gameboard variables
const tiles = []; //array to store all POINTERS to (container of) all the tiles on the gameboard
const wht_pieces = []; //white pieces
const blk_pieces = []; //black pieces
const state_max = 2; //2 active states in the game, 0-white's turn, 1-black's turn, -1-not started/ended
let game_state = 0; //current state of the game
let piece_selected = null //the pointer to the piece that is selected to be moved
let tiles2highlight = null //tiles that are currently highlighted
let playerColor = null; //playerColor is null/white/black
let winner = null; //either white/black
//gameboard stats
const boardW = 11;
const boardH_max = 11;
const boardH_min = 6;
const mid_col = Math.floor((boardH_max - 1) / 2);

//#region modal

//modal window events
modal_form.addEventListener("submit", (event)=>{
    
    event.preventDefault();
    promotePawn(event.submitter.value, modal_form.pawn2promote, true);

});

//#region game page UI events
//on chat form submission
chatForm.addEventListener("submit", (event)=>{

    event.preventDefault();
    consolePrint(`${username}(you): `+chatInput.value, true);
    socket.emit("chat message", `${username}: `+chatInput.value, game_id);
    chatInput.value = "";

});

window.addEventListener("resize", (event)=>{

    scaleBoard();
    initUI();

});
//#endregion

//modal window functions
//needs a boolean 
function setModalDisplay(bool){

    if(bool == true || bool == false){
        if(bool == true){
            modal.style.display = "block";
        }else if(bool == false){
            modal.style.display = "none";
        }
    }

}
//#endregion

//#region landing_page
//prepair landing page events
form1.addEventListener("submit", (event)=>{
    event.preventDefault();

    if(event.submitter.value == "one"){
        if(input1.value){
            socket.emit("start pvp", input1.value, 1);
            username = input1.value;
            input1.value = "";
            input2.value = "";
            info1.innerText = ""
        }else{
            info1.innerText = "Please Enter an Username!"
        }
    }else if(event.submitter.value == "two"){
        if(input1.value){
            socket.emit("start pvp", input1.value, 2);
            username = input1.value;
            input1.value = "";
            input2.value = "";
            info1.innerText = ""
        }else{
            info1.innerText = "Please Enter an Username!"
        }
    }else if(event.submitter.value == "join"){
        console.log(`trying to join game ${input2.value} as ${input1.value}`);
        if(input1.value && input2.value){
            socket.emit("join game", input1.value, input2.value);
            username = input1.value;
            input1.value = "";
            input2.value = "";
            info1.innerText = ""
        }else{
            info1.innerText = "You Need an Username and a Game Session ID to Join Game!"
        }
    }

});
//#endregion

//websocket events
//#region websocket_events
socket.on("new pvp", (uName, sessionID, playerNum)=>{
    game_id = sessionID; 
    //prepare game screen
    info1.innerText = uName;
    sect_landing.classList.remove("active");
    sect_game.classList.add("active");
    //prepair gameboard
    initBoard();
    initPieces();
    initUI();
    fillInfoTable(); //fill out infoTable

    //set some game variables
    if(playerNum == 2){
        playerColor = "white";
        setGameState(-1);
    }else if(playerNum == 1){
        setGameState(0);
    }

    consolePrint(`${uName} (you) starts the game ${sessionID} as white.`);
});

socket.on("player joint", (msg, roomSize, room_id)=>{
    info1.innerText = msg;
    game_id = room_id;
    //prepare game screen
    //if game screen is not already active
    if(sect_landing.classList.contains("active") == true){
        sect_landing.classList.remove("active");
        sect_game.classList.add("active");
    }

    //set some game variables
    if(playerColor == null){
        //prepair gameboard
        initBoard();
        initPieces();
        initUI();
        playerColor = "black";
        fillInfoTable(); //fill out infoTable
    }
    //start the game, regardless of which player
    setGameState(0);

    consolePrint(msg);
});

socket.on("spectator joint", (msg, roomSize, room_id, gameLog, maxPlayers)=>{
    info1.innerText = msg;
    game_id = room_id;
    //prepare game screen
    //if game screen is not already active
    if(sect_landing.classList.contains("active") == true){
        sect_landing.classList.remove("active");
        sect_game.classList.add("active");
        //prepair gameboard
        initBoard();
        initPieces();
        initUI();
        //mark this client as spectator 
        isPlayer = false;
        //fill out infoTable
        fillInfoTable();
        //set game in motion
        setGameState(0);
        //sync gameboard
        syncBoard(gameLog);
    }
    
    consolePrint(msg + ` ${roomSize-maxPlayers} currently watching`);
});

socket.on("username taken", (msg)=>{
    info1.innerText = msg;
});

socket.on("invalid room", (msg)=>{
    info1.innerText = msg;
});

socket.on("joint rejected", (msg)=>{
    info1.innerText = msg;
});

socket.on("move piece", (moveString, sender_id)=>{
    console.log("new move received: ", moveString);
    console.log("sender id:", sender_id, "socket id:", socket.id);
    //apply the move only if this client is not the original sender
    if(sender_id != socket.id){
        socketMove(moveString);
    }
});

socket.on("pawn promotion", (promoString, sender_id)=>{
    console.log("pawn promotion received: ", promoString);
    console.log("sender id:", sender_id, "socket id:", socket.id);
    if(sender_id != socket.id){
        onPawnPromoReceived(promoString);
    }
});

socket.on("player resigned", (color, userName)=>{

    let message = userName + " (" + color + ") " + "resigns.";
    if(winner == null){
        if(color == "white"){
            winner = "black";
        }else if(color == "black"){
            winner = "white";
        }
        console.log("setting winner to:", winner);
        setGameState(-1);
    }
    consolePrint(message);

});

socket.on("spectator left", (userName)=>{

    consolePrint(`${userName} (spectator) leaves the game.`);

});

socket.on("chat message", (msg, sender_id)=>{
    if(sender_id != socket.id){
        consolePrint(msg, false, true);
    }
});
//#endregion

//#region game UI functions

//function to fillout table displaying game infomation
function fillInfoTable(){

    document.getElementById("table_uName").innerHTML = username;
    document.getElementById("table_uID").innerHTML = socket.id;
    document.getElementById("table_isPlayer").innerHTML = isPlayer;
    document.getElementById("table_gameID").innerHTML = game_id;

    if(playerColor == "black"){
        infoTable.style.backgroundColor = "black";
        infoTable.style.color = "white";
    }else if(isPlayer == false){
        infoTable.style.backgroundColor = "lightgray";
    }

}

function scaleBoard(){

    let columns = gameboard.children
    let tile = document.getElementsByClassName("tile")[0];
    let current_col_len = boardH_min;
    
    let tile_margin = parseInt(window.getComputedStyle(tile).margin.split("p")[0]);
    let tileH = tile.offsetHeight; 
    let tileW = tileH * 1.1547;
    let offsetY = -1 * (tileH / 2 + tile_margin);
    let offsetX = -1 * (tileW / 4);
    console.log("offsetX, offsetY: ", offsetX, offsetY);

    for(let i=0; i<columns.length; i++){

        //ajdust col offset
        let current_offsetY = offsetY * (current_col_len - boardH_min);
        if(i == 0 || i == boardW - 1){
            current_offsetY = 0;
        }
        columns[i].style.marginBottom = current_offsetY.toString() + "px";
        if(i != 0){
            columns[i].style.marginLeft = offsetX.toString() + "px";
        }

        if(i < mid_col){
            current_col_len += 1;
        }else{
            current_col_len -= 1;
        }

    }

}

//#endregion

//gameplay functions
//#region gameplay_code

//put a message on the console
//text given to function needs to be a string
//needs to specify if message is written by the player itself
function consolePrint(text, isSelf=false, isChat=false){

    let nuText = document.createElement("div");
    nuText.classList.add("message");
    if(isSelf == true){
        nuText.classList.add("msg_self");
    }
    nuText.innerText = text;
    if(isSelf == true){
        isChat = true;
        nuText.classList.add("self");
    }
    if(isChat == true){
        nuText.classList.add("chat");
    }

    gConsole.appendChild(nuText);
    nuText.scrollIntoView({behavior: "smooth"});

}

//a function to create movement message
//piece needs to be an object of Piece or its Child class
//capture needs to be an object of Piece or its Child class of a piece being captured
//startTile and endTile are the containers of the tiles
function writeMovementMessage(startTile, endTile, piece, capture=null){

    let result = "";
    console.log("capturing: ", capture);

    //write the message
    result += piece.returnContainer().id + " " + piece.showColor() + " " + piece.showType() + " " + " ";
    result += startTile.id + " -> " + endTile.id;
    if(capture != null){
        result += " captures " + capture.returnContainer().id + " " + capture.showColor() + " " + capture.showType();
    }

    return result;

}

//initialize game page UI
function initUI(){

    let windowW = window.innerWidth;
    let windowH = window.innerHeight;
    let gameboardW = parseInt(window.getComputedStyle(gameboard).width.split("p")[0]);
    let gameboardH = parseInt(window.getComputedStyle(gameboard).height.split("p")[0]);
    console.log("window size: ", windowW, windowH);
    console.log("gameboard size: ", gameboardW);
    console.log("gui size: ", window.getComputedStyle(gui).width, window.getComputedStyle(gui).width);
    if(windowH < windowW){
        gui.style.width = ((windowW - gameboardW)*0.9) + "px";
        gConsole.style.height = "50vh";
    }else{
        gui.style.width = 0.9 * windowW + "px";
        gConsole.style.height = ((windowH - gameboardH)*0.3) + "px";
    }

    console.log("new gui size: ", window.getComputedStyle(gui).width, window.getComputedStyle(gui).width);


}

//initialize gameboard
function initBoard(){

    let current_col_len = boardH_min;

    for(let i=0; i<boardW; i++){
        
        //create a new column CONTAINER on the gameboard
        let nuCol_cont = document.createElement("div");
        nuCol_cont.classList.add("column");
        gameboard.appendChild(nuCol_cont);

        //create a new roll of TILES to store POINTERS to tiles
        let nuCol_ptrs = [];
        let dummy_len = boardH_max - current_col_len;
        tiles.push(nuCol_ptrs);

        //generate ONE column
        for(let j=0; j<current_col_len; j++){

            let tile_text = null;
            if(i < mid_col){
                tile_text = i + "-" + (j + dummy_len);
            }else{
                tile_text = i + "-" + j;
            }

            let nuTile = document.createElement("div");

            //set up tile element
            nuTile.classList.add("tile");
            nuTile.id = tile_text;
            //add the tile overlay text to tile
            let tile_overlay = document.createElement("p");
            tile_overlay.innerText = tile_text;
            nuTile.appendChild(tile_overlay);

            nuCol_cont.appendChild(nuTile) //add tile element to the column container on page
            nuCol_ptrs.push(nuTile); //add tile element to pointer array

        }

        //find out tile size in pixels
        let tile_margin = parseInt(window.getComputedStyle(nuCol_ptrs[0]).margin.split("p")[0]);
        let tileH = nuCol_ptrs[0].offsetHeight; 
        let tileW = tileH * 1.1547;
        let offsetY = -1 * (tileH / 2 + tile_margin);
        let offsetX = -1 * (tileW / 4);
        console.log("offsetX, offsetY: ", offsetX, offsetY);
        //ajdust col offset
        let current_offsetY = offsetY * (current_col_len - boardH_min);
        if(i == 0 || i == boardW - 1){
            current_offsetY = 0;
        }
        nuCol_cont.style.marginBottom = current_offsetY.toString() + "px";
        if(i != 0){
            nuCol_cont.style.marginLeft = offsetX.toString() + "px";
        }

        //adjust col len - variable columns true
        if(i < mid_col){
            current_col_len += 1;
            //add dummy tiles to array (i < mid_col)
            for(let cout=0; cout<dummy_len; cout++){
                nuCol_ptrs.unshift(null);
            }
        }else{
            current_col_len -= 1;
            //add dummy tiles to array (i < mid_col)
            for(let cout=0; cout<dummy_len; cout++){
                nuCol_ptrs.push(null);
            }
        }

    }

    gameboard.addEventListener("click", activateClick);
    setGameState(-1);
    console.log(tiles);

}

//initialize all pieces on the board
function initPieces(){

    let newPiece = null;
    let index = 0;

    //create white pieces
    newPiece = new King("king", "white", tiles[6][0], index++);
    wht_pieces.push(newPiece);
    newPiece = new Queen("queen", "white", tiles[4][1], index++);
    wht_pieces.push(newPiece);
    //white bishops
    for(let i=0; i<3; i++){
        newPiece = new Bishop("bishop", "white", tiles[5][2-i], index++);
        wht_pieces.push(newPiece);
    }
    //white knights
    newPiece = new Knight("knight", "white", tiles[3][2], index++);
    wht_pieces.push(newPiece);
    newPiece = new Knight("knight", "white", tiles[7][0], index++);
    wht_pieces.push(newPiece);
    //white rooks
    newPiece = new Rook("rook", "white", tiles[2][3], index++);
    wht_pieces.push(newPiece);
    newPiece = new Rook("rook", "white", tiles[8][0], index++);
    wht_pieces.push(newPiece);
    //white pawns
    for(let i=0; i<9; i++){
        newPiece = new Pawn("pawn", "white", tiles[0][5], index++);
        let cXY = newPiece.getStartRows()[i];
        newPiece.reposition(tiles[cXY.x][cXY.y]);
        wht_pieces.push(newPiece);
    }

    index = 0; //reset index
    //create black pieces
    newPiece = new King("king", "black", tiles[6][9], index++); 
    blk_pieces.push(newPiece);
    newPiece = new Queen("queen", "black", tiles[4][10], index++);
    blk_pieces.push(newPiece);
    //black bishops
    for(let i=0; i<3; i++){
        newPiece = new Bishop("bishop", "black", tiles[5][8+i], index++);
        blk_pieces.push(newPiece);
    }
    //black knights
    newPiece = new Knight("knight", "black", tiles[3][10], index++);
    blk_pieces.push(newPiece);
    newPiece = new Knight("knight", "black", tiles[7][8], index++);
    blk_pieces.push(newPiece);
    //black rooks
    newPiece = new Rook("rook", "black", tiles[2][10], index++);
    blk_pieces.push(newPiece);
    newPiece = new Rook("rook", "black", tiles[8][7], index++);
    blk_pieces.push(newPiece);
    //black pawns
    for(let i=0; i<9; i++){
        newPiece = new Pawn("pawn", "black", tiles[0][10], index++);
        let cXY = newPiece.getStartRows()[i];
        newPiece.reposition(tiles[cXY.x][cXY.y]);
        blk_pieces.push(newPiece);
    }

}

//do something depends on what the user clicked on
function activateClick(event){

    //displayed what is clicked
    let obj_type = event.target.classList[0];
    console.log(`A ${obj_type} is clicked`);

    //decide what to do
    switch(obj_type){

        case "piece":
            if(checkStateMatch(event.target.id.split("-")[0]) == true && piece_selected == null){
                //if current game state allows activating movement for a piece
                console.log("activate piece");
                activatePiece(event.target);
            }else if(piece_selected != null){
                console.log("try to capture");
                //move is activated (potential capture operation)
                let targetTile = event.target.parentElement; //target tile
                if(targetTile.classList.contains("highlighted") == true){
                    //if the clicked move is valid (highlighted)
                    movePiece(piece_selected, piece_selected.returnContainer().parentElement, targetTile);
                }
            }
            break;
        case "tile":
            if(piece_selected != null){
                //if player clicked on an empty tile while a piece is selected
                //get container of the selected piece
                let p_cont = piece_selected.returnContainer();
                //the current game state allow movement
                if(checkStateMatch(p_cont.id.split("-")[0]) == true){
                    //if the clicked tile is a valid movement
                    if(event.target.classList.contains("highlighted") == true){
                        let startTile = p_cont.parentElement;
                        let endTile = event.target;
                        movePiece(piece_selected, startTile, endTile);
                    }
                    else{
                        //reset some variables
                        piece_selected = null;
                        toggleTileHiLight(tiles2highlight); //unhighlight the tiles
                        tiles2highlight = null;
                    }
                }
            }
            break;
        default:

    }

}

//show the promotion modal
function showPromoModal(pawnObj){

    console.log(`Please promote pawn ${pawnObj.returnContainer().id}`);
    modal_form.pawn2promote = pawnObj;
    setModalDisplay(true);

}

//function to promote the give pawn
function promotePawn(option, pawnObj, sendMove=false){

    //let option = event.submitter.value;
    let pawnID = pawnObj.returnContainer().id.split("-");
    let p_tile = pawnObj.returnContainer().parentElement;
    let p_array = null;
    console.log(`promote ${pawnObj.returnContainer().id} to a ${option}!`);
    //find the piece from array
    setModalDisplay(false);

    let color = null
    if(pawnID[0] == "w"){
        p_array = wht_pieces;
        color = "white";
    }else if(pawnID[0] == "b"){
        p_array = blk_pieces;
        color = "black";
    }
    //write the console message
    let msg = `${pawnObj.returnContainer().id} ${color} pawn -> ${option}`
    //delete the old piece
    pawnObj.returnContainer().remove();
    p_array[pawnID[1]] = null;

    let nuPiece = null
    //promote the piece
    switch(option){
        case "bishop":
            nuPiece = new Bishop(option, color, p_tile, pawnID[1]);
            break;
        case "rook":
            nuPiece = new Rook(option, color, p_tile, pawnID[1]);
            break;
        case "queen":
            nuPiece = new Queen(option, color, p_tile, pawnID[1]);
            break;
        case "knight":
            nuPiece = new Knight(option, color, p_tile, pawnID[1]);
            break;
        default:
    }
    if(nuPiece != null){
        p_array[pawnID[1]] = nuPiece;
    }

    //advance game stage
    setGameState((game_state + 1) % state_max);
    //print promotion on console
    consolePrint(msg);
    if(sendMove == true){
        //send change thru websocket
        socket.emit("pawn promotion", `${pawnID[0]}-${pawnID[1]} ${option}`, game_id);
    }
}

//function to reset the epCapturable state for all pawns
//color be either "white" or "black"
function resetPawnsEPC(color){

    let array_selected = null;
    if(color == "white"){
        array_selected = wht_pieces;
    }else if(color == "black"){
        array_selected = blk_pieces;
    }
    for(let i=0; i<array_selected.length; i++){
        if(array_selected[i] != null && array_selected[i].showType() == "pawn"){
            array_selected[i].setEPCapturable(false);
        }
    }

}

//move piece from startTile to endTile
//pieceObj is an OBJECT of the piece being moved
function movePiece(pieceObj, startTile, endTile){

    let msg = ""; //message to be display on console
    let captureTile = null; //tile on which a capture will be made (if there is any)
    let willAdvance = true; //is it going to advance to next turn at the end of this function

    if(pieceObj.showType() == "pawn"){
        //if the piece is a pawn
        if(endTile.childElementCount > 1){
            //if it is a potential DIRECT capture on endTile
            //write message WITH capture info on console
            msg += writeMovementMessage(startTile, endTile, pieceObj, getPieceFromTile(endTile));
            if(capture(endTile, pieceObj.showColor().charAt(0)) == true){
                captureTile = endTile;
                //reposition piece to new location on board
                if(pieceObj.reposition(endTile) == true){
                    //if it is eligible for promotion
                    showPromoModal(pieceObj);
                    willAdvance = false; //don't advance state until user selected promotion
                }
            }else{
                msg = writeMovementMessage(startTile, endTile, pieceObj);;
            }
        }
        else{
            //if not a DIRECT capture, test for an en passant capture
            let endXY = {x: parseInt(endTile.id.split("-")[0]), y: parseInt(endTile.id.split("-")[1])};
            let epXY = null; //en Passant tile for the pawn
            //find epXY base on piece color
            if(pieceObj.showColor() == "white"){
                epXY = {x: endXY.x, y: endXY.y - 1};
            }else if(pieceObj.showColor() == "black"){
                epXY = {x: endXY.x, y: endXY.y + 1};
            }
            //test for en passant capture
            let epCapture = tiles[epXY.x][epXY.y];
            console.log("endXY:", endXY, "epXY:", epXY, "epCapture:", epCapture);
            //write message WITH capture info on console
            msg += writeMovementMessage(startTile, endTile, pieceObj, getPieceFromTile(epCapture));
            if(capture(epCapture, pieceObj.showColor().charAt(0)) == true){
                //if there is an en passant capture
                captureTile = epCapture;
            }else{
                //if NO en passant capture
                msg = writeMovementMessage(startTile, endTile, piece_selected);
            }
            //reposition piece to new location on board
            if(pieceObj.reposition(endTile) == true){
                //if it is eligible for promotion
                showPromoModal(pieceObj);
                willAdvance = false; //don't advance state until user selected promotion
            }
        }


    }else{
        //if the piece is NOT a pawn
        if(endTile.childElementCount > 1){
            //if it is a potential capture
            //show message WITH capture info on console
            msg += writeMovementMessage(startTile, endTile, pieceObj, getPieceFromTile(endTile));
            if(capture(endTile, pieceObj.showColor().charAt(0)) == true){
                captureTile = endTile;
                //reposition piece to destination
                pieceObj.reposition(endTile);
            }else{
                msg = writeMovementMessage(startTile, endTile, pieceObj);
            }
        }else{
            //if it is NOT an capture
            msg += writeMovementMessage(startTile, endTile, piece_selected);
            //reposition piece to destination
            pieceObj.reposition(endTile);
        }

    }

    
    //send the move to server to be boardcasted
    sendMove(startTile, endTile, pieceObj, captureTile);
    let winner_check = checkKingStatus(); //check if both kings still alive
    //advance game state
    if(winner_check == null){
        if(willAdvance == true){
            setGameState((game_state + 1) % state_max);
        }
    }else{
        winner = winner_check;
        setGameState(-1);
    }
    
    //stuffs that has to be done regardless
    //show message of the move on game console
    consolePrint(msg);
    //reset some variables
    piece_selected = null;
    toggleTileHiLight(tiles2highlight); //unhighlight the tiles
    tiles2highlight = null;

}

//make the move that is received from websocket server
function socketMove(moveString){

    console.log(`applying move on client (${socket.id}) side...`);
    let move = moveString.split(" ");
    let piece = null;
    let p_color = move[0].split("-")[0];
    let startTile = tiles[move[1].split("-")[0]][move[1].split("-")[1]]; 
    let endTile = tiles[move[2].split("-")[0]][move[2].split("-")[1]];
    let captured_piece = null;
    let willAdvance = true;

    if(p_color == "w"){
        piece = wht_pieces[move[0].split("-")[1]];
    }else if(p_color == "b"){
        piece = blk_pieces[move[0].split("-")[1]];
    }

    //if it is a potential capture
    //moveString contains an capture tile
    if(move.length > 3){
        let capture_tile = tiles[move[3].split("-")[0]][move[3].split("-")[1]];
        captured_piece = getPieceFromTile(capture_tile);
        let isCapOK = capture(capture_tile, p_color);
        if(isCapOK == false){
            console.log("something's wrong with the capture!");
        }
    }
    
    //test if it is a pawn that requires promotion after reposition
    if(piece.showType() == "pawn"){
        if(piece.reposition(endTile) == true){
            willAdvance = false;
        }
    }else{
        piece.reposition(endTile);
    }

    let winner_check = checkKingStatus();
    //advance game state
    if(winner_check == null){
        if(willAdvance == true){
            setGameState((game_state + 1) % state_max); 
        }
    }else{
        winner = winner_check;
        setGameState(-1);
    }
    //print message log on game console
    consolePrint(writeMovementMessage(startTile, endTile, piece, captured_piece));

}

//check status of the kings on BOTH side
//returns the winner if there is one, returns null if no winner
function checkKingStatus(){
    
    if(wht_pieces[0] == null){
        return "black";
    }
    if(blk_pieces[0] == null){
        return "white";
    }
    return null
}

//send the move the player made to server
//piece needs to be an object of PIECE
function sendMove(startTile, endTile, piece, capture_tile=null){

    let moveString = piece.returnContainer().id + " " + startTile.id + " " + endTile.id;
    if(capture_tile != null){
        moveString += " " + capture_tile.id;
    }
    socket.emit("piece moves", moveString, game_id);

}

//get the piece (object) from target tile
//returns null if no piece is found on the tile
function getPieceFromTile(targetTile){

    let array = targetTile.children;
    let loopEnd = array.length;
    console.log("fetching piece from tile: ", targetTile);
    for(let i=0; i<loopEnd; i++){
        if(array[i].classList.contains("piece") == true){
            let arrayID = array[i].id.split("-");
            if(arrayID[0] == "w"){
                return wht_pieces[arrayID[1]];
            }else if(arrayID[0] == "b"){
                return blk_pieces[arrayID[1]];
            }
            return null
        }
    }
    return null

}

//sync the gameboard for a spectator who joins the game late
//gamelog is an array of moveString
function syncBoard(gameLog){

    let loopEnd = gameLog.length;
    for(let i=0; i<loopEnd; i++){
        //test if this item is move or a pawn promotion
        if(gameLog[i].split(" ").length >= 3){
            //apply a move
            socketMove(gameLog[i]);
        }else{ 
            //apply pawn promotion
            onPawnPromoReceived(gameLog[i]);
        }
    }

}

//apply the pawn promotion on client side upon receiving it from websocket
function onPawnPromoReceived(pieceInfoString){

    console.log("applying pawn promotion...");
    let stringSplits = pieceInfoString.split(" ");
    let option = stringSplits[1];
    let pawnID = stringSplits[0].split("-");
    let pawnObj = null;
    //find the object of the pawn
    if(pawnID[0] == "w"){
        pawnObj = wht_pieces[pawnID[1]];
    }else if(pawnID[0] == "b"){
        pawnObj = blk_pieces[pawnID[1]];
    }
    promotePawn(option, pawnObj);

}

//capture piece on the target tile
//color is the color of the current piece that is making the capture
//color needs to be either "w" or "b"
//return true if capture is successful else returns false
function capture(targetTile, color){

    let stackSelected = null;
    
    if(color == "w"){
        stackSelected = blk_pieces;
    }else if(color == "b"){
        stackSelected = wht_pieces;
    }else{
        return false;
    }

    let tileContents = targetTile.children;

    for(let i=0; i < tileContents.length; i++){
        //find the container of the piece
        if(tileContents[i].classList.contains("piece") == true){
            //if piece clicked is the same color
            if(tileContents[i].id.split("-")[0] === color){
                console.log("can't capture a piece of same color!")
                return false;
            }
            //remove object
            let index = tileContents[i].id.split("-")[1];
            stackSelected.splice(index, 1, null);
            console.log(`surviving ${color} pieces: `, stackSelected);
            //remove element from document page
            tileContents[i].remove();
            return true;
        }

    }
    return false;

}

//set game state to given state and refresh UI
//0-white's turn', 1-black's turn, -1-game not started/game ended
function setGameState(nuState){

    console.log(`attemp to set state to ${nuState}`);
    let displayedText = null

    switch(nuState){
        case -1:
            if(winner == null){
                displayedText = "waiting for an opponent to join..."
            }else{
                displayedText = `${winner.toUpperCase()} WINS!`
            }
            game_state = -1
            break;
        case 0:
            displayedText = "White's Turn";
            game_state = 0;
            resetPawnsEPC("white"); //reset state for all white pawns
            break;
        case 1:
            displayedText = "Black's Turn";
            game_state = 1;
            resetPawnsEPC("black"); //reset state for all black pawns
            break;
        default:
            console.log("invalid state input!");
    }

    gStateUI.innerText = displayedText;

}

//check if gamestate allow matches the piece color clicked
//true means it is ok to activate movement
//false means not ok to activate movement
function checkStateMatch(pieceColor){
    
    console.log(`player color is ${playerColor}, current turn color is ${pieceColor}, current state is ${game_state}`)
    if(playerColor == null){
        if(isPlayer == true){
            //only allow movement if the current client is a player
            console.log("two player mode");
            if(pieceColor == "w" && game_state == 0){
                //white move
                return true;
            }else if(pieceColor == "b" && game_state == 1){
                //black move
                return true;
            }
        }else{
            return false;
        }
    }
    else if(playerColor == "white"){
        if(pieceColor == "w" && game_state == 0){
            //only white can move if player is white
            return true;
        }
    }else if(playerColor == "black"){
        if(pieceColor == "b" && game_state == 1){
            //only black can move if player is black
            return true;
        }
    }
    return false;

}

//activate movement for a chess piece
//target needs to be event.target
function activatePiece(target){

    let p_id = target.id.split("-");
    console.log("moving piece id: " + target.id);
    let array_selected;
    let cParent = target.parentElement;
    console.log("current tile: ", cParent);

    //select the OBJECT of the piece clicked
    if(p_id[0] == "w"){
        array_selected = wht_pieces;
    }else if(p_id[0] == "b"){
        array_selected = blk_pieces;
    }else{
        console.log("something's wrong with the piece id info!!");
        return;
    }
    
    let p_obj = array_selected[parseInt(p_id[1])];
    console.log("piece type: ", p_obj.showType());
    //check if the targeted piece is a pawn
    if(p_obj.showType() == "pawn"){
        tiles2highlight = p_obj.findViableTiles(cParent, tiles, wht_pieces, blk_pieces);
    }else{
        tiles2highlight = p_obj.findViableTiles(cParent, tiles);
    }
    if(tiles2highlight.length > 0){
        console.log("piece selected");
        toggleTileHiLight(tiles2highlight);
        piece_selected = p_obj;
    }

}

//toggle heighlighted status of given tiles on the board
//requires an array of POINTER to tile container 
//a status of "highlighted" will be toggled in the tile's classlist
function toggleTileHiLight(cArray){
    let loopEnd = cArray.length;
    for(let i=0; i<loopEnd; i++){
        cArray[i].classList.toggle("highlighted");
    }
}
//#endregion


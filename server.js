/*This is server code for the chess game prototype*/
const express = require("express");
const http = require("http");
const socektIO = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socektIO(server);

const users = {}; //users that are currently connected to server
const sessions = {}; //game sessions that are currently in progress

app.use(express.static("client"));

io.on("connection", (socket)=>{

    console.log(`user ${socket.id} just connected.`);

    socket.on("start pvp", (userName, playerNum)=>{

        userName = userName.trim();

        if(Object.values(users).indexOf(userName) == -1){
            users[socket.id] = userName;
            sessions[socket.id] = {roomName: "game-"+socket.id, maxPlayers: playerNum, open2join: true, white: socket.id, black: null, gameLog: []};
            socket.emit("new pvp", userName, socket.id, playerNum);
        }else{
            socket.emit("username taken", `username ${userName} is already taken`);
        }

    });

    socket.on("join game", (userName, room)=>{
        
        console.log("trying to join game", Object.values(users).indexOf(userName));
        userName = userName.trim();
        room = room.trim();

        if(Object.values(users).indexOf(userName) == -1){
            //user name is valid
            if(Object.keys(sessions).indexOf(room) != -1){
                //room id is valid
                if(sessions[room].open2join == true){
                    //if the game is open to join
                    users[socket.id] = userName; //add username to list
                    let roomSize = io.sockets.adapter.rooms.get(room).size;
                    let msg = `${userName} joins the game ${room} `;
                    socket.join(room); //join this socket to the game session room
                    console.log("room-id", room, "room size: ", io.sockets.adapter.rooms.get(room).size);
                    if(roomSize < sessions[room].maxPlayers){
                        //if there isn't enough player yet, make this user a player
                        sessions[room].black = socket.id;
                        msg += "as player."
                        io.to(room).emit("player joint", msg, ++roomSize, room);
                    }else{
                        //else it is a spectator
                        msg += "as spectator."
                        io.to(room).emit("spectator joint", msg, ++roomSize, room, sessions[room].gameLog, sessions[room].maxPlayers);
                    }
                }else{
                    socket.emit("joint rejected", `game ${room} is not open to join!`);
                }
            }else{
                socket.emit("invalid room", `room ${room} does not exist!`);
            }
        }else{
            socket.emit("username taken", `username ${userName} is already taken`);
        }

    });

    //some strange issue with socket.to()
    socket.on("piece moves", (moveString, game_id)=>{
        console.log("move received: ", moveString, game_id);
        if(Object.keys(sessions).indexOf(game_id) != -1){
            //if this game session exists
            console.log("broadcasting move to game", game_id);
            //log the move
            sessions[game_id].gameLog.push(moveString);
            //socket.to().emit() won't work if trying to broadcast to the socket's own room
            //socket.to(game_id).emit("move piece", moveString, socket.id);
            io.to(game_id).emit("move piece", moveString, socket.id);
        }else{
            console.log("error, cannot find this game session.");
        }
    });

    socket.on("pawn promotion", (pieceInfo, game_id)=>{
        console.log(`piece promotion ${pieceInfo} at game ${game_id}, attempting broadcast...`);
        if(Object.keys(sessions).indexOf(game_id) != -1){
            //log the promotion
            sessions[game_id].gameLog.push(pieceInfo);
            //broadcast to room
            io.to(game_id).emit("pawn promotion", pieceInfo, socket.id);
        }else{
            console.log("error, cannot find this game session.");
        }
    });

    socket.on("chat message", (chatInput, game_id)=>{
        io.to(game_id).emit("chat message", chatInput, socket.id);
    });

    socket.on("disconnecting", ()=>{
        console.log(`user ${socket.id} disconnecting...`);

        //find out which game session this user is in
        let uRooms = Array.from(socket.rooms);
        let gSession = uRooms[0];
        if(uRooms.length > 1){
            //if this user is not the host of the game session
            gSession = uRooms[1]
        }
        console.log("socket's rooms: ", uRooms);
        console.log("gSession", gSession);
        console.log("sessions[]:", sessions, "sessions.keys[]:", Object.keys(sessions));
        console.log("session id found:", sessions[gSession]);
        if(Object.keys(sessions).indexOf(gSession) != -1){
            //if this socket client is a player of a game session
            if(sessions[gSession].white == socket.id){
                console.log(`${users[socket.id]} (white) resigns`);
                io.to(gSession).emit("player resigned", "white", users[socket.id]);
                sessions[gSession].open2join = false;
                sessions[gSession].white = null;
            }else if(sessions[gSession].black == socket.id){
                console.log(`${users[socket.id]} (black) resigns`);
                io.to(gSession).emit("player resigned", "black", users[socket.id]);
                sessions[gSession].open2join = false;
                sessions[gSession].black = null;
            }else{
                console.log(`${users[socket.id]} (spectator) leaves`);
                io.to(gSession).emit("spectator left", users[socket.id]);
            }
        }
        //do a sanity check before trying to delete a game session
        if(sessions[gSession] == undefined){
            console.log(`Oops, this game session (${gSession}) does not exist`);
        }else{
            if(sessions[gSession].white == null && sessions[gSession].black == null){
                //delete room if there is no players in it
                console.log(`deleting game session ${gSession} ...`);
                delete sessions[gSession];
            }
        }
        //delete user from list
        delete users[socket.id];
    });

});

const PORT = process.env.PORT || 3000;
server.listen(PORT, ()=>{console.log(`server running on port ${PORT} ...`)});
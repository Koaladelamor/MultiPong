const express = require('express');
const app = express();
const http = require('http');
const http_server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(http_server);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

http_server.listen(4242, () => {
  console.log('listening on *:4242');
});

let player1;
let player2;

io.on("connection", (socket) => {
	console.log("WebSocket Connection");
	if(player1 == undefined){
		player1 = socket;
		player1.emit("player_num", 1);

		player1.on("coords", (msg) => {
			if(player2 == undefined)
				return;

			player2.emit("coords", msg);
		});
		player1.on("", (msg) => {
			if(player2 == undefined)
				return;

			player2.emit("coords", msg);
		});

		//console.log("Player 1");
	}
	else if(player2 == undefined){
		player2 = socket;
		player2.emit("player_num", 2);

		player2.on("coords", (msg) => {
			if(player1 == undefined)
				return;

			player1.emit("coords", msg);
		});

		//console.log("Player 2");
	}
	else{
		console.log("Sala llena");	
		return;
	}

	socket.on("disconnect", () => {
		console.log("Alguien se ha desconectado");
	});

});

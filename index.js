const express = require('express');
const app = express();
const http = require('http');
const http_server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(http_server);
let mongo_client = require("mongodb").MongoClient;
let url = "mongodb://localhost/";
let db = "multipong";

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

http_server.listen(4242, () => {
  console.log('listening on *:4242');
});

let scores[];
mongo_client.connect(url, function(error,conn){
	console.log("Dentro de Mongo >:\)");
	if (error){
		console.log("Esto no furula TwT");
		return;
	}
	db = conn.db(db);
	db.collection("scores")find({}).toArray;
	dbo.collection("customers").find({}).toArray(function(err, result) {
	if (err) throw err;
		console.log(result);
		db.close();
	});
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
		player1.on("player1_score", (msg) => {
			if(player2 == undefined)
				return;

			player2.emit("player1_score", msg);
		});
		player1.on("player2_score", (msg) => {
			if(player2 == undefined)
				return;

			player2.emit("player2_score", msg);
		});

		player1.on("game_over", (msg) => {
			if(player2 == undefined)
				return;

			player2.emit("game_over", msg);

			setTimeout(() => {
				player1.emit("game_reset");
				player2.emit("game_reset");
			}, 3000);
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


// db.scores.insert({"player1":"player1_score", "player2":"player2_score"});

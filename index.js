const express = require('express');
const app = express();
const http = require('http');
const http_server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(http_server);
let mongo_client = require("mongodb").MongoClient;
let url = "mongodb://localhost/";
let db = "multipong";
let db_string = "multipong";
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

http_server.listen(4242, () => {
  console.log('listening on *:4242');
});

let scores;
mongo_client.connect(url, function(error,conn){
	console.log("Dentro de Mongo >:\)");
	if (error){
		console.log("Esto no furula TwT");
		return;
	}
	db = conn.db(db_string);
	//db.collection("scores")find({}).toArray;
	db.collection("leaderboard").find({}).toArray(function(err, result) {
	if (err) throw err;
		console.log(result);
		scores = result;
		//player1.emit("update_leaderboard", scores);
		//player2.emit("update_leaderboard", scores);
		//db.close();
	});
});

let player1;
let player2;

io.on("connection", (socket) => {
	console.log("WebSocket Connection");
	if(player1 == undefined){
		player1 = socket;
		player1.emit("player_num", 1);
		player1.emit("update_leaderboard", scores);

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

		player1.on("score", (msg) => {

			let message = JSON.parse(msg);
			let p1score = parseInt(message.p1_score);
			let p2score = parseInt(message.p2_score);
			let score = {
				p1_score : p1score,
				p2_score : p2score,
				date: new Date()
				}

			mongo_client.connect(url, function(error,conn){
				console.log("Dentro de Mongo >:\)");
				if (error){
					console.log("Esto no furula TwT");
					return;
				}
				db = conn.db(db_string);
				db.collection("leaderboard").insertOne(score, function(err, result) {
					if (err) throw err;
					console.log(result);
					//conn.close();
				});
				db.collection("leaderboard").find({}).toArray(function(err, result) {
					if (err) throw err;
					console.log(result);
					// update leaderboard
					scores = result;
					player1.emit("update_leaderboard", scores);
					player2.emit("update_leaderboard", scores);
					//db.close();
				});

			});
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
		player2.emit("update_leaderboard", scores);

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

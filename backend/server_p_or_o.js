// File: server.js
// --- SAVE THIS CODE IN A FILE NAMED `server.js` ---

const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Object to store player data on the server
const players = {};

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

io.on("connection", (socket) => {
  console.log("A user has connected! Socket ID:", socket.id);

  // Create a new player object for the connected user
  players[socket.id] = {
    playerId: socket.id,
    x: Math.floor(Math.random() * 700) + 50, // Random starting x position
    y: Math.floor(Math.random() * 500) + 50, // Random starting y position
  };

  // Send the current list of players to the new player
  socket.emit("currentPlayers", players);

  // Broadcast the new player's information to all other players
  socket.broadcast.emit("newPlayer", players[socket.id]);

  // Listen for player movement
  socket.on("playerMovement", (movementData) => {
    if (players[socket.id]) {
      players[socket.id].x = movementData.x;
      players[socket.id].y = movementData.y;
      // Broadcast the player's new position to all other players
      socket.broadcast.emit("playerMoved", players[socket.id]);
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    // Remove the player from our players object
    delete players[socket.id];
    // Emit a message to all other players to remove this player
    io.emit("playerDisconnected", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

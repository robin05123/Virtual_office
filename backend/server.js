// 
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

const players = {};

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Add new player with random starting position
  players[socket.id] = {
    playerId: socket.id,
    playerName: socket.handshake.auth?.username || "Guest",
    x: Math.floor(Math.random() * 700) + 50,
    y: Math.floor(Math.random() * 500) + 50,
  };

  // Send current players to new client
  socket.emit("currentPlayers", players);

  // Notify others about new player
  socket.broadcast.emit("newPlayer", players[socket.id]);

  // Listen for player movement updates
  socket.on("playerMovement", (movementData) => {
    if (players[socket.id]) {
      players[socket.id].x = movementData.x;
      players[socket.id].y = movementData.y;
      socket.broadcast.emit("playerMoved", players[socket.id]);
    }
  });

  // Chat message handler - broadcast to all
  socket.on("chatMessage", (msg) => {
    console.log("Chat message:", msg);
    io.emit("chatMessage", msg);
  });

  // WebRTC signaling handlers
  socket.on("webrtc-offer", (payload) => {
    console.log("Relaying WebRTC offer from", socket.id, "to", payload.target);
    io.to(payload.target).emit("webrtc-offer", {
      from: socket.id,
      offer: payload.offer
    });
  });

  socket.on("webrtc-answer", (payload) => {
    console.log("Relaying WebRTC answer from", socket.id, "to", payload.target);
    io.to(payload.target).emit("webrtc-answer", {
      from: socket.id,
      answer: payload.answer
    });
  });

  socket.on("webrtc-ice-candidate", (payload) => {
    console.log("Relaying WebRTC ICE candidate from", socket.id, "to", payload.target);
    io.to(payload.target).emit("webrtc-ice-candidate", {
      from: socket.id,
      candidate: payload.candidate
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    delete players[socket.id];
    io.emit("playerDisconnected", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});


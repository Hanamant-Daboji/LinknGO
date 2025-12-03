import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 4000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

app.use(
  cors({
    origin: CLIENT_ORIGIN,
  })
);

app.get("/", (req, res) => {
  res.send("LinknGo realtime server is running");
});

// In-memory room state (for MVP)
const rooms = {}; // { roomId: { users: { socketId: { userName, lat, lng } } } }

const io = new Server(server, {
  cors: {
    origin: CLIENT_ORIGIN,
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // When user joins a room
  socket.on("join-room", ({ roomId, userName }) => {
    console.log(`${userName} joined room ${roomId}`);

    socket.join(roomId);

    if (!rooms[roomId]) {
      rooms[roomId] = { users: {} };
    }

    rooms[roomId].users[socket.id] = {
      userName,
      lat: null,
      lng: null,
    };

    // Send current users list to this client
    io.to(socket.id).emit("room-users", rooms[roomId].users);

    // Notify others
    socket.to(roomId).emit("user-joined", {
      socketId: socket.id,
      userName,
    });
  });

  // Location update from a user
  socket.on("location-update", ({ roomId, lat, lng }) => {
    const room = rooms[roomId];
    if (!room || !room.users[socket.id]) return;

    room.users[socket.id].lat = lat;
    room.users[socket.id].lng = lng;

    // Broadcast to everyone in the room
    io.to(roomId).emit("location-update", {
      socketId: socket.id,
      userName: room.users[socket.id].userName,
      lat,
      lng,
    });
  });

  // Handle manual leave (optional)
  socket.on("leave-room", ({ roomId }) => {
    if (rooms[roomId]) {
      delete rooms[roomId].users[socket.id];
      socket.leave(roomId);
      socket.to(roomId).emit("user-left", { socketId: socket.id });

      if (Object.keys(rooms[roomId].users).length === 0) {
        delete rooms[roomId];
      }
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);

    // Clean up from all rooms
    for (const roomId of Object.keys(rooms)) {
      if (rooms[roomId].users[socket.id]) {
        socket.to(roomId).emit("user-left", { socketId: socket.id });
        delete rooms[roomId].users[socket.id];

        if (Object.keys(rooms[roomId].users).length === 0) {
          delete rooms[roomId];
        }
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

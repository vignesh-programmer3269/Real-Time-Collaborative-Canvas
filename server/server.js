const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const roomManager = require("./rooms");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join_room", ({ roomId, user }) => {
    socket.join(roomId);
    const room = roomManager.getRoom(roomId);

    const userData = { ...user, id: socket.id };
    room.addUser(socket.id, userData);

    socket.emit("init_state", {
      history: room.state.getHistory(),
      users: room.getUsers(),
    });

    socket.to(roomId).emit("user_joined", userData);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  socket.on("undo", ({ roomId }) => {
    const room = roomManager.getRoom(roomId);
    if (!room) return;

    const undoneAction = room.state.undo();
    if (undoneAction) {
      // Broadcast undo event
      io.to(roomId).emit("undo", { actionId: undoneAction.id });
    }
  });

  socket.on("redo", ({ roomId }) => {
    const room = roomManager.getRoom(roomId);
    if (!room) return;

    const redoneAction = room.state.redo();
    if (redoneAction) {
      io.to(roomId).emit("redo", { actionId: redoneAction.id });
    }
  });

  socket.on("request_history", ({ roomId }) => {
    const room = roomManager.getRoom(roomId);
    if (!room) return;
    socket.emit("history_response", room.state.getHistory());
  });

  socket.on("disconnecting", () => {
    const rooms = [...socket.rooms];
    rooms.forEach((roomId) => {
      const room = roomManager.getRoom(roomId);
      if (room) {
        room.removeUser(socket.id);
        socket.to(roomId).emit("user_left", { userId: socket.id });
      }
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = 8000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

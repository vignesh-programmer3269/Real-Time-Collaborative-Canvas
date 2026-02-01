const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const roomManager = require("./rooms");

const app = express();
app.use(cors());

// Health check route for Railway
app.get("/", (req, res) => {
  res.status(200).send("Server is running");
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "https://real-time-collaborative-canvas-tan.vercel.app",
      "http://localhost:3000",
    ],
    methods: ["GET", "POST"],
    credentials: false,
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

  socket.on("drawing_live", ({ roomId, start, end, style }) => {
    // Broadcast live drawing segments to others (volatile for performance)
    socket.volatile.to(roomId).emit("drawing_live", { start, end, style });
  });

  socket.on("draw_finish", ({ roomId, data }) => {
    const room = roomManager.getRoom(roomId);
    if (!room) return;

    room.state.addDrawAction(socket.id, data);
    // We don't necessarily broadcast this if 'drawing_live' covered it.
    // But we could broadcast 'history_update' if we wanted strict sync.
    // For now, rely on initial sync + live updates.
  });

  socket.on("cursor_move", ({ roomId, x, y }) => {
    const room = roomManager.getRoom(roomId);
    if (!room) return;
    room.updateUserCursor(socket.id, x, y);
    socket.volatile
      .to(roomId)
      .emit("cursor_update", { userId: socket.id, x, y });
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

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

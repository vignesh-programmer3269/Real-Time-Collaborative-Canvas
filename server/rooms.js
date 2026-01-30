const StateManager = require("./state-manager");

class Room {
  constructor(id) {
    this.id = id;
    this.users = new Map(); // socketId -> { id, color, mouseX, mouseY }
    this.state = new StateManager();
  }

  addUser(socketId, userData) {
    this.users.set(socketId, userData);
    return userData;
  }

  removeUser(socketId) {
    const user = this.users.get(socketId);
    this.users.delete(socketId);
    return user;
  }

  updateUserCursor(socketId, x, y) {
    const user = this.users.get(socketId);
    if (user) {
      user.mouseX = x;
      user.mouseY = y;
    }
  }

  getUsers() {
    return Array.from(this.users.values());
  }
}

class RoomManager {
  constructor() {
    this.rooms = new Map();
  }

  getRoom(roomId) {
    if (!this.rooms.has(roomId)) {
      console.log(`Creating new room: ${roomId}`);
      this.rooms.set(roomId, new Room(roomId));
    }
    return this.rooms.get(roomId);
  }
}

module.exports = new RoomManager();

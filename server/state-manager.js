const { v4: uuidv4 } = require("uuid");

class StateManager {
  constructor() {
    this.globalHistory = []; // Array of { id, userId, type, ...data }
    this.redoStack = []; // Array of undone actions (optional, for global redo)
  }

  addDrawAction(userId, data) {
    // data should contain: points, color, width, etc.
    const action = {
      id: uuidv4(),
      userId,
      timestamp: Date.now(),
      type: "draw",
      data,
    };
    this.globalHistory.push(action);
    this.redoStack = []; // Clear redo stack on new action
    console.log(
      `[State] Add Action. History: ${this.globalHistory.length}, RedoStack: ${this.redoStack.length}`,
    );
    return action;
  }

  undo() {
    if (this.globalHistory.length === 0) {
      console.log("[State] Undo failed: History empty");
      return null;
    }

    const action = this.globalHistory.pop();
    this.redoStack.push(action);
    console.log(
      `[State] Undo. History: ${this.globalHistory.length}, RedoStack: ${this.redoStack.length}`,
    );
    return action; // Return the action that was undone
  }

  redo() {
    if (this.redoStack.length === 0) {
      console.log("[State] Redo failed: Stack empty");
      return null;
    }

    const action = this.redoStack.pop();
    this.globalHistory.push(action);
    console.log(
      `[State] Redo. History: ${this.globalHistory.length}, RedoStack: ${this.redoStack.length}`,
    );
    return action; // Return the action that was redone
  }

  getHistory() {
    return this.globalHistory;
  }
}

module.exports = StateManager;

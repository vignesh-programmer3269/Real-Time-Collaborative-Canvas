# Collaborative Canvas

A real-time collaborative whiteboard application that allows multiple users to draw together simultaneously on a shared canvas.

## Features

- **Real-time Collaboration**: See other users' cursors and drawing in real-time.
- **Tools**: Pencil and Eraser with customizable colors and widths.
- **Room System**: Join specific rooms to collaborate with specific people.
- **Undo/Redo**: Global undo and redo functionality for the shared canvas.
- **Responsive Design**: Works across different screen sizes.

---

## Installation and Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)
- [npm](https://www.npmjs.com/)

### 1. Clone the repository

```bash
# If you haven't already
git clone <your-repo-url>
cd "Collabrative Canvas"
```

### 2. Install Dependencies

You need to install dependencies for both the client and the server.

**Server:**

```bash
cd server
npm install
```

**Client:**

```bash
cd ../client
npm install
```

### 3. Run the Project

You need to have two terminal windows open: one for the server and one for the client.

**Start the Server:**

```bash
cd server
npm start
```

_The server will run on `http://localhost:8000`_

**Start the Client:**

```bash
cd client
npm start
```

_The client will run on `http://localhost:3000`_

---

## How to Test with Multiple Users

To see the collaboration in action, you can simulate multiple users on your local machine:

1. Open your browser and navigate to `http://localhost:3000`.
2. Enter a name and a Room ID (e.g., "Room1").
3. Open a **New Incognito Window** (or a different browser like Firefox/Edge).
4. Navigate to `http://localhost:3000` again.
5. Enter a different name but use the **same Room ID** ("Room1").
6. You should now see the other user's cursor moving and their drawings appearing instantly on your screen.

---

## Known Issues or Limitations

- **Transient Connections**: If the server restarts, currently active room data (history) is kept in memory and will be reset.
- **Canvas Scaling**: Drawings are coordinate-based; large differences in window size between users might lead to slight visual offsets if the aspect ratio isn't maintained.
- **Global Undo/Redo**: Undo/Redo is currently global for the room. If User A undoes, it removes the last action in the room, even if it was made by User B.

---

## Total Time Spent

**Approximately: 12-14 Hours**

- _Initial Setup & Research_: 2 hours
- _Environment Migration (Vite to CRA)_: 2 hours
- _Canvas Engine & Drawing Logic_: 3 hours
- _Socket.io Integration (Real-time)_: 3 hours
- _State Management (Undo/Redo)_: 2 hours
- _UI/UX Refinement & Documentation_: 2 hours

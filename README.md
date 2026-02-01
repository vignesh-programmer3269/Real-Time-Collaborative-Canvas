# Real-Time Collaborative Canvas

A seamless real-time collaborative drawing application that allows multiple users to draw on a shared canvas simultaneously. Built with a React frontend and a Node.js/Socket.io backend.

## Features

- **Real-time Drawing**: See other users' brush strokes as they happen.
- **Live Cursors**: Track the presence and activity of other collaborators.
- **Global Undo/Redo**: Revert or restore actions across the entire session.
- **Adaptive UI**: Responsive toolbar and canvas that fits any screen size.
- **Eraser Mode**: Toggle between drawing and erasing with ease.

## Installation and Running

To get the project up and running locally, follow these steps:

### Prerequisites

- Node.js (v16 or higher)
- npm

### Setup

1. **Install dependencies for all components:**

   ```bash
   npm run install:all
   ```

   _This command installs dependencies in both the `client` and `server` folders._

2. **Start the application:**

   ```bash
   npm start
   ```

   _This will concurrently start the backend server (port 8000) and the frontend dev server (port 3000)._

3. **Access the app:**
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Testing with Multiple Users

To test the collaborative features:

1. Open the application in your primary browser.
2. Open the same URL ([http://localhost:3000](http://localhost:3000)) in an Incognito/Private window or a different browser (e.g., Firefox, Edge).
3. Enter different names for each user.
4. Draw on one canvas and watch the strokes and cursor appear instantly on the other window.

## Known Issues or Limitations

- **Canvas Persistence**: Since the project doesn't use a persistent database, the canvas history is cleared when the backend server restarts.
- **Global Undo/Redo**: The current implementation for undo/redo is global (LIFO), meaning it undoes the very last action taken in the room, regardless of who performed it.
- **High Latency Environments**: In extremely slow network conditions, live stroke segments might appear slightly fragmented before the final synchronization.

## Total Time Spent

- **Estimated Development Time**: ~10 hours
- **Core Implementation**: ~8 hours (React, Socket.io, Canvas API)
- **Deployment & Debugging**: ~4 hours (Render, CORS, Environment config) ~3 hours deploying backend in Railway and change to Render due to required of upgrade

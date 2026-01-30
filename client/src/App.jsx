import { useState, useEffect } from "react";
import Canvas from "./components/Canvas";
import Toolbar from "./components/Toolbar";
import { socket } from "./socket";

import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [color, setColor] = useState("#000000");
  const [width, setWidth] = useState(5);
  const [roomId] = useState("main-room");

  useEffect(() => {
    if (!isLoggedIn) return;

    socket.connect();

    const user = {
      name: userName,
      color: "#" + Math.floor(Math.random() * 16777215).toString(16),
    };

    socket.emit("join_room", { roomId, user });

    return () => {
      socket.disconnect();
    };
  }, [isLoggedIn, roomId, userName]);

  const handleUndo = () => {
    socket.emit("undo", { roomId });
  };

  const handleRedo = () => {
    socket.emit("redo", { roomId });
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (userName.trim()) {
      setIsLoggedIn(true);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="login-screen">
        <form onSubmit={handleLogin} className="login-card">
          <h1>Join Collaborative Canvas</h1>
          <input
            type="text"
            placeholder="Enter your name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            autoFocus
          />
          <button type="submit">Join</button>
        </form>
      </div>
    );
  }

  return (
    <div className="app">
      <Toolbar
        color={color}
        setColor={setColor}
        width={width}
        setWidth={setWidth}
        onUndo={handleUndo}
        onRedo={handleRedo}
      />
      <Canvas color={color} width={width} roomId={roomId} userName={userName} />
    </div>
  );
}

export default App;

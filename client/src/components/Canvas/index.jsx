import { useEffect, useRef, useState } from "react";
import { socket } from "../../socket";
import "./index.css";

const Canvas = ({ color, width, roomId, userName }) => {
  const bgCanvasRef = useRef(null);
  const uiCanvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // State to store users for cursor rendering
  const [otherUsers, setOtherUsers] = useState({}); // { [id]: { x, y, name, color } }

  // Internal ref to keep track of drawing state without causing re-renders
  const lastPos = useRef({ x: 0, y: 0 });

  const getCanvasCoordinates = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || e.touches?.[0]?.clientX;
    const clientY = e.clientY || e.touches?.[0]?.clientY;

    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  // Draw Line Function
  const drawLine = (ctx, start, end, style) => {
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.strokeStyle = style.color;
    ctx.lineWidth = style.width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
  };

  // Helper to redraw entire history
  const redrawHistory = (ctx, history) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    history.forEach((action) => {
      if (action.type === "draw") {
        const { points, color, width } = action.data;
        if (!points || points.length < 2) return;

        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.stroke();
      }
    });
  };

  useEffect(() => {
    const bgCanvas = bgCanvasRef.current;
    const uiCanvas = uiCanvasRef.current;
    const bgCtx = bgCanvas.getContext("2d");

    // Initial Resize
    const handleResize = () => {
      bgCanvas.width = window.innerWidth;
      bgCanvas.height = window.innerHeight;
      uiCanvas.width = window.innerWidth;
      uiCanvas.height = window.innerHeight;

      socket.emit("request_history", { roomId });
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    // Socket Event Listeners

    // 1. Init State
    socket.on("init_state", ({ history, users }) => {
      redrawHistory(bgCtx, history);
      const usersMap = {};
      users.forEach((u) => {
        if (u.id !== socket.id) usersMap[u.id] = { ...u, x: 0, y: 0 };
      });
      setOtherUsers(usersMap);
    });

    socket.on("user_joined", (user) => {
      setOtherUsers((prev) => ({
        ...prev,
        [user.id]: { ...user, x: 0, y: 0 },
      }));
    });

    // 2. Real-time Draw
    socket.on("draw", (action) => {
      if (action.type === "draw") {
        // Handled via history for now if needed, or ignored if transient
      }
    });

    socket.on("drawing_live", ({ start, end, style }) => {
      drawLine(bgCtx, start, end, style);
    });

    socket.on("undo", ({ actionId }) => {
      socket.emit("request_history", { roomId });
    });

    socket.on("redo", ({ actionId }) => {
      socket.emit("request_history", { roomId });
    });

    socket.on("history_response", (history) => {
      redrawHistory(bgCtx, history);
    });

    // Cursor Update
    socket.on("cursor_update", ({ userId, x, y }) => {
      setOtherUsers((prev) => {
        if (!prev[userId]) return prev;
        return { ...prev, [userId]: { ...prev[userId], x, y } };
      });
    });

    socket.on("user_left", ({ userId }) => {
      setOtherUsers((prev) => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });
    });

    return () => {
      window.removeEventListener("resize", handleResize);
      socket.off("init_state");
      socket.off("draw");
      socket.off("drawing_live");
      socket.off("undo");
      socket.off("redo");
      socket.off("history_response");
      socket.off("cursor_update");
      socket.off("user_left");
      socket.off("user_joined");
    };
  }, [roomId]);

  // Cursor Rendering Loop
  useEffect(() => {
    const uiCanvas = uiCanvasRef.current;
    const ctx = uiCanvas.getContext("2d");
    let animationFrameId;

    const renderCursors = () => {
      ctx.clearRect(0, 0, uiCanvas.width, uiCanvas.height);
      Object.entries(otherUsers).forEach(([id, pos]) => {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = pos.color || "red";
        ctx.fill();
        ctx.fillStyle = "white";
        ctx.font = "12px sans-serif";
        ctx.fillText(pos.name || id.slice(0, 4), pos.x + 8, pos.y);
      });
      animationFrameId = requestAnimationFrame(renderCursors);
    };

    renderCursors();
    return () => cancelAnimationFrame(animationFrameId);
  }, [otherUsers]);

  // Input Handlers
  const startDrawing = (e) => {
    const { x, y } = getCanvasCoordinates(e, bgCanvasRef.current);
    setIsDrawing(true);
    lastPos.current = { x, y };
    // Start a buffer for the full stroke
    bgCanvasRef.current.strokeBuffer = [{ x, y }];
  };

  const draw = (e) => {
    if (!isDrawing) {
      // Emit cursor move even if not drawing
      const { x, y } = getCanvasCoordinates(e, bgCanvasRef.current);
      socket.emit("cursor_move", { roomId, x, y });
      return;
    }

    const bgCtx = bgCanvasRef.current.getContext("2d");
    const { x, y } = getCanvasCoordinates(e, bgCanvasRef.current);
    const start = lastPos.current;

    // Draw locally
    drawLine(bgCtx, start, { x, y }, { color, width });

    // Emit live segment
    socket.emit("drawing_live", {
      roomId,
      start,
      end: { x, y },
      style: { color, width },
    });

    // Update state
    lastPos.current = { x, y };
    bgCanvasRef.current.strokeBuffer.push({ x, y });
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    // Emit final stroke to history
    const points = bgCanvasRef.current.strokeBuffer;
    if (points && points.length > 1) {
      socket.emit("draw_finish", { roomId, data: { points, color, width } });
    }
  };

  // Determine cursor class
  const cursorClass = color === "#f0f0f0" ? "cursor-eraser" : "cursor-pencil";

  return (
    <div className={`canvas-container ${cursorClass}`}>
      <canvas
        ref={bgCanvasRef}
        className="canvas-layer canvas-bg"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />
      <canvas ref={uiCanvasRef} className="canvas-layer canvas-ui" />
    </div>
  );
};

export default Canvas;

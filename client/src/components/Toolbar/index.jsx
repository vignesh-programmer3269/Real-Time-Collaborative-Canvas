import "./index.css";

const ERASER_COLOR = "#f0f0f0"; // Matches App.css background

const Toolbar = ({ color, setColor, width, setWidth, onUndo, onRedo }) => {
  return (
    <div className="toolbar">
      <div className="toolbar-group">
        <label>Color: </label>
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="color-select"
        />
      </div>

      <div className="toolbar-separator" />

      <div className="toolbar-group">
        <button
          className="tool-btn"
          style={{
            background: color === ERASER_COLOR ? "#888" : "#555",
            border: color === ERASER_COLOR ? "2px solid white" : "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "5px",
          }}
          onClick={() => setColor(ERASER_COLOR)}
          title="Eraser"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path
              d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.9-9.9c1-1 2.5-1 3.4 0l4.4 4.4c1 1 1 2.5 0 3.4L10.5 21z"
              fill="#ffb6c1"
            />
            <path d="m15 5 4 4" />
          </svg>
        </button>
      </div>

      <div className="toolbar-separator" />

      <div className="toolbar-group">
        <label>Size: </label>
        <input
          type="range"
          min="1"
          max="50"
          value={width}
          onChange={(e) => setWidth(parseInt(e.target.value))}
        />
        <span style={{ width: "30px", textAlign: "center" }}>{width}px</span>
      </div>

      <div className="toolbar-separator" />

      <div className="toolbar-group">
        <button onClick={onUndo} className="action-btn">
          Undo
        </button>
        <button onClick={onRedo} className="action-btn">
          Redo
        </button>
      </div>
    </div>
  );
};

export default Toolbar;

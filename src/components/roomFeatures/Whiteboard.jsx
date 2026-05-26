"use client";
import React, { useRef, useState, useEffect } from "react";
import { Stage, Layer, Line, Rect, Circle, Ellipse, Text } from "react-konva";
import { useUser } from "@clerk/nextjs";
import { toast } from "react-toastify";
import { io } from "socket.io-client";
import {
  Pencil, Eraser, Minus, RectangleHorizontal, Square,
  CircleIcon, Ellipsis, Type, Undo2, Save, Loader2
} from "lucide-react";

const toolConfig = [
  { id: "draw",    label: "Draw",    Icon: Pencil },
  { id: "eraser",  label: "Eraser",  Icon: Eraser },
  { id: "line",    label: "Line",    Icon: Minus },
  { id: "rect",    label: "Rect",    Icon: RectangleHorizontal },
  { id: "square",  label: "Square",  Icon: Square },
  { id: "circle",  label: "Circle",  Icon: CircleIcon },
  { id: "ellipse", label: "Ellipse", Icon: Ellipsis },
  { id: "text",    label: "Text",    Icon: Type },
];

const Whiteboard = ({ roomId }) => {
  const stageRef = useRef(null);
  const containerRef = useRef(null);
  const wrapperRef = useRef(null);
  const textAreaRef = useRef(null);
  const { user } = useUser();
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const [tool, setTool] = useState("draw");
  const [color, setColor] = useState("#ffffff");
  const [lineWidth, setLineWidth] = useState(4);
  const [saving, setSaving] = useState(false);
  const [lines, setLines] = useState([]);
  const [shapes, setShapes] = useState([]);
  const [currentShape, setCurrentShape] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const [texts, setTexts] = useState([]);
  const [isEditingText, setIsEditingText] = useState(false);
  const [textPos, setTextPos] = useState({ x: 0, y: 0 });
  const [cursors, setCursors] = useState({});

  useEffect(() => {
    const updateSize = () => {
      if (wrapperRef.current) {
        const w = wrapperRef.current.clientWidth;
        setStageSize({ width: w, height: Math.max(480, window.innerHeight - 200) });
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const socketRef = useRef();

  useEffect(() => {
    socketRef.current = io("https://mindora-new-1.onrender.com");
    const socket = socketRef.current;

    if (roomId && user) {
      socket.emit("join-room", {
        roomId,
        userName: user.fullName || user.username || "Anonymous"
      });
    }

    socket.on("draw-action", ({ type, data }) => {
      if (type === "line") setLines(prev => [...prev, data]);
      else if (type === "shape") setShapes(prev => [...prev, data]);
      else if (type === "text") setTexts(prev => [...prev, data]);
    });

    socket.on("cursor-move", ({ userId, name, x, y }) => {
      setCursors((prev) => ({ ...prev, [userId]: { x, y, name } }));
    });

    return () => { socket.disconnect(); };
  }, [roomId, user]);

  useEffect(() => {
    if (!socketRef.current) return;
    socketRef.current.on("cursor-move", ({ userId, name, x, y }) => {
      setCursors((prev) => ({ ...prev, [userId]: { x, y, name } }));
    });
    return () => { socketRef.current.off("cursor-move"); };
  }, [roomId]);

  const handleMouseDown = (e) => {
    const pos = e.target.getStage().getPointerPosition();

    if (tool === "draw" || tool === "eraser") {
      setIsDrawing(true);
      setLines([...lines, {
        points: [pos.x, pos.y],
        color: tool === "eraser" ? "white" : color,
        strokeWidth: lineWidth,
      }]);
    } else if (["line", "rect", "square", "circle", "ellipse"].includes(tool)) {
      setIsDrawing(true);
      setCurrentShape({ type: tool, start: pos, end: pos, color, strokeWidth: lineWidth });
    } else if (tool === "text" && !isEditingText) {
      setTextPos({ x: pos.x, y: pos.y });
      const ta = textAreaRef.current;
      if (!ta || !containerRef.current) return;
      ta.style.display = "block";
      ta.style.position = "absolute";
      ta.style.left = `${pos.x}px`;
      ta.style.top = `${pos.y}px`;
      ta.style.minWidth = "200px";
      ta.style.width = "400px";
      ta.style.height = "100px";
      ta.style.fontSize = "18px";
      ta.style.border = "1px solid #ccc";
      ta.style.padding = "4px";
      ta.style.background = "#111111";
      ta.style.color = color;
      ta.style.zIndex = 1000;
      ta.value = "";
      setTimeout(() => ta.focus(), 0);
      setIsEditingText(true);
    }
  };

  const handleMouseMove = (e) => {
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();

    if (pos && user) {
      socketRef.current.emit("cursor-move", {
        roomId,
        userId: user.id,
        name: user.fullName || user.username || "Anonymous",
        x: pos.x,
        y: pos.y,
      });
    }
    if (!isDrawing) return;

    if (tool === "draw" || tool === "eraser") {
      const lastLine = lines[lines.length - 1];
      lastLine.points = lastLine.points.concat([pos.x, pos.y]);
      setLines(lines.slice(0, -1).concat(lastLine));
      socketRef.current.emit("draw-action", { roomId, type: "line", data: lastLine });
    } else if (currentShape) {
      setCurrentShape({ ...currentShape, end: pos });
    }
  };

  const handleMouseUp = () => {
    if (tool === "draw" || tool === "eraser") {
      setIsDrawing(false);
      const lastLine = lines[lines.length - 1];
      if (lastLine) {
        socketRef.current.emit("draw-action", { roomId, type: "line", data: lastLine });
      }
    } else if (currentShape) {
      setShapes([...shapes, currentShape]);
      socketRef.current.emit("draw-action", { roomId, type: "shape", data: currentShape });
      setCurrentShape(null);
      setIsDrawing(false);
    }
  };

  const handleTextCommit = () => {
    const ta = textAreaRef.current;
    if (!ta) return;
    const value = ta.value.trim();
    if (value !== "") {
      const newText = { x: textPos.x, y: textPos.y, text: value, color, fontSize: 20 };
      setTexts([...texts, newText]);
      socketRef.current.emit("draw-action", { roomId, type: "text", data: newText });
    }
    ta.style.display = "none";
    ta.value = "";
    setIsEditingText(false);
  };

  const handleSaveToDB = async () => {
    if (isEditingText) handleTextCommit();
    if (!stageRef.current || !user) return;
    setSaving(true);
    try {
      const uri = stageRef.current.toDataURL({ pixelRatio: 2 });
      const res = await fetch(uri);
      const blob = await res.blob();
      const formData = new FormData();
      formData.append("file", blob);
      formData.append("upload_preset", "your_upload_preset");
      const cloudRes = await fetch("/api/upload", { method: "POST", body: formData });
      const cloudData = await cloudRes.json();
      if (cloudData.error) throw new Error(cloudData.error);
      const imageUrl = cloudData.secure_url;
      const saveRes = await fetch("/api/images/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, topic: "Whiteboard Drawing", uploaderId: user.id, link: imageUrl }),
      });
      const saveData = await saveRes.json();
      if (saveData.error) throw new Error(saveData.error);
      toast.success("Whiteboard saved successfully!");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Save failed");
    }
    setSaving(false);
  };

  const handleUndo = () => {
    if (lines.length > 0) setLines(lines.slice(0, -1));
    else if (shapes.length > 0) setShapes(shapes.slice(0, -1));
    else if (texts.length > 0) setTexts(texts.slice(0, -1));
  };

  const renderShape = (shape, i) => {
    const { start, end, color, strokeWidth, type, xOffset = 0, yOffset = 0 } = shape;
    const x = start.x + xOffset;
    const y = start.y + yOffset;
    const w = end.x - start.x;
    const h = end.y - start.y;

    switch (type) {
      case "line":
        return <Line key={i} points={[start.x, start.y, end.x, end.y]} stroke={color} strokeWidth={strokeWidth} lineCap="round" />;
      case "rect":
        return <Rect key={i} x={x} y={y} width={w} height={h} stroke={color} strokeWidth={strokeWidth} fill="transparent" />;
      case "square": {
        const size = Math.max(Math.abs(w), Math.abs(h));
        return <Rect key={i} x={x} y={y} width={size} height={size} stroke={color} strokeWidth={strokeWidth} fill="transparent" />;
      }
      case "circle": {
        const radius = Math.sqrt(w * w + h * h);
        return <Circle key={i} x={x} y={y} radius={radius} stroke={color} strokeWidth={strokeWidth} fill="transparent" />;
      }
      case "ellipse":
        return <Ellipse key={i} x={x + w / 2} y={y + h / 2} radiusX={Math.abs(w / 2)} radiusY={Math.abs(h / 2)} stroke={color} strokeWidth={strokeWidth} fill="transparent" />;
      default:
        return null;
    }
  };

  const renderCurrentShape = () => {
    if (!currentShape) return null;
    return renderShape(currentShape, "current");
  };

  return (
    <div className="p-4 md:p-6 min-h-full flex flex-col gap-4" style={{ color: "#f4f4ff" }}>

      {/* Toolbar */}
      <div
        className="flex flex-wrap items-center gap-2 px-4 py-3 rounded-2xl"
        style={{
          background: "linear-gradient(160deg, #111128 0%, #0d0d1f 100%)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
        }}
      >
        {/* Tool buttons */}
        <div className="flex flex-wrap gap-1.5">
          {toolConfig.map(({ id, label, Icon }) => {
            const active = tool === id;
            return (
              <button
                key={id}
                onClick={() => setTool(id)}
                title={label}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150"
                style={
                  active
                    ? {
                        background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                        color: "#fff",
                        boxShadow: "0 0 14px rgba(124,58,237,0.4)",
                      }
                    : {
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        color: "#8888aa",
                      }
                }
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            );
          })}
        </div>

        {/* Divider */}
        <div className="w-px h-8 mx-1 flex-shrink-0" style={{ background: "rgba(255,255,255,0.08)" }} />

        {/* Stroke width */}
        <div className="flex gap-1">
          {[{ label: "Thin", value: 2 }, { label: "Normal", value: 4 }, { label: "Thick", value: 8 }].map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setLineWidth(value)}
              className="px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150"
              style={
                lineWidth === value
                  ? { background: "linear-gradient(135deg, #7c3aed, #4f46e5)", color: "#fff", boxShadow: "0 0 14px rgba(124,58,237,0.4)" }
                  : { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#8888aa" }
              }
            >
              {label}
            </button>
          ))}
        </div>

        {/* Color picker */}
        <div
          className="relative flex items-center justify-center rounded-xl overflow-hidden"
          style={{
            width: 38,
            height: 38,
            border: "2px solid rgba(124,58,237,0.4)",
            boxShadow: "0 0 10px rgba(124,58,237,0.2)",
          }}
          title="Pick color"
        >
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            style={{
              width: 52,
              height: 52,
              border: "none",
              padding: 0,
              cursor: "pointer",
              position: "absolute",
              top: -6,
              left: -6,
              background: "none",
            }}
          />
        </div>

        {/* Divider */}
        <div className="w-px h-8 mx-1 flex-shrink-0" style={{ background: "rgba(255,255,255,0.08)" }} />

        {/* Undo */}
        <button
          onClick={handleUndo}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150"
          style={{
            background: "rgba(251,146,60,0.1)",
            border: "1px solid rgba(251,146,60,0.25)",
            color: "#fdba74",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(251,146,60,0.18)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(251,146,60,0.1)"; }}
        >
          <Undo2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Undo</span>
        </button>

        {/* Save */}
        <button
          onClick={handleSaveToDB}
          disabled={saving}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150"
          style={
            saving
              ? { background: "rgba(124,58,237,0.15)", color: "#5e5e80", cursor: "not-allowed" }
              : {
                  background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                  color: "#fff",
                  boxShadow: "0 0 14px rgba(124,58,237,0.35)",
                  cursor: "pointer",
                }
          }
          onMouseEnter={(e) => { if (!saving) e.currentTarget.style.boxShadow = "0 0 24px rgba(124,58,237,0.55)"; }}
          onMouseLeave={(e) => { if (!saving) e.currentTarget.style.boxShadow = "0 0 14px rgba(124,58,237,0.35)"; }}
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{saving ? "Saving..." : "Save"}</span>
        </button>
      </div>

      {/* Canvas wrapper — measures available width */}
      <div ref={wrapperRef} className="w-full">
      {/* Canvas container — blackboard */}
      <div
        ref={containerRef}
        style={{
          backgroundColor: "#111111",
          width: "100%",
          height: stageSize.height,
          position: "relative",
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 0 0 2px rgba(124,58,237,0.3), 0 8px 40px rgba(0,0,0,0.6)",
        }}
      >
        <Stage
          width={stageSize.width}
          height={stageSize.height}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          ref={stageRef}
        >
          <Layer>
            {lines.map((line, i) =>
              line && line.points ? (
                <Line key={i} points={line.points} stroke={line.color} strokeWidth={line.strokeWidth} lineCap="round" />
              ) : null
            )}
            {shapes.map(renderShape)}
            {renderCurrentShape()}
            {texts.map((t, i) => (
              <Text key={i} x={t.x} y={t.y} text={t.text} fontSize={t.fontSize} fill={t.color} />
            ))}
          </Layer>
          <Layer>
            {Object.entries(cursors).map(([id, c]) =>
              id !== user?.id ? (
                <React.Fragment key={id}>
                  <Circle x={c.x} y={c.y} radius={5} fill="red" />
                  <Text x={c.x + 8} y={c.y - 10} text={c.name} fontSize={14} fill="#f4f4ff" />
                </React.Fragment>
              ) : null
            )}
          </Layer>
        </Stage>

        {/* Textarea for text tool */}
        <textarea
          ref={textAreaRef}
          style={{
            display: "none",
            position: "absolute",
            zIndex: 1000,
            background: "#111111",
            border: "1px solid rgba(255,255,255,0.2)",
            padding: "4px",
            fontSize: "18px",
            outline: "none",
            resize: "none",
            minHeight: "22px",
          }}
          onBlur={handleTextCommit}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); handleTextCommit(); }
          }}
        />
      </div>
      </div>
    </div>
  );
};

export default Whiteboard;
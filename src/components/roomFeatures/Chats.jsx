"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Users } from "lucide-react";
import { io } from "socket.io-client";

export default function ChatWidget({ roomId, userName }) {
  const socketRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  // Connect to socket when component mounts
  useEffect(() => {
    if (!roomId || !userName) return;

    // socketRef.current = io("https://mindora-new-1.onrender.com");
    socketRef.current = io("http://localhost:3001");
    socketRef.current.emit("join-room", { roomId, userName });

    socketRef.current.on("receive-message", (msgData) => {
      setMessages((prev) => [...prev, msgData]);
    });

    socketRef.current.on("user-joined", ({ userName }) => {
      setMessages((prev) => [
        ...prev,
        { text: `${userName} joined the chat`, sender: "System", time: "" },
      ]);
    });

    socketRef.current.on("online-users", (users) => {
      setOnlineUsers(users.map((u) => u.userName));
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [roomId, userName]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || !socketRef.current) return;

    const msgData = {
      sender: userName,
      text: input,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    socketRef.current.emit("send-message", { roomId, userName, message: input });

    setInput(""); // server will send back the message
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col w-[92vw] sm:w-[380px]"
            style={{
              maxHeight: "80vh",
              background: "linear-gradient(160deg, #111128 0%, #0d0d1f 100%)",
              border: "1px solid rgba(124,58,237,0.3)",
              borderRadius: 20,
              boxShadow: "0 8px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(124,58,237,0.1)",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3 flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-white" />
                <span className="font-semibold text-sm text-white">Room Chat</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg transition-all"
                style={{ background: "rgba(255,255,255,0.15)" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.25)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.15)"; }}
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Online Users */}
            {onlineUsers.length > 0 && (
              <div
                className="flex items-center gap-2 px-4 py-2 flex-shrink-0 flex-wrap"
                style={{
                  background: "rgba(124,58,237,0.07)",
                  borderBottom: "1px solid rgba(124,58,237,0.15)",
                }}
              >
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#a78bfa" }} />
                  <span className="text-xs font-semibold" style={{ color: "#a78bfa" }}>Online:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {onlineUsers.map((u, i) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        background: "rgba(124,58,237,0.15)",
                        border: "1px solid rgba(124,58,237,0.25)",
                        color: "#c4b5fd",
                      }}
                    >
                      {u}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0" style={{ maxHeight: "50vh" }}>
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full py-8 gap-2">
                  <MessageCircle className="w-8 h-8" style={{ color: "#5e5e80" }} />
                  <p className="text-xs" style={{ color: "#5e5e80" }}>No messages yet. Say hello!</p>
                </div>
              )}

              {messages.map((msg, idx) => {
                const isOwn = msg.sender === userName;
                const isSystem = msg.sender === "System";

                if (isSystem) {
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                      className="flex justify-center"
                    >
                      <span
                        className="text-xs px-3 py-1 rounded-full"
                        style={{
                          background: "rgba(124,58,237,0.1)",
                          border: "1px solid rgba(124,58,237,0.2)",
                          color: "#8888aa",
                        }}
                      >
                        {msg.text}
                      </span>
                    </motion.div>
                  );
                }

                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: isOwn ? 12 : -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex flex-col gap-1 max-w-[80%] ${isOwn ? "self-end items-end ml-auto" : "self-start items-start"}`}
                  >
                    {!isOwn && (
                      <span className="text-xs font-semibold px-1" style={{ color: "#a78bfa" }}>
                        {msg.sender}
                      </span>
                    )}
                    <div
                      className="px-3 py-2 rounded-2xl text-sm break-words"
                      style={
                        isOwn
                          ? {
                              background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                              color: "#fff",
                              borderBottomRightRadius: 4,
                            }
                          : {
                              background: "rgba(255,255,255,0.06)",
                              border: "1px solid rgba(255,255,255,0.08)",
                              color: "#f4f4ff",
                              borderBottomLeftRadius: 4,
                            }
                      }
                    >
                      {msg.text}
                    </div>
                    <span className="text-xs px-1" style={{ color: "#5e5e80" }}>
                      {msg.time}
                    </span>
                  </motion.div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div
              className="flex items-center gap-2 p-3 flex-shrink-0"
              style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2.5 rounded-xl text-sm"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#f4f4ff",
                  outline: "none",
                }}
                onFocus={(e) => {
                  e.target.style.border = "1px solid rgba(124,58,237,0.5)";
                  e.target.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.border = "1px solid rgba(255,255,255,0.08)";
                  e.target.style.boxShadow = "none";
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <button
                onClick={handleSend}
                className="w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0 transition-all duration-150"
                style={{
                  background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                  boxShadow: "0 0 14px rgba(124,58,237,0.35)",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 0 22px rgba(124,58,237,0.6)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 0 14px rgba(124,58,237,0.35)"; }}
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating toggle button */}
      <motion.button
        onClick={() => setOpen(!open)}
        className="w-14 h-14 rounded-full flex items-center justify-center"
        style={{
          background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
          boxShadow: "0 0 28px rgba(124,58,237,0.5)",
        }}
        animate={{ y: [0, -5, 0] }}
        transition={{ repeat: Infinity, duration: 1.8 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <MessageCircle className="w-6 h-6 text-white" />
      </motion.button>
    </div>
  );
}
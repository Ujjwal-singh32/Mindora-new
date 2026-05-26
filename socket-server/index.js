require('dotenv').config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Track online users per room
const onlineUsers = {}; // { roomId: [ { socketId, userName } ] }

io.on("connection", (socket) => {
  // console.log("User connected:", socket.id);

  // Join room
  socket.on("join-room", ({ roomId, userName }) => {
    socket.join(roomId);
    // console.log(`${userName} joined room ${roomId}`);

    // Track user in the room
    if (!onlineUsers[roomId]) onlineUsers[roomId] = [];
    onlineUsers[roomId].push({ socketId: socket.id, userName });

    // Notify all clients in the room about online users
    io.to(roomId).emit("online-users", onlineUsers[roomId]);

    // Notify others that a new user joined
    socket.to(roomId).emit("user-joined", { userName });
  });

  // Chat message
  socket.on("send-message", async ({ roomId, userName, message }) => {
    const msgData = {
      sender: userName,
      text: message,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    io.to(roomId).emit("receive-message", msgData);
    if (message.trim().startsWith("@")) {
      try {
        // Call Gemini API (example using Axios)
      //  console.log("Using NEXTJS_URL:", process.env.NEXTJS_URL);
        const geminiResponse = await axios.post(
          `${process.env.NEXTJS_URL}/api/gemini-ans-for-chat`,
          {
            question: message, // send the whole message or extract after @
          }
        );
      //  console.log("debug");
        const answer = geminiResponse.data.answer; // adjust based on API response

        const aiMsg = {
          sender: "Ai-ans",
          text: answer,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };

        // Send Gemini response to the same room
        io.to(roomId).emit("receive-message", aiMsg);
      } catch (err) {
        console.error("Error calling Gemini:", err.message);
      }
    }
  });

  // Drawing events
  socket.on("draw-action", ({ roomId, type, data }) => {
    socket.to(roomId).emit("draw-action", { type, data });
  });

  socket.on("cursor-move", ({ roomId, userId, name, x, y }) => {
    // console.log("user connected for cursor", name);
    socket.to(roomId).emit("cursor-move", { userId, name, x, y });
  });

  // Disconnect
  socket.on("disconnect", () => {
    // console.log("User disconnected:", socket.id);

    // Remove user from onlineUsers
    for (const roomId in onlineUsers) {
      onlineUsers[roomId] = onlineUsers[roomId].filter(
        (u) => u.socketId !== socket.id
      );
      io.to(roomId).emit("online-users", onlineUsers[roomId]);
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});

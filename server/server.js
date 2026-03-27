import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userroutes.js";
import messageRouter from "./routes/messageroutes.js";
import gameRouter from "./routes/gameroutes.js";
import { Server } from "socket.io";
import passport from "./lib/passport.js";
import { handleGameEvents } from "./socket/gamehandlers.js";

const app = express();
const server = http.createServer(app);

// ✅ CORS
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://realtime-chat-app-rho-flax.vercel.app",
    ],
    credentials: true,
  })
);

// ✅ Body parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ✅ Passport init (VERY IMPORTANT)
app.use(passport.initialize());

// ✅ Socket.io
export const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://realtime-chat-app-rho-flax.vercel.app",
    ],
    credentials: true,
  },
});

export const userSocketMap = {};

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;

  if (userId) userSocketMap[userId] = socket.id;

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });

  // 🎮 MULTIPLAYER GAMES
  handleGameEvents(socket, userId);

  // 📞 CALL RELAY
  socket.on("call-user", (data) => {
    const receiverSocketId = userSocketMap[data.to];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("call-user", { 
        from: userId, 
        offer: data.offer, 
        name: data.name 
      });
    }
  });

  socket.on("answer-call", (data) => {
    const receiverSocketId = userSocketMap[data.to];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("call-answered", data.answer);
    }
  });

  socket.on("ice-candidate", (data) => {
    const receiverSocketId = userSocketMap[data.to];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("ice-candidate", { candidate: data.candidate });
    }
  });

  socket.on("end-call", (data) => {
    const receiverSocketId = userSocketMap[data.to];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("call-ended");
    }
  });

  // ✨ TYPING
  socket.on("typing", (data) => {
    const receiverSocketId = userSocketMap[data.to];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typing", { from: userId });
    }
  });

  // 👀 CHAT SEEN
  socket.on("chat-seen", (data) => {
    const receiverSocketId = userSocketMap[data.to];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("chat-seen", { from: userId });
    }
  });
});

// ✅ Routes
app.get("/api/status", (req, res) => res.send("Server is Live"));

app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);
app.use("/api/games", gameRouter);

// ✅ DB
await connectDB();

// ✅ Server start
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log("Server running on PORT:", PORT)
);

export default server;
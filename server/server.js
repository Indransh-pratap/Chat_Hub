import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/Userroutes.js";
import messageRouter from "./routes/messageRoutes.js";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);

// 🔥🔥🔥 CORS FOR EXPRESS (THIS WAS MISSING)
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://realtime-chat-app-rho-flax.vercel.app"  // 👈 your frontend URL
  ],
  credentials: true,
}));

// Body limits
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// 🔥 Socket.IO with same CORS
export const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://realtime-chat-app-rho-flax.vercel.app"
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

export const userSocketMap = {};

// Socket handler
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  console.log("User connected:", userId);

  if (userId) userSocketMap[userId] = socket.id;

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("User disconnected:", userId);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

// Routes
app.get("/api/status", (req, res) => res.send("Server is Live"));
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

// Connect DB
await connectDB();

// Local dev
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => console.log("Server running on PORT:", PORT));
}

// Export for Vercel
export default server;

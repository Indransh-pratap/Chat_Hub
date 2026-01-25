import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/Userroutes.js";
import messageRouter from "./routes/messageRoutes.js";
import { Server } from "socket.io";

// create express app and http server

const app = express();
const server = http.createServer(app)

//initialize socket.io server

export const io = new Server(server,{
    cors:{origin: "*"}
})

export const userSocketMap = {};//{userid and socketid}

//socket.io connectio handler

io.on("connection",(Socket)=>{
    const userId = Socket.handshake.query.userId;
    console.log("user connected",userId);
    if(userId) userSocketMap[userId] = Socket.id;
    // emit online users to all connected clients

    io.emit("getOnlineUsers",Object.keys(userSocketMap));

    Socket.on("disconnect",()=>{
       console.log("User Disconnected",userId) ;
       delete userSocketMap[userId];
       io.emit("getOnlineUsers",Object.keys(userSocketMap))
    })
})
// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));



// Route Setup
app.use("/api/status", (req,res)=> res.send("Server is Live"));
app.use("/api/auth",userRouter)
app.use("/api/messages",messageRouter)







 const PORT = process.env.PORT || 5000;
 server.listen(PORT ,()=> console.log("Server is running on PORT:" + PORT))

 //connect to mongodb
await connectDB();
import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { connect } from "http2";
import { connectDB } from "./lib/db.js";

// create express app and http server

const app = express();
const server = http.createServer(app)

// Middleware

app.use(express.json({limit:"4mb"}))
app.use(cors());
app.use("/api/status", (req,res)=> res.send("Server is Live"));







 const PORT = process.env.PORT || 5000;
 server.listen(PORT ,()=> console.log("Server is running on PORT:" + PORT))

 //connect to mongodb
await connectDB();
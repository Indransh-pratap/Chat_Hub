import express from "express";
import {protectRoutes } from "../middleware/auth.js"
import {getMessages,getUserForSidebar, markMessageAsSEEN, sendMessage} from "../controllers/messageController.js"

const messageRouter = express.Router();

messageRouter.get("/users",protectRoutes ,getUserForSidebar)
messageRouter.get("/:id",protectRoutes,getMessages);
messageRouter.get("/mark/:id",protectRoutes,markMessageAsSEEN)
messageRouter.post("/send/:id",protectRoutes ,sendMessage)


export default messageRouter;



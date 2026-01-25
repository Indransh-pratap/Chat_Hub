import express from "express";
import { login, signup, updateProfile, check } from "../controllers/Usercotroller.js";
import { protectRoutes  } from "../middleware/auth.js";

const userRouter = express.Router();

userRouter.post("/signup", signup);
userRouter.post("/login", login);
userRouter.post("/update-profile", protectRoutes, updateProfile);
userRouter.get("/check", protectRoutes,check);

export default userRouter;

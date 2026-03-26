import express from "express";
import jwt from "jsonwebtoken";
import passport from "../lib/passport.js";

import {
  login,
  signup,
  updateProfile,
  check,
} from "../controllers/usercontroller.js";

import { protectRoutes } from "../middleware/auth.js";

const userroutes = express.Router();

// ================= NORMAL AUTH =================
userRouter.post("/signup", signup);
userRouter.post("/login", login);
userRouter.post("/update-profile", protectRoutes, updateProfile);
userRouter.get("/check", protectRoutes, check);

// ================= GOOGLE AUTH =================

// Step 1: Start Google login
userRouter.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Step 2: Callback
userRouter.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    const token = jwt.sign(
      { userId: req.user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

    res.redirect(`${CLIENT_URL}/success?token=${token}`);
  }
);

export default userroutes;
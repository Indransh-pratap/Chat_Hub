import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protectRoutes = async (req, res, next) => {
  try {
    // 1. Get token
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, token missing",
      });
    }

    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Find user
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 4. Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error(error.message);
    res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

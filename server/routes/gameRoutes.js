import express from "express";
import { protectRoute } from "../middleware/authMiddleware.js";
import { saveGameResult, getGameStats } from "../controllers/gameController.js";

const router = express.Router();

router.post("/save", protectRoute, saveGameResult);
router.get("/stats/:userId", protectRoute, getGameStats);

export default router;

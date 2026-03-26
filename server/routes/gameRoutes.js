import express from "express";
import { protectRoutes } from "../middleware/auth.js";
import { saveGameResult, getGameStats } from "../controllers/gameController.js";

const router = express.Router();

router.post("/save", protectRoutes, saveGameResult);
router.get("/stats/:userId", protectRoutes, getGameStats);

export default router;

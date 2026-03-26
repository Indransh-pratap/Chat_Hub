import GameResult from "../models/GameResult.js";

export const saveGameResult = async (req, res) => {
    try {
        const { gameId, roomId, players, winnerId, result, details } = req.body;

        const newResult = new GameResult({
            gameId,
            roomId,
            players,
            winnerId,
            result,
            details
        });

        await newResult.save();

        res.status(201).json({
            success: true,
            message: "Game result archived successfully",
            data: newResult
        });
    } catch (error) {
        console.error("Error in saveGameResult:", error.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const getGameStats = async (req, res) => {
    try {
        const { userId } = req.params;
        const stats = await GameResult.find({ players: userId });
        
        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error("Error in getGameStats:", error.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

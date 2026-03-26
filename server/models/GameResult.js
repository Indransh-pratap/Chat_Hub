import mongoose from "mongoose";

const gameResultSchema = new mongoose.Schema({
    gameId: {
        type: String,
        required: true,
        enum: ['rps', 'tictactoe', 'snake', 'truthdare']
    },
    roomId: {
        type: String,
        required: true
    },
    players: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    winnerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null // null for draw
    },
    result: {
        type: String,
        enum: ['win', 'draw', 'lose'],
        required: true
    },
    details: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, { timestamps: true });

const GameResult = mongoose.model("GameResult", gameResultSchema);

export default GameResult;

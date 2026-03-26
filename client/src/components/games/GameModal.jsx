import { useContext, useEffect } from "react";
import { useUIStore } from "../../lib/uiStore";
import { AuthContext } from "../../../context/AuthContext";
import { ChatContext } from "../../../context/ChatContext";
import { X, User, Trophy, AlertTriangle } from "lucide-react";
import TicTacToe from "./TicTacToe";
import RockPaperScissors from "./RockPaperScissors";
import TruthAndDare from "./TruthAndDare";
import SnakeDuel from "./SnakeDuel";
import { motion, AnimatePresence } from "framer-motion";
import assets from "../../assets/assets";

const GameModal = () => {
  const { activeGame, clearGame } = useUIStore();
  const { authUser, socket } = useContext(AuthContext);
  const { users, sendMessage } = useContext(ChatContext);

  // Listen for opponent leaving
  useEffect(() => {
    if (!socket || !activeGame) return;
    
    socket.on("game:opponentLeft", () => {
      clearGame();
    });

    return () => socket.off("game:opponentLeft");
  }, [socket, clearGame, activeGame]);

  if (!activeGame) return null;

  const opponent = users.find((u) => u._id === activeGame.opponentId);
  const gameName = activeGame.gameId === "tictactoe" ? "Tic Tac Toe" : activeGame.gameId === "rps" ? "Rock Paper Scissors" : "Truth & Dare";

  const handleClose = (resultText = null) => {
    if (resultText) {
      // Send result message to chat
      sendMessage({
        text: `🏆 ${resultText}`,
        type: "text"
      }, activeGame.opponentId);
    }
    socket.emit("game:leave", { roomId: activeGame.roomId });
    clearGame();
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-4 md:p-8 backdrop-blur-sm"
    >
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 pointer-events-none"></div>

      {/* Header */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-8 z-10">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img 
              src={opponent?.profilePic || assets.avatar_icon} 
              className="w-12 h-12 rounded-full border-2 border-[var(--neon-red)] shadow-[0_0_15px_rgba(255,0,60,0.4)]"
              alt="opponent"
            />
            <div className="absolute -bottom-1 -right-1 bg-green-500 w-3 h-3 rounded-full border-2 border-black"></div>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-red-500 font-bold">Opponent Link Active</p>
            <h2 className="text-xl font-black text-white tracking-widest uppercase italic">{opponent?.fullName}</h2>
          </div>
        </div>

        <div className="text-center hidden md:block">
          <p className="text-[10px] uppercase tracking-[0.4em] text-gray-500 mb-1">Sector: Arcade</p>
          <h1 className="text-2xl font-black text-[var(--neon-red)] neon-text tracking-[0.2em] uppercase italic">{gameName}</h1>
        </div>

        <button 
          onClick={() => handleClose()}
          className="p-3 bg-red-950/30 border border-red-500/50 rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-[0_0_15px_rgba(255,0,60,0.2)]"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Game Content */}
      <div className="flex-1 w-full max-w-4xl bg-[#0a0a0d] border border-gray-800 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden flex flex-col">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--neon-red)] to-transparent"></div>
        
        <div className="flex-1 relative overflow-auto custom-scrollbar">
          {activeGame.gameId === "tictactoe" && (
            <TicTacToe 
              opponent={opponent} 
              isMultiplayer={true} 
              onGameEnd={(res) => handleClose(res)} 
            />
          )}
          {activeGame.gameId === "rps" && (
            <RockPaperScissors 
              opponent={opponent} 
              isMultiplayer={true} 
              onGameEnd={(res) => handleClose(res)} 
            />
          )}
          {activeGame.gameId === "truthdare" && (
            <TruthAndDare 
              opponent={opponent} 
              isMultiplayer={true} 
              onGameEnd={(res) => handleClose(res)} 
            />
          )}
          {activeGame.gameId === "snake" && (
            <SnakeDuel 
              opponent={opponent} 
              isMultiplayer={true} 
              onGameEnd={(res) => handleClose(res)} 
            />
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="w-full max-w-4xl mt-6 flex justify-between items-center z-10 text-[10px] uppercase tracking-[0.2em] text-gray-600 font-bold">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-3 h-3" /> DO NOT DISCONNECT DURING SEQUENCE
        </div>
        <div className="flex items-center gap-2">
          <Trophy className="w-3 h-3" /> SEASON: PROTO-1
        </div>
      </div>
    </motion.div>
  );
};

export default GameModal;

import { useContext, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import { AuthContext } from "../../context/AuthContext";
import { ChatContext } from "../../context/ChatContext";
import assets from "../assets/assets";
import TicTacToe from "../components/games/TicTacToe";
import RockPaperScissors from "../components/games/RockPaperScissors";
import TruthAndDare from "../components/games/TruthAndDare";
import SnakeDuel from "../components/games/SnakeDuel";

import { Gamepad2, Swords, Target, Users, Zap } from "lucide-react";
import { useUIStore } from "../lib/uiStore";

const GamesPage = () => {
  const location = useLocation();
  const { authUser, onlineUsers, socket } = useContext(AuthContext);
  const { users } = useContext(ChatContext);
  const { setActiveGame } = useUIStore();
  const [selectedOpponent, setSelectedOpponent] = useState(null);
  const [selectedGame, setSelectedGame] = useState("tictactoe");
  const [gameStateOverride, setGameStateOverride] = useState(null);
  const [incomingInvites, setIncomingInvites] = useState([]); // Array of { from, game, inviterName }

  // Global Invitation Listener in GamesPage
  useEffect(() => {
    if (!socket) return;

    const handleInvite = (data) => {
      const inviter = users.find(u => u._id === data.from);
      if (!inviter) return;

      setIncomingInvites(prev => {
        if (prev.find(inv => inv.from === data.from && inv.game === data.game)) return prev;
        return [...prev, { from: data.from, game: data.game, inviterName: inviter.fullName }];
      });

      toast.custom((t) => (
        <div className="bg-[#0a0a0d] border border-[#ff003c] p-4 rounded-xl shadow-[0_0_20px_rgba(255,0,60,0.4)] text-white">
          <p className="font-bold tracking-widest uppercase text-sm mb-1">Incoming Challenge!</p>
          <p className="text-gray-300 text-xs mb-3">{inviter.fullName} challenges you to {data.game === 'tictactoe' ? 'Tic Tac Toe' : data.game === 'rps' ? 'Rock Paper Scissors' : 'Truth & Dare'}</p>
          <div className="flex gap-2">
            <button 
              onClick={() => { 
                socket.emit("game:accept", { to: data.from, gameId: data.game }); 
                toast.dismiss(t.id);
                setIncomingInvites(prev => prev.filter(inv => !(inv.from === data.from && inv.game === data.game)));
                setActiveGame({
                  gameId: data.game,
                  opponentId: data.from,
                  role: 'follower'
                });
              }}
              className="bg-[var(--neon-red)] px-4 py-1.5 rounded-lg text-[10px] text-black font-bold uppercase tracking-widest hover:scale-105 transition-all"
            > ACCEPT </button>
            <button 
              onClick={() => toast.dismiss(t.id)} 
              className="border border-gray-600 px-4 py-1.5 rounded-lg text-[10px] uppercase tracking-widest hover:bg-white/5"
            > IGNORE </button>
          </div>
        </div>
      ), { duration: 10000 });
    };

    socket.on("game:invite", handleInvite);
    return () => socket.off("game:invite");
  }, [socket, users, setActiveGame]);

  // Read URL parameters for Chat-to-Game integration
  useEffect(() => {
    if (users.length === 0) return;
    
    const params = new URLSearchParams(location.search);
    const opponentId = params.get("opponent");
    const gameId = params.get("game");
    const isAccept = params.get("accept") === "true";

    if (opponentId && gameId) {
      const opponent = users.find(u => u._id === opponentId);
      if (opponent) {
        if (isAccept) {
          socket.emit("game:accept", { to: opponentId, gameId: gameId });
        } else {
            setSelectedOpponent(opponent);
            setSelectedGame(gameId);
        }
      }
    }
  }, [location.search, users, setActiveGame]);

  // Reset override when opponent or game changes manually
  const selectOpponent = (user) => {
    setSelectedOpponent(user);
    setGameStateOverride(null);
  };
  
  const selectGame = (gameId) => {
    setSelectedGame(gameId);
    setGameStateOverride(null);
  };

  const availableUsers = users.filter(
    (user) =>
      onlineUsers.includes(user._id) && user._id !== authUser?._id
  );

  return (
    <div className="w-full h-screen flex flex-col bg-[var(--bg-dark)] overflow-hidden">
      <Navbar />

      <div className="flex-1 w-full max-w-[1600px] mx-auto p-4 md:p-6 overflow-hidden flex flex-col relative z-10">
        <h1 className="text-2xl md:text-3xl font-bold tracking-widest text-[var(--neon-red)] mb-6 uppercase flex-shrink-0 flex items-center gap-3">
          <Gamepad2 className="w-8 h-8" /> Arcade Terminal
        </h1>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 min-h-0">
          
          {/* Active Users sidebar */}
          <div className="bg-[#0a0a0d] border border-gray-800 rounded-2xl p-4 flex flex-col overflow-hidden shadow-[0_0_20px_rgba(255,0,60,0.05)]">
            <h2 className="text-sm uppercase tracking-widest text-[var(--neon-red)] mb-4 shrink-0 font-semibold drop-shadow-[0_0_8px_var(--neon-red)] flex items-center gap-2">
              <Users className="w-4 h-4" /> Available Challengers
            </h2>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {availableUsers.length === 0 ? (
                <p className="text-xs text-gray-500 text-center mt-10">
                  No operatives currently online.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {availableUsers.map((user) => (
                    <div
                      key={user._id}
                      onClick={() => selectOpponent(user)}
                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
                        selectedOpponent?._id === user._id
                          ? "bg-[#1a0005] border-[var(--neon-red)] shadow-[0_0_10px_rgba(255,0,60,0.2)]"
                          : "border-transparent bg-[#121217] hover:border-gray-700"
                      }`}
                    >
                      <div className="relative">
                        <img
                          src={user.profilePic || assets.avatar_icon}
                          className="w-10 h-10 rounded-full border border-gray-600 object-cover"
                          alt="avatar"
                        />
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-black rounded-full shadow-[0_0_5px_#22c55e]"></span>
                      </div>

                      <div className="flex flex-col">
                        <span
                          className={`text-sm font-bold tracking-widest ${
                            selectedOpponent?._id === user._id
                              ? "text-[var(--neon-red)]"
                              : "text-white"
                          }`}
                        >
                          {user.fullName}
                        </span>
                        <span className="text-[10px] text-green-400 uppercase tracking-widest">
                          Active Link
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Incoming Invites section */}
            {incomingInvites.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-800 shrink-0">
                <h2 className="text-[10px] uppercase tracking-[0.2em] text-[var(--neon-red)] mb-4 font-bold flex items-center gap-2">
                  <Swords className="w-3 h-3" /> Pending Challenges
                </h2>
                <div className="flex flex-col gap-3">
                  {incomingInvites.map((invite, index) => (
                    <div key={index} className="bg-[#1a0005]/50 border border-[var(--neon-red)]/30 p-3 rounded-xl flex flex-col gap-2">
                      <p className="text-[10px] text-gray-300">
                        <span className="text-white font-bold">{invite.inviterName}</span> wants to play <span className="text-[var(--neon-red)] uppercase">{invite.game}</span>
                      </p>
                      <button 
                        onClick={() => {
                          socket.emit("game:accept", { to: invite.from, gameId: invite.game });
                          setIncomingInvites(prev => prev.filter((_, i) => i !== index));
                        }}
                        className="bg-[var(--neon-red)] text-black text-[9px] font-bold py-1.5 rounded uppercase tracking-widest hover:scale-105 transition-all"
                      >
                        Accept Challenge
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Game Area */}
          <div className="bg-[#0a0a0d] border border-[#ff003c40] rounded-2xl p-6 shadow-[0_0_20px_rgba(255,0,60,0.1)] flex flex-col relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5 pointer-events-none rounded-2xl"></div>

            {!selectedOpponent ? (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-gray-500 tracking-widest text-sm bg-black/50 px-6 py-2 rounded-full border border-gray-800 animate-pulse">
                  SELECT A CHALLENGER TO INITIATE SEQUENCE
                </p>
              </div>
            ) : (
              <div className="flex flex-col h-full z-10 w-full max-w-4xl mx-auto">
                
                {/* Game Selector */}
                <div className="flex justify-between items-center bg-[#121217] p-2 rounded-xl border border-gray-800 mb-6 shrink-0 overflow-x-auto custom-scrollbar">
                  {[
                    { id: "tictactoe", title: "Tic Tac Toe", icon: Target },
                    { id: "rps", title: "Rock Paper Scissors", icon: Swords },
                    { id: "snake", title: "Snake Duel", icon: Zap },
                    { id: "truthdare", title: "Truth & Dare", icon: Gamepad2 }
                  ].map((game) => (
                    <button
                      key={game.id}
                      onClick={() => selectGame(game.id)}
                      className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold tracking-widest uppercase transition-all whitespace-nowrap ${
                        selectedGame === game.id
                          ? "bg-[var(--neon-red)] text-white shadow-[0_0_15px_rgba(255,0,60,0.4)]"
                          : "text-gray-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <game.icon className="w-4 h-4" /> {game.title}
                    </button>
                  ))}
                </div>

                {/* Game Render */}
                <div className="flex-1 overflow-hidden bg-[#050505] rounded-xl border border-gray-800 p-4 relative">
                  {selectedGame === "tictactoe" && (
                    <TicTacToe opponent={selectedOpponent} gameStateOverride={gameStateOverride} />
                  )}
                  {selectedGame === "rps" && (
                    <RockPaperScissors opponent={selectedOpponent} gameStateOverride={gameStateOverride} />
                  )}
                  {selectedGame === "truthdare" && (
                    <TruthAndDare opponent={selectedOpponent} gameStateOverride={gameStateOverride} />
                  )}
                  {selectedGame === "snake" && (
                    <SnakeDuel opponent={selectedOpponent} gameStateOverride={gameStateOverride} />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamesPage;
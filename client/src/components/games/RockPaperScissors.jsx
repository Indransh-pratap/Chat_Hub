import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { ChatContext } from "../../../context/ChatContext";
import toast from "react-hot-toast";
import { useUIStore } from "../../lib/uiStore";
import { Hand, Scissors, Circle, Swords, Zap, X } from "lucide-react"; // Fallbacks for Rock, Paper, Scissors

const choices = [
  { id: 'rock', name: 'Rock', icon: Circle },
  { id: 'paper', name: 'Paper', icon: Hand },
  { id: 'scissors', name: 'Scissors', icon: Scissors }
];

const RockPaperScissors = ({ opponent, gameStateOverride, isMultiplayer = false, onGameEnd }) => {
  const { socket, authUser, axios: api } = useContext(AuthContext);
  const { sendMessage } = useContext(ChatContext);
  const [gameActive, setGameActive] = useState(isMultiplayer);
  const [myChoice, setMyChoice] = useState(null);
  const [opponentChoice, setOpponentChoice] = useState(null);
  const [result, setResult] = useState(null);
  const [score, setScore] = useState({ you: 0, opponent: 0, draws: 0 });

  const { activeGame } = useUIStore();
  const roomId = activeGame?.roomId;

  useEffect(() => {
    if (isMultiplayer && activeGame) {
      setGameActive(true);
      resetGame();
    }
  }, [isMultiplayer, activeGame]);

  useEffect(() => {
    if (!socket || !roomId) return;

    socket.on("game:update", (data) => {
      if (data.game === "rps") {
        setOpponentChoice(data.move.choice);
      }
    });

    socket.on("game:ended", (data) => {
        if (data.game === "rps") {
            setOpponentChoice(data.opponentChoice);
        }
    });

    return () => {
      socket.off("game:update");
      socket.off("game:ended");
    };
  }, [socket, roomId]);

  useEffect(() => {
    if (myChoice && opponentChoice) {
      determineWinner(myChoice, opponentChoice);
    }
  }, [myChoice, opponentChoice]);

  const determineWinner = async (mine, theirs) => {
    let res = "";
    if (mine === theirs) {
      res = "DRAW";
      setScore(s => ({ ...s, draws: s.draws + 1 }));
    } else if (
        (mine === 'rock' && theirs === 'scissors') ||
        (mine === 'paper' && theirs === 'rock') ||
        (mine === 'scissors' && theirs === 'paper')
    ) {
        res = "WIN";
        setScore(s => ({ ...s, you: s.you + 1 }));
    } else {
        res = "LOSE";
        setScore(s => ({ ...s, opponent: s.opponent + 1 }));
    }
    setResult(res);

    // Persist to MongoDB
    try {
        await api.post("/api/games/save", {
            gameId: "rps",
            roomId,
            players: [authUser._id, opponent._id],
            winnerId: res === "WIN" ? authUser._id : res === "LOSE" ? opponent._id : null,
            result: res.toLowerCase(),
            details: { myChoice: mine, opponentChoice: theirs }
        });
    } catch (error) {
        console.error("Failed to archive round:", error);
    }

    // Inform opponent of our final choice if we were the last to move
    socket.emit("game:end", {
        roomId,
        game: "rps",
        opponentChoice: mine
    });
  };

  const invitePlayer = async () => {
    socket.emit("game:invite", { to: opponent._id, game: "rps" });
    
    await sendMessage({
      text: `Tactical Challenge: Rock Paper Scissors`,
      type: "game-invite",
      gameId: "rps"
    }, opponent._id);

    toast("Challenge Sent...", { icon: "⚔️" });
  };

  const makeChoice = (choiceId) => {
    setMyChoice(choiceId);
    socket.emit("game:move", { roomId, game: "rps", move: { choice: choiceId } });
    
    // Check if we can decide winner now
    if (opponentChoice) {
        // We already have opponent choice (they moved first)
        // the useEffect will trigger determineWinner
    }
  };

  const resetGame = () => {
    setMyChoice(null);
    setOpponentChoice(null);
    setResult(null);
  };

  if (!gameActive) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4">
        <div className="h-full flex flex-col items-center justify-center p-8 bg-[#050505] text-center">
          <div className="max-w-md w-full space-y-8">
            <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-2xl animate-pulse" />
                <div className="relative bg-black/40 border border-blue-500/30 rounded-full w-full h-full flex items-center justify-center">
                    <Swords className="w-12 h-12 text-blue-500 opacity-50" />
                </div>
            </div>
            
            <div className="space-y-2">
                <h3 className="text-3xl font-black tracking-tighter text-white uppercase italic">Combat Simulator</h3>
                <p className="text-gray-500 text-xs uppercase tracking-[0.4em] font-bold">Rock • Paper • Scissors</p>
            </div>

            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md">
                <p className="text-gray-400 text-sm leading-relaxed italic">
                    "Hand-to-hand combat protocol. Choose your weapon carefully; speed and intuition are your only allies."
                </p>
            </div>

            <button 
                onClick={() => {
                    if (!opponent) return toast.error("Select an operative first!");
                    invitePlayer();
                }}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(37,99,235,0.3)] hover:scale-105 transition-all flex items-center justify-center gap-3 active:scale-95"
            >
                <Zap className="w-5 h-5 fill-white" /> Initiate Combat
            </button>
            
            <p className="text-[10px] text-gray-600 uppercase font-black tracking-widest">Target Operative: {opponent?.fullName || "None Selected"}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center gap-8 w-full max-w-2xl">
        <div className="w-full flex justify-between items-center mb-4 bg-black/40 border border-white/5 p-4 rounded-2xl backdrop-blur-md">
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">You</span>
            <span className="text-xl font-black text-white">{score.you}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[8px] text-gray-600 uppercase font-bold tracking-widest">Draws</span>
            <span className="text-sm font-bold text-gray-500">{score.draws}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">{opponent.fullName.split(' ')[0]}</span>
            <span className="text-xl font-black text-white">{score.opponent}</span>
          </div>
          <button 
            onClick={() => onGameEnd?.(`Series Results: You ${score.you} - ${score.opponent} ${opponent.fullName}`)}
            className="p-2 hover:bg-red-500/20 rounded-lg text-gray-600 hover:text-red-500 transition-all ml-4"
            title="End Mission"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="h-8">
          {result ? (
            <p className={`text-2xl font-bold tracking-widest ${result === 'WIN' ? 'text-green-500' : result === 'LOSE' ? 'text-[var(--neon-red)]' : 'text-yellow-500'}`}>
              {result === 'WIN' ? 'MISSION SUCCESS' : result === 'LOSE' ? 'MISSION FAILURE' : 'STALEMATE'}
            </p>
          ) : myChoice ? (
            <p className="text-sm font-bold tracking-widest text-gray-300 animate-pulse uppercase">Awaiting Target Choice...</p>
          ) : (
            <p className="text-sm font-bold tracking-widest text-[var(--neon-red)] uppercase">Select Hand-to-Hand Weapon</p>
          )}
        </div>

        <div className="flex justify-between w-full items-center">
          {/* YOU */}
          <div className="flex flex-col items-center gap-4">
            <p className="text-xs uppercase tracking-widest text-gray-500">You</p>
            <div className="flex flex-col gap-4">
              {choices.map(c => (
                <button
                  key={c.id}
                  onClick={() => !myChoice && makeChoice(c.id)}
                  disabled={!!myChoice}
                  className={`w-20 h-20 rounded-full flex items-center justify-center border-2 transition-all ${myChoice === c.id ? "bg-[var(--neon-red)] border-[var(--neon-red)] text-black scale-110 shadow-[0_0_20px_var(--neon-red)]" : myChoice ? "opacity-30 border-gray-800 bg-[#0a0a0d] text-gray-500" : "border-gray-600 bg-[#121217] text-gray-300 hover:border-[var(--neon-red)]"}`}
                >
                  <c.icon className="w-8 h-8" />
                </button>
              ))}
            </div>
          </div>

          <div className="text-4xl text-gray-800 font-bold opacity-50 px-8">VS</div>

          {/* OPPONENT */}
          <div className="flex flex-col items-center gap-4">
            <p className="text-xs uppercase tracking-widest text-gray-500">{opponent.fullName}</p>
            <div className="flex flex-col gap-4">
              {choices.map(c => {
                const isOpponentsChoice = result && opponentChoice === c.id;
                const isHidden = !result;
                
                return (
                  <div
                    key={`opp-${c.id}`}
                    className={`w-20 h-20 rounded-full flex items-center justify-center border-2 transition-all ${isOpponentsChoice ? "bg-white border-white text-black scale-110 shadow-[0_0_20px_rgba(255,255,255,0.5)]" : "border-gray-800 bg-[#0a0a0d] text-gray-700 opacity-50"}`}
                  >
                    {isHidden ? <div className="text-xl">?</div> : <c.icon className="w-8 h-8" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {result && (
          <button 
            onClick={resetGame}
            className="mt-8 border border-[var(--neon-red)] text-[var(--neon-red)] px-8 py-3 rounded-full text-xs font-bold tracking-widest hover:bg-[var(--neon-red)] hover:text-white transition-all shadow-[0_0_15px_rgba(255,0,60,0.1)] hover:shadow-[0_0_20px_rgba(255,0,60,0.4)]"
          >
            NEXT ROUND
          </button>
        )}
      </div>
    </div>
  );
};

export default RockPaperScissors;

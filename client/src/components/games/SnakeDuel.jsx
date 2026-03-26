import { useState, useContext, useEffect, useRef } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { useUIStore } from "../../lib/uiStore";
import toast from "react-hot-toast";
import { Trophy, Skull, Zap } from "lucide-react";

const GRID_SIZE = 20;
const INITIAL_SPEED = 150;

const SnakeDuel = ({ opponent, isMultiplayer = false, onGameEnd }) => {
  const { socket, authUser } = useContext(AuthContext);
  const { activeGame } = useUIStore();
  const roomId = activeGame?.roomId;

  const [gameActive, setGameActive] = useState(isMultiplayer);
  const [snake1, setSnake1] = useState([{ x: 2, y: 10 }]); // Inviter
  const [snake2, setSnake2] = useState([{ x: 17, y: 10 }]); // Follower
  const [dir1, setDir1] = useState({ x: 1, y: 0 });
  const [dir2, setDir2] = useState({ x: -1, y: 0 });
  const [food, setFood] = useState({ x: 10, y: 10 });
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);

  const myRole = activeGame?.role; // 'inviter' or 'follower'
  const isInviter = myRole === "inviter";

  const gameLoopRef = useRef();
  const lastDirRef = useRef(isInviter ? { x: 1, y: 0 } : { x: -1, y: 0 });

  // Handle Input
  useEffect(() => {
    const handleKeyDown = (e) => {
      let newDir = null;
      switch (e.key) {
        case "ArrowUp": if (lastDirRef.current.y === 0) newDir = { x: 0, y: -1 }; break;
        case "ArrowDown": if (lastDirRef.current.y === 0) newDir = { x: 0, y: 1 }; break;
        case "ArrowLeft": if (lastDirRef.current.x === 0) newDir = { x: -1, y: 0 }; break;
        case "ArrowRight": if (lastDirRef.current.x === 0) newDir = { x: 1, y: 0 }; break;
      }

      if (newDir) {
        lastDirRef.current = newDir;
        if (isInviter) setDir1(newDir);
        else setDir2(newDir);

        socket.emit("game:move", {
          roomId,
          game: "snake",
          move: { role: myRole, dir: newDir }
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [socket, roomId, myRole, isInviter]);

  // Socket Listeners
  useEffect(() => {
    if (!socket || !roomId) return;

    socket.on("game:update", (data) => {
      if (data.game === "snake") {
        if (data.move.role === "inviter") setDir1(data.move.dir);
        else setDir2(data.move.dir);
        
        // Host (Inviter) syncs positions periodically or on food eat
        if (data.sync) {
            setSnake1(data.sync.s1);
            setSnake2(data.sync.s2);
            setFood(data.sync.food);
            setScore1(data.sync.sc1);
            setScore2(data.sync.sc2);
        }
      }
    });

    socket.on("game:ended", (data) => {
        if (data.game === "snake") {
            setGameOver(true);
            setWinner(data.winnerId === authUser._id ? "YOU" : opponent.fullName);
        }
    });

    return () => {
      socket.off("game:update");
      socket.off("game:ended");
    };
  }, [socket, roomId, authUser._id, opponent.fullName]);

  // Game Logic (Only runs on Inviter's side to act as host)
  useEffect(() => {
    if (!gameActive || gameOver || !isInviter) return;

    const moveSnakes = () => {
      setSnake1((prev1) => {
        const newHead1 = { x: prev1[0].x + dir1.x, y: prev1[0].y + dir1.y };
        setSnake2((prev2) => {
          const newHead2 = { x: prev2[0].x + dir2.x, y: prev2[0].y + dir2.y };

          // Collision Check
          const checkCollision = (head, s1, s2) => {
            if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) return true;
            if (s1.some(seg => seg.x === head.x && seg.y === head.y)) return true;
            if (s2.some(seg => seg.x === head.x && seg.y === head.y)) return true;
            return false;
          };

          const dead1 = checkCollision(newHead1, prev1.slice(1), prev2);
          const dead2 = checkCollision(newHead2, prev1, prev2.slice(1));

          if (dead1 || dead2) {
             let winId = null;
             if (dead1 && !dead2) winId = opponent._id;
             else if (dead2 && !dead1) winId = authUser._id;

             socket.emit("game:end", {
                 roomId,
                 game: "snake",
                 winnerId: winId,
                 result: winId ? "win" : "draw"
             });

             setGameOver(true);
             return prev2;
          }

          const newS1 = [newHead1, ...prev1];
          const newS2 = [newHead2, ...prev2];

          // Food Check
          let newFood = food;
          if (newHead1.x === food.x && newHead1.y === food.y) {
            setScore1(s => s + 10);
            newFood = { x: Math.floor(Math.random() * GRID_SIZE), y: Math.floor(Math.random() * GRID_SIZE) };
          } else {
            newS1.pop();
          }

          if (newHead2.x === food.x && newHead2.y === food.y) {
            setScore2(s => s + 10);
            if (newFood === food) newFood = { x: Math.floor(Math.random() * GRID_SIZE), y: Math.floor(Math.random() * GRID_SIZE) };
          } else {
            newS2.pop();
          }
          
          if (newFood !== food) setFood(newFood);

          // Sync positions to follower
          socket.emit("game:move", {
            roomId,
            game: "snake",
            move: { role: "inviter", dir: dir1 },
            sync: { s1: newS1, s2: newS2, food: newFood, sc1: score1, sc2: score2 }
          });

          return newS2;
        });
        return newS1;
      });
    };

    gameLoopRef.current = setInterval(moveSnakes, INITIAL_SPEED);
    return () => clearInterval(gameLoopRef.current);
  }, [gameActive, gameOver, isInviter, dir1, dir2, food, socket, roomId, opponent._id, authUser._id, score1, score2]);

  const renderGrid = () => {
    let cells = [];
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const isS1 = snake1.some((s) => s.x === x && s.y === y);
        const isS2 = snake2.some((s) => s.x === x && s.y === y);
        const isFood = food.x === x && food.y === y;

        cells.push(
          <div
            key={`${x}-${y}`}
            className={`w-full h-full border-[0.5px] border-white/5 rounded-sm ${
              isS1 ? "bg-[var(--neon-red)] shadow-[0_0_10px_var(--neon-red)] z-10" : 
              isS2 ? "bg-white shadow-[0_0_10px_white] z-10" : 
              isFood ? "bg-yellow-400 animate-pulse scale-75 rounded-full shadow-[0_0_15px_#facc15]" : ""
            }`}
          />
        );
      }
    }
    return cells;
  };

  if (!gameActive) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 bg-[#050505] text-center">
        <div className="max-w-md w-full space-y-8">
            <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 bg-yellow-500/20 rounded-full blur-2xl animate-pulse" />
                <div className="relative bg-black/40 border border-yellow-500/30 rounded-full w-full h-full flex items-center justify-center">
                    <Zap className="w-12 h-12 text-yellow-500 opacity-50 fill-yellow-500" />
                </div>
            </div>
            
            <div className="space-y-2">
                <h3 className="text-3xl font-black tracking-tighter text-white uppercase italic">Snake Duel Protocol</h3>
                <p className="text-gray-500 text-xs uppercase tracking-[0.4em] font-bold">Synchronized Combat • v2.0</p>
            </div>

            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md">
                <p className="text-gray-400 text-sm leading-relaxed italic">
                    "Two snakes. One arena. Only the fastest operative survives the digital cage."
                </p>
            </div>

            <button 
                onClick={() => {
                    if (!opponent) return toast.error("Select an operative first!");
                    socket.emit("game:invite", { to: opponent._id, game: "snake" });
                    toast("Invitation Transmitted", { icon: "📡" });
                }}
                className="w-full bg-yellow-600 hover:bg-yellow-500 text-black py-4 rounded-2xl font-black uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(234,179,8,0.3)] hover:scale-105 transition-all flex items-center justify-center gap-3 active:scale-95"
            >
                <Zap className="w-5 h-5 fill-black" /> Initiate Duel
            </button>
            
            <p className="text-[10px] text-gray-600 uppercase font-black tracking-widest">Target Operative: {opponent?.fullName || "None Selected"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col items-center justify-center p-4 bg-[#050505]">
        
        {/* Score Board */}
        <div className="w-full max-w-[400px] flex justify-between items-center mb-6 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
            <div className={`flex flex-col items-center gap-1 ${isInviter ? "text-[var(--neon-red)]" : "text-gray-400"}`}>
                <p className="text-[10px] uppercase font-bold tracking-widest">Inviter</p>
                <p className="text-xl font-black">{score1}</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex items-center gap-2 text-yellow-500">
                <Zap className="w-4 h-4 fill-yellow-500" />
                <span className="text-xs font-bold uppercase tracking-widest">Duel</span>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className={`flex flex-col items-center gap-1 ${!isInviter ? "text-white" : "text-gray-400"}`}>
                <p className="text-[10px] uppercase font-bold tracking-widest">Follower</p>
                <p className="text-xl font-black">{score2}</p>
            </div>
        </div>

        {/* Game Canvas */}
        <div className="relative aspect-square w-full max-w-[400px] bg-[#0a0a0d] border-2 border-white/10 rounded-xl overflow-hidden shadow-2xl">
            <div 
              className="grid w-full h-full"
              style={{ 
                gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`
              }}
            >
                {renderGrid()}
            </div>

            {gameOver && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center z-50 text-center p-6">
                    <Trophy className="w-16 h-16 text-yellow-500 mb-4 animate-bounce" />
                    <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-2">Game Over</h2>
                    <p className="text-[var(--neon-red)] font-bold tracking-widest uppercase mb-6 drop-shadow-sm">
                        Winner: {winner === "YOU" ? "VICTORY SECURED" : winner}
                    </p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="bg-white text-black px-8 py-3 rounded-full font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl"
                    >
                        Re-Engage
                    </button>
                </div>
            )}
        </div>

        <div className="mt-6 text-[10px] text-gray-500 uppercase font-bold tracking-[0.3em] flex items-center gap-2">
            <Skull className="w-3 h-3" /> Movement keys active
        </div>
    </div>
  );
};

export default SnakeDuel;

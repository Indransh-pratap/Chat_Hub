import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { ChatContext } from "../../../context/ChatContext";
import toast from "react-hot-toast";
import { useUIStore } from "../../lib/uiStore";
import { Target, Zap } from "lucide-react";

const TicTacToe = ({ opponent, gameStateOverride, isMultiplayer = false, onGameEnd }) => {
  const { socket, authUser } = useContext(AuthContext);
  const { sendMessage } = useContext(ChatContext);
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [gameActive, setGameActive] = useState(isMultiplayer);
  const [playerSymbol, setPlayerSymbol] = useState(null); 

  const { activeGame } = useUIStore();
  const roomId = activeGame?.roomId;

  // Handle Multiplayer Mode Initialization
  useEffect(() => {
    if (isMultiplayer && activeGame) {
      setGameActive(true);
      setPlayerSymbol(activeGame.role === "inviter" ? "X" : "O");
      setIsXNext(true); // Server starts with inviter (X)
      setBoard(Array(9).fill(null));
    }
  }, [isMultiplayer, activeGame]);

  useEffect(() => {
    if (!socket || !roomId) return;

    socket.on("game:update", (data) => {
      if (data.game === "tictactoe") {
        setBoard(data.move.board);
        setIsXNext(data.move.isXNext);
      }
    });

    socket.on("game:ended", (data) => {
      if (data.game === "tictactoe") {
        setBoard(data.board);
      }
    });

    return () => {
      socket.off("game:update");
      socket.off("game:ended");
    };
  }, [socket, roomId]);

  const calculateWinner = (squares) => {
    const lines = [[0,1,2], [3,4,5], [6,7,8], [0,3,6], [1,4,7], [2,5,8], [0,4,8], [2,4,6]];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) return squares[a];
    }
    return null;
  };

  const invitePlayer = async () => {
    socket.emit("game:invite", { to: opponent._id, game: "tictactoe" });
    
    await sendMessage({
      text: `Tactical Challenge: Tic Tac Toe`,
      type: "game-invite",
      gameId: "tictactoe"
    }, opponent._id);

    toast("Challenge Sent...", { icon: "⚔️" });
  };

  const currentTurnSymbol = isXNext ? 'X' : 'O';
  const isMyTurn = playerSymbol === currentTurnSymbol;
  const winner = calculateWinner(board);

  const handleClick = (i) => {
    if (!gameActive || board[i] || winner || !isMyTurn) return;

    const newBoard = board.slice();
    newBoard[i] = playerSymbol;
    setBoard(newBoard);
    setIsXNext(!isXNext);

    const win = calculateWinner(newBoard);
    const draw = !win && newBoard.every(Boolean);

    if (win || draw) {
      const resultMsg = win ? (win === playerSymbol ? `Won Tic Tac Toe against ${opponent.fullName}` : `Lost Tic Tac Toe against ${opponent.fullName}`) : `Drew Tic Tac Toe against ${opponent.fullName}`;
      
      socket.emit("game:move", { 
        roomId,
        game: "tictactoe", 
        move: { board: newBoard, isXNext: !isXNext }
      });

      socket.emit("game:end", {
        roomId,
        game: "tictactoe",
        winnerId: win ? (win === playerSymbol ? authUser._id : opponent._id) : null,
        result: win ? 'win' : 'draw',
        winnerSymbol: win,
        board: newBoard
      });

      if (onGameEnd) {
        setTimeout(() => onGameEnd(resultMsg), 2000);
      }
    } else {
      socket.emit("game:move", { 
        roomId,
        game: "tictactoe", 
        move: { board: newBoard, isXNext: !isXNext }
      });
    }
  };

  if (!gameActive) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 bg-[#050505] text-center">
        <div className="max-w-md w-full space-y-8">
            <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 bg-[var(--neon-red)]/20 rounded-full blur-2xl animate-pulse" />
                <div className="relative bg-black/40 border border-[var(--neon-red)]/30 rounded-full w-full h-full flex items-center justify-center">
                    <Target className="w-12 h-12 text-[var(--neon-red)] opacity-50" />
                </div>
            </div>
            
            <div className="space-y-2">
                <h3 className="text-3xl font-black tracking-tighter text-white uppercase italic">Tic Tac Toe Protocol</h3>
                <p className="text-gray-500 text-xs uppercase tracking-[0.4em] font-bold">Logic Duel • v1.0</p>
            </div>

            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md">
                <p className="text-gray-400 text-sm leading-relaxed italic">
                    "A classic test of spatial awareness and foresight. Anticipate every move, or face tactical elimination."
                </p>
            </div>

            <button 
                onClick={() => {
                    if (!opponent) return toast.error("Select an operative first!");
                    invitePlayer();
                }}
                className="w-full bg-[var(--neon-red)] hover:bg-red-500 text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(255,0,60,0.3)] hover:scale-105 transition-all flex items-center justify-center gap-3 active:scale-95"
            >
                <Zap className="w-5 h-5 fill-white" /> Initiate Sequence
            </button>
            
            <p className="text-[10px] text-gray-600 uppercase font-black tracking-widest">Target Operative: {opponent?.fullName || "None Selected"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-8 w-full">

          <div className="flex justify-between w-full max-w-sm px-4">
            <div className={`text-center p-3 rounded-xl border ${playerSymbol === 'X' ? 'border-[var(--neon-red)] bg-[#1a0005]' : 'border-gray-800'}`}>
              <p className="font-bold text-white tracking-widest text-xs uppercase">You ({playerSymbol})</p>
            </div>
            <div className={`text-center p-3 rounded-xl border ${playerSymbol === 'O' ? 'border-[var(--neon-red)] bg-[#1a0005]' : 'border-gray-800'}`}>
              <p className="font-bold text-gray-400 tracking-widest text-xs uppercase">{opponent.fullName} ({playerSymbol === 'X' ? 'O' : 'X'})</p>
            </div>
          </div>
          
          <div className="text-center h-8">
            {winner ? (
              <p className="text-xl font-bold text-[var(--neon-red)] tracking-widest animate-pulse">
                {winner === playerSymbol ? 'VICTORY SECURED' : 'CRITICAL FAILURE'}
              </p>
            ) : board.every(Boolean) ? (
              <p className="text-xl font-bold text-yellow-500 tracking-widest">STALEMATE</p>
            ) : (
              <p className="text-sm font-bold tracking-widest text-gray-300">
                {isMyTurn ? "YOUR MOVE" : "AWAITING OPPONENT"}
              </p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 bg-[#121217] p-2 rounded-2xl border border-gray-800">
            {board.map((square, i) => (
              <button
                key={i}
                onClick={() => handleClick(i)}
                className={`w-24 h-24 md:w-32 md:h-32 bg-[#0a0a0d] border border-gray-800 hover:border-gray-600 rounded-xl text-5xl flex items-center justify-center font-bold transition-colors ${square === 'X' ? 'text-[var(--neon-red)]' : 'text-white'}`}
                disabled={!isMyTurn || winner || square}
              >
                {square}
              </button>
            ))}
          </div>
        </div>
    </div>
  );
};

export default TicTacToe;
import { useContext } from "react";
import { ChatContext } from "../../../context/ChatContext";
import { AuthContext } from "../../../context/AuthContext";
import { useUIStore } from "../../lib/uiStore";
import { Gamepad2, Check, X, Swords } from "lucide-react";
import toast from "react-hot-toast";

const GameInviteCard = ({ message }) => {
  const { authUser, socket } = useContext(AuthContext);
  const { updateMessageStatus } = useContext(ChatContext);
  const { setActiveGame } = useUIStore();

  const isMine = message.senderId === authUser?._id;
  const isPending = message.status === "pending";
  const gameName = message.gameId === "tictactoe" ? "Tic Tac Toe" : message.gameId === "rps" ? "Rock Paper Scissors" : "Truth & Dare";

  const handleAccept = async () => {
    try {
      // 1. Update status in DB
      await updateMessageStatus(message._id, "accepted");

      // 2. Notify sender via socket (Server will then create room and emit game:start)
      socket.emit("game:accept", {
        to: message.senderId,
        gameId: message.gameId,
        messageId: message._id
      });
      
      // Note: We don't setActiveGame here anymore, we wait for 'game:start' broadcast
    } catch (error) {
      toast.error("Failed to accept challenge");
    }
  };

  const handleReject = async () => {
    try {
      await updateMessageStatus(message._id, "rejected");
      socket.emit("game:reject", {
        to: message.senderId,
        gameId: message.gameId
      });
    } catch (error) {
      toast.error("Failed to reject challenge");
    }
  };

  return (
    <div className={`min-w-[240px] p-4 rounded-2xl border ${
      isMine ? "bg-[#1a0005]/40 border-red-500/30" : "bg-[#0a0a0d] border-gray-800"
    } shadow-xl relative overflow-hidden group`}>
      
      {/* Background glow */}
      <div className="absolute -top-10 -right-10 w-24 h-24 bg-[var(--neon-red)]/10 blur-3xl group-hover:bg-[var(--neon-red)]/20 transition-all"></div>

      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-red-950/50 border border-red-500/30 flex items-center justify-center text-[var(--neon-red)] shadow-[0_0_15px_rgba(255,0,60,0.2)]">
          <Gamepad2 className="w-6 h-6" />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-red-400 font-bold">Combat Protocol</p>
          <p className="text-sm font-bold text-white tracking-widest uppercase">{gameName}</p>
        </div>
      </div>

      <p className="text-xs text-gray-400 mb-6 italic leading-relaxed">
        {isMine ? `You challenged the target to ${gameName}.` : `An operative has challenged you to ${gameName}.`}
      </p>

      {isPending ? (
        !isMine ? (
          <div className="flex gap-2">
            <button 
              onClick={handleAccept}
              className="flex-1 bg-[var(--neon-red)] text-black font-bold py-2 rounded-lg text-[11px] uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-[0_5px_15px_rgba(255,0,60,0.3)] flex items-center justify-center gap-2"
            >
              <Check className="w-3 h-3" /> ACCEPT
            </button>
            <button 
              onClick={handleReject}
              className="px-3 border border-gray-700 text-gray-400 hover:bg-white/5 py-2 rounded-lg transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="text-center py-2 border border-dashed border-red-900/30 rounded-lg bg-red-950/10">
            <p className="text-[10px] uppercase tracking-widest text-red-400/60 animate-pulse font-bold">Awaiting Tactical Response</p>
          </div>
        )
      ) : (
        <div className={`text-center py-2 rounded-lg font-bold uppercase tracking-widest text-[10px] border flex items-center justify-center gap-2 ${
          message.status === "accepted" ? "bg-green-500/10 border-green-500/30 text-green-400" : "bg-gray-800/30 border-gray-700 text-gray-500"
        }`}>
          {message.status === "accepted" ? (
            <><Check className="w-3 h-3" /> Challenge Accepted</>
          ) : (
            <><Swords className="w-3 h-3" /> Challenge Expired/Declined</>
          )}
        </div>
      )}
    </div>
  );
};

export default GameInviteCard;

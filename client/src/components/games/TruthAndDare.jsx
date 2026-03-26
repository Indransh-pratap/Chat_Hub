import { useState, useContext, useEffect, useRef } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { ChatContext } from "../../../context/ChatContext";
import toast from "react-hot-toast";
import { useUIStore } from "../../lib/uiStore";
import { 
  HelpCircle, AlertTriangle, RefreshCcw, Send, Image, 
  Video, User, MessageSquare, Zap, Heart, Laugh, 
  Flame, Ghost, Bot 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import assets from "../../assets/assets";

const CATEGORIES = [
  { id: 'romantic', name: 'Romantic', icon: Heart, color: 'text-pink-500', bg: 'bg-pink-500/10', border: 'border-pink-500/30' },
  { id: 'funny', name: 'Funny', icon: Laugh, color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
  { id: 'deep', name: 'Deep', icon: Ghost, color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
  { id: 'savage', name: 'Savage', icon: Flame, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/30' },
];

const QUESTIONS = {
  romantic: {
      truths: ["Who was your first crush?", "What's your idea of a perfect date?", "Have you ever fallen in love at first sight?"],
      dares: ["Send a heart emoji to your crush.", "Describe your dream partner in 3 words.", "Message someone 'I appreciate you'."]
  },
  funny: {
      truths: ["What's the silliest thing you've done for a dare?", "Have you ever walked into a glass door?", "What's your most embarrassing fart story?"],
      dares: ["Do your best chicken impression.", "Talk in an accent for the next 2 turns.", "Try to lick your elbow."]
  },
  deep: {
      truths: ["What is your biggest regret?", "What's the hardest lesson you've ever learned?", "If you could change one thing about your past, what would it be?"],
      dares: ["Share a deep secret with the room.", "Write a 2-sentence poem about life.", "Close your eyes and describe your happy place."]
  },
  savage: {
      truths: ["Who is the most annoying person you know?", "What's the meanest thing you've ever said?", "Have you ever cheated on a test?"],
      dares: ["Roast another player in the room.", "Show the most embarrassing photo on your phone.", "Tell a brutal truth about someone here."]
  }
};

const TruthAndDare = ({ opponent, isMultiplayer = false, onGameEnd }) => {
  const { socket, authUser } = useContext(AuthContext);
  const { users } = useContext(ChatContext);
  const { activeGame } = useUIStore();
  const roomId = activeGame?.roomId;

  const [gameActive, setGameActive] = useState(isMultiplayer);
  const [currentTurnId, setCurrentTurnId] = useState(null);
  const [currentPrompt, setCurrentPrompt] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [gameMessages, setGameMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isMultiplayer && activeGame) {
      setGameActive(true);
      setCurrentTurnId(activeGame.role === "inviter" ? authUser._id : opponent._id);
      
      // Initialize chat with system message (only sender once)
      if (activeGame.role === "inviter" && socket && roomId && gameMessages.length === 0) {
          const initMsg = {
              id: `init-${Date.now()}`,
              isSystem: true,
              text: `MISSION PROTOCOL: ${activeGame.gameId.toUpperCase()} INITIALIZED`,
          };
          socket.emit("game:chat", { roomId, message: initMsg });
      }
    }
  }, [isMultiplayer, activeGame, authUser._id, opponent._id, socket, roomId]);

  useEffect(() => {
    if (!socket || !roomId) return;

    socket.on("game:update", (data) => {
      if (data.game === "truthdare") {
        if (data.move.action === "ask") {
          setCurrentPrompt({ type: data.move.type, text: data.move.text, category: data.move.category, answered: false });
          setCurrentTurnId(authUser._id);
        } else if (data.move.action === "answered") {
          setCurrentPrompt(prev => ({ ...prev, answered: true }));
          setCurrentTurnId(opponent._id);
        } else if (data.move.action === "select_category") {
            setSelectedCategory(data.move.category);
        }
      }
    });

    socket.on("game:chat", (msg) => {
        setGameMessages(prev => [...prev, msg]);
    });

    return () => {
      socket.off("game:update");
      socket.off("game:chat");
    };
  }, [socket, roomId, authUser._id, opponent._id]);

  const handleFileSelect = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (file.size > 10 * 1024 * 1024) {
          return toast.error("File excessively large. Max 10MB permitted.");
      }

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
          const base64 = reader.result;
          const isVideo = file.type.startsWith('video');
          
          setIsUploading(true);
          const toastId = toast.loading(`Transmitting ${isVideo ? 'Video' : 'Image'} evidence...`);

          try {
              const res = await axios.post(`/api/messages/send/${opponent._id}`, {
                  [isVideo ? 'video' : 'image']: base64,
                  text: `[Tactical Media Transmission]`,
                  type: isVideo ? 'video' : 'video'
              });

              if (res.data.success) {
                  const mediaMsg = {
                      id: `media-${Date.now()}`,
                      senderId: authUser._id,
                      senderName: authUser.fullName,
                      text: "", // Clear text for media-only messages
                      image: res.data.newMessage.image,
                      video: res.data.newMessage.video,
                      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  };
                  socket.emit("game:chat", { roomId, message: mediaMsg });
                  toast.success("Transmission Complete", { id: toastId });
              }
          } catch (error) {
              console.error("Transmission Failure:", error);
              toast.error("Transmission Failure", { id: toastId });
          } finally {
              setIsUploading(false);
              if (fileInputRef.current) fileInputRef.current.value = "";
          }
      };
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [gameMessages]);

  const sendGameMessage = (e) => {
    e?.preventDefault();
    if (!chatInput.trim()) return;
    if (!roomId) {
        toast.error("Tactical Comms offline: Room not found.");
        return;
    }

    const msg = {
        id: Date.now(),
        senderId: authUser._id,
        senderName: authUser.fullName,
        text: chatInput,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    socket.emit("game:chat", { roomId, message: msg });
    setChatInput("");
  };

  const handleCategorySelect = (catId) => {
      setSelectedCategory(catId);
      socket.emit("game:move", { roomId, game: "truthdare", move: { action: "select_category", category: catId } });
  };

  const askQuestion = (type) => {
    if (!selectedCategory) return;
    const categoryData = QUESTIONS[selectedCategory];
    const list = type === 'truth' ? categoryData.truths : categoryData.dares;
    const randomItem = list[Math.floor(Math.random() * list.length)];
    
    setCurrentPrompt({ type, text: randomItem, category: selectedCategory, answered: false });
    setCurrentTurnId(opponent._id);

    socket.emit("game:move", { 
      roomId, 
      game: "truthdare", 
      move: {
        action: "ask",
        type,
        text: randomItem,
        category: selectedCategory
      }
    });

    // Auto-post to game chat
    const logMsg = {
        id: `log-${Date.now()}`,
        isSystem: true,
        text: `${authUser.fullName} challenged ${opponent.fullName} with a ${type.toUpperCase()}!`,
    };
    socket.emit("game:chat", { roomId, message: logMsg });
  };

  const completeTask = () => {
    setCurrentPrompt(prev => ({ ...prev, answered: true }));
    setCurrentTurnId(authUser._id);
    
    socket.emit("game:move", { roomId, game: "truthdare", move: { action: "answered" } });

    const logMsg = {
        id: `log-${Date.now()}`,
        isSystem: true,
        text: `${authUser.fullName} completed the ${currentPrompt.type.toUpperCase()}!`,
    };
    socket.emit("game:chat", { roomId, message: logMsg });
  };

  const isMyTurn = currentTurnId === authUser?._id;

  return (
    <div className="h-full w-full">
      {!gameActive ? (
        <div className="h-full flex flex-col items-center justify-center p-8 bg-[#050505] text-center">
          <div className="max-w-md w-full space-y-8">
              <div className="relative w-24 h-24 mx-auto">
                  <div className="absolute inset-0 bg-red-500/20 rounded-full blur-2xl animate-pulse" />
                  <div className="relative bg-black/40 border border-red-500/30 rounded-full w-full h-full flex items-center justify-center">
                      <HelpCircle className="w-12 h-12 text-red-500 opacity-50" />
                  </div>
              </div>
              
              <div className="space-y-2">
                  <h3 className="text-3xl font-black tracking-tighter text-white uppercase italic">Interrogation Protocol</h3>
                  <p className="text-gray-500 text-xs uppercase tracking-[0.4em] font-bold">Truth or Dare • Tactical Edition</p>
              </div>

              <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md">
                  <p className="text-gray-400 text-sm leading-relaxed italic">
                      "Secrets are vulnerabilities. In the Truth & Dare protocol, we extract the truth or test the resolve of our operatives."
                  </p>
              </div>

              <button 
                  onClick={() => {
                      if (!opponent) return toast.error("Select an operative first!");
                      socket.emit("game:invite", { to: opponent._id, game: "truthdare" });
                      toast("Invitation Transmitted", { icon: "📡" });
                  }}
                  className="w-full bg-red-600 hover:bg-red-500 text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(255,0,60,0.3)] hover:scale-105 transition-all flex items-center justify-center gap-3 active:scale-95"
              >
                  <Zap className="w-5 h-5 fill-white" /> Initiate Sequence
              </button>
              
              <p className="text-[10px] text-gray-600 uppercase font-black tracking-widest">Target Operative: {opponent?.fullName || "None Selected"}</p>
          </div>
        </div>
      ) : (
        <div className="h-full flex flex-col lg:grid lg:grid-cols-[240px_1fr_320px] bg-[#050505] overflow-hidden">
          
          {/* LEFT: OPERATIVES LIST (Hidden on mobile) */}
          <div className="hidden lg:flex flex-col border-r border-white/5 p-4 bg-black/40 h-full">
            <h3 className="text-[10px] uppercase tracking-[0.3em] text-red-500 font-bold mb-6 flex items-center gap-2">
                <User className="w-3 h-3" /> Live Operatives
            </h3>
            <div className="space-y-4">
                {[authUser, opponent].map(user => (
                    <div key={user?._id} className={`flex items-center gap-3 p-3 rounded-xl border ${currentTurnId === user?._id ? 'bg-[#1a0005] border-red-500/50 shadow-[0_0_15px_rgba(255,0,60,0.2)]' : 'bg-white/5 border-transparent'} transition-all`}>
                        <div className="relative">
                            <img src={user?.profilePic || assets.avatar_icon} className="w-8 h-8 rounded-full border border-gray-700" alt="avatar" />
                            {currentTurnId === user?._id && (
                                <div className="absolute -top-1 -right-1 bg-red-500 w-3 h-3 rounded-full animate-pulse border-2 border-black" />
                            )}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[11px] font-bold text-white truncate w-24 uppercase tracking-tighter">{user?.fullName}</span>
                            <span className="text-[8px] text-gray-500 uppercase tracking-widest">{currentTurnId === user?._id ? 'Active Turn' : 'Awaiting'}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-auto pt-4 border-t border-white/5">
                <h4 className="text-[9px] uppercase tracking-widest text-gray-600 mb-3">AI Intelligence</h4>
                <button 
                    onClick={() => toast("AI Neural Link: Coming in next update.", { icon: "🧠" })}
                    className="w-full flex items-center gap-2 p-2 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-400 hover:bg-blue-500/20 transition-all text-[10px] uppercase font-bold tracking-widest"
                >
                    <Bot className="w-3 h-3" /> AI Suggestion
                </button>
            </div>
          </div>

          {/* CENTER: DASHBOARD / TACTICAL BOARD */}
          <div className="flex-1 flex flex-col relative overflow-hidden p-4 lg:p-6 h-[50vh] lg:h-full border-b lg:border-b-0 border-white/5">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5 pointer-events-none" />
            
            <div className="flex-1 flex flex-col justify-center items-center z-10 max-w-xl mx-auto w-full">
                {!selectedCategory ? (
                    <div className="w-full space-y-6 lg:space-y-8 text-center">
                        <div>
                            <h2 className="text-2xl lg:text-3xl font-black text-white italic tracking-tighter uppercase mb-2">Select Protocol</h2>
                            <p className="text-gray-500 text-[10px] lg:text-xs uppercase tracking-[0.3em]">Phase 1: Categorization</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 lg:gap-4">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => isMyTurn && handleCategorySelect(cat.id)}
                                    disabled={!isMyTurn}
                                    className={`group p-4 lg:p-6 rounded-2xl lg:rounded-3xl border-2 transition-all flex flex-col items-center gap-2 lg:gap-3 ${cat.bg} ${cat.border} hover:scale-105 active:scale-95 ${!isMyTurn ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                                >
                                    <cat.icon className={`w-6 h-6 lg:w-8 lg:h-8 ${cat.color} group-hover:scale-110 transition-transform`} />
                                    <span className={`text-[10px] lg:text-xs font-black uppercase tracking-widest ${cat.color}`}>{cat.name}</span>
                                </button>
                            ))}
                        </div>
                        {!isMyTurn && <p className="text-red-500 font-bold text-[10px] animate-pulse uppercase">Awaiting opponent...</p>}
                    </div>
                ) : (
                    <div className="w-full space-y-6 lg:space-y-8">
                        {/* Active Question Card */}
                        <AnimatePresence mode="wait">
                            {currentPrompt ? (
                                <motion.div 
                                    key={currentPrompt.text}
                                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, y: -20 }}
                                    className={`w-full p-6 lg:p-10 rounded-[30px] lg:rounded-[40px] border-2 bg-black/80 backdrop-blur-xl relative overflow-hidden text-center shadow-2xl ${currentPrompt.type === 'truth' ? 'border-blue-500/50' : 'border-red-500/50'}`}
                                >
                                    <div className={`absolute top-0 left-0 w-full h-1.5 ${currentPrompt.type === 'truth' ? 'bg-blue-500' : 'bg-red-500'}`} />
                                    <h3 className={`text-[10px] lg:text-sm font-black uppercase tracking-[0.4em] mb-4 lg:mb-8 ${currentPrompt.type === 'truth' ? 'text-blue-500' : 'text-red-500'}`}>
                                        {currentPrompt.type} INITIATED
                                    </h3>
                                    <p className="text-xl lg:text-3xl font-bold text-white leading-tight italic tracking-tight mb-6 lg:mb-8 px-2">
                                        "{currentPrompt.text}"
                                    </p>
                                    {currentPrompt.answered ? (
                                        <div className="flex items-center justify-center gap-2 text-green-500 font-black uppercase tracking-widest text-[10px] py-2 px-6 rounded-full bg-green-500/10 border border-green-500/40 w-max mx-auto">
                                            <Zap className="w-3 h-3 fill-green-500" /> Objective Cleared
                                        </div>
                                    ) : isMyTurn && (
                                        <button 
                                            onClick={completeTask}
                                            className="w-full lg:w-auto bg-green-600 hover:bg-green-500 text-white font-black uppercase tracking-[0.2em] py-3 lg:py-4 px-10 rounded-xl lg:rounded-2xl transition-all shadow-[0_0_30px_rgba(22,163,74,0.4)] text-xs lg:text-sm"
                                        >
                                            I COMPLETED THIS
                                        </button>
                                    )}
                                </motion.div>
                            ) : (
                                <div className="text-center space-y-4 lg:space-y-6">
                                    <div className="p-6 lg:p-8 rounded-full bg-red-950/20 border border-red-500/30 w-max mx-auto shadow-[0_0_30px_rgba(255,0,60,0.2)]">
                                        <Zap className="w-8 h-8 lg:w-12 lg:h-12 text-red-500 animate-pulse fill-red-500" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl lg:text-2xl font-black text-white italic tracking-tighter uppercase">{isMyTurn ? 'Your Turn to Strike' : 'Target Selection Phase'}</h2>
                                        <p className="text-gray-500 text-[8px] lg:text-[10px] uppercase font-bold tracking-[0.5em] mt-2">Active Protocol: {selectedCategory}</p>
                                    </div>
                                    {isMyTurn && (
                                        <div className="flex gap-3 lg:gap-4 w-full">
                                            <button onClick={() => askQuestion('truth')} className="flex-1 py-3 lg:py-4 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest rounded-xl lg:rounded-2xl shadow-lg transition-all text-xs">Truth</button>
                                            <button onClick={() => askQuestion('dare')} className="flex-1 py-3 lg:py-4 bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest rounded-xl lg:rounded-2xl shadow-lg transition-all text-xs">Dare</button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>
          </div>

          {/* RIGHT: COMMS (IN-GAME CHAT) */}
          <div className="flex flex-col h-[40vh] lg:h-full border-t lg:border-t-0 lg:border-l border-white/5 bg-black/60 backdrop-blur-md overflow-hidden">
            <div className="p-3 lg:p-4 border-b border-white/5 flex items-center justify-between bg-black/40">
                <h3 className="text-[10px] uppercase tracking-[0.2em] text-blue-500 font-bold flex items-center gap-2">
                    <MessageSquare className="w-3 h-3" /> Mission Comms
                </h3>
                <span className="text-[8px] bg-red-500/20 text-red-500 px-2 py-0.5 rounded font-bold uppercase tracking-widest">Live</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-black/20">
                {gameMessages.map(msg => (
                    <div key={msg.id} className={`${msg.isSystem ? 'text-center' : ''}`}>
                        {msg.isSystem ? (
                            <p className="text-[8px] lg:text-[9px] uppercase font-black text-gray-600 tracking-widest italic">{msg.text}</p>
                        ) : (
                            <div className={`flex flex-col ${msg.senderId === authUser._id ? 'items-end' : 'items-start'}`}>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[8px] font-bold text-gray-500 uppercase">{msg.senderName}</span>
                                    <span className="text-[7px] text-gray-700">{msg.timestamp}</span>
                                </div>
                                <div className={`max-w-[85%] lg:max-w-[90%] p-3 rounded-xl lg:rounded-2xl text-[11px] lg:text-[12px] leading-tight ${msg.senderId === authUser._id ? 'bg-red-500 text-white rounded-tr-none' : 'bg-white/5 text-gray-300 rounded-tl-none border border-white/5'}`}>
                                    {msg.text && <p className="mb-2">{msg.text}</p>}
                                    {msg.image && (
                                        <img src={msg.image} alt="tactical-media" className="rounded-lg max-w-full h-auto border border-white/10 shadow-lg" />
                                    )}
                                    {msg.video && (
                                        <video src={msg.video} controls className="rounded-lg max-w-full h-auto border border-white/10 shadow-lg" />
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
                <div ref={chatEndRef} />
            </div>

            <form onSubmit={sendGameMessage} className="p-3 lg:p-4 bg-black/95 border-t border-white/5 flex gap-2 items-center">
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileSelect} 
                    accept="image/*,video/*" 
                    className="hidden" 
                />
                <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className={`p-2 hover:text-white transition-colors hidden sm:block ${isUploading ? 'text-red-500 animate-pulse' : 'text-gray-500'}`}
                >
                    <Image className="w-4 h-4" />
                </button>
                <input 
                    type="text" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={isUploading ? "Uploading Protocol..." : "Secure transmission..."} 
                    disabled={isUploading}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-red-500/50 transition-all shadow-inner disabled:opacity-50"
                />
                <button 
                    type="submit" 
                    disabled={isUploading || !chatInput.trim()}
                    className="px-4 py-2 bg-red-600 rounded-xl text-white hover:bg-red-500 transition-all shadow-[0_0_15px_rgba(255,0,60,0.4)] active:scale-95 disabled:opacity-50 disabled:grayscale"
                >
                    <Send className="w-4 h-4" />
                </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TruthAndDare;


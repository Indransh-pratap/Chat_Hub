import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";
import { formatMessageTime } from "../lib/utils";
import assets from "../assets/assets";
import { Send, Image as ImageIcon, Smile, Phone, Video, MoreVertical } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import EmojiPicker from "emoji-picker-react";
import toast from "react-hot-toast";
import { useUIStore } from "../lib/uiStore";
import GameInviteCard from "./games/GameInviteCard";

const ChatContainer = () => {
  const navigate = useNavigate();
  const { messages, selectedUser, setSelectedUser, sendMessage, getMessages } = useContext(ChatContext);
  const { authUser, onlineUsers, socket } = useContext(AuthContext);
  const { setActiveCall } = useUIStore();

  const scrollEnd = useRef(null);
  const [input, setInput] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (selectedUser?._id) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser]);

  const scrollToBottom = () => {
    scrollEnd.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // SOCKET: Listen for typing events
  useEffect(() => {
    if (!socket || !selectedUser) return;

    const handleTyping = ({ from }) => {
      if (from === selectedUser._id) {
        setIsTyping(true);
        // Clear previous timeout and set a new one to turn off typing after 2 seconds
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 2000);
      }
    };

    socket.on("typing", handleTyping);

    return () => {
      socket.off("typing", handleTyping);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [socket, selectedUser]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim()) return;

    await sendMessage({ text: input.trim() });
    setInput("");
    setShowEmojiPicker(false);
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    
    // Emit typing event to backend (throttled/simple)
    if (socket && selectedUser) {
      socket.emit("typing", { to: selectedUser._id });
    }
  };

  const handleSendImage = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Invalid image format");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Max 2MB allowed");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      await sendMessage({ image: reader.result });
      e.target.value = "";
    };
    reader.readAsDataURL(file);
  };

  const onEmojiClick = (emojiObject) => {
    setInput((prev) => prev + emojiObject.emoji);
  };

  if (!selectedUser) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400 glass-panel">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="w-24 h-24 rounded-full border border-[var(--neon-red)] flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(255,0,60,0.3)]">
            <span className="text-4xl">📡</span>
          </div>
          <p className="text-xl font-medium text-[var(--neon-red)] neon-text tracking-widest">AWAITING CONNECTION</p>
          <p className="text-sm mt-2">Select an operative from the directory to establish a secure link.</p>
        </motion.div>
      </div>
    );
  }

  const isUserOnline = Array.isArray(onlineUsers) && onlineUsers.includes(selectedUser?._id);

  return (
    <div className="h-full w-full flex flex-col glass-panel relative z-10 overflow-hidden">
      {/* Chat Header */}
      <div className="h-[76px] shrink-0 border-b border-[#ffffff10] bg-[#0a0a0d] flex items-center justify-between px-4 sticky top-0 z-20 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-3">
          <button className="md:hidden p-2 -ml-2 hover:bg-[#1a0005] rounded-full transition-colors text-[var(--neon-red)]" onClick={() => setSelectedUser(null)}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <img src={selectedUser.profilePic || assets.avatar_icon} className="w-10 h-10 md:w-11 md:h-11 rounded-full object-cover border-2 border-[var(--neon-red)] shadow-[0_0_10px_rgba(255,0,60,0.3)]" alt="" />
          <div>
            <p className="font-bold text-white tracking-widest text-sm md:text-base">{selectedUser.fullName}</p>
            <p className={`text-[10px] md:text-xs ${isUserOnline ? 'text-green-400' : 'text-gray-500'} uppercase tracking-wider font-semibold`}>
              {isUserOnline ? "Signal Acquired" : "Signal Lost"}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setActiveCall({ remoteUserId: selectedUser._id, isReceiver: false })}
            className="hover:text-white hover:drop-shadow-[0_0_8px_white] transition-colors p-2 rounded-full hover:bg-white/10" 
            title="Secure Voice Comm"
          >
            <Phone className="w-5 h-5 text-gray-300" />
          </button>
          <button 
            onClick={() => setActiveCall({ remoteUserId: selectedUser._id, isReceiver: false })}
            className="hover:text-white hover:drop-shadow-[0_0_8px_white] transition-colors p-2 rounded-full hover:bg-white/10" 
            title="Encrypted Video Link"
          >
            <Video className="w-5 h-5 text-gray-300" />
          </button>
          <button className="hover:text-white hover:drop-shadow-[0_0_8px_white] transition-colors p-2 rounded-full hover:bg-white/10" title="Options">
            <MoreVertical className="w-5 h-5 text-gray-300" />
          </button>
        </div>
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 custom-scrollbar relative z-10">
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <p className="text-center text-gray-500 tracking-widest text-sm bg-[#0a0a0d] px-6 py-2 rounded-full border border-gray-800">
              SECURE CHANNEL ESTABLISHED. NO MESSAGES YET.
            </p>
          </div>
        )}

        <AnimatePresence>
          {messages.map((msg) => {
            const isMine = msg.senderId === authUser._id;

            return (
              <motion.div
                key={msg._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                layout
                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm relative group ${
                    isMine
                      ? "bg-gradient-to-br from-red-900 to-[#4a0011] text-white border border-[var(--neon-red)] shadow-[0_0_15px_rgba(255,0,60,0.15)] rounded-tr-sm"
                      : "bg-[#1a1a24] text-gray-100 border border-gray-700 rounded-tl-sm shadow-lg"
                  }`}
                >
                  {msg.image ? (
                    <img src={msg.image} className="rounded-lg object-cover max-h-60 mb-2 cursor-pointer hover:opacity-90 transition-opacity" alt="attachment" />
                  ) : null}
                  
                  {msg.text && msg.type !== 'game-invite' && msg.type !== 'game_invite' && <p className="leading-relaxed">{msg.text}</p>}

                  {(msg.type === 'game-invite' || msg.type === 'game_invite') && (
                    <GameInviteCard message={msg} />
                  )}

                  <div className={`text-[10px] mt-2 flex items-center gap-1 ${isMine ? "text-red-300 justify-end" : "text-gray-500 justify-start"}`}>
                    {formatMessageTime(msg.createdAt)}
                    {isMine && (
                      <span className={`ml-1 ${msg.seen ? 'text-green-400 drop-shadow-[0_0_5px_#22c55e]' : 'text-gray-400'}`}>✓✓</span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
          
        {isTyping && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="flex justify-start max-w-[85%] mb-4"
          >
            <div className="px-4 py-3 rounded-2xl bg-[#121217] border border-gray-800 rounded-bl-sm flex gap-1 items-center shadow-lg">
              <span className="w-2 h-2 bg-[var(--neon-red)] rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-2 h-2 bg-[var(--neon-red)] rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-2 h-2 bg-[var(--neon-red)] rounded-full animate-bounce"></span>
            </div>
          </motion.div>
        )}

        <div ref={scrollEnd} />
      </div>

      {/* Emoji Picker Popover */}
      {showEmojiPicker && (
        <div className="absolute bottom-24 left-6 z-50 shadow-[0_0_20px_rgba(255,0,60,0.2)] rounded-lg overflow-hidden border border-[var(--neon-red)]">
          <EmojiPicker 
            onEmojiClick={onEmojiClick}
            theme="dark"
            previewConfig={{ showPreview: false }}
          />
        </div>
      )}

      {/* Message Input Area */}
      <div className="p-3 md:p-4 bg-[#0a0a0d] border-t border-[#ffffff10] sticky bottom-0 z-30 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        <form onSubmit={handleSend} className="flex items-center gap-2 md:gap-3 bg-[#121217] p-1 md:p-2 rounded-xl border border-gray-800 focus-within:border-[var(--neon-red)] focus-within:shadow-[0_0_15px_rgba(255,0,60,0.1)] transition-all">
          <button 
            type="button" 
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 md:p-3 text-gray-400 hover:text-[var(--neon-red)] transition-colors"
          >
            <Smile className="w-5 h-5 md:w-6 md:h-6" />
          </button>

          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none px-2 tracking-wide text-sm md:text-base selection:bg-[var(--neon-red)] selection:text-white"
            placeholder="Encrypting outgoing transmission..."
          />

          <input
            onChange={handleSendImage}
            type="file"
            id="image"
            accept="image/png,image/jpeg,image/webp"
            hidden
          />

          <label htmlFor="image" className="cursor-pointer text-gray-400 hover:text-[var(--neon-red)] transition-colors p-1">
            <ImageIcon className="w-5 h-5" />
          </label>

          <button
            type="submit"
            disabled={!input.trim()}
            className="bg-[var(--neon-red)] text-white p-2 rounded-full hover:bg-white hover:text-[var(--dark-red)] transition-all shadow-[0_0_10px_var(--neon-red)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[var(--neon-red)] disabled:hover:text-white"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatContainer;
import { useContext, useEffect, useRef, useState } from "react";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";
import { formatMessageTime } from "../lib/utils";
import assets from "../assets/assets";
import { Send, Image as ImageIcon, Smile, Phone, Video, MoreVertical } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import EmojiPicker from "emoji-picker-react";
import toast from "react-hot-toast";

const ChatContainer = () => {
  const { messages, selectedUser, setSelectedUser, sendMessage, getMessages } = useContext(ChatContext);
  const { authUser, onlineUsers } = useContext(AuthContext);

  const scrollEnd = useRef(null);
  const [input, setInput] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);

  useEffect(() => {
    if (selectedUser?._id) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser]);

  useEffect(() => {
    scrollEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!input.trim()) return;

    await sendMessage({ text: input.trim() });
    setInput("");
    setShowEmoji(false);
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
      {/* HEADER */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-[#ff003c40] bg-black/40 backdrop-blur-md z-20">
        <button className="md:hidden" onClick={() => setSelectedUser(null)}>
          <img src={assets.arrow_icon} className="w-6 cursor-pointer" alt="back" />
        </button>

        <div className="relative">
          <img
            src={selectedUser.profilePic || assets.avatar_icon}
            className={`w-12 h-12 rounded-full object-cover border-2 ${isUserOnline ? 'border-green-500' : 'border-gray-600'}`}
            alt="profile"
          />
          {isUserOnline && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black shadow-[0_0_8px_#22c55e]"></span>
          )}
        </div>

        <div className="flex-1">
          <p className="text-white font-bold tracking-wide flex items-center gap-2">
            {selectedUser.fullName}
          </p>
          <p className={`text-xs ${isUserOnline ? 'text-green-400' : 'text-gray-500'} tracking-widest uppercase`}>
            {isUserOnline ? "Signal Acquired" : "Signal Lost"}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4 text-[var(--neon-red)]">
          <button className="hover:text-white hover:drop-shadow-[0_0_8px_white] transition-colors p-2 rounded-full hover:bg-white/10" title="Secure Voice Comm">
            <Phone className="w-5 h-5" />
          </button>
          <button className="hover:text-white hover:drop-shadow-[0_0_8px_white] transition-colors p-2 rounded-full hover:bg-white/10" title="Encrypted Video Link">
            <Video className="w-5 h-5" />
          </button>
          <button className="hover:text-white hover:drop-shadow-[0_0_8px_white] transition-colors p-2 rounded-full hover:bg-white/10" title="Options">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 custom-scrollbar relative z-10">
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <p className="text-center text-gray-500 tracking-widest text-sm bg-black/50 px-6 py-2 rounded-full border border-gray-800">
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
                  
                  {msg.text && <p className="leading-relaxed">{msg.text}</p>}

                  <div className={`text-[10px] mt-2 flex items-center gap-1 ${isMine ? "text-red-300 justify-end" : "text-gray-500 justify-start"}`}>
                    {formatMessageTime(msg.createdAt)}
                    {isMine && <span className="ml-1 text-[var(--neon-red)]">✓✓</span>}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={scrollEnd}></div>
      </div>

      {/* Emoji Picker Popover */}
      {showEmoji && (
        <div className="absolute bottom-24 left-6 z-50 shadow-[0_0_20px_rgba(255,0,60,0.2)] rounded-lg overflow-hidden border border-[var(--neon-red)]">
          <EmojiPicker 
            onEmojiClick={onEmojiClick}
            theme="dark"
            previewConfig={{ showPreview: false }}
          />
        </div>
      )}

      {/* INPUT AREA */}
      <div className="px-6 py-4 bg-black/60 backdrop-blur-md border-t border-[#ff003c40] z-20">
        <form
          onSubmit={handleSendMessage}
          className="flex items-center gap-3 bg-[var(--bg-panel)] border border-[var(--neon-red)] rounded-full px-4 py-2 shadow-[0_0_10px_rgba(255,0,60,0.1)] focus-within:shadow-[0_0_15px_rgba(255,0,60,0.4)] transition-all"
        >
          <button 
            type="button" 
            onClick={() => setShowEmoji(!showEmoji)}
            className="text-gray-400 hover:text-[var(--neon-red)] transition-colors p-1"
          >
            <Smile className="w-5 h-5" />
          </button>

          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            type="text"
            placeholder="Transmit data..."
            className="flex-1 bg-transparent text-white border-none outline-none placeholder-gray-600 text-sm px-2"
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
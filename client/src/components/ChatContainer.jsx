import { useContext, useEffect, useRef, useState } from "react";
import assets from "../assets/assets";
import { formatMessageTime } from "../lib/utils";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";

const ChatContainer = () => {
  const {
    messages,
    selectedUser,
    setSelectedUser,
    sendMessage,
    getMessages,
  } = useContext(ChatContext);

  const { authUser, onlineUsers } = useContext(AuthContext);

  const scrollEnd = useRef(null);
  const [input, setInput] = useState("");

  // SEND TEXT
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    await sendMessage({ text: input.trim() });
    setInput("");
  };

  // SEND IMAGE
  const handleSendImage = async (e) => {
    const file = e.target.files[0];

    if (!file || !file.type.startsWith("image/")) {
      toast.error("Select a valid image file");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image too large (max 2MB)");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      await sendMessage({ image: reader.result });
      e.target.value = "";
    };

    reader.readAsDataURL(file);
  };

  // LOAD MESSAGES
  useEffect(() => {
    if (selectedUser?._id) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser]);

  // AUTO SCROLL
  useEffect(() => {
    if (scrollEnd.current) {
      scrollEnd.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const isUserOnline =
    Array.isArray(onlineUsers) &&
    onlineUsers.includes(selectedUser?._id);

  return selectedUser ? (
    <div className="h-full w-full flex flex-col bg-gradient-to-br from-[#0f0f1a] via-[#151529] to-[#0b0b14]">

      {/* HEADER */}
      <div className="shrink-0 flex items-center gap-4 px-6 py-4 border-b border-white/10 backdrop-blur-xl bg-white/5">
        <img
          src={selectedUser.profilePic || assets.avatar_icon}
          alt=""
          className="w-10 h-10 rounded-full object-cover ring-2 ring-violet-500/40"
        />

        <div className="flex-1">
          <p className="text-white font-semibold flex items-center gap-2 tracking-wide">
            {selectedUser.fullName || "Unknown User"}
            {isUserOnline && (
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
            )}
          </p>
          <p className="text-xs text-gray-400">
            {isUserOnline ? "Online now" : "Offline"}
          </p>
        </div>

        <img
          onClick={() => setSelectedUser(null)}
          src={assets.arrow_icon}
          alt="back"
          className="md:hidden w-7 cursor-pointer opacity-80 hover:opacity-100 transition"
        />
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 w-full overflow-y-auto px-10 py-6 space-y-4">

        {messages.length === 0 && (
          <p className="text-center text-gray-400 text-sm mt-10">
            No messages yet. Say hi 👋
          </p>
        )}

        {messages.map((msg) => {
          const isMine = msg.senderId === authUser._id;

          return (
            <div
              key={msg._id}
              className={`w-full flex ${
                isMine ? "justify-end" : "justify-start"
              }`}
            >
              {/* MESSAGE WRAPPER */}
              <div
                className={`flex items-end gap-3 max-w-[75%] ${
                  isMine ? "flex-row" : "flex-row-reverse"
                }`}
              >
                {/* MESSAGE */}
                {msg.image ? (
                  <img
                    src={msg.image}
                    alt="sent"
                    className="max-w-full rounded-2xl border border-white/10 shadow-lg"
                  />
                ) : (
                  <p
                    className={`px-4 py-2.5 text-sm rounded-2xl break-words shadow-md ${
                      isMine
                        ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-br-md"
                        : "bg-white/10 text-white rounded-bl-md"
                    }`}
                  >
                    {msg.text}
                  </p>
                )}

                {/* AVATAR + TIME */}
                <div className="flex flex-col items-center text-[10px] text-gray-400">
                  <img
                    src={
                      isMine
                        ? authUser.profilePic || assets.avatar_icon
                        : selectedUser.profilePic || assets.avatar_icon
                    }
                    alt=""
                    className="w-8 h-8 rounded-full object-cover mb-1"
                  />
                  {formatMessageTime(msg.createdAt)}
                </div>
              </div>
            </div>
          );
        })}

        <div ref={scrollEnd}></div>
      </div>

      {/* INPUT */}
      <form
        onSubmit={handleSendMessage}
        className="shrink-0 px-6 py-4 flex items-center gap-3 border-t border-white/10 backdrop-blur-xl bg-white/5"
      >
        <div className="flex-1 flex items-center bg-white/10 rounded-full px-4 py-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            type="text"
            placeholder="Type a message..."
            className="flex-1 text-sm bg-transparent outline-none text-white placeholder-gray-400"
          />

          <input
            onChange={handleSendImage}
            type="file"
            id="image"
            accept="image/png,image/jpeg"
            hidden
          />

          <label htmlFor="image">
            <img
              src={assets.gallery_icon}
              alt="gallery"
              className="w-5 cursor-pointer opacity-70 hover:opacity-100 transition"
            />
          </label>
        </div>

        <button type="submit">
          <div className="w-11 h-11 flex items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:scale-105 transition shadow-lg">
            <img
              src={assets.send_button}
              alt="send"
              className="w-5 invert"
            />
          </div>
        </button>
      </form>
    </div>
  ) : (
    <div className="h-full flex flex-col items-center justify-center gap-4 text-gray-400 bg-gradient-to-br from-[#0f0f1a] to-[#0b0b14] max-md:hidden">
      <img src={assets.logo_icon} className="w-20 opacity-80" alt="" />
      <p className="text-xl font-semibold text-white">
        Chat anytime, anywhere
      </p>
      <p className="text-sm text-gray-400">
        Select a user to start chatting
      </p>
    </div>
  );
};

export default ChatContainer;

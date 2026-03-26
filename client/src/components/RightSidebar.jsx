import { useContext, useEffect, useState } from "react";
import assets from "../assets/assets";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";
import { motion } from "framer-motion";
import { X, Images, Fingerprint, Activity } from "lucide-react";

const RightSidebar = ({ setShowRightSidebar }) => {
  const { selectedUser, messages } = useContext(ChatContext);
  const { onlineUsers } = useContext(AuthContext);

  const [msgImages, setMsgImages] = useState([]);

  useEffect(() => {
    if (!messages || messages.length === 0) {
      setMsgImages([]);
      return;
    }

    const imgs = messages
      .filter((msg) => msg.image)
      .map((msg) => msg.image);

    setMsgImages(imgs);
  }, [messages]);

  if (!selectedUser) return null;

  const isOnline = Array.isArray(onlineUsers) && onlineUsers.includes(selectedUser._id);

  return (
    <motion.div 
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="bg-[var(--bg-panel)] backdrop-blur-md text-white w-full h-full relative flex flex-col max-md:hidden custom-scrollbar overflow-y-auto"
    >
      {/* 🔴 HIDE BUTTON */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={() => setShowRightSidebar(false)}
          className="text-gray-400 hover:text-[var(--neon-red)] transition-colors p-1 rounded-full hover:bg-white/5"
          title="Close Dossier"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-6 pb-2">
        <h2 className="text-sm uppercase tracking-widest text-[var(--neon-red)] font-semibold flex items-center gap-2 drop-shadow-[0_0_8px_var(--neon-red)]">
          <Fingerprint className="w-4 h-4" /> Subject Dossier
        </h2>
      </div>

      {/* -------- USER INFO -------- */}
      <div className="flex flex-col items-center gap-4 mt-6 mx-auto w-full px-6">
        <div className="relative group">
          <img
            src={selectedUser.profilePic || assets.avatar_icon}
            alt="profile"
            className="w-28 h-28 rounded-full object-cover ring-4 ring-[#1a1014] border-2 border-[var(--neon-red)] shadow-[0_0_20px_rgba(255,0,60,0.3)] transition-transform duration-500 group-hover:scale-105"
          />
          {isOnline && (
            <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-[#1a1014] shadow-[0_0_10px_#22c55e] flex items-center justify-center">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            </div>
          )}
        </div>

        <div className="text-center w-full">
          <h1 className="text-2xl font-bold tracking-wider text-white flex justify-center items-center gap-2">
            {selectedUser.fullName || "UNKNOWN SUBJECT"}
          </h1>
          <div className="inline-flex items-center gap-1 mt-1 px-3 py-1 rounded-full bg-black/40 border border-gray-800">
            <Activity className={`w-3 h-3 ${isOnline ? "text-green-500" : "text-gray-500"}`} />
            <span className={`text-[10px] uppercase font-bold tracking-widest ${isOnline ? "text-green-400" : "text-gray-500"}`}>
              {isOnline ? "Active Signal" : "Signal Dropped"}
            </span>
          </div>
        </div>

        {selectedUser.bio && (
          <div className="w-full bg-black/30 border border-[#ff003c20] rounded-xl p-4 mt-2">
            <p className="text-xs text-[var(--neon-red)] uppercase tracking-wider mb-2 font-semibold">Decrypted Bio</p>
            <p className="text-sm text-gray-300 leading-relaxed font-light">
              "{selectedUser.bio}"
            </p>
          </div>
        )}
      </div>

      {/* -------- MEDIA GALLERY -------- */}
      <div className="px-6 mt-8 flex-1">
        <div className="flex items-center gap-2 mb-4 border-b border-[#ff003c20] pb-2">
          <Images className="w-4 h-4 text-[var(--neon-red)]" />
          <p className="text-xs uppercase tracking-widest text-[var(--neon-red)] font-semibold">Intercepted Media</p>
          <span className="ml-auto text-xs bg-[var(--neon-red)] text-white px-2 py-0.5 rounded-full font-bold">
            {msgImages.length}
          </span>
        </div>

        {msgImages.length === 0 ? (
          <div className="bg-black/20 border border-dashed border-gray-800 rounded-xl p-6 text-center">
            <p className="text-gray-500 text-xs tracking-widest uppercase">No Visual Data</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 pb-6">
            {msgImages.map((img, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="cursor-pointer rounded-lg overflow-hidden border border-transparent hover:border-[var(--neon-red)] transition-all shadow-md hover:shadow-[0_0_15px_rgba(255,0,60,0.3)] relative group aspect-square"
                onClick={() => window.open(img, "_blank")}
              >
                <div className="absolute inset-0 bg-[var(--neon-red)] mix-blend-overlay opacity-0 group-hover:opacity-30 transition-opacity z-10 pointer-events-none"></div>
                <img
                  src={img}
                  alt="media intercept"
                  className="w-full h-full object-cover"
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default RightSidebar;

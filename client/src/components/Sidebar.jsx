import { useContext, useEffect, useState } from "react";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";
import assets from "../assets/assets";
import { Search } from "lucide-react";
import { motion } from "framer-motion";

const Sidebar = () => {
  const [input, setInput] = useState("");

  const { onlineUsers } = useContext(AuthContext);
  const {
    users,
    getUsers,
    unseenMessages,
    selectedUser,
    setSelectedUser,
    setUnseenMessages
  } = useContext(ChatContext);

  const filteredUsers = input
    ? users.filter((user) =>
        user.fullName.toLowerCase().includes(input.toLowerCase())
      )
    : users;

  useEffect(() => {
    getUsers();
  }, [onlineUsers]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    show: { x: 0, opacity: 1 }
  };

  return (
    <div className={`h-full flex flex-col p-4 text-white`}>
      
      {/* Search Header */}
      <div className="mb-6">
        <h2 className="text-sm uppercase tracking-widest text-[var(--neon-red)] font-semibold mb-4 drop-shadow-[0_0_8px_var(--neon-red)]">
          Operatives Directory
        </h2>
        
        <div className="relative group">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-gray-400 group-focus-within:text-[var(--neon-red)] transition-colors" />
          </div>
          <input
            onChange={(e) => setInput(e.target.value)}
            type="text"
            className="w-full bg-[var(--bg-panel)] border border-gray-800 rounded-lg py-3 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[var(--neon-red)] focus:ring-1 focus:ring-[var(--neon-red)] transition-all glass-panel"
            placeholder="Search Subject..."
          />
        </div>
      </div>

      {/* User List */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {users.length === 0 ? (
          <div className="text-gray-500 text-sm text-center mt-10">No operatives found.</div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="flex flex-col gap-2"
          >
            {filteredUsers.map((user) => {
              const isSelected = selectedUser?._id === user._id;
              const isOnline = onlineUsers.includes(user._id);

              return (
                <motion.div
                  variants={itemVariants}
                  key={user._id}
                  onClick={() => {
                    setSelectedUser(user);
                    setUnseenMessages(prev => ({ ...prev, [user._id]: 0 }));
                  }}
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors border glass-panel ${
                    isSelected 
                      ? "bg-[#1a0005] border-[var(--neon-red)] shadow-[0_0_15px_rgba(255,0,60,0.15)]" 
                      : "border-transparent hover:border-red-900/50 hover:bg-[#121217]"
                  }`}
                >
                  <div className="relative">
                    <img
                      src={user?.profilePic || assets.avatar_icon}
                      alt={`${user.fullName}`}
                      className={`w-12 h-12 rounded-full object-cover border-2 transition-all ${
                        isOnline ? "border-green-500" : "border-gray-700"
                      } ${isSelected ? "border-[var(--neon-red)] shadow-[0_0_10px_var(--neon-red)]" : ""}`}
                    />
                    {isOnline && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-black rounded-full shadow-[0_0_8px_#22c55e]"></span>
                    )}
                  </div>
                  
                  <div className="flex flex-col flex-1 overflow-hidden">
                    <p className={`font-semibold truncate transition-colors ${isSelected ? "text-[var(--neon-red)]" : "text-gray-200"}`}>
                      {user.fullName}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {isOnline ? (
                        <span className="text-green-400 text-[10px] tracking-wider uppercase">Signal Acquired</span>
                      ) : (
                        <span className="text-gray-500 text-[10px] tracking-wider uppercase">Signal Lost</span>
                      )}
                    </p>
                  </div>

                  {unseenMessages[user._id] > 0 && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute right-3 w-5 h-5 flex items-center justify-center rounded-full bg-[var(--neon-red)] text-white text-[10px] font-bold shadow-[0_0_10px_var(--neon-red)]"
                    >
                      {unseenMessages[user._id]}
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;

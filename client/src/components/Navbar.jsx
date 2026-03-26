import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import assets from "../assets/assets";
import { Settings, LogOut, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { useUIStore } from "../lib/uiStore";

const Navbar = () => {
  const { authUser, logout } = useContext(AuthContext);
  const { openSettings } = useUIStore();
  const navigate = useNavigate();

  if (!authUser) return null;

  return (
    <motion.div 
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="h-16 w-full glass-panel border-b border-neon-red/30 flex items-center justify-between px-6 z-40 relative"
    >
      {/* Logo Section */}
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
        <Shield className="text-[var(--neon-red)] w-8 h-8 drop-shadow-[0_0_10px_var(--neon-red)]" />
        <h1 className="text-2xl font-bold tracking-widest neon-text font-[Space Grotesk]">
      ChatHub
        </h1>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-6">
        {/* Settings */}
        <button 
          onClick={openSettings}
          className="text-gray-300 hover:text-[var(--neon-red)] hover:drop-shadow-[0_0_8px_var(--neon-red)] transition-all"
          title="Settings"
        >
          <Settings className="w-6 h-6" />
        </button>

        {/* User Profile Snippet */}
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => navigate("/profile")}
        >
          <img 
            src={authUser.profilePic || assets.avatar_icon} 
            alt="Profile" 
            className="w-10 h-10 rounded-full object-cover border-2 border-transparent group-hover:border-[var(--neon-red)] transition-all neon-border"
          />
          <div className="hidden md:block">
            <p className="text-sm font-semibold text-white group-hover:text-[var(--neon-red)] transition-colors">
              {authUser.fullName}
            </p>
            <p className="text-[10px] text-[var(--neon-red)]">Operative Active</p>
          </div>
        </div>

        {/* Logout */}
        <button 
          onClick={logout}
          className="text-gray-300 hover:text-red-500 hover:drop-shadow-[0_0_8px_red] transition-all ml-2"
          title="Disconnect"
        >
          <LogOut className="w-6 h-6" />
        </button>
      </div>
    </motion.div>
  );
};

export default Navbar;

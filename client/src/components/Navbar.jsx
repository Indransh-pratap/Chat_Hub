import { useNavigate, useLocation } from "react-router-dom";
import { Gamepad2, MessageCircle, User, Settings, Zap } from "lucide-react";
import { motion } from "framer-motion";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { name: "Chat", path: "/chat", icon: MessageCircle },
    { name: "Arcade", path: "/games", icon: Gamepad2, activeColor: "text-[var(--neon-red)]" },
    { name: "Profile", path: "/profile", icon: User },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="h-[80px] w-full sticky top-0 z-[100] flex justify-between items-center px-8 bg-black/40 backdrop-blur-xl border-b border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      
      {/* LOGO AREA */}
      <div 
        onClick={() => navigate("/chat")}
        className="flex items-center gap-3 cursor-pointer group"
      >
        <div className="w-10 h-10 bg-gradient-to-br from-[var(--neon-red)] to-red-900 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(255,0,60,0.4)] group-hover:scale-110 transition-transform">
          <Zap className="w-6 h-6 text-white fill-white" />
        </div>
        <h1 className="text-2xl font-black text-white tracking-[0.2em] uppercase italic group-hover:text-[var(--neon-red)] transition-colors">
          Chat<span className="text-[var(--neon-red)]">Hub</span>
        </h1>
      </div>

      {/* NAV LINKS */}
      <div className="flex items-center gap-2 md:gap-8 bg-white/5 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 ${
                active 
                  ? (item.activeColor || "text-white") 
                  : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
              }`}
            >
              {active && (
                <motion.div 
                  layoutId="nav-glow"
                  className="absolute inset-0 bg-white/5 rounded-xl border border-white/10 shadow-[inset_0_0_10px_rgba(255,255,255,0.05)]"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <item.icon className={`w-4 h-4 ${active ? (item.activeColor || "text-white") : "text-gray-500"}`} />
              <span className="hidden sm:inline">{item.name}</span>
              {active && (
                <motion.div 
                  layoutId="nav-underline"
                  className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full ${active ? "bg-[var(--neon-red)] shadow-[0_0_10px_var(--neon-red)]" : "bg-white"}`}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* SETTINGS / PROFILE SECONDARY */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/settings")}
          className="p-3 rounded-full text-gray-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

    </nav>
  );
};

export default Navbar;
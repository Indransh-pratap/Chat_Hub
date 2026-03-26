import { Play, Pause, SkipForward, SkipBack, Music, Volume2 } from "lucide-react";
import { motion } from "framer-motion";
import { useUIStore } from "../lib/uiStore";
import { useState } from "react";

const MusicPlayer = () => {
  const { isMusicPlaying, toggleMusic } = useUIStore();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div 
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5, type: "spring" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="absolute bottom-6 left-6 z-40 glass-panel border border-[var(--neon-red)] rounded-2xl p-4 flex items-center gap-4 shadow-[0_0_20px_rgba(255,0,60,0.15)] overflow-hidden w-[300px]"
    >
      <div className="absolute inset-0 bg-[#0a0a0d] mix-blend-overlay pointer-events-none"></div>

      {/* Album Art Placeholder */}
      <div className="relative w-12 h-12 rounded-lg bg-black border border-gray-800 flex items-center justify-center shrink-0 overflow-hidden shadow-[0_0_10px_var(--neon-red)]">
        <Music className={`w-6 h-6 text-[var(--neon-red)] ${isMusicPlaying ? "animate-pulse" : ""}`} />
        {isMusicPlaying && (
          <div className="absolute inset-0 bg-[var(--neon-red)] opacity-20 hover:opacity-10 transition-opacity"></div>
        )}
      </div>

      {/* Track Info */}
      <div className="flex-1 overflow-hidden">
        <motion.p 
          animate={isMusicPlaying ? { x: [0, -20, 0] } : {}}
          transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
          className="text-sm font-bold text-white whitespace-nowrap tracking-wider drop-shadow-md"
        >
          Stranger Synthesizer - 1984
        </motion.p>
        <p className="text-xs text-[var(--neon-red)] tracking-widest uppercase mt-1">
          {isMusicPlaying ? "Transmitting..." : "Signal Paused"}
        </p>

        {/* Progress Bar (Visual Only) */}
        <div className="w-full h-1 bg-black rounded-full mt-2 overflow-hidden border border-gray-800">
          <motion.div 
            className="h-full bg-[var(--neon-red)] shadow-[0_0_5px_var(--neon-red)]"
            initial={{ width: "0%" }}
            animate={isMusicPlaying ? { width: ["0%", "100%"] } : { width: "35%" }}
            transition={isMusicPlaying ? { repeat: Infinity, duration: 60, ease: "linear" } : {}}
          ></motion.div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center justify-center gap-2 shrink-0">
        <div className="flex items-center gap-2 text-white">
          <button className="text-gray-400 hover:text-[var(--neon-red)] transition-colors">
            <SkipBack className="w-4 h-4 fill-current" />
          </button>
          
          <button 
            onClick={toggleMusic}
            className="w-8 h-8 rounded-full bg-[var(--neon-red)] flex items-center justify-center hover:bg-white hover:text-[var(--dark-red)] transition-colors shadow-[0_0_10px_var(--neon-red)]"
          >
            {isMusicPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
          </button>
          
          <button className="text-gray-400 hover:text-[var(--neon-red)] transition-colors">
            <SkipForward className="w-4 h-4 fill-current" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default MusicPlayer;

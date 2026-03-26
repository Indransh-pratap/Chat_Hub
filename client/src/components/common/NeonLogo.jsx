import { MessageSquare } from "lucide-react";

const NeonLogo = ({ className = "" }) => {
  return (
    <div className={`flex flex-col items-center gap-2 group select-none relative ${className}`}>
      {/* Intricate Branch Background (SVG) */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40 blur-[1px]">
          <svg viewBox="0 0 200 200" className="w-full h-full text-red-950 scale-150">
              <path d="M100 200 C100 150 80 120 40 80 M100 200 C110 140 140 100 180 60 M100 200 C90 160 60 140 20 130 M100 200 C120 170 160 160 190 140 M40 80 C30 70 20 40 10 20 M180 60 C190 50 195 30 198 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M100 200 C100 180 90 170 70 160 M100 200 C110 185 125 175 140 170" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
          </svg>
      </div>

      {/* Icon with intense glow */}
      <div className="relative z-10">
        <div className="absolute inset-0 bg-red-600 rounded-full blur-3xl opacity-30 group-hover:opacity-50 transition-all duration-700 animate-pulse"></div>
        <div className="relative bg-[#050505]/80 backdrop-blur-sm border border-red-500/40 p-5 rounded-[22px] shadow-[0_0_40px_rgba(255,0,60,0.3)] hover:shadow-[0_0_60px_rgba(255,0,60,0.5)] transition-all duration-500">
          <MessageSquare className="w-14 h-14 text-red-500 fill-red-500/20" />
          {/* Typing dots */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-1.5 pt-1.5">
             <div className="w-2 h-2 bg-black rounded-full animate-bounce [animation-delay:-0.3s]"></div>
             <div className="w-2 h-2 bg-black rounded-full animate-bounce [animation-delay:-0.15s]"></div>
             <div className="w-2 h-2 bg-black rounded-full animate-bounce"></div>
          </div>
        </div>
      </div>

      {/* Text with Layered Neon effects */}
      <div className="relative mt-4 z-10 text-center">
        <h1 className="text-6xl font-black italic tracking-tighter text-red-600 drop-shadow-[0_0_20px_rgba(255,0,60,1)] uppercase">
          ChatHub
        </h1>
        {/* Glow Layers */}
        <h1 className="absolute inset-0 text-6xl font-black italic tracking-tighter text-red-500 blur-md opacity-40 uppercase select-none pointer-events-none">
          ChatHub
        </h1>
        <h1 className="absolute inset-0 text-6xl font-black italic tracking-tighter text-red-400 blur-sm opacity-20 uppercase select-none pointer-events-none">
          ChatHub
        </h1>
      </div>

      {/* Subtext */}
      <div className="flex items-center gap-3 mt-2 z-10">
        <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-red-500/40 to-transparent"></div>
        <span className="text-[11px] uppercase tracking-[0.6em] font-black text-gray-500/80 italic">Operative Protocol</span>
        <div className="h-[1px] w-12 bg-gradient-to-l from-transparent via-red-500/40 to-transparent"></div>
      </div>
    </div>
  );
};

export default NeonLogo;

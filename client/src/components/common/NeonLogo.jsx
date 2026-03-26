import { MessageSquare } from "lucide-react";

const NeonLogo = ({ className = "" }) => {
  return (
    <div className={`flex flex-col items-center gap-2 group select-none ${className}`}>
      {/* Icon with intense glow */}
      <div className="relative">
        <div className="absolute inset-0 bg-red-600 rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity animate-pulse"></div>
        <div className="relative bg-black/40 border border-red-500/50 p-4 rounded-[20px] shadow-[0_0_30px_rgba(255,0,60,0.3)]">
          <MessageSquare className="w-12 h-12 text-red-500 fill-red-500" />
          {/* Typing dots */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-1 pt-1">
             <div className="w-1.5 h-1.5 bg-black rounded-full animate-bounce [animation-delay:-0.3s]"></div>
             <div className="w-1.5 h-1.5 bg-black rounded-full animate-bounce [animation-delay:-0.15s]"></div>
             <div className="w-1.5 h-1.5 bg-black rounded-full animate-bounce"></div>
          </div>
        </div>
      </div>

      {/* Text with Neon font-style */}
      <div className="relative mt-2">
        <h1 className="text-5xl font-black italic tracking-tighter text-red-600 drop-shadow-[0_0_15px_rgba(255,0,60,0.8)] uppercase">
          ChatHub
        </h1>
        {/* Animated glow overlay */}
        <h1 className="absolute inset-0 text-5xl font-black italic tracking-tighter text-red-500 blur-sm opacity-50 uppercase">
          ChatHub
        </h1>
      </div>

      {/* Subtext */}
      <div className="flex items-center gap-2 mt-1">
        <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-red-500/50"></div>
        <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-gray-500">Operative Link</span>
        <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-red-500/50"></div>
      </div>
    </div>
  );
};

export default NeonLogo;

import { motion } from "framer-motion";
import { PhoneIncoming, PhoneOff } from "lucide-react";

function IncomingCallModal({ caller, onAccept, onReject }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#050505] bg-opacity-95">
      <div className="absolute inset-0 scanlines pointer-events-none"></div>
      
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="w-[400px] glass-panel border-2 border-[var(--neon-red)] rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(255,0,60,0.3)] text-white relative z-10"
      >
        <div className="p-6 text-center">
          <motion.div 
            animate={{ 
              boxShadow: ["0 0 0px var(--neon-red)", "0 0 20px var(--neon-red)", "0 0 0px var(--neon-red)"],
              scale: [1, 1.05, 1]
            }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-20 h-20 rounded-full bg-red-900/40 border border-[var(--neon-red)] flex items-center justify-center mx-auto mb-4"
          >
            <PhoneIncoming className="w-10 h-10 text-[var(--neon-red)]" />
          </motion.div>
          
          <h2 className="text-xl font-bold tracking-widest neon-text mb-2">INCOMING TRANSMISSION</h2>
          <p className="text-gray-300 mb-6">Operative: <span className="font-semibold text-white">{caller}</span></p>

          <div className="flex items-center justify-center gap-6 mt-6">
            <button 
              onClick={onReject}
              className="flex items-center justify-center w-14 h-14 rounded-full bg-red-950 border border-red-500 hover:bg-red-900 transition-colors shadow-lg"
              title="Reject Signal"
            >
              <PhoneOff className="w-6 h-6 text-red-500" />
            </button>
            <button 
              onClick={onAccept}
              className="flex items-center justify-center w-14 h-14 rounded-full bg-green-950 border border-green-500 hover:bg-green-900 transition-colors shadow-[0_0_15px_#22c55e]"
              title="Accept Signal"
            >
              <PhoneIncoming className="w-6 h-6 text-green-500" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default IncomingCallModal;
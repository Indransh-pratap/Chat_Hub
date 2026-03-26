import { motion, AnimatePresence } from "framer-motion";
import { X, Shield, Bell, Moon, Eye, Volume2 } from "lucide-react";
import { useUIStore } from "../lib/uiStore";

const SettingsModal = () => {
  const { isSettingsOpen, closeSettings } = useUIStore();

  if (!isSettingsOpen) return null;

  return (
    <AnimatePresence>
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#050505] bg-opacity-95">
          <div className="absolute inset-0 pointer-events-none"></div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-lg glass-panel border border-[var(--neon-red)] rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(255,0,60,0.2)] relative z-10"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#ff003c40] bg-[#0a0a0d] flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-widest text-[var(--neon-red)] flex items-center gap-3">
                <Shield className="w-6 h-6" /> SYSTEM PREFERENCES
              </h2>
              <button 
                onClick={closeSettings}
                className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              
              {/* Theme / Appearance */}
              <div className="space-y-3">
                <h3 className="text-xs uppercase tracking-widest text-gray-500 font-semibold flex items-center gap-2">
                  <Moon className="w-4 h-4" /> Interface
                </h3>
                <div className="flex items-center justify-between bg-[#121217] p-4 rounded-xl border border-gray-800">
                  <div>
                    <p className="text-white font-medium">Dark Mode Override</p>
                    <p className="text-xs text-gray-400">Force maximum contrast</p>
                  </div>
                  <div className="w-12 h-6 bg-[var(--neon-red)] rounded-full relative cursor-pointer shadow-[0_0_10px_var(--neon-red)]">
                    <div className="absolute right-1 top-1 bottom-1 w-4 bg-white rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* Notifications */}
              <div className="space-y-3">
                <h3 className="text-xs uppercase tracking-widest text-gray-500 font-semibold flex items-center gap-2">
                  <Bell className="w-4 h-4" /> Alerts
                </h3>
                <div className="flex items-center justify-between bg-[#121217] p-4 rounded-xl border border-gray-800">
                  <div>
                    <p className="text-white font-medium">Transmission Alerts</p>
                    <p className="text-xs text-gray-400">Sound on incoming messages</p>
                  </div>
                  <div className="w-12 h-6 bg-gray-700 rounded-full relative cursor-pointer">
                    <div className="absolute left-1 top-1 bottom-1 w-4 bg-gray-400 rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* Privacy */}
              <div className="space-y-3">
                <h3 className="text-xs uppercase tracking-widest text-gray-500 font-semibold flex items-center gap-2">
                  <Eye className="w-4 h-4" /> Privacy
                </h3>
                <div className="flex items-center justify-between bg-[#121217] p-4 rounded-xl border border-gray-800">
                  <div>
                    <p className="text-white font-medium">Read Receipts</p>
                    <p className="text-xs text-gray-400">Show operatives when data is read</p>
                  </div>
                  <div className="w-12 h-6 bg-[var(--neon-red)] rounded-full relative cursor-pointer shadow-[0_0_10px_var(--neon-red)]">
                    <div className="absolute right-1 top-1 bottom-1 w-4 bg-white rounded-full"></div>
                  </div>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-[#0a0a0d] border-t border-gray-800 flex justify-end">
              <button 
                onClick={closeSettings}
                className="px-6 py-2 bg-[var(--neon-red)] hover:bg-white hover:text-[var(--dark-red)] text-white font-semibold rounded-lg transition-colors shadow-[0_0_15px_rgba(255,0,60,0.5)]"
              >
                APPLY CHANGES
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SettingsModal;

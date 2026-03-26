import { Moon, Bell, Eye, LogOut } from "lucide-react";
import Navbar from "../components/Navbar";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const SettingsPage = () => {
  const { logout } = useContext(AuthContext);

  return (
    <div className="w-full h-screen flex flex-col bg-[var(--bg-dark)] overflow-hidden">
      <Navbar />
      
      <div className="flex-1 w-full max-w-4xl mx-auto p-6 overflow-y-auto custom-scrollbar relative z-10">
        <h1 className="text-3xl font-bold tracking-widest text-[var(--neon-red)] mb-8 uppercase">Device Settings</h1>

        <div className="space-y-6">
          {/* Theme / Appearance */}
          <div className="bg-[#0a0a0d] border border-[#ff003c40] rounded-2xl p-6 shadow-[0_0_20px_rgba(255,0,60,0.05)]">
            <h3 className="text-sm uppercase tracking-widest text-gray-500 font-semibold flex items-center gap-2 mb-4">
              <Moon className="w-5 h-5 text-gray-300" /> Interface
            </h3>
            <div className="flex items-center justify-between bg-[#121217] p-4 rounded-xl border border-gray-800">
              <div>
                <p className="text-white font-medium">Dark Mode Override</p>
                <p className="text-xs text-gray-400 mt-1">Force maximum contrast across all frequency bands</p>
              </div>
              <div className="w-12 h-6 bg-[var(--neon-red)] rounded-full relative cursor-pointer shadow-[0_0_10px_var(--neon-red)]">
                <div className="absolute right-1 top-1 bottom-1 w-4 bg-white rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-[#0a0a0d] border border-gray-800 rounded-2xl p-6">
            <h3 className="text-sm uppercase tracking-widest text-gray-500 font-semibold flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5 text-gray-300" /> Alerts
            </h3>
            <div className="flex items-center justify-between bg-[#121217] p-4 rounded-xl border border-gray-800">
              <div>
                <p className="text-white font-medium">Transmission Alerts</p>
                <p className="text-xs text-gray-400 mt-1">Audible alerts on incoming messages</p>
              </div>
              <div className="w-12 h-6 bg-gray-700 rounded-full relative cursor-pointer">
                <div className="absolute left-1 top-1 bottom-1 w-4 bg-gray-400 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Privacy */}
          <div className="bg-[#0a0a0d] border border-gray-800 rounded-2xl p-6">
            <h3 className="text-sm uppercase tracking-widest text-gray-500 font-semibold flex items-center gap-2 mb-4">
              <Eye className="w-5 h-5 text-gray-300" /> Privacy
            </h3>
            <div className="flex items-center justify-between bg-[#121217] p-4 rounded-xl border border-gray-800">
              <div>
                <p className="text-white font-medium">Read Receipts</p>
                <p className="text-xs text-gray-400 mt-1">Show operatives when data is decrypted</p>
              </div>
              <div className="w-12 h-6 bg-[var(--neon-red)] rounded-full relative cursor-pointer shadow-[0_0_10px_var(--neon-red)]">
                <div className="absolute right-1 top-1 bottom-1 w-4 bg-white rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Logout Section */}
          <div className="mt-8 pt-6 border-t border-[#ff003c20]">
            <button 
              onClick={logout}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-red-950/50 hover:bg-red-900 border border-[var(--neon-red)] text-[var(--neon-red)] hover:text-white rounded-xl transition-all shadow-[0_0_15px_rgba(255,0,60,0.2)] font-bold tracking-widest"
            >
              <LogOut className="w-5 h-5" /> TERMINATE SESSION
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

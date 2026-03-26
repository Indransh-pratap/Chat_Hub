import { useContext, useState } from "react";
import { useUIStore } from "../lib/uiStore";
import ChatContainer from "../components/ChatContainer";
import RightSidebar from "../components/RightSidebar";
import Sidebar from "../components/Sidebar";
import { ChatContext } from "../../context/ChatContext";
import Navbar from "../components/Navbar";
import SettingsModal from "../components/SettingsModal";
import MusicPlayer from "../components/MusicPlayer";

const HomePage = () => {
  const { selectedUser } = useContext(ChatContext);

  // 🔴 Controls hide/show of RightSidebar
  const [showRightSidebar, setShowRightSidebar] = useState(true);

  return (
    <div className="w-full h-screen overflow-hidden flex flex-col bg-[var(--bg-dark)] scanlines">
      {/* TOP NAVBAR */}
      <Navbar />

      {/* MAIN LAYOUT */}
      <div className="flex-1 overflow-hidden relative p-4">
        <div className={`h-full w-full max-w-[1600px] mx-auto glass-panel rounded-2xl overflow-hidden grid relative neon-border ${
            selectedUser && showRightSidebar
              ? "grid-cols-[300px_1fr_320px]"
              : "grid-cols-[300px_1fr]"
          }`}
        >
          {/* LEFT SIDEBAR */}
          <div className="h-full overflow-hidden border-r border-[#ffffff10]">
            <Sidebar />
          </div>

          {/* MAIN CHAT */}
          <div className="h-full w-full overflow-hidden">
            <ChatContainer />
          </div>

          {/* RIGHT SIDEBAR (CONTROLLED) */}
          {selectedUser && showRightSidebar && (
            <div className="h-full overflow-hidden border-l border-[#ffffff10]">
              <RightSidebar setShowRightSidebar={setShowRightSidebar} />
            </div>
          )}
        </div>

        {/* FLOATING COMPONENTS */}
        <MusicPlayer />
      </div>

      {/* MODALS */}
      <SettingsModal />
    </div>
  );
};

export default HomePage;

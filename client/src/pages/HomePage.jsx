import { useContext, useState } from "react";
import ChatContainer from "../components/ChatContainer";
import RightSidebar from "../components/RightSidebar";
import Sidebar from "../components/Sidebar";
import { ChatContext } from "../../context/ChatContext";
import Navbar from "../components/Navbar";
import SettingsModal from "../components/SettingsModal";
import MusicPlayer from "../components/MusicPlayer";

const HomePage = () => {
  const { selectedUser } = useContext(ChatContext);
  const [showRightSidebar, setShowRightSidebar] = useState(true);

  return (
    <div className="h-screen flex flex-col pt-[76px] bg-black">
      <Navbar />

      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT SIDEBAR */}
        <div className="w-[300px] border-r border-gray-800">
          <Sidebar />
        </div>

        {/* MAIN CHAT */}
        <div className="flex-1">
          {selectedUser ? (
            <ChatContainer />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Select a user to start chat
            </div>
          )}
        </div>

        {/* RIGHT SIDEBAR */}
        {selectedUser && showRightSidebar && (
          <div className="w-[300px] border-l border-gray-800">
            <RightSidebar setShowRightSidebar={setShowRightSidebar} />
          </div>
        )}
      </div>

  
      <SettingsModal />
    </div>
  );
};

export default HomePage;
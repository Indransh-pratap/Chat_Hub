import { useContext, useState } from "react";
import ChatContainer from "../components/ChatContainer";
import RightSidebar from "../components/RightSidebar";
import Sidebar from "../components/Sidebar";
import { ChatContext } from "../../context/ChatContext";

const HomePage = () => {
 
const {selectedUser} = useContext(ChatContext);
  return (
    <div className="border w-full h-screen sm:px-[15%] sm:py-[5%] overflow-hidden">

      <div
        className={`backdrop-blur-xl border-2 border-gray-600 rounded-2xl overflow-hidden h-full w-full grid relative ${
          selectedUser
            ? "grid-cols-[260px_1fr_300px]"
            : "grid-cols-[260px_1fr]"
        }`}
      >
        {/* LEFT SIDEBAR */}
        <div className="h-full overflow-hidden">
          <Sidebar />
        </div>

        {/* MAIN CHAT */}
        <div className="h-full w-full overflow-hidden">
          <ChatContainer />
        </div>

        {/* RIGHT SIDEBAR */}
        {selectedUser && (
          <div className="h-full overflow-hidden">
            <RightSidebar
             
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;

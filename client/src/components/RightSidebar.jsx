import { useContext, useEffect, useState } from "react";
import assets from "../assets/assets";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";

const RightSidebar = () => {
  const { selectedUser, messages } = useContext(ChatContext);
  const { logout, onlineUsers } = useContext(AuthContext);

  const [msgImages, setMsgImages] = useState([]);

  // ================= GET ALL IMAGES FROM MESSAGES =================
  useEffect(() => {
    if (!messages || messages.length === 0) {
      setMsgImages([]);
      return;
    }

    const imgs = messages
      .filter((msg) => msg.image)          // only messages with image
      .map((msg) => msg.image);            // store direct image url/base64

    setMsgImages(imgs);
  }, [messages]);   // 🔥 dependency added

  if (!selectedUser) return null;

  const isOnline =
    Array.isArray(onlineUsers) &&
    onlineUsers.includes(selectedUser._id);

  return (
    <div className="bg-[#8185B2]/10 text-white w-full h-full relative overflow-y-auto max-md:hidden">

      {/* -------- USER INFO -------- */}
      <div className="pt-16 flex flex-col items-center gap-2 text-xs font-light mx-auto">
        <img
          src={selectedUser.profilePic || assets.avatar_icon}
          alt="profile"
          className="w-20 h-20 rounded-full object-cover ring-2 ring-violet-500/40"
        />

        <h1 className="px-6 text-xl font-medium mx-auto flex items-center gap-2">
          {isOnline && <span className="w-2 h-2 rounded-full bg-green-500"></span>}
          {selectedUser.fullName || "Unnamed User"}
        </h1>

        {selectedUser.bio && (
          <p className="px-8 mx-auto text-center text-gray-300">
            {selectedUser.bio}
          </p>
        )}
      </div>

      <hr className="border-[#ffffff30] my-5" />

      {/* -------- MEDIA GALLERY -------- */}
      <div className="px-5 text-xs">
        <p className="font-medium mb-3">Media</p>

        {msgImages.length === 0 ? (
          <p className="text-gray-400 text-center text-sm">
            No media shared yet
          </p>
        ) : (
          <div className="max-h-[220px] overflow-y-auto grid grid-cols-2 gap-4 pr-2">
            {msgImages.map((img, index) => (
              <div
                key={index}
                className="cursor-pointer rounded overflow-hidden hover:scale-105 transition"
                onClick={() => window.open(img, "_blank")}
              >
                <img
                  src={img}
                  alt="media"
                  className="h-24 w-full object-cover rounded-md"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* -------- LOGOUT BUTTON -------- */}
      <button
        onClick={logout}
        className="absolute bottom-6 left-1/2 transform -translate-x-1/2
        bg-gradient-to-r from-purple-400 to-violet-600 text-white
        border-none text-sm font-medium py-2 px-20 rounded-full cursor-pointer
        hover:scale-105 transition shadow-lg"
      >
        Logout
      </button>
    </div>
  );
};

export default RightSidebar;

import { useNavigate } from "react-router-dom";
import assets from "../assets/assets";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { ChatContext } from "../../context/ChatContext";

const Sidebar = ( ) => {

  

  const [input, setInput] = useState("");                     // FIX: added input state

  const { logout, onlineUsers } = useContext(AuthContext);   // FIX: onlineUers -> onlineUsers
  const {
  users,
  getUsers,
  unseenMessages,
  selectedUser,
  setSelectedUser,
  setUnseenMessages
} = useContext(ChatContext);
// FIX: users comes from context

  const navigate = useNavigate();

  const filteredUsers = input
    ? users.filter((user) =>
        user.fullName.toLowerCase().includes(input.toLowerCase())
      )
    : users;

  useEffect(() => {
    getUsers();
  }, [onlineUsers]);   
  
  
  // FIX: onlineUers -> onlineUsers

  useEffect(() => {
  console.log("ONLINE USERS ARRAY:", onlineUsers);
  if (users.length > 0) {
    console.log("FIRST USER ID:", users[0]._id);
  }
}, [onlineUsers, users]);


  return (
    <div
      className={`bg-[#8185B2]/10 h-full p-5 rounded-r-xl overflow-y-auto text-white ${
        selectedUser ? "max-md:hidden" : ""
      }`}
    >
      {/* Header */}
      <div className="pb-5 border-b border-gray-700 flex justify-between items-center">
        <img src={assets.logo} alt="logo" className="max-w-40" />
        <div className="relative group">
          <img src={assets.menu_icon} alt="menu" className="max-h-5 cursor-pointer" />
          <div className="absolute top-full right-0 z-20 w-32 p-5 rounded-md bg-[#282142] border border-gray-600 text-gray-100 hidden group-hover:block">
            <p
              onClick={() => navigate("/profile")}
              className="cursor-pointer text-sm hover:text-violet-300"
            >
              Edit Profile
            </p>
            <hr className="my-2 border-t border-gray-500" />
            <p
              onClick={() => logout()}
              className="cursor-pointer text-sm hover:text-violet-300"
            >
              Logout
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-[#282142] rounded-full flex items-center gap-2 py-3 px-4 mt-5">
        <img src={assets.search_icon} alt="search" className="w-3" />
        <input
          onChange={(e) => setInput(e.target.value)}          // FIX: Setinput -> setInput
          type="text"
          className="bg-transparent border-none outline-none text-white text-xs placeholder-[#c8c8c8] flex-1"
          placeholder="Search User"
        />
      </div>

      {/* User List */}
      <div className="flex flex-col mt-4">
        {filteredUsers.map((user, index) => (
          <div
            key={user._id || index}
            onClick={() => {
  setSelectedUser(user);
  setUnseenMessages(prev => ({
    ...prev,
    [user._id]: 0
  }));
}}
  
            className={`relative flex items-center gap-2 p-2 pl-4 rounded cursor-pointer max-sm:text-sm hover:bg-[#282142]/30 transition ${
              selectedUser?._id === user._id ? "bg-[#282142]/50" : ""
            }`}
          >
            <img
              src={user?.profilePic || assets.avatar_icon}
              alt={`${user.fullName} avatar`}
              className="w-[35px] aspect-square rounded-full"
            />
            <div className="flex flex-col leading-5">
              <p className="font-medium">{user.fullName}</p>
              {onlineUsers.includes(user._id) ? (              // FIX: onlineUers -> onlineUsers
                <span className="text-green-400 text-xs">Online</span>
              ) : (
                <span className="text-neutral-400 text-xs">Offline</span>
              )}
            </div>
            {unseenMessages[user._id] > 0 && (                 // FIX: unseenMessages now defined
              <p className="absolute top-4 right-4 text-xs h-5 w-5 flex justify-center items-center rounded-full bg-violet-500/50">
                {unseenMessages[user._id]}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;

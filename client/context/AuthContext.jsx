import { createContext, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const backendURL = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendURL;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [Token, setToken] = useState(localStorage.getItem("token"));
  const [authUser, setAuthUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setsocket] = useState(null);

  // 🔹 Check if user is authenticated using token
  const checkAuth = async () => {
    try {
      const { data } = await axios.get("/api/auth/check");
      if (data.success) {
        setAuthUser(data.user);
        connectSocket(data.user);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // 🔹 Login / Signup
  const login = async (State, Credentials) => {
    try {
      const { data } = await axios.post(`/api/auth/${State}`, Credentials);

      if (data.success) {
        setAuthUser(data.userData);
        connectSocket(data.userData);

        // FIX: send token in Authorization header
        axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;

        setToken(data.token);
        localStorage.setItem("token", data.token);

        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // 🔹 Logout
  const logout = async () => {
    localStorage.removeItem("token");
    setToken(null);
    setAuthUser(null);
    setOnlineUsers([]);
    axios.defaults.headers.common["Authorization"] = null;   // FIX
    toast.success("Logout successfully");
  };

  // 🔹 Update profile (POST matches backend route)
  const updateProfile = async (body) => {
    try {
      const { data } = await axios.post("/api/auth/update-profile", body);

      if (data.success) {
        setAuthUser(data.user);
        toast.success("profile updated successfully");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // 🔹 Connect socket
  const connectSocket = (userData) => {
    if (!userData || socket?.connected) return;

    const newSocket = io(backendURL, {
      query: {
        userId: userData._id,
      },
    });

    newSocket.connect();
    setsocket(newSocket);

    newSocket.on("getOnlineUsers", (userIds) => {
      setOnlineUsers(userIds);
    });
  };

  // 🔹 Restore auth on refresh
  useEffect(() => {
    if (Token) {
      // FIX: correct header name
      axios.defaults.headers.common["Authorization"] = `Bearer ${Token}`;
      checkAuth();   // FIX: restore user from token
    }
  }, []);

  const value = {
    axios,
    authUser,
    onlineUsers,
    socket,
    login,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

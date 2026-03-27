import { createContext, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

export const AuthContext = createContext();

// Backend URL
const backendURL = import.meta.env.VITE_BACKEND_URL;
console.log("Backend URL from env:", backendURL);

// Axios instance
const api = axios.create({
  baseURL: backendURL,
  withCredentials: true,
});

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [authUser, setAuthUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);

  // ================= CHECK AUTH =================
  const checkAuth = async () => {
    try {
      const { data } = await api.get("/api/auth/check");

      if (data.success) {
        setAuthUser(data.user);
        connectSocket(data.user);
      }
    } catch (error) {
      console.log("Check auth error:", error);
    }
  };

  // ================= LOGIN / SIGNUP =================
  const login = async (credentials) => {
    try {
      const { data } = await api.post(`/api/auth/login`, credentials);

      if (data.success) {
        setAuthUser(data.userData);
        api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
        setToken(data.token);
        localStorage.setItem("token", data.token);
        connectSocket(data.userData);
        toast.success(data.message);
        return true;
      } else {
        toast.error(data.message);
        return false;
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error(
        error?.response?.data?.message || "Network error, backend not reachable"
      );
      return false;
    }
  };

  const signup = async (credentials) => {
    try {
      const { data } = await api.post(`/api/auth/signup`, credentials);
      if (data.success) {
        toast.success("Account created successfully! Please log in.");
        return true;
      } else {
        toast.error(data.message);
        return false;
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast.error(
        error?.response?.data?.message || "Network error, backend not reachable"
      );
      return false;
    }
  };

  // ================= GOOGLE SUCCESS =================
  const setGoogleSession = async (tokenData) => {
    try {
      api.defaults.headers.common["Authorization"] = `Bearer ${tokenData}`;
      setToken(tokenData);
      localStorage.setItem("token", tokenData);
      await checkAuth(); // Hydrates authUser and connects socket
      toast.success("Logged in with Google", { icon: "✅" });
    } catch (err) {
      console.error("Google session error:", err);
      throw err;
    }
  };

  // ================= LOGOUT =================
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setAuthUser(null);
    setOnlineUsers([]);

    delete api.defaults.headers.common["Authorization"];

    if (socket) {
      socket.disconnect();
      setSocket(null);
    }

    toast.success("Logout successfully");
  };

  // ================= UPDATE PROFILE =================
  const updateProfile = async (body) => {
    try {
      const { data } = await api.post("/api/auth/update-profile", body);

      if (data.success) {
        setAuthUser(data.user);
        toast.success("Profile updated successfully");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Update profile error:", error);
      toast.error("Failed to update profile");
    }
  };

  // ================= CONNECT SOCKET =================
  const connectSocket = (userData) => {
    if (!userData || socket?.connected) return;

    const newSocket = io(backendURL, {
      withCredentials: true,
      query: {
        userId: userData._id,
      },
       transports: ["websocket"], 
    });

    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
    });

    newSocket.on("getOnlineUsers", (userIds) => {
      setOnlineUsers(userIds);
    });

    setSocket(newSocket);
  };

  // ================= RESTORE AUTH ON REFRESH =================
  useEffect(() => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      checkAuth();
    }
  }, []);

  const value = {
    axios: api,
    authUser,
    onlineUsers,
    socket,
    login,
    signup,
    logout,
    updateProfile,
    setGoogleSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

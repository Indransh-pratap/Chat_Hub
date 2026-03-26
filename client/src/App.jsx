import React, { useContext } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage"; 
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import GamesPage from "./pages/GamesPage";
import GoogleSuccess from "./pages/GoogleSuccess";
import CallManager from "./components/CallManager";
import GameModal from "./components/games/GameModal";
import { Toaster } from "react-hot-toast";
import { AuthContext } from "../context/AuthContext";
import { useUIStore } from "./lib/uiStore";
import toast from "react-hot-toast";

const ProtectedRoute = ({ children }) => {
  const { authUser } = useContext(AuthContext);
  if (!authUser) return <Navigate to="/login" replace />;
  return children;
};

const App = () => {
  const { authUser, socket } = useContext(AuthContext);
  const { setActiveGame } = useUIStore();

  // Global Game Socket Listeners
  React.useEffect(() => {
    if (!socket || !authUser) return;

    const handleGameStart = (data) => {
      // Open Game Modal for both players
      setActiveGame({
        roomId: data.roomId,
        gameId: data.gameId,
        opponentId: data.players.find(id => id !== authUser._id),
        role: data.inviterId === authUser._id ? 'inviter' : 'follower',
      });
      toast.success(`Game Started: ${data.gameId === 'tictactoe' ? 'Tic Tac Toe' : 'Arcade Game'}`);
    };

    const handleGameRejected = (data) => {
      toast.error("Challenge Declined");
    };

    socket.on("game:start", handleGameStart);
    socket.on("game:rejected", handleGameRejected);

    return () => {
      socket.off("game:start", handleGameStart);
      socket.off("game:rejected", handleGameRejected);
    };
  }, [socket, authUser, setActiveGame]);

  return (
    <>
      <div className="min-h-screen bg-[var(--bg-dark)]">
        <Toaster />
        <CallManager />
        <GameModal />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/chat" />} />
          <Route path="/register" element={!authUser ? <LoginPage /> : <Navigate to="/chat" />} />
          <Route path="/success" element={<GoogleSuccess />} />

          {/* Protected Routes */}
          <Route path="/chat" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="/games" element={<ProtectedRoute><GamesPage /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="/" element={<Navigate to="/chat" replace />} />
          <Route path="*" element={<Navigate to="/chat" replace />} />
        </Routes>
      </div>
    </>
  );
};

export default App;

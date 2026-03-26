import { io, userSocketMap } from "../server.js";
import { v4 as uuidv4 } from "uuid";

// Store active game states: roomId -> { players: [id1, id2], gameId, state, type }
const activeGames = new Map();

export const handleGameEvents = (socket, userId) => {
  // 🎮 GAME INVITE
  socket.on("game:invite", (data) => {
    const receiverSocketId = userSocketMap[data.to];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("game:invite", {
        ...data,
        from: userId,
      });
    }
  });

  // ✅ GAME ACCEPT (Initiates Room)
  socket.on("game:accept", (data) => {
    const { to: inviterId, gameId } = data;
    const inviterSocketId = userSocketMap[inviterId];
    
    if (inviterSocketId) {
      const roomId = `game_${uuidv4()}`;
      
      // Join both players to the room
      socket.join(roomId);
      const inviterSocket = io.sockets.sockets.get(inviterSocketId);
      if (inviterSocket) inviterSocket.join(roomId);

      // Initialize Game State
      const gameState = {
        roomId,
        gameId,
        players: [inviterId, userId],
        board: gameId === "tictactoe" ? Array(9).fill(null) : null,
        turn: inviterId, // Inviter starts by default
        status: "active"
      };

      activeGames.set(roomId, gameState);

      // Notify both players that the game has started
      io.to(roomId).emit("game:start", {
        ...gameState,
        inviterId,
        acceptorId: userId
      });
    }
  });

  // ❌ GAME REJECT
  socket.on("game:reject", (data) => {
    const inviterSocketId = userSocketMap[data.to];
    if (inviterSocketId) {
      io.to(inviterSocketId).emit("game:rejected", {
        gameId: data.gameId,
        from: userId
      });
    }
  });

  // ♟️ GAME MOVE (Room-based)
  socket.on("game:move", (data) => {
    const { roomId, move } = data;
    const game = activeGames.get(roomId);

    if (game && game.status === "active") {
      // Update server state if needed (e.g., TTT board)
      if (game.gameId === "tictactoe" && move.board) {
        game.board = move.board;
        game.turn = game.players.find(p => p !== userId);
      }

      // Relay to room
      socket.to(roomId).emit("game:update", {
        ...data,
        serverState: game
      });
    }
  });

  // 🏁 GAME END
  socket.on("game:end", (data) => {
    const { roomId, result } = data;
    if (roomId) {
      io.to(roomId).emit("game:ended", data);
      activeGames.delete(roomId);
      // Room will be cleaned up automatically when players leave
    }
  });

  // 🏳️ LEAVE GAME
  socket.on("game:leave", (data) => {
    const { roomId } = data;
    if (roomId) {
      socket.to(roomId).emit("game:opponentLeft");
      activeGames.delete(roomId);
    }
  });
};

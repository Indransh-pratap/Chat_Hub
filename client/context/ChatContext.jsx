import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});

  const { socket, axios } = useContext(AuthContext);

  // ================== GET USERS ==================
  const getUsers = async () => {
    try {
      const { data } = await axios.get("/api/messages/users");
      if (data.success) {
        setUsers(data.users);
        setUnseenMessages(data.unseenMessages || {});
      }
    } catch (error) {
      toast.error(error?.message || "Failed to load users");
    }
  };

  // ================== GET MESSAGES ==================
  const getMessages = async (userId) => {
    if (!userId) return;

    try {
      const { data } = await axios.get(`/api/messages/${userId}`);
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (error) {
      toast.error(error?.message || "Failed to load messages");
    }
  };

  // ================== SEND MESSAGE ==================
  const sendMessage = async (messagesData, recipientId = null) => {
    const targetId = recipientId || selectedUser?._id;

    if (!targetId) {
      toast.error("No user selected");
      return;
    }

    try {
      const { data } = await axios.post(
        `/api/messages/send/${targetId}`,
        messagesData
      );

      if (data.success) {
        if (targetId === selectedUser?._id) {
          setMessages((prevMessages) => [...prevMessages, data.newMessage]);
        }
        return data.newMessage;
      } else {
        toast.error(data.message || "Message not sent");
      }
    } catch (error) {
      toast.error(error?.message || "Failed to send message");
    }
  };

  // ================== UPDATE MESSAGE STATUS ==================
  const updateMessageStatus = async (messageId, status) => {
    try {
      const { data } = await axios.put(`/api/messages/status/${messageId}`, { status });
      if (data.success) {
        setMessages((prev) => 
          prev.map((msg) => msg._id === messageId ? { ...msg, status } : msg)
        );
        return data.message;
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  // ================== SOCKET SUBSCRIBE ==================
  const subscribeToMessages = () => {
    if (!socket) return;

    // IMPORTANT: remove old listener before adding new one
    socket.off("newMessage");
    socket.off("chat-seen");

    socket.on("chat-seen", ({ from }) => {
      // If the currently selected user saw our messages, mark them seen
      if (selectedUser && selectedUser._id === from) {
        setMessages((prev) => prev.map(msg => 
          msg.senderId === authUser?._id ? { ...msg, seen: true } : msg
        ));
      }
    });

    socket.on("newMessage", async (newMessage) => {
      if (selectedUser && newMessage.senderId === selectedUser._id) {
        newMessage.seen = true;
        setMessages((prevMessages) => [...prevMessages, newMessage]);

        try {
          await axios.put(`/api/messages/mark/${newMessage._id}`);
          socket.emit("chat-seen", { to: selectedUser._id });
        } catch (err) {
          console.error("Failed to mark message as seen");
        }
      } else {
        setUnseenMessages((prev) => ({
          ...prev,
          [newMessage.senderId]: prev[newMessage.senderId]
            ? prev[newMessage.senderId] + 1
            : 1,
        }));
      }
    });
  };

  // ================== SOCKET UNSUBSCRIBE ==================
  const unsubscribeFromMessages = () => {
    if (socket) {
      socket.off("newMessage");
      socket.off("chat-seen");
    }
  };

  // ================== EFFECT ==================
  useEffect(() => {
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [socket, selectedUser]);

  // ================== CONTEXT VALUE ==================
  const value = {
    messages,
    users,
    selectedUser,
    getUsers,
    getMessages,
    setMessages,
    sendMessage,
    setSelectedUser,
    unseenMessages,
    setUnseenMessages,
    updateMessageStatus,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

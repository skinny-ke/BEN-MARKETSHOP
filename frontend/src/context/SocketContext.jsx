import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { io } from "socket.io-client";
import { useUser, useAuth } from "@clerk/clerk-react";
import { toast } from "sonner";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // ✅ Connect socket only once per session
  const connectSocket = useCallback(async () => {
    if (socket || !user) return;

    const API_URL = import.meta.env.VITE_API_URL?.replace(/\/api$/, "") || "http://localhost:5000";
    let token = null;

    try {
      token = await getToken();
    } catch (err) {
      console.error("❌ Error fetching Clerk token:", err);
      return;
    }

    if (!token) {
      console.warn("⚠️ No Clerk token found, socket not connected.");
      return;
    }

    const newSocket = io(API_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      auth: { token }, // ✅ token sent in auth handshake
      extraHeaders: {
        'Authorization': `Bearer ${token}`,
        'Clerk-Auth-Token': token,
      },
    });

    // ✅ Event listeners
    newSocket.on("connect", () => {
      console.log("✅ Socket connected:", newSocket.id);
      setIsConnected(true);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("🔴 Socket disconnected:", reason);
      setIsConnected(false);
    });

    newSocket.on("connect_error", (err) => {
      console.error("⚠️ Socket connection error:", err.message);
      toast.error("Socket connection failed");
    });

    newSocket.on("auth_error", (err) => {
      console.warn("⚠️ Socket auth error:", err?.message || err);
      toast.error("Authentication error on socket connection");
    });

    newSocket.on("unauthorized", (err) => {
      console.warn("⚠️ Socket unauthorized:", err?.message || err);
      toast.error("Unauthorized socket connection");
    });

    // ✅ Server events
    newSocket.on("order_updated", (payload) => {
      console.log("🧾 Order updated:", payload);
      toast.success(`Order ${payload.orderId} updated: ${payload.paymentStatus || payload.status}`);
    });

    newSocket.on("server_status", (payload) => {
      console.log("🩺 Server status:", payload);
    });

    setSocket(newSocket);
  }, [socket, user, getToken]);

  const disconnectSocket = useCallback(() => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
    }
  }, [socket]);

  // ✅ Emit events safely
  const joinChatRoom = useCallback(
    (chatId) => {
      if (socket && chatId) {
        socket.emit("joinChat", chatId);
        console.log(`💬 Joined chat room: ${chatId}`);
      }
    },
    [socket]
  );

  const sendMessage = useCallback(
    (messageData) => {
      if (socket && isConnected) {
        socket.emit("sendMessage", messageData);
      }
    },
    [socket, isConnected]
  );

  const sendTyping = useCallback(
    (data) => {
      if (socket && isConnected) {
        socket.emit("typing", data);
      }
    },
    [socket, isConnected]
  );

  const joinChat = useCallback(
    (chatId) => {
      if (socket && chatId) {
        socket.emit("joinChat", chatId);
        console.log(`💬 Joined chat room: ${chatId}`);
      }
    },
    [socket]
  );

  // ✅ Auto manage connection based on user state
  useEffect(() => {
    if (user && !socket) connectSocket();
    if (!user && socket) disconnectSocket();
  }, [user, socket, connectSocket, disconnectSocket]);

  // ✅ Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socket) socket.disconnect();
    };
  }, [socket]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        connectSocket,
        disconnectSocket,
        joinChat: joinChatRoom,
        sendMessage,
        sendTyping,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);

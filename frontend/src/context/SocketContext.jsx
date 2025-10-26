import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { io } from "socket.io-client";
import { useUser } from "@clerk/clerk-react";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useUser();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  /** 🟢 Connect socket when user logs in */
  const connectSocket = useCallback(() => {
    if (socket || !user) return;

    const newSocket = io(import.meta.env.VITE_API_BASE_URL || "http://localhost:5000", {
      withCredentials: true,
      transports: ["websocket"],
    });

    newSocket.on("connect", () => {
      console.log("✅ Socket connected");
      setIsConnected(true);

      // Join personal room for direct messages
      newSocket.emit("joinUser", user.id);
      console.log("👤 Joined chat room:", user.id);
    });

    newSocket.on("disconnect", () => {
      console.log("🔴 Socket disconnected");
      setIsConnected(false);
    });

    setSocket(newSocket);
  }, [socket, user]);

  /** 🔴 Disconnect socket when user logs out */
  const disconnectSocket = useCallback(() => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
    }
  }, [socket]);

  /** 🔁 Join specific chat room (for a chatId) */
  const joinChat = useCallback(
    (chatId) => {
      if (socket && chatId) {
        socket.emit("joinChat", chatId);
        console.log(`💬 Joined chat room: ${chatId}`);
      }
    },
    [socket]
  );

  /** 🧹 Handle user login/logout transitions */
  useEffect(() => {
    if (user && !socket) connectSocket();
    if (!user && socket) disconnectSocket();
  }, [user, socket, connectSocket, disconnectSocket]);

  /** 🧩 Cleanup socket on unmount */
  useEffect(() => {
    return () => {
      if (socket) socket.disconnect();
    };
  }, [socket]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, connectSocket, disconnectSocket, joinChat }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);

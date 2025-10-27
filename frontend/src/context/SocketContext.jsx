import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { io } from "socket.io-client";
import { useUser } from "@clerk/clerk-react";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useUser();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const connectSocket = useCallback(() => {
    if (socket || !user) return;

    // ✅ Use deployed backend URL from env
    const backendUrl = import.meta.env.VITE_API_BASE_URL;
    if (!backendUrl) {
      console.error("⚠️ VITE_API_BASE_URL is not set!");
      return;
    }

    const newSocket = io(backendUrl, {
      withCredentials: true,
      transports: ["websocket"],
    });

    newSocket.on("connect", () => {
      console.log("✅ Socket connected");
      setIsConnected(true);

      // Join personal room
      newSocket.emit("joinUser", user.id);
      console.log("👤 Joined chat room:", user.id);
    });

    newSocket.on("disconnect", () => {
      console.log("🔴 Socket disconnected");
      setIsConnected(false);
    });

    newSocket.on("connect_error", (err) => {
      console.error("⚠️ Socket connection error:", err.message);
    });

    setSocket(newSocket);
  }, [socket, user]);

  const disconnectSocket = useCallback(() => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
    }
  }, [socket]);

  const joinChat = useCallback(
    (chatId) => {
      if (socket && chatId) {
        socket.emit("joinChat", chatId);
        console.log(`💬 Joined chat room: ${chatId}`);
      }
    },
    [socket]
  );

  useEffect(() => {
    if (user && !socket) connectSocket();
    if (!user && socket) disconnectSocket();
  }, [user, socket, connectSocket, disconnectSocket]);

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

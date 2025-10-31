import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { io } from "socket.io-client";
import { useUser, useAuth } from "@clerk/clerk-react";
import { toast } from 'sonner';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const connectSocket = useCallback(async () => {
    if (socket || !user) return;

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const token = await getToken();
    if (!token) return;

    const newSocket = io(API_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      auth: { token }, // ✅ token sent to backend
    });

    newSocket.on("connect", () => {
      console.log("✅ Socket connected:", newSocket.id);
      setIsConnected(true);
    });

    newSocket.on('order_updated', (payload) => {
      console.log('🧾 Order updated:', payload);
      toast.success(`Order ${payload.orderId} updated: ${payload.paymentStatus || payload.status}`);
    });

    newSocket.on('server_status', (payload) => {
      console.log('🩺 Server status:', payload);
    });

    newSocket.on('auth_error', (err) => {
      console.warn('⚠️ Socket auth error:', err?.message || err);
    });

    newSocket.on("disconnect", () => {
      console.log("🔴 Socket disconnected");
      setIsConnected(false);
    });

    newSocket.on("connect_error", (err) => {
      console.error("⚠️ Socket connection error:", err.message);
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

  const joinChat = useCallback(
    (chatId) => {
      if (socket && chatId) {
        socket.emit("joinChat", chatId);
        console.log(`💬 Joined chat room: ${chatId}`);
      }
    },
    [socket]
  );

  const sendMessage = useCallback((messageData) => {
    if (socket && isConnected) {
      socket.emit('sendMessage', messageData);
    }
  }, [socket, isConnected]);

  const sendTyping = useCallback((data) => {
    if (socket && isConnected) {
      socket.emit('typing', data);
    }
  }, [socket, isConnected]);

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
    <SocketContext.Provider value={{ 
      socket, 
      isConnected, 
      connectSocket, 
      disconnectSocket, 
      joinChat,
      sendMessage,
      sendTyping
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);

/* filepath: /context/SocketContext.jsx */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!user) return;

    const connectSocket = async () => {
      const token = await getToken();

      // Use environment variable for deployment
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      const newSocket = io(API_URL, {
        auth: { token },
        autoConnect: true,
        withCredentials: true,
        transports: ['websocket', 'polling'],
      });

      newSocket.on('connect', () => {
        console.log('✅ Socket connected');
        setIsConnected(true);

        if (user?.id) {
          newSocket.emit('joinChat', user.id);
          console.log('👤 Joined chat room:', user.id);
        }
      });

      newSocket.on('disconnect', (reason) => {
        console.warn('⚠️ Socket disconnected:', reason);
        setIsConnected(false);
      });

      newSocket.on('connect_error', (err) => {
        console.error('❌ Socket connection error:', err.message);
        setIsConnected(false);
      });

      newSocket.on('error', (err) => {
        console.error('Socket error:', err);
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
        setIsConnected(false);
      };
    };

    connectSocket();
  }, [user, getToken]);

  // Core emit functions
  const sendMessage = (messageData) => {
    if (socket && isConnected) {
      socket.emit('sendMessage', messageData);
    }
  };

  const sendTyping = (data) => {
    if (socket && isConnected) {
      socket.emit('typing', data);
    }
  };

  const value = {
    socket,
    isConnected,
    sendMessage,
    sendTyping,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

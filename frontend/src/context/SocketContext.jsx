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

    // Initialize socket connection
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const newSocket = io(API_URL, {
      autoConnect: true,
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', async () => {
      console.log('🔌 Connected to server');
      setIsConnected(true);
      
      // Join chat room with user ID
      if (user?.id) {
        newSocket.emit('joinChat', user.id);
        console.log('👤 Joined chat room:', user.id);
      }
    });

    newSocket.on('connected', (data) => {
      console.log('✅ Server confirmed connection:', data.message);
    });

    newSocket.on('joinedRoom', (data) => {
      console.log('✅ Joined room successfully:', data.message);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('🔌 Disconnected from server:', reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.close();
      }
    };
  }, [user]);

  const connectSocket = () => {
    if (socket && !isConnected) {
      socket.connect();
    }
  };

  const disconnectSocket = () => {
    if (socket && isConnected) {
      socket.disconnect();
    }
  };

  const joinChat = (userId) => {
    if (socket && isConnected) {
      socket.emit('joinChat', userId);
    }
  };

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
    connectSocket,
    disconnectSocket,
    joinChat,
    sendMessage,
    sendTyping,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

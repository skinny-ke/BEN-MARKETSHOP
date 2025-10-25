import React, { createContext, useContext, useEffect, useState } from 'react';
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
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5001', {
      autoConnect: false,
      withCredentials: true,
    });

    newSocket.on('connect', () => {
      console.log('🔌 Connected to server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 Disconnected from server');
      setIsConnected(false);
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

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

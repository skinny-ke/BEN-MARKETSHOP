import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { useUser } from '@clerk/clerk-react';

const ChatTest = () => {
  const { socket, isConnected } = useSocket();
  const { user } = useUser();
  const [testMessage, setTestMessage] = useState('');
  const [logs, setLogs] = useState([]);

  const addLog = (message) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    if (socket) {
      addLog('Socket instance created');
      
      socket.on('connect', () => {
        addLog('Socket connected');
      });
      
      socket.on('disconnect', () => {
        addLog('Socket disconnected');
      });
      
      socket.on('connected', (data) => {
        addLog(`Server confirmation: ${data.message}`);
      });
      
      socket.on('joinedRoom', (data) => {
        addLog(`Room joined: ${data.message}`);
      });
    }
  }, [socket]);

  const sendTestMessage = () => {
    if (socket && isConnected) {
      const messageData = {
        chatId: 'test-chat',
        senderId: user?.id,
        content: testMessage,
        receiverId: 'admin'
      };
      
      socket.emit('sendMessage', messageData);
      addLog(`Sent message: ${testMessage}`);
      setTestMessage('');
    } else {
      addLog('Cannot send message - not connected');
    }
  };

  return (
    <div className="fixed top-4 right-4 w-96 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-50">
      <h3 className="font-bold text-lg mb-4">Chat Debug</h3>
      
      <div className="mb-4">
        <p className="text-sm">
          <span className={`inline-block w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
          Status: {isConnected ? 'Connected' : 'Disconnected'}
        </p>
        <p className="text-sm">User ID: {user?.id || 'Not logged in'}</p>
        <p className="text-sm">Socket ID: {socket?.id || 'No socket'}</p>
      </div>
      
      <div className="mb-4">
        <input
          type="text"
          value={testMessage}
          onChange={(e) => setTestMessage(e.target.value)}
          placeholder="Test message..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        />
        <button
          onClick={sendTestMessage}
          disabled={!isConnected || !testMessage.trim()}
          className="mt-2 w-full bg-blue-600 text-white px-3 py-2 rounded-lg text-sm disabled:opacity-50"
        >
          Send Test Message
        </button>
      </div>
      
      <div className="max-h-40 overflow-y-auto">
        <h4 className="font-semibold text-sm mb-2">Logs:</h4>
        {logs.map((log, index) => (
          <div key={index} className="text-xs text-gray-600 mb-1">
            {log}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatTest;

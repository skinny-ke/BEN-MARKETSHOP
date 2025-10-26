import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { useUser } from '@clerk/clerk-react';

const ChatTest = () => {
  const { socket, isConnected, joinChat } = useSocket();
  const { user } = useUser();
  const [testMessage, setTestMessage] = useState('');
  const [logs, setLogs] = useState([]);

  const addLog = (message) => {
    setLogs((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${message}`,
    ]);
  };

  /** ✅ Setup socket listeners */
  useEffect(() => {
    if (!socket) return;

    addLog('Socket instance created');

    socket.on('connect', () => addLog('✅ Socket connected'));
    socket.on('disconnect', () => addLog('❌ Socket disconnected'));
    socket.on('connected', (data) =>
      addLog(`🔗 Server confirmation: ${data.message}`)
    );
    socket.on('joinedRoom', (data) =>
      addLog(`🏠 Joined room: ${data.message}`)
    );
    socket.on('receiveMessage', (msg) =>
      addLog(`💬 Received message: ${msg.content}`)
    );

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connected');
      socket.off('joinedRoom');
      socket.off('receiveMessage');
    };
  }, [socket]);

  /** 🟢 Auto join test room */
  useEffect(() => {
    if (socket && isConnected) {
      joinChat('test-chat');
      addLog('Joined test-chat room');
    }
  }, [socket, isConnected]);

  /** 🧪 Send test message */
  const sendTestMessage = () => {
    if (socket && isConnected) {
      const messageData = {
        chatId: 'test-chat',
        senderId: user?.id || 'guest',
        receiverId: 'admin',
        content: testMessage,
      };

      socket.emit('sendMessage', messageData);
      addLog(`🚀 Sent: ${testMessage}`);
      setTestMessage('');
    } else {
      addLog('⚠️ Cannot send message — not connected');
    }
  };

  return (
    <div className="fixed top-4 right-4 w-96 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-50">
      <h3 className="font-bold text-lg mb-4">Chat Debug Panel</h3>

      <div className="mb-3 text-sm">
        <p>
          <span
            className={`inline-block w-2 h-2 rounded-full mr-2 ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`}
          ></span>
          Status: {isConnected ? 'Connected' : 'Disconnected'}
        </p>
        <p>User ID: {user?.id || 'Not logged in'}</p>
        <p>Socket ID: {socket?.id || 'N/A'}</p>
      </div>

      <div className="mb-4">
        <input
          type="text"
          value={testMessage}
          onChange={(e) => setTestMessage(e.target.value)}
          placeholder="Type message..."
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

      <div className="max-h-48 overflow-y-auto bg-gray-50 p-2 rounded">
        <h4 className="font-semibold text-sm mb-2">Logs:</h4>
        {logs.map((log, i) => (
          <div key={i} className="text-xs text-gray-600 mb-1">
            {log}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatTest;

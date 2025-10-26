import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import { PaperAirplaneIcon, XMarkIcon } from '@heroicons/react/24/outline';

const ChatWindow = ({ isOpen, onClose, chatId, receiverId, currentUserId, messages, onNewMessage }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const typingDelay = useRef(null);
  const { socket, isConnected, sendMessage, sendTyping } = useSocket();

  /** 🟢 Auto-scroll to bottom when messages change */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  /** 🧩 Listen for socket events (messages & typing) */
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleReceiveMessage = (newMessage) => {
      onNewMessage(newMessage);
    };

    const handleUserTyping = (data) => {
      if (!data) return;
      setTypingUser(data.senderId);
      setIsTyping(data.isTyping);

      if (data.isTyping) {
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
          setIsTyping(false);
          setTypingUser(null);
        }, 3000);
      }
    };

    socket.on('receiveMessage', handleReceiveMessage);
    socket.on('userTyping', handleUserTyping);

    return () => {
      socket.off('receiveMessage', handleReceiveMessage);
      socket.off('userTyping', handleUserTyping);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [socket, isConnected, onNewMessage]);

  /** 📤 Send message */
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() || !isConnected) return;

    const messageData = {
      chatId,
      senderId: currentUserId,
      content: message.trim(),
      receiverId,
      timestamp: new Date().toISOString(), // Local timestamp for instant display
    };

    if (typeof sendMessage === 'function') {
      sendMessage(messageData);
    } else if (socket) {
      socket.emit('sendMessage', messageData);
    }

    onNewMessage(messageData);
    setMessage('');

    // Stop typing indicator
    if (sendTyping) sendTyping({ receiverId, isTyping: false });
  };

  /** ⌨️ Handle typing events with throttle */
  const handleTyping = (e) => {
    const value = e.target.value;
    setMessage(value);

    if (!isConnected || !sendTyping) return;

    if (typingDelay.current) clearTimeout(typingDelay.current);
    sendTyping({ receiverId, isTyping: true });

    typingDelay.current = setTimeout(() => {
      sendTyping({ receiverId, isTyping: false });
    }, 1500);
  };

  /** 🕓 Format timestamps nicely */
  const formatTime = (timestamp) =>
    new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  /** 🚪 Exit early if closed */
  if (!isOpen) return null;

  return (
    <div
      className={`fixed bottom-4 right-4 w-96 h-[500px] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col z-50 transform transition-all duration-300 ${
        isOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'
      }`}
    >
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
        <div>
          <h3 className="font-semibold">Support Chat</h3>
          <p className="text-sm text-blue-100 flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-yellow-400'}`}
            ></span>
            {isConnected ? 'Connected' : 'Connecting...'}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-200 transition-colors"
          title="Close chat"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="flex justify-center">
            <div className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm">
              <p>Welcome! How can we help you today?</p>
            </div>
          </div>
        )}

        {messages.map((msg, index) => (
          <div
            key={msg._id || msg.timestamp || index}
            className={`flex ${msg.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-lg ${
                msg.senderId === currentUserId
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              <p className="text-sm">{msg.content}</p>
              <p className="text-xs mt-1 opacity-70">{formatTime(msg.timestamp || msg.createdAt)}</p>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && typingUser && typingUser !== currentUserId && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg">
              <p className="text-sm italic">
                {typingUser === 'admin' ? 'Support is typing...' : 'User is typing...'}
              </p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text"
            value={message}
            onChange={handleTyping}
            placeholder={isConnected ? 'Type your message...' : 'Connecting...'}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            disabled={!isConnected}
          />
          <button
            type="submit"
            disabled={!message.trim() || !isConnected}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title={!isConnected ? 'Connecting...' : 'Send message'}
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </form>

        {!isConnected && (
          <p className="text-xs text-gray-500 mt-2 text-center">
            Please wait while we connect you to support...
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;

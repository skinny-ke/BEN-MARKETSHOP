import React, { useState, useEffect, useRef } from "react";
import { useSocket } from "../context/SocketContext";
import { PaperAirplaneIcon, XMarkIcon } from "@heroicons/react/24/outline";

const ChatWindow = ({
  isOpen,
  onClose,
  chatId,
  receiverId,
  currentUserId,
  messages,
  onNewMessage,
}) => {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const { socket, isConnected, sendMessage, sendTyping } = useSocket();

  /** Scroll chat to the latest message */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  /** Handle socket events for new messages and typing */
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleReceiveMessage = (newMessage) => {
      if (newMessage.chatId === chatId) {
        onNewMessage(newMessage);
      }
    };

    const handleUserTyping = (data) => {
      if (data.senderId === currentUserId) return; // ignore self typing
      setTypingUser(data.senderId);
      setIsTyping(data.isTyping);

      if (data.isTyping) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
          setIsTyping(false);
          setTypingUser(null);
        }, 3000);
      }
    };

    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("userTyping", handleUserTyping);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("userTyping", handleUserTyping);
      clearTimeout(typingTimeoutRef.current);
    };
  }, [socket, isConnected, onNewMessage, currentUserId, chatId]);

  /** Handle sending a new message */
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() || !isConnected) return;

    const messageData = {
      chatId,
      content: message.trim(),
      messageType: 'text',
    };

    sendMessage(messageData);
    onNewMessage({
      ...messageData,
      senderId: currentUserId,
      timestamp: new Date().toISOString(),
    });
    setMessage("");

    // Stop typing indicator
    sendTyping({ receiverId, isTyping: false });
  };

  /** Handle typing indicator */
  const handleTyping = (e) => {
    const value = e.target.value;
    setMessage(value);

    if (value.trim()) {
      sendTyping({ receiverId, isTyping: true, senderId: currentUserId });
    } else {
      sendTyping({ receiverId, isTyping: false, senderId: currentUserId });
    }
  };

  /** Format message timestamp */
  const formatTime = (timestamp) =>
    new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[500px] bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col z-50 transition-colors duration-300">
      {/* Header */}
      <div className="bg-primary dark:bg-primary-dark text-white p-4 rounded-t-lg flex justify-between items-center transition-colors duration-300">
        <div>
          <h3 className="font-semibold">Support Chat</h3>
          <p className="text-sm text-blue-100 flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? "bg-green-400" : "bg-yellow-400"
              }`}
            ></span>
            {isConnected ? "Connected" : "Connecting..."}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-200 transition-colors"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-700 transition-colors duration-300">
        {messages.length === 0 && (
          <div className="flex justify-center mt-10">
            <div className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm text-center">
              <p>Welcome! 👋</p>
              <p>How can we assist you today?</p>
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={msg._id || idx}
            className={`flex ${
              msg.senderId === currentUserId
                ? "justify-end"
                : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-lg ${
                  msg.senderId === currentUserId
                    ? "bg-primary dark:bg-primary-dark text-white"
                    : "bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200"
                } transition-colors duration-300`}
            >
              <p className="text-sm">{msg.content}</p>
              <p className="text-xs mt-1 opacity-70">
                {formatTime(msg.timestamp || msg.createdAt)}
              </p>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && typingUser && typingUser !== currentUserId && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg italic text-sm">
              Support is typing...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 transition-colors duration-300">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text"
            value={message}
            onChange={handleTyping}
            placeholder={
              isConnected ? "Type your message..." : "Connecting..."
            }
            className="flex-1 px-3 py-2 border border-border-light dark:border-border-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100 dark:disabled:bg-gray-700 bg-white dark:bg-surface-dark text-text dark:text-text-dark placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-300"
            disabled={!isConnected}
          />
          <button
            type="submit"
            disabled={!message.trim() || !isConnected}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark disabled:opacity-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            title={!isConnected ? "Connecting..." : "Send message"}
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

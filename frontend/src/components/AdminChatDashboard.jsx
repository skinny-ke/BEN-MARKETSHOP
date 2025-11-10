import React, { useState, useEffect } from "react";
import { useSocket } from "../context/SocketContext";
import { chatService } from "../api/chatService";
import {
  ChatBubbleLeftRightIcon,
  UserIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

const AdminChatDashboard = () => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const { socket, isConnected, sendMessage, joinChat } = useSocket();

  /** 🟦 Load chats on mount */
  useEffect(() => {
    loadChats();
  }, []);

  /** 🟩 Load messages when chat changes */
  useEffect(() => {
    if (selectedChat) {
      loadMessages(selectedChat._id);
      if (selectedChat._id) joinChat(selectedChat._id);
    }
  }, [selectedChat]);

  /** 🟧 Handle socket incoming messages */
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleReceiveMessage = (message) => {
      if (selectedChat && message.chatId === selectedChat._id) {
        setMessages((prev) => [...prev, message]);
      }
      // Update chat preview
      setChats((prev) =>
        prev.map((chat) =>
          chat._id === message.chatId
            ? {
                ...chat,
                lastMessage: message.content,
                lastMessageTime: message.createdAt,
              }
            : chat
        )
      );
    };

    socket.on("receiveMessage", handleReceiveMessage);
    return () => socket.off("receiveMessage", handleReceiveMessage);
  }, [socket, isConnected, selectedChat]);

  /** 🧩 Load all chats (admin only) */
  const loadChats = async () => {
    try {
      setLoading(true);
      const response = await chatService.getAllChats();
      setChats(response.chats || response.data?.chats || []);
    } catch (error) {
      console.error("❌ Error loading chats:", error);
      setChats([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  /** 🧩 Load messages in selected chat */
  const loadMessages = async (chatId) => {
    try {
      const response = await chatService.getChatMessages(chatId);
      setMessages(response.messages || response.data?.messages || []);
    } catch (error) {
      console.error("❌ Error loading messages:", error);
      setMessages([]); // Set empty array on error
    }
  };

  /** 🟨 Handle selecting a chat */
  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
  };

  /** 🟩 Handle sending message */
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    const messageData = {
      chatId: selectedChat._id,
      content: newMessage.trim(),
      messageType: 'text',
      metadata: {}
    };

    try {
      // Send via socket
      sendMessage(messageData);

      // Also send via API to ensure persistence
      await chatService.sendMessage(messageData);

      // Optimistically update UI
      setMessages((prev) => [
        ...prev,
        {
          ...messageData,
          senderId: "admin",
          createdAt: new Date().toISOString()
        },
      ]);
      setNewMessage("");
    } catch (error) {
      console.error("❌ Error sending message:", error);
    }
  };

  /** 🕒 Formatters */
  const formatTime = (timestamp) =>
    new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );

  return (
    <div className="h-[600px] bg-white rounded-lg shadow-lg border border-gray-200 flex">
      {/* Sidebar */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Customer Chats</h2>
          <p className="text-sm text-gray-500">
            {isConnected ? "🟢 Connected" : "🕓 Connecting..."}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {chats.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <ChatBubbleLeftRightIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No active chats</p>
            </div>
          ) : (
            chats.map((chat) => (
              <div
                key={chat._id}
                onClick={() => handleSelectChat(chat)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                  selectedChat?._id === chat._id
                    ? "bg-blue-50 border-blue-200"
                    : ""
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <UserIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {chat.users.find((u) => u.role !== "admin")?.name ||
                        "Customer"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {chat.lastMessage || "No messages yet"}
                    </p>
                  </div>
                  <ClockIcon className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <UserIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    {selectedChat.users.find((u) => u.role !== "admin")?.name ||
                      "Customer"}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {
                      selectedChat.users.find((u) => u.role !== "admin")
                        ?.email
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${
                    msg.senderId === "admin"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      msg.senderId === "admin"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {formatTime(msg.createdAt || msg.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200">
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!isConnected}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || !isConnected}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                >
                  Send
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <ChatBubbleLeftRightIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>Select a chat to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminChatDashboard;

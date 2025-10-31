/* filepath: /components/ChatButton.jsx */
import React, { useState, useEffect } from "react";
import { useUser, useAuth } from "@clerk/clerk-react";
import { useSocket } from "../context/SocketContext";
import { chatService } from "../api/chatService";
import { setClerkTokenGetter } from "../api/axios";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import ChatWindow from "./ChatWindow";

const ChatButton = ({ receiverId = null }) => {
  const { user } = useUser();
  const { getToken } = useAuth(); // ✅ Needed for Clerk JWT
  const { socket, joinChat } = useSocket();

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);

  const currentUserId = user?.id;
  const targetReceiverId = receiverId || "admin";

  // ✅ Ensure Clerk token is set for Axios before any API call
  useEffect(() => {
    if (getToken) {
      setClerkTokenGetter(() => getToken);
    }
  }, [getToken]);

  /** 🟢 Open chat window + load or create chat + join socket room */
  const handleOpenChat = async () => {
    setIsChatOpen(true);
    if (!currentUserId) return;

    try {
      const response = await chatService.getOrCreateChat(targetReceiverId);
      const chat = response.chat || response;
      setChatId(chat._id);

      // Join socket room
      joinChat(chat._id);

      // Fetch previous messages
      const chatMsgs = await chatService.getChatMessages(chat._id);
      setMessages(chatMsgs.messages || []);
    } catch (error) {
      console.error("❌ Error opening chat:", error);
    }
  };

  /** 🔴 Close chat window */
  const handleCloseChat = () => {
    setIsChatOpen(false);
  };

  /** 🟣 Append new messages in real-time */
  const handleNewMessage = (newMsg) => {
    setMessages((prev) => [...prev, newMsg]);
  };

  /** 🟠 Listen for new incoming messages */
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (msg) => {
      if (msg.chatId === chatId) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on("receiveMessage", handleReceiveMessage);
    return () => socket.off("receiveMessage", handleReceiveMessage);
  }, [socket, chatId]);

  return (
    <>
      {/* 💬 Floating Chat Button */}
      <button
        onClick={handleOpenChat}
        className="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all z-50"
        title="Chat with Support"
      >
        <ChatBubbleLeftRightIcon className="h-6 w-6" />
      </button>

      {/* 💭 Chat Window */}
      <ChatWindow
        isOpen={isChatOpen}
        onClose={handleCloseChat}
        chatId={chatId}
        receiverId={targetReceiverId}
        currentUserId={currentUserId}
        messages={messages}
        onNewMessage={handleNewMessage}
      />
    </>
  );
};

export default ChatButton;

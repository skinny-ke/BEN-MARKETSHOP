/* filepath: /components/ChatButton.jsx */
import React, { useState, useEffect, useCallback } from "react";
import { useUser, useAuth } from "@clerk/clerk-react";
import { useSocket } from "../context/SocketContext";
import { chatService } from "../api/chatService";
import { setClerkTokenGetter } from "../lib/axios";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import ChatWindow from "./ChatWindow";

const ChatButton = ({ receiverId = null }) => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const { socket, joinChat } = useSocket();

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);

  const currentUserId = user?.id;
  const targetReceiverId = receiverId || "admin";

  // ✅ Ensure Clerk token is available for Axios
  useEffect(() => {
    if (getToken) setClerkTokenGetter(() => getToken);
  }, [getToken]);

  /** 🟢 Open chat window: get/create chat + join socket room */
  const handleOpenChat = useCallback(async () => {
    if (!currentUserId) return;

    setIsChatOpen(true);

    try {
      // Get or create chat
      const { chat } = await chatService.getOrCreateChat(targetReceiverId);
      setChatId(chat._id);

      // Join socket room
      joinChat(chat._id);

      // Load previous messages
      const { messages: chatMsgs } = await chatService.getChatMessages(chat._id);
      setMessages(chatMsgs || []);
    } catch (err) {
      console.error("❌ Error opening chat:", err.response?.data || err.message || err);
    }
  }, [currentUserId, targetReceiverId, joinChat]);

  /** 🔴 Close chat window */
  const handleCloseChat = () => setIsChatOpen(false);

  /** 🟣 Listen for incoming socket messages */
  useEffect(() => {
    if (!socket || !chatId) return;

    const handleReceiveMessage = (msg) => {
      if (msg.chatId === chatId) setMessages((prev) => [...prev, msg]);
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
        onNewMessage={(msg) => setMessages((prev) => [...prev, msg])}
      />
    </>
  );
};

export default ChatButton;

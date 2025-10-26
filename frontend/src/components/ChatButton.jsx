import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { useSocket } from "../context/SocketContext";
import { chatService } from "../api/chatService";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import ChatWindow from "./ChatWindow";

const ChatButton = ({ receiverId = null }) => {
  const { user } = useUser();
  const { socket, connectSocket, isConnected, joinChat } = useSocket();

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);

  const currentUserId = user?.id;
  const targetReceiverId = receiverId || "admin";

  /** 🟢 Connect socket when user logs in */
  useEffect(() => {
    if (user && !isConnected) {
      connectSocket();
    }
  }, [user, isConnected, connectSocket]);

  /** 🟡 Open chat window + load chat + join room */
  const handleOpenChat = async () => {
    setIsChatOpen(true);
    if (!currentUserId) return;

    try {
      const chat = await chatService.getOrCreateChat(targetReceiverId);
      setChatId(chat._id);

      joinChat(chat._id);

      const chatMsgs = await chatService.getChatMessages(chat._id);
      setMessages(chatMsgs.messages || []);
    } catch (err) {
      console.error("❌ Error loading chat:", err);
    }
  };

  /** 🟣 Close chat window */
  const handleCloseChat = () => {
    setIsChatOpen(false);
  };

  /** 🧩 Append new messages safely */
  const handleNewMessage = (newMsg) => {
    setMessages((prev) => [...prev, newMsg]);
  };

  /** 🔵 Listen for messages via socket */
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
        className="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-40"
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

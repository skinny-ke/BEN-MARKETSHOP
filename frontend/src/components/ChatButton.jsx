import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import ChatWindow from './ChatWindow';

const ChatButton = ({ receiverId = null }) => {
  const { user } = useUser();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);

  // Default to admin/support user ID if no receiver specified
  const targetReceiverId = receiverId || 'admin';
  const currentUserId = user?.id;

  const handleOpenChat = () => {
    setIsChatOpen(true);
    // In a real app, you'd fetch chat history here
    // For now, we'll start with empty messages
  };

  const handleCloseChat = () => {
    setIsChatOpen(false);
  };

  const handleNewMessage = (newMessage) => {
    setMessages(prev => [...prev, newMessage]);
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={handleOpenChat}
        className="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-40"
        title="Open Support Chat"
      >
        <ChatBubbleLeftRightIcon className="h-6 w-6" />
      </button>

      {/* Chat Window */}
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

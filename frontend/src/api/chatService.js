import axios from './axios';

// ✅ Automatically detect correct backend URL (Render in production, localhost in dev)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const chatService = {
  /** ✅ Get or create chat with a user */
  getOrCreateChat: async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/api/chats/${userId}`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error getting/creating chat:', error);
      throw error;
    }
  },

  /** ✅ Get user's chats */
  getUserChats: async () => {
    try {
      const response = await axios.get(`${API_URL}/api/chats`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error getting user chats:', error);
      throw error;
    }
  },

  /** ✅ Get messages from specific chat */
  getChatMessages: async (chatId) => {
    try {
      const response = await axios.get(`${API_URL}/api/chats/messages/${chatId}`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error getting chat messages:', error);
      throw error;
    }
  },

  /** ✅ Send a new message */
  sendMessage: async (messageData) => {
    try {
      const response = await axios.post(`${API_URL}/api/chats/messages`, messageData, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error sending message:', error);
      throw error;
    }
  },

  /** ✅ Mark messages in a chat as read */
  markAsRead: async (chatId) => {
    try {
      const response = await axios.put(
        `${API_URL}/api/chats/messages/${chatId}/read`,
        {},
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.error('❌ Error marking messages as read:', error);
      throw error;
    }
  },

  /** ✅ Get all chats (admin only) */
  getAllChats: async () => {
    try {
      const response = await axios.get(`${API_URL}/api/chats/admin/all`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error getting all chats (admin):', error);
      throw error;
    }
  },
};

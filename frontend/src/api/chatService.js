import axios from './axios';

export const chatService = {
  /** ✅ Get or create chat with a user */
  getOrCreateChat: async (userId) => {
    try {
      const response = await axios.get(`/api/chats/${userId}`, {
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
      const response = await axios.get(`/api/chats`, {
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
      const response = await axios.get(`/api/chats/messages/${chatId}`, {
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
      const response = await axios.post(`/api/chats/messages`, messageData, {
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
        `/api/chats/messages/${chatId}/read`,
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
      const response = await axios.get(`/api/chats/admin/all`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error getting all chats (admin):', error);
      throw error;
    }
  },
};

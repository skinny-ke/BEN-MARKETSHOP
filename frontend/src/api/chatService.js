import axios from './axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export const chatService = {
  // Get or create chat with a user
  getOrCreateChat: async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/api/chats/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting/creating chat:', error);
      throw error;
    }
  },

  // Get user's chats
  getUserChats: async () => {
    try {
      const response = await axios.get(`${API_URL}/api/chats`);
      return response.data;
    } catch (error) {
      console.error('Error getting user chats:', error);
      throw error;
    }
  },

  // Get chat messages
  getChatMessages: async (chatId) => {
    try {
      const response = await axios.get(`${API_URL}/api/chats/messages/${chatId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting chat messages:', error);
      throw error;
    }
  },

  // Send message
  sendMessage: async (messageData) => {
    try {
      const response = await axios.post(`${API_URL}/api/chats/messages`, messageData);
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  // Mark messages as read
  markAsRead: async (chatId) => {
    try {
      const response = await axios.put(`${API_URL}/api/chats/messages/${chatId}/read`);
      return response.data;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  },

  // Get all chats (admin only)
  getAllChats: async () => {
    try {
      const response = await axios.get(`${API_URL}/api/chats/admin/all`);
      return response.data;
    } catch (error) {
      console.error('Error getting all chats:', error);
      throw error;
    }
  },
};

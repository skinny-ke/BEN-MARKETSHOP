/* filepath: /lib/chatService.js */

import api from './axios';

export const chatService = {
  /** ✅ Get or create a chat with a user */
  getOrCreateChat: async (userId) => {
    try {
      const response = await api.get(`/api/chats/${userId}`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error getting/creating chat:', error.response?.data || error.message);
      throw error;
    }
  },

  /** ✅ Get all chats for the logged-in user */
  getUserChats: async () => {
    try {
      const response = await api.get(`/api/chats`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching user chats:', error.response?.data || error.message);
      throw error;
    }
  },

  /** ✅ Get messages from a specific chat */
  getChatMessages: async (chatId) => {
    try {
      const response = await api.get(`/api/chats/messages/${chatId}`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching chat messages:', error.response?.data || error.message);
      throw error;
    }
  },

  /** ✅ Send a new message */
  sendMessage: async (messageData) => {
    try {
      const response = await api.post(`/api/chats/messages`, messageData, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error sending message:', error.response?.data || error.message);
      throw error;
    }
  },

  /** ✅ Mark all messages in a chat as read */
  markAsRead: async (chatId) => {
    try {
      const response = await api.put(`/api/chats/messages/${chatId}/read`, {}, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error marking messages as read:', error.response?.data || error.message);
      throw error;
    }
  },

  /** ✅ Get all chats (Admin only) */
  getAllChats: async () => {
    try {
      const response = await api.get(`/api/chats/admin/all`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching all chats (admin):', error.response?.data || error.message);
      throw error;
    }
  },
};

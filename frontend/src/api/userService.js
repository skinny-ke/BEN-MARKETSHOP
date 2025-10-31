/* filepath: /lib/userService.js */

import api from './axios';

export const userService = {
  /** ✅ Get all users (admin only) */
  getAllUsers: async () => {
    try {
      const response = await api.get(`/api/users`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error getting all users:', error.response?.data || error.message);
      throw error;
    }
  },

  /** ✅ Get user statistics (admin only) */
  getUserStats: async () => {
    try {
      const response = await api.get(`/api/users/stats`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error getting user stats:', error.response?.data || error.message);
      throw error;
    }
  },

  /** ✅ Update user role (admin only) */
  updateUserRole: async (userId, role) => {
    try {
      const response = await api.put(
        `/api/users/${userId}/role`,
        { role },
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.error('❌ Error updating user role:', error.response?.data || error.message);
      throw error;
    }
  },

  /** ✅ Deactivate user (admin only) */
  deactivateUser: async (userId) => {
    try {
      const response = await api.delete(`/api/users/${userId}`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error deactivating user:', error.response?.data || error.message);
      throw error;
    }
  },
};

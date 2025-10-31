import axios from './axios';

export const userService = {
  // Get all users (admin only)
  getAllUsers: async () => {
    try {
      const response = await axios.get(`/api/users`);
      return response.data;
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  },

  // Get user statistics (admin only)
  getUserStats: async () => {
    try {
      const response = await axios.get(`/api/users/stats`);
      return response.data;
    } catch (error) {
      console.error('Error getting user stats:', error);
      throw error;
    }
  },

  // Update user role (admin only)
  updateUserRole: async (userId, role) => {
    try {
      const response = await axios.put(`/api/users/${userId}/role`, { role });
      return response.data;
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  },

  // Deactivate user (admin only)
  deactivateUser: async (userId) => {
    try {
      const response = await axios.delete(`/api/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error deactivating user:', error);
      throw error;
    }
  },
};

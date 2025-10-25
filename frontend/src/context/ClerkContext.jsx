import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { chatService } from '../api/chatService';

const ClerkContext = createContext();

export const useClerkContext = () => {
  const context = useContext(ClerkContext);
  if (!context) {
    throw new Error('useClerkContext must be used within a ClerkProvider');
  }
  return context;
};

export const ClerkProvider = ({ children }) => {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const [userRole, setUserRole] = useState('user');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && user) {
      // Get user role from Clerk metadata or backend
      const role = user.publicMetadata?.role || 'user';
      setUserRole(role);
      setIsAdmin(role === 'admin');
      setLoading(false);
    } else if (isLoaded && !user) {
      setLoading(false);
    }
  }, [isLoaded, user]);

  // Get auth token for API calls
  const getAuthToken = async () => {
    try {
      return await getToken();
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  };

  // Update user role (admin only)
  const updateUserRole = async (userId, newRole) => {
    if (!isAdmin) {
      throw new Error('Only admins can update user roles');
    }
    
    try {
      const token = await getAuthToken();
      // This would call an admin API endpoint to update user role
      // Implementation depends on your backend admin endpoints
      console.log('Updating user role:', userId, newRole);
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  };

  const value = {
    user,
    isLoaded,
    userRole,
    isAdmin,
    loading,
    getAuthToken,
    updateUserRole
  };

  return (
    <ClerkContext.Provider value={value}>
      {children}
    </ClerkContext.Provider>
  );
};

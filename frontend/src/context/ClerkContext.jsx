import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUser, useAuth, useOrganization } from '@clerk/clerk-react';
import axios from '../api/axios';
import { setClerkTokenGetter } from '../api/axios'; // ✅ added import

const ClerkContext = createContext();

export const useClerkContext = () => {
  const context = useContext(ClerkContext);
  if (!context) throw new Error('useClerkContext must be used within a ClerkProvider');
  return context;
};

export const ClerkProvider = ({ children }) => {
  const { user, isLoaded: userLoaded } = useUser();
  const { getToken } = useAuth();
  const { organization, isLoaded: orgLoaded } = useOrganization();

  const [userRole, setUserRole] = useState('user');
  const [isAdmin, setIsAdmin] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Register Clerk token getter globally for axios
  useEffect(() => {
    if (getToken) setClerkTokenGetter(getToken);
  }, [getToken]);

  // ✅ Fetch user data from backend
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user || !userLoaded) {
        setLoading(false);
        return;
      }

      try {
        const token = await getToken();
        if (!token) {
          const role = user.publicMetadata?.role || 'user';
          setUserRole(role);
          setIsAdmin(role === 'admin');
          setLoading(false);
          return;
        }

        const response = await axios.get('/api/users/profile');
        const userInfo = response.data.data || response.data;

        setUserData(userInfo);
        setUserRole(userInfo.role || 'user');
        setIsAdmin(userInfo.role === 'admin');
      } catch (error) {
        console.error('Error fetching user data:', error);
        const role = user.publicMetadata?.role || 'user';
        setUserRole(role);
        setIsAdmin(role === 'admin');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user, userLoaded, getToken]);

  // ✅ Expose helper functions and state
  const getAuthToken = async () => {
    try {
      return await getToken();
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  };

  const updateUserRole = async (userId, newRole) => {
    if (!isAdmin) throw new Error('Only admins can update user roles');

    try {
      const response = await axios.put(`/admin/users/${userId}/role`, { role: newRole });
      return response.data;
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  };

  const value = {
    user,
    userData,
    isLoaded: userLoaded && orgLoaded,
    userRole,
    isAdmin,
    organization,
    orgId: organization?.id || null,
    loading,
    getAuthToken,
    updateUserRole,
  };

  return <ClerkContext.Provider value={value}>{children}</ClerkContext.Provider>;
};

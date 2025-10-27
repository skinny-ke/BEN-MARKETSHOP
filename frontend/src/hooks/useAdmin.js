import { useClerkContext } from '../context/ClerkContext';
import { Navigate } from 'react-router-dom';

// Hook to check if user is admin
export const useAdmin = () => {
  const { isAdmin, loading } = useClerkContext();
  
  return {
    isAdmin,
    loading,
    requiresAuth: !loading && !isAdmin
  };
};

// Higher-order component to protect admin routes
export const withAdminProtection = (Component) => {
  return (props) => {
    const { isAdmin, loading } = useAdmin();
    
    if (loading) {
      return <div>Loading...</div>;
    }
    
    if (!isAdmin) {
      return <Navigate to="/" replace />;
    }
    
    return <Component {...props} />;
  };
};

// Hook to get current user and role
export const useCurrentUser = () => {
  const { user, userData, userRole, isAdmin, organization, orgId } = useClerkContext();
  
  return {
    user,
    userData,
    role: userRole,
    isAdmin,
    orgId,
    organization
  };
};


import React, { createContext, useContext, useState, useEffect } from 'react';

const RecentlyViewedContext = createContext();

export const useRecentlyViewed = () => {
  const context = useContext(RecentlyViewedContext);
  if (!context) {
    throw new Error('useRecentlyViewed must be used within a RecentlyViewedProvider');
  }
  return context;
};

export const RecentlyViewedProvider = ({ children }) => {
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('benmarket-recently-viewed');
    if (saved) {
      try {
        const products = JSON.parse(saved);
        setRecentlyViewed(products);
      } catch (error) {
        console.error('Error loading recently viewed from localStorage:', error);
      }
    }
  }, []);

  // Save to localStorage whenever recentlyViewed changes
  useEffect(() => {
    localStorage.setItem('benmarket-recently-viewed', JSON.stringify(recentlyViewed));
  }, [recentlyViewed]);

  const addToRecentlyViewed = (product) => {
    setRecentlyViewed(prev => {
      // Remove if already exists
      const filtered = prev.filter(p => p._id !== product._id);
      // Add to beginning and limit to 10 items
      return [product, ...filtered].slice(0, 10);
    });
  };

  const removeFromRecentlyViewed = (productId) => {
    setRecentlyViewed(prev => prev.filter(p => p._id !== productId));
  };

  const clearRecentlyViewed = () => {
    setRecentlyViewed([]);
  };

  const value = {
    recentlyViewed,
    addToRecentlyViewed,
    removeFromRecentlyViewed,
    clearRecentlyViewed
  };

  return (
    <RecentlyViewedContext.Provider value={value}>
      {children}
    </RecentlyViewedContext.Provider>
  );
};

export default RecentlyViewedContext;
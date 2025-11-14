import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

const ComparisonContext = createContext();

export const useComparison = () => {
  const context = useContext(ComparisonContext);
  if (!context) {
    throw new Error('useComparison must be used within a ComparisonProvider');
  }
  return context;
};

export const ComparisonProvider = ({ children }) => {
  const [comparedProducts, setComparedProducts] = useState([]);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('benmarket-comparison');
    if (saved) {
      try {
        const products = JSON.parse(saved);
        setComparedProducts(products);
      } catch (error) {
        console.error('Error loading comparison from localStorage:', error);
      }
    }
  }, []);

  // Save to localStorage whenever comparedProducts changes
  useEffect(() => {
    localStorage.setItem('benmarket-comparison', JSON.stringify(comparedProducts));
  }, [comparedProducts]);

  const addToComparison = (product) => {
    if (comparedProducts.length >= 4) {
      toast.error('You can compare up to 4 products at a time');
      return false;
    }

    if (comparedProducts.find(p => p._id === product._id)) {
      toast.info('Product already in comparison');
      return false;
    }

    setComparedProducts(prev => [...prev, product]);
    toast.success('Product added to comparison');
    return true;
  };

  const removeFromComparison = (productId) => {
    setComparedProducts(prev => prev.filter(p => p._id !== productId));
    toast.success('Product removed from comparison');
  };

  const clearComparison = () => {
    setComparedProducts([]);
    toast.success('Comparison cleared');
  };

  const openComparison = () => {
    if (comparedProducts.length === 0) {
      toast.info('Add products to compare first');
      return;
    }
    setIsComparisonOpen(true);
  };

  const closeComparison = () => {
    setIsComparisonOpen(false);
  };

  const isInComparison = (productId) => {
    return comparedProducts.some(p => p._id === productId);
  };

  const value = {
    comparedProducts,
    isComparisonOpen,
    addToComparison,
    removeFromComparison,
    clearComparison,
    openComparison,
    closeComparison,
    isInComparison
  };

  return (
    <ComparisonContext.Provider value={value}>
      {children}
    </ComparisonContext.Provider>
  );
};

export default ComparisonContext;
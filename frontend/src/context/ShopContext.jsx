import React, { createContext, useState, useContext, useEffect } from 'react';
import { productService } from '../api/services';
import { enhanceProductsWithDownloads } from '../utils/sampleData';
import { toast } from 'sonner';

const ShopContext = createContext();
export const useShop = () => useContext(ShopContext);

export const ShopProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('bm_cart')) || [];
    } catch {
      return [];
    }
  });

  

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Persist cart to localStorage
  useEffect(() => {
    localStorage.setItem('bm_cart', JSON.stringify(cart));
  }, [cart]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const productsArray = await productService.getProducts();
      const productsWithDownloads = enhanceProductsWithDownloads(Array.isArray(productsArray) ? productsArray : []);
      setProducts(productsWithDownloads);
    } catch (error) {
      console.error('Fetch products error:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product) => {
    setCart(prev => {
      const exist = prev.find(item => item._id === product._id);
      if (exist) {
        toast.success('Quantity updated');
        return prev.map(item =>
          item._id === product._id ? { ...item, qty: (item.qty || 1) + 1 } : item
        );
      }
      toast.success('Added to cart');
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateCartItem = (id, qty) => {
    if (qty <= 0) {
      removeFromCart(id);
      return;
    }
    setCart(prev => prev.map(item => item._id === id ? { ...item, qty } : item));
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item._id !== id));
    toast.success('Removed from cart');
  };

  const clearCart = () => {
    setCart([]);
    toast.success('Cart cleared');
  };

  return (
    <ShopContext.Provider value={{
      products,
      cart,
      loading,
      addToCart,
      updateCartItem,
      removeFromCart,
      clearCart,
      fetchProducts
    }}>
      {children}
    </ShopContext.Provider>
  );
};

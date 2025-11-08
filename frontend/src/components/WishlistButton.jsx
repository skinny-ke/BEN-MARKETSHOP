/* filepath: /components/WishlistButton.jsx */
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useClerkContext } from '../context/ClerkContext';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { toast } from 'sonner';
import axios from '../api/axios';

const WishlistButton = ({ product, size = 'w-6 h-6' }) => {
  const { userData } = useClerkContext();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  /** ✅ Initialize wishlist state */
  useEffect(() => {
    const initializeWishlist = async () => {
      try {
        if (userData?.id) {
          const res = await axios.get(`/api/wishlist/${userData.id}`);
          const userWishlist = res.data.wishlist || [];
          setIsWishlisted(userWishlist.some(item => item._id === product._id));
        } else {
          const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
          setIsWishlisted(wishlist.some(item => item._id === product._id));
        }
      } catch (err) {
        console.error('❌ Error fetching wishlist:', err);
      }
    };
    initializeWishlist();
  }, [userData?.id, product._id]);

  /** ✅ Toggle wishlist status */
  const toggleWishlist = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      if (userData?.id) {
        if (isWishlisted) {
          await axios.delete(`/api/wishlist/${userData.id}/${product._id}`);
          setIsWishlisted(false);
          toast.success('Removed from wishlist');
        } else {
          await axios.post(`/api/wishlist/${userData.id}`, { product });
          setIsWishlisted(true);
          toast.success('Added to wishlist');
        }
      } else {
        const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        if (isWishlisted) {
          const updated = wishlist.filter(item => item._id !== product._id);
          localStorage.setItem('wishlist', JSON.stringify(updated));
          setIsWishlisted(false);
          toast.success('Removed from wishlist');
        } else {
          const updated = [...wishlist, product];
          localStorage.setItem('wishlist', JSON.stringify(updated));
          setIsWishlisted(true);
          toast.success('Added to wishlist');
        }
      }
    } catch (error) {
      console.error('❌ Wishlist update error:', error);
      toast.error('Failed to update wishlist');
    } finally {
      setIsLoading(false);
    }
  }, [isWishlisted, isLoading, product, userData?.id]);

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={toggleWishlist}
      disabled={isLoading}
      title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      className={`
        p-2 rounded-full transition-colors duration-200
        ${isWishlisted 
          ? 'bg-red-100 text-red-500 hover:bg-red-200' 
          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}
        ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      {isLoading ? (
        <div className={`${size} animate-spin rounded-full border-2 border-gray-300 border-t-gray-600`} />
      ) : isWishlisted ? (
        <HeartIconSolid className={`${size} fill-current`} />
      ) : (
        <HeartIcon className={`${size}`} />
      )}
    </motion.button>
  );
};

export default WishlistButton;

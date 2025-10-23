import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

const WishlistButton = ({ product, size = 'w-6 h-6' }) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize wishlist state from localStorage
  useEffect(() => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    setIsWishlisted(wishlist.some(item => item._id === product._id));
  }, [product._id]);

  const toggleWishlist = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');

      if (isWishlisted) {
        // Remove from wishlist
        const updatedWishlist = wishlist.filter(item => item._id !== product._id);
        localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
        setIsWishlisted(false);
        toast.success('Removed from wishlist');
      } else {
        // Add to wishlist
        const updatedWishlist = [...wishlist, product];
        localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
        setIsWishlisted(true);
        toast.success('Added to wishlist');
      }
    } catch (error) {
      console.error('Wishlist error:', error);
      toast.error('Failed to update wishlist');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={toggleWishlist}
      disabled={isLoading}
      title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      className={`
        p-2 rounded-full transition-colors
        ${isWishlisted ? 'bg-red-100 text-red-500 hover:bg-red-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}
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

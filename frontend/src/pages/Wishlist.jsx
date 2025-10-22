import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HeartIcon, ShoppingCartIcon, EyeIcon, TrashIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { useShop } from '../context/ShopContext';
import WishlistButton from '../components/WishlistButton';
import toast from 'react-hot-toast';

export default function Wishlist() {
  const { addToCart } = useShop();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWishlist = () => {
      try {
        const savedWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        setWishlist(savedWishlist);
      } catch (error) {
        console.error('Error loading wishlist:', error);
        toast.error('Failed to load wishlist');
      } finally {
        setLoading(false);
      }
    };

    loadWishlist();
  }, []);

  const removeFromWishlist = (productId) => {
    try {
      const updatedWishlist = wishlist.filter(item => item._id !== productId);
      setWishlist(updatedWishlist);
      localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
      toast.success('Removed from wishlist');
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Failed to remove from wishlist');
    }
  };

  const addToCartFromWishlist = (product) => {
    addToCart(product);
    toast.success('Added to cart');
  };

  const clearWishlist = () => {
    if (window.confirm('Are you sure you want to clear your wishlist?')) {
      setWishlist([]);
      localStorage.setItem('wishlist', JSON.stringify([]));
      toast.success('Wishlist cleared');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading wishlist...</p>
        </div>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <HeartIcon className="text-6xl text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-600 mb-2">Your wishlist is empty</h2>
          <p className="text-gray-500 mb-6">Save items you love for later by clicking the heart icon.</p>
          <Link 
            to="/"
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            Start Shopping
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          {/* Header */}
          <div className="bg-green-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">My Wishlist</h1>
                <p className="text-green-100 mt-1">
                  {wishlist.length} item{wishlist.length !== 1 ? 's' : ''} saved
                </p>
              </div>
              <button
                onClick={clearWishlist}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <TrashIcon className="w-4 h-4" />
                Clear All
              </button>
            </div>
          </div>

          {/* Wishlist Items */}
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlist.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white border border-gray-200 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group"
                >
                  <div className="relative">
                    <img 
                      src={product.image || '/placeholder.png'} 
                      alt={product.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    {/* Wishlist Button */}
                    <div className="absolute top-3 right-3">
                      <WishlistButton product={product} size="w-6 h-6" />
                    </div>

                    {/* Quick Actions */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2">
                        <Link 
                          to={`/product/${product._id}`}
                          className="bg-white text-green-600 p-2 rounded-full hover:bg-green-50 transition-colors"
                          title="View Details"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </Link>
                        <button 
                          onClick={() => addToCartFromWishlist(product)}
                          className="bg-green-600 text-white p-2 rounded-full hover:bg-green-700 transition-colors"
                          title="Add to Cart"
                        >
                          <ShoppingCartIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    
                    {product.category && (
                      <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mb-2">
                        {product.category}
                      </span>
                    )}
                    
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-2xl font-bold text-green-600">
                        KSh {product.price?.toLocaleString()}
                      </span>
                      {product.stock !== undefined && (
                        <span className={`text-sm px-2 py-1 rounded ${
                          product.stock > 0 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                        </span>
                      )}
                    </div>
                    
                    <div className="mt-4 flex gap-2">
                      <Link 
                        to={`/product/${product._id}`}
                        className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg text-center hover:bg-gray-200 transition-colors"
                      >
                        View Details
                      </Link>
                      <button 
                        onClick={() => addToCartFromWishlist(product)}
                        disabled={product.stock === 0}
                        className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                      >
                        <ShoppingCartIcon className="w-4 h-4" />
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
              <div className="text-sm text-gray-600">
                {wishlist.length} item{wishlist.length !== 1 ? 's' : ''} in your wishlist
              </div>
              <div className="flex gap-3">
                <Link
                  to="/"
                  className="bg-gray-100 text-gray-700 py-2 px-6 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Continue Shopping
                </Link>
                <button
                  onClick={() => {
                    wishlist.forEach(product => addToCartFromWishlist(product));
                    toast.success('All items added to cart!');
                  }}
                  className="bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Add All to Cart
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

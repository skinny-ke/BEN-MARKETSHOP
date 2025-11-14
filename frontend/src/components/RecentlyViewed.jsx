import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ClockIcon, XMarkIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import { useRecentlyViewed } from '../context/RecentlyViewedContext';
import { useShop } from '../context/ShopContext';
import { toast } from 'sonner';

const RecentlyViewed = ({ className = "", showTitle = true, maxItems = 5 }) => {
  const { recentlyViewed, removeFromRecentlyViewed, clearRecentlyViewed } = useRecentlyViewed();
  const { addToCart } = useShop();
  const [isExpanded, setIsExpanded] = useState(false);

  const displayedItems = isExpanded ? recentlyViewed : recentlyViewed.slice(0, maxItems);

  const handleAddToCart = (product) => {
    addToCart(product);
    toast.success(`${product.name} added to cart`);
  };

  if (recentlyViewed.length === 0) {
    return null;
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
      {showTitle && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ClockIcon className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-800">Recently Viewed</h3>
          </div>
          {recentlyViewed.length > maxItems && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              {isExpanded ? 'Show Less' : `View All (${recentlyViewed.length})`}
            </button>
          )}
        </div>
      )}

      <div className="space-y-3">
        {displayedItems.map((product, index) => (
          <motion.div
            key={product._id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors group"
          >
            {/* Product Image */}
            <Link to={`/product/${product._id}`} className="flex-shrink-0">
              <img
                src={product.image || '/placeholder.png'}
                alt={product.name}
                className="w-12 h-12 object-cover rounded-lg group-hover:scale-105 transition-transform"
              />
            </Link>

            {/* Product Info */}
            <div className="flex-1 min-w-0">
              <Link
                to={`/product/${product._id}`}
                className="block hover:text-blue-600 transition-colors"
              >
                <h4 className="text-sm font-medium text-gray-800 truncate">
                  {product.name}
                </h4>
              </Link>
              <p className="text-sm font-semibold text-green-600">
                KSh {product.price?.toLocaleString()}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleAddToCart(product)}
                disabled={product.stock === 0}
                className="p-2 text-gray-400 hover:text-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Add to Cart"
              >
                <ShoppingCartIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => removeFromRecentlyViewed(product._id)}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                title="Remove from recently viewed"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Clear All Button */}
      {recentlyViewed.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={clearRecentlyViewed}
            className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
          >
            Clear All History
          </button>
        </div>
      )}

      {/* Expand/Collapse for mobile */}
      {recentlyViewed.length > maxItems && !isExpanded && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setIsExpanded(true)}
            className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            View {recentlyViewed.length - maxItems} more items
          </button>
        </div>
      )}
    </div>
  );
};

export default RecentlyViewed;
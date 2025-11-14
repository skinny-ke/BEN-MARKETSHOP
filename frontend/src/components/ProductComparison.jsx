import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, ScaleIcon, StarIcon, ShoppingCartIcon, HeartIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { useShop } from '../context/ShopContext';
import { useTranslation } from '../context/LanguageContext';
import { toast } from 'sonner';
import api from '../api/axios';

const ProductComparison = ({ isOpen, onClose, initialProducts = [] }) => {
  const { addToCart } = useShop();
  const { t } = useTranslation();
  const [products, setProducts] = useState(initialProducts);
  const [loading, setLoading] = useState(false);

  // Load product details if only IDs are provided
  useEffect(() => {
    if (initialProducts.length > 0 && typeof initialProducts[0] === 'string') {
      loadProductDetails(initialProducts);
    } else {
      setProducts(initialProducts);
    }
  }, [initialProducts]);

  const loadProductDetails = async (productIds) => {
    setLoading(true);
    try {
      const productPromises = productIds.map(id =>
        api.get(`/products/${id}`).then(res => res.data)
      );
      const productDetails = await Promise.all(productPromises);
      setProducts(productDetails);
    } catch (error) {
      console.error('Error loading product details:', error);
      toast.error('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const removeProduct = (productId) => {
    setProducts(products.filter(p => p._id !== productId));
  };

  const addToCartHandler = (product) => {
    addToCart(product);
    toast.success(`${product.name} added to cart`);
  };

  const renderStars = (rating) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className="text-yellow-400">
            {star <= rating ? <StarIconSolid className="w-4 h-4" /> : <StarIcon className="w-4 h-4" />}
          </span>
        ))}
      </div>
    );
  };

  const getBestValue = (field) => {
    if (products.length < 2) return null;

    const values = products.map(p => {
      switch (field) {
        case 'price': return p.price;
        case 'rating': return p.rating || 0;
        case 'reviews': return p.reviews || 0;
        case 'stock': return p.stock || 0;
        default: return 0;
      }
    });

    if (field === 'price') {
      return Math.min(...values); // Lower price is better
    } else {
      return Math.max(...values); // Higher rating/reviews/stock is better
    }
  };

  const isBestValue = (product, field) => {
    const bestValue = getBestValue(field);
    if (!bestValue) return false;

    const productValue = field === 'price' ? product.price :
                        field === 'rating' ? (product.rating || 0) :
                        field === 'reviews' ? (product.reviews || 0) :
                        (product.stock || 0);

    return field === 'price' ? productValue === bestValue : productValue === bestValue;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ScaleIcon className="w-6 h-6" />
              <h2 className="text-2xl font-bold">Product Comparison</h2>
              <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">
                {products.length} products
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-auto max-h-[calc(90vh-120px)]">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <ScaleIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No products to compare</h3>
                <p className="text-gray-500">Add products to start comparing</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  {/* Product Images and Names */}
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left p-6 font-semibold text-gray-800 w-48">Product</th>
                      {products.map((product) => (
                        <th key={product._id} className="p-4 min-w-64">
                          <div className="relative">
                            <button
                              onClick={() => removeProduct(product._id)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors z-10"
                            >
                              <XMarkIcon className="w-4 h-4" />
                            </button>
                            <div className="text-center">
                              <img
                                src={product.image || '/placeholder.png'}
                                alt={product.name}
                                className="w-32 h-32 object-cover rounded-lg mx-auto mb-3"
                              />
                              <h3 className="font-semibold text-gray-800 text-sm leading-tight">
                                {product.name}
                              </h3>
                            </div>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {/* Price */}
                    <tr className="border-b border-gray-100">
                      <td className="p-6 font-medium text-gray-700 bg-gray-50">Price</td>
                      {products.map((product) => (
                        <td key={product._id} className="p-4 text-center">
                          <div className={`text-lg font-bold ${isBestValue(product, 'price') ? 'text-green-600' : 'text-gray-800'}`}>
                            KSh {product.price?.toLocaleString()}
                            {isBestValue(product, 'price') && (
                              <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                Best Value
                              </span>
                            )}
                          </div>
                        </td>
                      ))}
                    </tr>

                    {/* Rating */}
                    <tr className="border-b border-gray-100">
                      <td className="p-6 font-medium text-gray-700 bg-gray-50">Rating</td>
                      {products.map((product) => (
                        <td key={product._id} className="p-4 text-center">
                          <div className="flex flex-col items-center gap-1">
                            {renderStars(product.rating || 0)}
                            <span className={`text-sm ${isBestValue(product, 'rating') ? 'text-green-600 font-semibold' : 'text-gray-600'}`}>
                              {product.rating || 0}/5 ({product.reviews || 0} reviews)
                            </span>
                            {isBestValue(product, 'rating') && (
                              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                                Top Rated
                              </span>
                            )}
                          </div>
                        </td>
                      ))}
                    </tr>

                    {/* Stock */}
                    <tr className="border-b border-gray-100">
                      <td className="p-6 font-medium text-gray-700 bg-gray-50">Availability</td>
                      {products.map((product) => (
                        <td key={product._id} className="p-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            product.stock > 10 ? 'bg-green-100 text-green-800' :
                            product.stock > 0 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {product.stock > 10 ? 'In Stock' :
                             product.stock > 0 ? `Only ${product.stock} left` :
                             'Out of Stock'}
                          </span>
                        </td>
                      ))}
                    </tr>

                    {/* Category */}
                    <tr className="border-b border-gray-100">
                      <td className="p-6 font-medium text-gray-700 bg-gray-50">Category</td>
                      {products.map((product) => (
                        <td key={product._id} className="p-4 text-center">
                          <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                            {product.category || 'Uncategorized'}
                          </span>
                        </td>
                      ))}
                    </tr>

                    {/* Brand */}
                    <tr className="border-b border-gray-100">
                      <td className="p-6 font-medium text-gray-700 bg-gray-50">Brand</td>
                      {products.map((product) => (
                        <td key={product._id} className="p-4 text-center">
                          <span className="text-gray-700">{product.brand || 'N/A'}</span>
                        </td>
                      ))}
                    </tr>

                    {/* Description */}
                    <tr className="border-b border-gray-100">
                      <td className="p-6 font-medium text-gray-700 bg-gray-50">Description</td>
                      {products.map((product) => (
                        <td key={product._id} className="p-4">
                          <p className="text-sm text-gray-600 line-clamp-3">
                            {product.description || 'No description available'}
                          </p>
                        </td>
                      ))}
                    </tr>

                    {/* Actions */}
                    <tr>
                      <td className="p-6 font-medium text-gray-700 bg-gray-50">Actions</td>
                      {products.map((product) => (
                        <td key={product._id} className="p-4">
                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() => addToCartHandler(product)}
                              disabled={product.stock === 0}
                              className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm"
                            >
                              <ShoppingCartIcon className="w-4 h-4" />
                              Add to Cart
                            </button>
                            <button className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                              <HeartIcon className="w-4 h-4" />
                              Wishlist
                            </button>
                          </div>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Compare up to 4 products side by side
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setProducts([])}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={onClose}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProductComparison;
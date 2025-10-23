import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaShoppingCart, FaEye, FaDownload } from "react-icons/fa";
import { useShop } from "../context/ShopContext";
import WishlistButton from "./WishlistButton";

export default function ProductCard({ product }) {
  const { addToCart } = useShop();

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
    >
      <div className="relative overflow-hidden">
        <img 
          src={product.image || '/placeholder.png'} 
          alt={product.name} 
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" 
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2">
            <Link 
              to={`/product/${product._id}`}
              className="bg-white text-green-600 p-2 rounded-full hover:bg-green-50 transition-colors"
            >
              <FaEye />
            </Link>
            <button 
              onClick={() => addToCart(product)}
              className="bg-green-600 text-white p-2 rounded-full hover:bg-green-700 transition-colors"
              disabled={product.stock === 0}
            >
              <FaShoppingCart />
            </button>
            {product.downloadableFiles?.length > 0 && (
              <div className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors">
                <FaDownload />
              </div>
            )}
          </div>
        </div>

        {/* Wishlist Button */}
        <div className="absolute top-3 right-3">
          <WishlistButton product={product} size="w-6 h-6" />
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

        {/* Downloadable Files Indicator */}
        {product.downloadableFiles?.length > 0 && (
          <div className="mt-3 flex items-center text-sm text-blue-600">
            <FaDownload className="w-4 h-4 mr-1" />
            <span>{product.downloadableFiles.length} downloadable file{product.downloadableFiles.length !== 1 ? 's' : ''}</span>
          </div>
        )}

        <div className="mt-4 flex gap-2">
          <Link 
            to={`/product/${product._id}`}
            className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg text-center hover:bg-gray-200 transition-colors"
          >
            View Details
          </Link>
          <button 
            onClick={() => addToCart(product)}
            disabled={product.stock === 0}
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <FaShoppingCart className="text-sm" />
            Add to Cart
          </button>
        </div>
      </div>
    </motion.div>
  );
}

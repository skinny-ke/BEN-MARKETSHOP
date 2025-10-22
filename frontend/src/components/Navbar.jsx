import { Link } from "react-router-dom";
import { FaShoppingCart, FaUser, FaSignOutAlt } from "react-icons/fa";
import { motion } from "framer-motion";
import { useShop } from "../context/ShopContext";

export default function Navbar() {
  const { cart, user, logout } = useShop();
  const count = cart.reduce((s, i) => s + (i.qty || 1), 0);

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="bg-green-600 text-white p-4 shadow-lg"
    >
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold hover:text-green-200 transition-colors">
          BenMarket
        </Link>
        
        <div className="flex items-center gap-6">
          <Link 
            to="/cart" 
            className="flex items-center gap-2 hover:text-green-200 transition-colors relative"
          >
            <FaShoppingCart className="text-xl" />
            <span className="font-medium">Cart</span>
            {count > 0 && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
              >
                {count}
              </motion.span>
            )}
          </Link>
          
          {user ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <FaUser />
                <span className="text-sm">{user.name}</span>
              </div>
              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  className="bg-yellow-600 text-white px-3 py-1 rounded-md hover:bg-yellow-700 transition-colors text-sm"
                >
                  Admin
                </Link>
              )}
              <button
                onClick={logout}
                className="flex items-center gap-2 hover:text-green-200 transition-colors"
              >
                <FaSignOutAlt />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link 
                to="/login" 
                className="hover:text-green-200 transition-colors"
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="bg-white text-green-600 px-4 py-2 rounded-md hover:bg-green-50 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </motion.nav>
  );
}

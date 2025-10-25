import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaBars, 
  FaTimes, 
  FaHome, 
  FaShoppingCart, 
  FaUser, 
  FaHeart, 
  FaSearch,
  FaBox,
  FaChartLine,
  FaSignOutAlt
} from 'react-icons/fa';
import { useUser, useClerk } from '@clerk/clerk-react';
import { useShop } from '../context/ShopContext';

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useClerk();
  const { cart } = useShop();
  const location = useLocation();
  
  const cartCount = cart.reduce((total, item) => total + (item.qty || 1), 0);

  const navigation = [
    { name: 'Home', href: '/', icon: FaHome },
    { name: 'Products', href: '/products', icon: FaBox },
    { name: 'Wishlist', href: '/wishlist', icon: FaHeart },
    { name: 'Cart', href: '/cart', icon: FaShoppingCart },
    { name: 'Track Order', href: '/track-order', icon: FaSearch },
  ];

  const adminNavigation = [
    { name: 'Analytics', href: '/analytics', icon: FaChartLine },
    { name: 'Admin', href: '/admin', icon: FaUser },
  ];

  const handleSignOut = () => {
    signOut();
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
      >
        <FaBars className="w-6 h-6" />
      </button>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={() => setIsOpen(false)}
            />
            
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-80 max-w-sm bg-white shadow-xl lg:hidden"
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-md text-gray-400 hover:text-gray-600"
                  >
                    <FaTimes className="w-5 h-5" />
                  </button>
                </div>

                {/* User info */}
                {user && (
                  <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <FaUser className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{user.emailAddresses[0]?.emailAddress}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto">
                  <div className="p-4">
                    <ul className="space-y-2">
                      {navigation.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.href;
                        const showBadge = item.name === 'Cart' && cartCount > 0;
                        
                        return (
                          <li key={item.name}>
                            <Link
                              to={item.href}
                              onClick={() => setIsOpen(false)}
                              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                isActive
                                  ? 'bg-green-100 text-green-700'
                                  : 'text-gray-700 hover:bg-gray-100'
                              }`}
                            >
                              <Icon className="w-5 h-5 mr-3" />
                              {item.name}
                              {showBadge && (
                                <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1">
                                  {cartCount}
                                </span>
                              )}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>

                    {/* Admin navigation */}
                    {user?.publicMetadata?.role === 'admin' && (
                      <div className="mt-6">
                        <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Admin
                        </h3>
                        <ul className="mt-2 space-y-2">
                          {adminNavigation.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.href;
                            
                            return (
                              <li key={item.name}>
                                <Link
                                  to={item.href}
                                  onClick={() => setIsOpen(false)}
                                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                    isActive
                                      ? 'bg-blue-100 text-blue-700'
                                      : 'text-gray-700 hover:bg-gray-100'
                                  }`}
                                >
                                  <Icon className="w-5 h-5 mr-3" />
                                  {item.name}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                  </div>
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200">
                  {user ? (
                    <button
                      onClick={handleSignOut}
                      className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <FaSignOutAlt className="w-5 h-5 mr-3" />
                      Sign Out
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <Link
                        to="/login"
                        onClick={() => setIsOpen(false)}
                        className="block w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                      >
                        Sign In
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setIsOpen(false)}
                        className="block w-full px-3 py-2 text-sm font-medium bg-green-600 text-white hover:bg-green-700 rounded-md transition-colors"
                      >
                        Sign Up
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

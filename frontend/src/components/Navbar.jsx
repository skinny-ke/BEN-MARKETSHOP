import { Link } from "react-router-dom";
import { FaShoppingCart, FaUser, FaSignOutAlt, FaHeart, FaSearch } from "react-icons/fa";
import { motion } from "framer-motion";
import { useUser, useClerk, SignedIn, SignedOut } from "@clerk/clerk-react";
import { useShop } from "../context/ShopContext";
import NotificationCenter from "./NotificationCenter";
import DarkModeToggle from "./DarkModeToggle";
import Logo from "./Logo";

export default function Navbar() {
  const { cart } = useShop();
  const { user, signOut } = useClerk();
  const count = cart.reduce((s, i) => s + (i.qty || 1), 0);

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="bg-green-600 text-white p-4 shadow-lg"
    >
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="hover:opacity-80 transition-opacity">
          <Logo size="default" showText={true} logoSrc="/logo.png"/>
        </Link>
        
                <div className="flex items-center gap-6">
                  <SignedIn>
                    <Link
                      to="/wishlist"
                      className="flex items-center gap-2 hover:text-black-200 transition-colors relative"
                    >
                      <FaHeart className="text-xl" />
                      <span className="font-medium">Wishlist</span>
                    </Link>

                    <Link
                      to="/track-order"
                      className="flex items-center gap-2 hover:text-green-200 transition-colors"
                    >
                      <FaSearch className="text-xl" />
                      <span className="font-medium">Track Order</span>
                    </Link>
                  </SignedIn>

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

                  <NotificationCenter />
                  <DarkModeToggle />

                  <SignedIn>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <img
                          src={user?.imageUrl || "/placeholder-avatar.png"}
                          alt="Profile"
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <span className="text-sm">{user?.firstName}</span>
                      </div>
                      
                      <Link
                        to="/profile"
                        className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors text-sm"
                      >
                        Profile
                      </Link>

                      {user?.publicMetadata?.role === 'admin' && (
                        <Link
                          to="/analytics"
                          className="bg-purple-600 text-white px-3 py-1 rounded-md hover:bg-purple-700 transition-colors text-sm"
                        >
                          Analytics
                        </Link>
                      )}

                      {user?.publicMetadata?.role === 'admin' && (
                        <Link
                          to="/admin"
                          className="bg-yellow-600 text-white px-3 py-1 rounded-md hover:bg-yellow-700 transition-colors text-sm"
                        >
                          Admin
                        </Link>
                      )}

                      <button
                        onClick={() => signOut()}
                        className="flex items-center gap-2 hover:text-green-200 transition-colors"
                      >
                        <FaSignOutAlt />
                        <span className="text-sm">Logout</span>
                      </button>
                    </div>
                  </SignedIn>

                  <SignedOut>
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
                  </SignedOut>
                </div>
      </div>
    </motion.nav>
  );
}

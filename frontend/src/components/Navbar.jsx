import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaShoppingCart,
  FaUser,
  FaSignOutAlt,
  FaHeart,
  FaSearch,
} from "react-icons/fa";
import { useClerk, SignedIn, SignedOut } from "@clerk/clerk-react";
import { useShop } from "../context/ShopContext";
import Logo from "./Logo";
import MobileNav from "./MobileNav";
import { debounce } from "lodash";
import { StarIcon, XMarkIcon, FunnelIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export default function Navbar({ products = [] }) {
  const { cart } = useShop();
  const { user, signOut } = useClerk();
  const count = cart.reduce((s, i) => s + (i.qty || 1), 0);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    category: "",
    priceRange: [0, 10000],
    rating: 0,
    inStock: false,
    sortBy: "relevance",
  });
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const categories = [...new Set(products.map((p) => p.category).filter(Boolean))];
  const sortOptions = [
    { value: "relevance", label: "Relevance" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "rating", label: "Customer Rating" },
    { value: "newest", label: "Newest First" },
    { value: "name", label: "Name A-Z" },
  ];

  // Debounced search
  const debouncedSearch = debounce((query) => console.log("Search:", query), 500);

  useEffect(() => {
    if (searchQuery.trim() !== "") {
      debouncedSearch(searchQuery);
    }
  }, [searchQuery]);

  const handleFilterChange = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));
  const applyFilters = () => {
    console.log("Filters applied:", filters);
    setIsFiltersOpen(false);
  };
  const clearFilters = () => {
    setFilters({ category: "", priceRange: [0, 10000], rating: 0, inStock: false, sortBy: "relevance" });
    setSearchQuery("");
  };
  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.category) count++;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 10000) count++;
    if (filters.rating > 0) count++;
    if (filters.inStock) count++;
    if (filters.sortBy !== "relevance") count++;
    return count;
  };

  return (
    <motion.nav initial={{ y: -100 }} animate={{ y: 0 }} className="bg-green-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="hover:opacity-80 transition-opacity flex items-center">
            <Logo size="default" showText={true} logoSrc="/logo.png" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6">
            <Link to="/wishlist" className="flex items-center gap-2 hover:text-green-200 transition-colors">
              <FaHeart className="text-xl" />
              <span className="font-medium">Wishlist</span>
            </Link>

            <Link to="/track-order" className="flex items-center gap-2 hover:text-green-200 transition-colors">
              <FaSearch className="text-xl" />
              <span className="font-medium">Track Order</span>
            </Link>

            <Link to="/cart" className="relative flex items-center gap-2 hover:text-green-200 transition-colors">
              <FaShoppingCart className="text-xl" />
              <span className="font-medium">Cart</span>
              {count > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {count}
                </span>
              )}
            </Link>

            <SignedIn>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <img src={user?.imageUrl || "/placeholder-avatar.png"} alt="Profile" className="w-8 h-8 rounded-full object-cover" />
                  <span className="text-sm">{user?.firstName}</span>
                </div>
                {user?.publicMetadata?.role === 'admin' && (
                  <Link to="/analytics" className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors text-sm">
                    Analytics
                  </Link>
                )}
                {user?.publicMetadata?.role === 'admin' && (
                  <Link to="/admin" className="bg-yellow-600 text-white px-3 py-1 rounded-md hover:bg-yellow-700 transition-colors text-sm">
                    Admin
                  </Link>
                )}
                <button onClick={() => signOut()} className="flex items-center gap-2 hover:text-green-200 transition-colors">
                  <FaSignOutAlt />
                  <span className="text-sm">Logout</span>
                </button>
              </div>
            </SignedIn>

            <SignedOut>
              <div className="flex items-center gap-4">
                <Link to="/login" className="hover:text-green-200 transition-colors">
                  Login
                </Link>
                <Link to="/register" className="bg-white text-green-600 px-4 py-2 rounded-md hover:bg-green-50 transition-colors">
                  Sign Up
                </Link>
              </div>
            </SignedOut>
          </div>

          {/* Mobile Navigation */}
          <MobileNav />
        </div>
      </div>

    </motion.nav>
  );
}

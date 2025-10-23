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
    <motion.nav initial={{ y: -100 }} animate={{ y: 0 }} className="bg-green-600 text-white p-4 shadow-lg">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="hover:opacity-80 transition-opacity flex items-center">
          <Logo size="default" showText={true} logoSrc="/logo.png" />
        </Link>

        {/* Search & Filters */}
        <div className="flex-1 flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
          <div className="flex-1 relative w-full md:w-auto">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
            />
          </div>
          <button
            onClick={() => debouncedSearch(searchQuery)}
            className="px-4 md:px-6 py-2 md:py-3 bg-green-700 hover:bg-green-800 rounded-lg transition-colors font-medium"
          >
            Search
          </button>
          <button
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className="relative px-4 py-2 md:py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-black font-medium"
          >
            <FunnelIcon className="w-5 h-5" />
            Filters
            {getActiveFiltersCount() > 0 && (
              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {getActiveFiltersCount()}
              </span>
            )}
          </button>
        </div>

        {/* User & Cart */}
        <div className="flex items-center gap-4 mt-2 md:mt-0">
          <Link to="/cart" className="relative flex items-center gap-2 hover:text-green-200 transition-colors">
            <FaShoppingCart className="text-xl" />
            {count > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>

          <SignedIn>
            <div className="flex items-center gap-3">
              <img src={user?.imageUrl || "/placeholder-avatar.png"} alt="Profile" className="w-8 h-8 rounded-full object-cover" />
              <span className="hidden md:inline text-sm">{user?.firstName}</span>
              <button onClick={() => signOut()} className="flex items-center gap-1 hover:text-green-200">
                <FaSignOutAlt />
              </button>
            </div>
          </SignedIn>

          <SignedOut>
            <div className="flex gap-2">
              <Link to="/login" className="hover:text-green-200 transition-colors">Login</Link>
              <Link to="/register" className="bg-white text-green-600 px-3 py-1 rounded-md hover:bg-green-50 transition-colors">Sign Up</Link>
            </div>
          </SignedOut>
        </div>
      </div>

      {/* Advanced Filters Dropdown */}
      <motion.div
        initial={false}
        animate={{ height: isFiltersOpen ? "auto" : 0, opacity: isFiltersOpen ? 1 : 0 }}
        className="overflow-hidden mt-2"
      >
        <div className="bg-white text-black rounded-lg shadow-md p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
                className="w-full px-2 py-1 border rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium mb-1">Max Price (KSh)</label>
              <input
                type="range"
                min="0"
                max="10000"
                value={filters.priceRange[1]}
                onChange={(e) => handleFilterChange("priceRange", [0, parseInt(e.target.value)])}
                className="w-full"
              />
              <div className="text-xs mt-1">{filters.priceRange[0]} - {filters.priceRange[1]}</div>
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-medium mb-1">Rating</label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleFilterChange("rating", star)}
                    className={`p-1 ${star <= filters.rating ? "text-yellow-400" : "text-gray-300 hover:text-yellow-400"}`}
                  >
                    <StarIcon className="w-5 h-5 fill-current" />
                  </button>
                ))}
                {filters.rating > 0 && (
                  <button onClick={() => handleFilterChange("rating", 0)} className="ml-1">
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium mb-1">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                className="w-full px-2 py-1 border rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Additional Actions */}
          <div className="flex justify-end gap-2 mt-4">
            <button onClick={clearFilters} className="px-3 py-1 border rounded hover:bg-gray-100">Clear</button>
            <button onClick={applyFilters} className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700">Apply</button>
          </div>
        </div>
      </motion.div>
    </motion.nav>
  );
}

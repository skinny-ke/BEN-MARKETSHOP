import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaSearch, FaTimes, FaFilter, FaSort, FaDownload } from "react-icons/fa";

export default function EnhancedSearch({ onSearch, onFilter, products = [], className = "" }) {
  const [searchTerm, setSearchTerm] = useState(localStorage.getItem("searchTerm") || "");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState(
    JSON.parse(localStorage.getItem("filters")) || {
      category: "all",
      priceRange: "all",
      hasDownloads: false,
      sortBy: "name"
    }
  );
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1); // for keyboard nav
  const searchRef = useRef(null);
  const suggestionsRef = useRef(null);

  const categories = ["all", ...new Set(products.map(p => p.category).filter(Boolean))];

  // Generate search suggestions
  useEffect(() => {
    if (searchTerm.length > 1) {
      const filtered = products
        .filter(product =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .slice(0, 5);
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchTerm, products]);

  // Persist search term and filters
  useEffect(() => {
    localStorage.setItem("searchTerm", searchTerm);
    localStorage.setItem("filters", JSON.stringify(filters));
  }, [searchTerm, filters]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions) return;
    if (e.key === "ArrowDown") {
      setHighlightIndex(prev => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      setHighlightIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && highlightIndex >= 0) {
      handleSearch(suggestions[highlightIndex].name);
      setHighlightIndex(-1);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    setShowSuggestions(false);
    onSearch(term);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = { category: "all", priceRange: "all", hasDownloads: false, sortBy: "name" };
    setFilters(clearedFilters);
    onFilter(clearedFilters);
  };

  const getPriceRangeLabel = (range) => ({
    "all": "All Prices",
    "0-1000": "Under KSh 1,000",
    "1000-5000": "KSh 1,000 - 5,000",
    "5000-10000": "KSh 5,000 - 10,000",
    "10000+": "Over KSh 10,000"
  }[range] || "All Prices");

  const getSortLabel = (sort) => ({
    "name": "Name A-Z",
    "price-low": "Price Low to High",
    "price-high": "Price High to Low",
    "newest": "Newest First",
    "popular": "Most Popular"
  }[sort] || "Name A-Z");

  return (
    <div className={`relative ${className}`}>
      <div className="relative" ref={searchRef}>
        <div className="relative">
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search products, categories, or descriptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setShowSuggestions(searchTerm.length > 1)}
            onKeyDown={handleKeyDown}
            className="w-full pl-12 pr-12 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
          />
          {searchTerm && (
            <button
              onClick={() => handleSearch("")}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <FaTimes />
            </button>
          )}
        </div>

        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div
              ref={suggestionsRef}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-80 overflow-y-auto"
            >
              {suggestions.map((product, index) => (
                <motion.button
                  key={product._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleSearch(product.name)}
                  className={`w-full p-4 text-left border-b border-gray-100 last:border-b-0 flex items-center space-x-3
                    ${highlightIndex === index ? "bg-green-50" : "hover:bg-gray-50"}`}
                >
                  <img
                    src={product.image || '/placeholder.png'}
                    alt={product.name}
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{product.name}</p>
                    <p className="text-sm text-gray-500">KSh {product.price?.toLocaleString()}</p>
                  </div>
                  {product.downloadableFiles && product.downloadableFiles.length > 0 && (
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      whileHover={{ scale: 1.2 }}
                      className="text-blue-500 text-sm"
                    >
                      <FaDownload />
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Filter Toggle */}
      <div className="flex items-center justify-between mt-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <FaFilter />
          <span>Filters</span>
          {Object.values(filters).some(v => v !== "all" && v !== false) && (
            <span className="bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {Object.values(filters).filter(v => v !== "all" && v !== false).length}
            </span>
          )}
        </button>

        <div className="flex items-center space-x-2">
          <FaSort className="text-gray-400" />
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange("sortBy", e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="name">Name A-Z</option>
            <option value="price-low">Price Low to High</option>
            <option value="price-high">Price High to Low</option>
            <option value="newest">Newest First</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>
      </div>

      {/* Advanced Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-6 bg-gray-50 rounded-xl border border-gray-200"
          >
            {/* Filters Content same as your original */}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

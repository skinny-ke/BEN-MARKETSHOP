import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaSearch, FaTimes, FaFilter, FaSort, FaDownload } from "react-icons/fa";

export default function EnhancedSearch({ 
  onSearch, 
  onFilter, 
  products = [], 
  className = "" 
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: "all",
    priceRange: "all",
    hasDownloads: false,
    sortBy: "name"
  });
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Get unique categories
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
    const clearedFilters = {
      category: "all",
      priceRange: "all",
      hasDownloads: false,
      sortBy: "name"
    };
    setFilters(clearedFilters);
    onFilter(clearedFilters);
  };

  const getPriceRangeLabel = (range) => {
    const ranges = {
      "all": "All Prices",
      "0-1000": "Under KSh 1,000",
      "1000-5000": "KSh 1,000 - 5,000",
      "5000-10000": "KSh 5,000 - 10,000",
      "10000+": "Over KSh 10,000"
    };
    return ranges[range] || "All Prices";
  };

  const getSortLabel = (sort) => {
    const sorts = {
      "name": "Name A-Z",
      "price-low": "Price Low to High",
      "price-high": "Price High to Low",
      "newest": "Newest First",
      "popular": "Most Popular"
    };
    return sorts[sort] || "Name A-Z";
  };

  return (
    <div className={`relative ${className}`}>
      {/* Search Bar */}
      <div className="relative" ref={searchRef}>
        <div className="relative">
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search products, categories, or descriptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setShowSuggestions(searchTerm.length > 1)}
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

        {/* Search Suggestions */}
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
                  className="w-full p-4 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 flex items-center space-x-3"
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
                    <FaDownload className="text-blue-500 text-sm" />
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange("category", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === "all" ? "All Categories" : category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range
                </label>
                <select
                  value={filters.priceRange}
                  onChange={(e) => handleFilterChange("priceRange", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">All Prices</option>
                  <option value="0-1000">Under KSh 1,000</option>
                  <option value="1000-5000">KSh 1,000 - 5,000</option>
                  <option value="5000-10000">KSh 5,000 - 10,000</option>
                  <option value="10000+">Over KSh 10,000</option>
                </select>
              </div>

              {/* Downloads Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Features
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.hasDownloads}
                      onChange={(e) => handleFilterChange("hasDownloads", e.target.checked)}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 flex items-center">
                      <FaDownload className="mr-1" />
                      Has Downloads
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Filters Display */}
      {(filters.category !== "all" || filters.priceRange !== "all" || filters.hasDownloads) && (
        <div className="mt-4 flex flex-wrap gap-2">
          {filters.category !== "all" && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
              {filters.category}
              <button
                onClick={() => handleFilterChange("category", "all")}
                className="ml-2 hover:text-green-600"
              >
                <FaTimes className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.priceRange !== "all" && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
              {getPriceRangeLabel(filters.priceRange)}
              <button
                onClick={() => handleFilterChange("priceRange", "all")}
                className="ml-2 hover:text-blue-600"
              >
                <FaTimes className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.hasDownloads && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
              <FaDownload className="mr-1" />
              Has Downloads
              <button
                onClick={() => handleFilterChange("hasDownloads", false)}
                className="ml-2 hover:text-purple-600"
              >
                <FaTimes className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}

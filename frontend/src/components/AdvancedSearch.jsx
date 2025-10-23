import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import Logo from "./Logo"; // optional logo
import { debounce } from "lodash"; // install lodash if not installed

const AdvancedSearch = ({ onSearch, onFilter, products = [], showLogo = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    category: "",
    priceRange: [0, 10000],
    rating: 0,
    inStock: false,
    sortBy: "relevance",
  });

  const categories = [...new Set(products.map((p) => p.category).filter(Boolean))];
  const sortOptions = [
    { value: "relevance", label: "Relevance" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "rating", label: "Customer Rating" },
    { value: "newest", label: "Newest First" },
    { value: "name", label: "Name A-Z" },
  ];

  // Debounced search handler
  const debouncedSearch = debounce((query) => onSearch(query), 500);

  useEffect(() => {
    if (searchQuery.trim() !== "") {
      debouncedSearch(searchQuery);
    }
  }, [searchQuery]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    onFilter(filters);
    setIsOpen(false);
  };

  const clearFilters = () => {
    setFilters({
      category: "",
      priceRange: [0, 10000],
      rating: 0,
      inStock: false,
      sortBy: "relevance",
    });
    setSearchQuery("");
    onFilter({});
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
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      {/* Logo + Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-4 items-center">
        {showLogo && <Logo size="large" showText={false} logoSrc="/logo.png" />}
        <div className="flex-1 relative w-full">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={() => onSearch(searchQuery)}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          Search
        </button>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
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

      {/* Advanced Filters Modal */}
      <motion.div
        initial={false}
        animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
        className="overflow-hidden"
      >
        <div className="border-t border-gray-200 pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Range (KSh)
              </label>
              <div className="flex gap-2">
                <input
                  type="range"
                  min="0"
                  max="10000"
                  value={filters.priceRange[1]}
                  onChange={(e) =>
                    handleFilterChange("priceRange", [0, parseInt(e.target.value)])
                  }
                  className="w-full"
                />
                <span className="text-sm text-gray-700">
                  {filters.priceRange[0]} - {filters.priceRange[1]}
                </span>
              </div>
            </div>

            {/* Rating Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Rating
              </label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleFilterChange("rating", star)}
                    className={`p-1 ${
                      star <= filters.rating
                        ? "text-yellow-400"
                        : "text-gray-300 hover:text-yellow-400"
                    }`}
                  >
                    <StarIcon className="w-5 h-5 fill-current" />
                  </button>
                ))}
                {filters.rating > 0 && (
                  <button
                    onClick={() => handleFilterChange("rating", 0)}
                    className="ml-2 text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {filters.rating > 0 ? `${filters.rating}+ stars` : "Any rating"}
              </div>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Additional Filters */}
          <div className="mt-6 flex flex-wrap gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.inStock}
                onChange={(e) => handleFilterChange("inStock", e.target.checked)}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="ml-2 text-sm text-gray-700">In Stock Only</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Clear All
            </button>
            <button
              onClick={applyFilters}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </motion.div>

      {/* Quick Filter Tags */}
      <div className="flex flex-wrap gap-2 mt-4">
        <span className="text-sm text-gray-600">Quick filters:</span>
        {["Electronics", "Clothing", "Under 1000", "High Rating"].map((tag) => (
          <button
            key={tag}
            className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
            onClick={() => {
              if (tag === "Electronics" || tag === "Clothing") {
                handleFilterChange("category", tag);
              } else if (tag === "Under 1000") {
                handleFilterChange("priceRange", [0, 1000]);
              } else if (tag === "High Rating") {
                handleFilterChange("rating", 4);
              }
            }}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AdvancedSearch;

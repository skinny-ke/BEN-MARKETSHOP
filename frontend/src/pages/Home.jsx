import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ProductCard from "../components/ProductCard";
import AdvancedSearch from "../components/AdvancedSearch";
import Quotes from "../components/Quotes";
import LoadingSpinner from "../components/LoadingSpinner";
import RecentlyViewed from "../components/RecentlyViewed";
import { useShop } from "../context/ShopContext";
import { useTranslation } from "../context/LanguageContext";
import { toast } from "sonner";

export default function Home() {
  const { products, loading } = useShop();
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    category: "",
    priceRange: [0, 10000],
    rating: 0,
    inStock: false,
    sortBy: "relevance",
  });
  const [filteredProducts, setFilteredProducts] = useState([]);

  // Get unique categories
  const categories = ["all", ...new Set(products.map(p => p.category).filter(Boolean))];

  // Advanced filtering logic
  useEffect(() => {
    let filtered = [...products];

    // Search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(product => product.category === filters.category);
    }

    // Price range filter
    filtered = filtered.filter(product =>
      product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1]
    );

    // Rating filter (if product has rating)
    if (filters.rating > 0) {
      filtered = filtered.filter(product => (product.rating || 0) >= filters.rating);
    }

    // In stock filter
    if (filters.inStock) {
      filtered = filtered.filter(product => product.stock > 0);
    }

    // Sorting
    switch (filters.sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        // relevance - keep original order
        break;
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, filters]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner 
          size="xl" 
          text="Loading amazing products..." 
          showLogo={true}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gradient-to-r from-green-600 to-green-700 text-red py-16"
      >
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            {t('welcomeToBenMarket', 'Welcome to BenMarket')}
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            {t('yourOneStopShop', 'Your one-stop shop for quality products')}
          </p>
          
          {/* Inspirational Quote */}
          <motion.div 
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Quotes 
              variant="hero" 
              autoRotate={true} 
              interval={6000}
              showCategory={true}
              className="mt-8"
            />
          </motion.div>
        </div>
      </motion.div>

      {/* Enhanced Search Section */}
      <div className="container mx-auto px-4 py-8">
        {/* Advanced Search Component */}
        <AdvancedSearch
          onSearch={setSearchTerm}
          onFilter={setFilters}
          products={products}
          showLogo={true}
        />

        {/* Motivational Quote Section */}
        <motion.div 
          className="my-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Quotes 
            variant="card" 
            autoRotate={true} 
            interval={8000}
            showCategory={true}
            className="max-w-4xl mx-auto"
          />
        </motion.div>

        {/* Recently Viewed Section */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <RecentlyViewed maxItems={4} />
        </motion.div>

        {/* Products Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {filteredProducts.length} Product{filteredProducts.length !== 1 ? 's' : ''} Found
            </h2>
            {searchTerm && (
              <div className="text-sm text-gray-600">
                Searching for: <span className="font-medium">"{searchTerm}"</span>
              </div>
            )}
          </div>
          
          {filteredProducts.length === 0 ? (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="text-gray-400 text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No products found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
            </motion.div>
          ) : (
            <motion.div 
              layout
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            >
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  layout
                  transition={{ delay: index * 0.05 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

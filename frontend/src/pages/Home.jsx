import { useState } from "react";
import { motion } from "framer-motion";
import ProductCard from "../components/ProductCard";
import EnhancedSearch from "../components/EnhancedSearch";
import Quotes from "../components/Quotes";
import LoadingSpinner from "../components/LoadingSpinner";
import { useShop } from "../context/ShopContext";

export default function Home() {
  const { products, loading } = useShop();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Get unique categories
  const categories = ["all", ...new Set(products.map(p => p.category).filter(Boolean))];

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
        className="bg-gradient-to-r from-green-600 to-green-700 text-white py-16"
      >
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Welcome to BenMarket
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Your one-stop shop for quality products
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
        {/* Category Buttons */}
        <div className="flex gap-2 flex-wrap my-4">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Enhanced Search Component */}
        <EnhancedSearch 
          onSearch={setSearchTerm}
          onFilter={(filters) => {
            setSelectedCategory(filters.category || "all");
          }}
          products={products}
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

        {/* Products Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {filteredProducts.length} Product{filteredProducts.length !== 1 ? 's' : ''} Found
          </h2>
          
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

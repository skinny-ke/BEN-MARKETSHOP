import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaQuoteLeft, FaHeart, FaStar, FaShoppingCart } from "react-icons/fa";

const quotes = [
  { text: "Quality is not an act, it is a habit.", author: "Aristotle", category: "quality" },
  { text: "The best way to find out if you can trust somebody is to trust them.", author: "Ernest Hemingway", category: "trust" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill", category: "success" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs", category: "passion" },
  { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs", category: "innovation" },
  { text: "Your time is limited, don't waste it living someone else's life.", author: "Steve Jobs", category: "life" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt", category: "dreams" },
  { text: "It is during our darkest moments that we must focus to see the light.", author: "Aristotle", category: "resilience" },
  { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney", category: "action" },
  { text: "Don't be afraid to give up the good to go for the great.", author: "John D. Rockefeller", category: "excellence" }
];

const categoryIcons = {
  quality: FaStar,
  trust: FaHeart,
  success: FaShoppingCart,
  passion: FaHeart,
  innovation: FaStar,
  life: FaHeart,
  dreams: FaStar,
  resilience: FaHeart,
  action: FaShoppingCart,
  excellence: FaStar
};

export default function Quotes({ variant = "default", autoRotate = true, interval = 5000, showCategory = true, className = "" }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!autoRotate || isHovered) return;
    const timer = setInterval(() => setCurrentIndex((prev) => (prev + 1) % quotes.length), interval);
    return () => clearInterval(timer);
  }, [autoRotate, interval, isHovered]);

  const currentQuote = quotes[currentIndex];
  const IconComponent = categoryIcons[currentQuote.category];

  const variantStyles = {
    default: "bg-gradient-to-r from-green-50 to-blue-50 border border-green-200",
    card: "bg-white shadow-lg border border-gray-200",
    hero: "bg-gradient-to-r from-green-600 to-green-700 text-white",
    minimal: "bg-transparent border-none"
  };

  const textStyles = {
    default: "text-gray-800",
    card: "text-gray-800",
    hero: "text-white",
    minimal: "text-gray-600"
  };

  return (
    <motion.div
      className={`relative overflow-hidden rounded-lg p-6 ${variantStyles[variant]} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-4 left-4 w-8 h-8 border-2 border-current rounded-full"></div>
        <div className="absolute bottom-4 right-4 w-6 h-6 border-2 border-current rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 border-2 border-current rounded-full"></div>
      </div>

      <div className="relative z-10 text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div 
              className="flex justify-center mb-4"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <FaQuoteLeft className={`text-2xl ${variant === 'hero' ? 'text-green-200' : 'text-green-500'}`} />
            </motion.div>

            <motion.blockquote className={`text-lg md:text-xl font-medium leading-relaxed mb-4 ${textStyles[variant]}`} initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }}>
              "{currentQuote.text}"
            </motion.blockquote>

            <motion.div className="flex items-center justify-center space-x-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
              <div className="w-8 h-px bg-current opacity-30"></div>
              <cite className={`text-sm font-medium ${variant === 'hero' ? 'text-green-200' : 'text-gray-600'}`}>— {currentQuote.author}</cite>
              <div className="w-8 h-px bg-current opacity-30"></div>
            </motion.div>

            {showCategory && (
              <motion.div className="flex items-center justify-center mt-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${variant === 'hero' ? 'bg-white bg-opacity-20 text-white' : 'bg-green-100 text-green-800'}`}>
                  <IconComponent className="w-3 h-3 mr-1" />
                  {currentQuote.category}
                </span>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Dots */}
        {quotes.length > 1 && (
          <motion.div className="flex justify-center space-x-2 mt-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
            {quotes.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrentIndex(i)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${i === currentIndex ? (variant === 'hero' ? 'bg-white' : 'bg-green-500 w-6') : (variant === 'hero' ? 'bg-white bg-opacity-30' : 'bg-gray-300')}`}
              />
            ))}
          </motion.div>
        )}

        {/* Manual Navigation */}
        {quotes.length > 1 && (
          <div className="flex justify-center space-x-4 mt-4">
            <button type="button" onClick={() => setCurrentIndex((prev) => (prev - 1 + quotes.length) % quotes.length)} className={`p-2 rounded-full transition-colors ${variant === 'hero' ? 'bg-white bg-opacity-20 hover:bg-opacity-30 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}>←</button>
            <button type="button" onClick={() => setCurrentIndex((prev) => (prev + 1) % quotes.length)} className={`p-2 rounded-full transition-colors ${variant === 'hero' ? 'bg-white bg-opacity-20 hover:bg-opacity-30 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}>→</button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

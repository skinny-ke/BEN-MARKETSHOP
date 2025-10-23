import { motion } from "framer-motion";
import { FaShoppingBag, FaLeaf } from "react-icons/fa";

export default function Logo({ size = "default", showText = true, className = "" }) {
  const sizeClasses = {
    small: "w-8 h-8",
    default: "w-10 h-10",
    large: "w-16 h-16",
    xl: "w-20 h-20"
  };

  const textSizes = {
    small: "text-lg",
    default: "text-2xl",
    large: "text-4xl",
    xl: "text-5xl"
  };

  return (
    <motion.div 
      className={`flex items-center space-x-2 ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Logo Icon */}
      <motion.div 
        className={`${sizeClasses[size]} bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center shadow-lg`}
        animate={{ 
          rotate: [0, 5, -5, 0],
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          repeatDelay: 3
        }}
      >
        <FaShoppingBag className="text-white text-lg" />
        <motion.div
          className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{ 
            duration: 1.5,
            repeat: Infinity,
            repeatDelay: 1
          }}
        />
      </motion.div>

      {/* Logo Text */}
      {showText && (
        <motion.div 
          className="flex flex-col"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <span className={`${textSizes[size]} font-bold text-green-600 leading-tight`}>
            BenMarket
          </span>
          <motion.span 
            className="text-xs text-green-500 font-medium -mt-1"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatDelay: 1
            }}
          >
            Quality Products
          </motion.span>
        </motion.div>
      )}
    </motion.div>
  );
}

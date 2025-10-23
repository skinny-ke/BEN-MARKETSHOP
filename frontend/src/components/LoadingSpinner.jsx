import { motion } from "framer-motion";
import { FaShoppingBag, FaLeaf } from "react-icons/fa";

export default function LoadingSpinner({ 
  size = "default", 
  text = "Loading...", 
  showLogo = true,
  className = ""
}) {
  const sizeClasses = {
    small: "w-8 h-8",
    default: "w-12 h-12",
    large: "w-16 h-16",
    xl: "w-20 h-20"
  };

  const textSizes = {
    small: "text-sm",
    default: "text-base",
    large: "text-lg",
    xl: "text-xl"
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {showLogo && (
        <motion.div
          className={`${sizeClasses[size]} bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center shadow-lg mb-4`}
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <FaShoppingBag className="text-white text-lg" />
          <motion.div
            className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full"
            animate={{ 
              scale: [1, 1.5, 1],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{ 
              duration: 1,
              repeat: Infinity,
              delay: 0.5
            }}
          />
        </motion.div>
      )}

      <motion.div
        className="flex items-center space-x-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex space-x-1">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="w-2 h-2 bg-green-600 rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: index * 0.2
              }}
            />
          ))}
        </div>
        <span className={`${textSizes[size]} text-gray-600 font-medium`}>
          {text}
        </span>
      </motion.div>
    </div>
  );
}

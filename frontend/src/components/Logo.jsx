import { motion } from "framer-motion";

export default function Logo({ size = "default", showText = true, className = "", logoSrc }) {
  const sizeClasses = {
    small: "w-8 h-8",
    default: "w-10 h-10",
    large: "w-16 h-16",
    xl: "w-20 h-20",
  };

  const textSizes = {
    small: "text-lg",
    default: "text-2xl",
    large: "text-4xl",
    xl: "text-5xl",
  };

  // Sparkles for animation
  const sparkles = Array.from({ length: 5 }).map((_, i) => ({
    key: i,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    size: `${Math.random() * 4 + 2}px`,
  }));

  return (
    <motion.div
      className={`flex items-center space-x-2 relative ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Logo Container */}
      <motion.div
        className={`${sizeClasses[size]} rounded-xl flex items-center justify-center shadow-lg overflow-hidden relative`}
        animate={{ rotate: [0, 5, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
      >
        {/* Animated Gradient Background */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-green-400 via-green-600 to-green-700"
          animate={{ backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] }}
          transition={{ duration: 5, repeat: Infinity, repeatType: "loop", ease: "linear" }}
          style={{ backgroundSize: "200% 200%" }}
        />

        {/* Sparkles */}
        {sparkles.map(s => (
          <motion.div
            key={s.key}
            className="absolute bg-white rounded-full"
            style={{ top: s.top, left: s.left, width: s.size, height: s.size, opacity: 0.8 }}
            animate={{ y: [0, -5, 0], x: [0, 3, 0], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, repeatDelay: Math.random() }}
          />
        ))}

        {/* Logo Image */}
        {logoSrc ? (
          <motion.img
            src={logoSrc}
            alt="Logo"
            className="relative w-3/4 h-3/4 object-contain z-10"
            whileHover={{ filter: "drop-shadow(0 0 12px rgba(255,255,255,0.7))" }}
            transition={{ duration: 0.3 }}
          />
        ) : (
          <span className="relative text-white text-lg z-10">Logo</span>
        )}

        {/* Notification Dot */}
        <motion.div
          className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full z-20"
          animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
        />

        {/* Subtle Shadow Pulse */}
        <motion.div
          className="absolute inset-0 rounded-xl shadow-inner"
          animate={{ boxShadow: ["0 0 10px rgba(0,0,0,0.1)", "0 0 20px rgba(0,0,0,0.2)", "0 0 10px rgba(0,0,0,0.1)"] }}
          transition={{ duration: 4, repeat: Infinity, repeatType: "loop", ease: "easeInOut" }}
        />
      </motion.div>

      {/* Logo Text */}
      {showText && (
        <motion.div
          className="flex flex-col"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: [0, 1, 0.9, 1], x: 0 }}
          transition={{ delay: 0.2, duration: 3, repeat: Infinity, repeatType: "loop" }}
        >
          <span className={`${textSizes[size]} font-bold text-green-600 leading-tight`}>
            Ben-Market
          </span>
          <motion.span
            className="text-xs text-red-500 font-medium -mt-1"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
          >
            Quality Products
          </motion.span>
        </motion.div>
      )}
    </motion.div>
  );
}

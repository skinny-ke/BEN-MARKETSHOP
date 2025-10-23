import { motion, AnimatePresence } from "framer-motion";
import { FaCheck, FaExclamation, FaInfo, FaTimes, FaDownload } from "react-icons/fa";

const toastVariants = {
  success: {
    icon: FaCheck,
    bgColor: "bg-green-500",
    textColor: "text-white",
    borderColor: "border-green-400"
  },
  error: {
    icon: FaExclamation,
    bgColor: "bg-red-500",
    textColor: "text-white",
    borderColor: "border-red-400"
  },
  info: {
    icon: FaInfo,
    bgColor: "bg-blue-500",
    textColor: "text-white",
    borderColor: "border-blue-400"
  },
  download: {
    icon: FaDownload,
    bgColor: "bg-purple-500",
    textColor: "text-white",
    borderColor: "border-purple-400"
  }
};

export default function Toast({ 
  id, 
  message, 
  type = "success", 
  duration = 3000, 
  onClose,
  action
}) {
  const config = toastVariants[type] || toastVariants.success;
  const IconComponent = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      className={`
        ${config.bgColor} ${config.textColor} 
        border-l-4 ${config.borderColor}
        rounded-lg shadow-lg p-4 mb-4 max-w-sm w-full
        flex items-center space-x-3
      `}
    >
      <motion.div
        className="flex-shrink-0"
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 0.5 }}
      >
        <IconComponent className="w-5 h-5" />
      </motion.div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{message}</p>
        {action && (
          <button
            onClick={action.onClick}
            className="text-xs underline hover:no-underline mt-1"
          >
            {action.text}
          </button>
        )}
      </div>

      <button
        onClick={onClose}
        className="flex-shrink-0 ml-2 hover:bg-black hover:bg-opacity-10 rounded-full p-1 transition-colors"
      >
        <FaTimes className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

export function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            {...toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

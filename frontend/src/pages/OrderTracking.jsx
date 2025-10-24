import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Clock, AlertCircle, Truck } from "lucide-react";

/**
 * Helper: Choose the right icon for a step
 */
function getStatusIcon(status, completed) {
  if (completed) return <CheckCircle className="text-green-500" size={20} />;
  switch (status.toLowerCase()) {
    case "processing":
      return <Clock className="text-yellow-500" size={20} />;
    case "shipped":
      return <Truck className="text-blue-500" size={20} />;
    case "error":
      return <AlertCircle className="text-red-500" size={20} />;
    default:
      return <Clock className="text-gray-400" size={20} />;
  }
}

/**
 * Helper: Apply color classes based on order status
 */
function getStatusColor(status, completed) {
  if (completed) return "text-green-600";
  switch (status.toLowerCase()) {
    case "processing":
      return "text-yellow-600";
    case "shipped":
      return "text-blue-600";
    case "error":
      return "text-red-600";
    default:
      return "text-gray-600";
  }
}

/**
 * Helper: Format date nicely
 */
function formatDate(timestamp) {
  try {
    const date = new Date(timestamp);
    return date.toLocaleString(); // You can customize the format if needed
  } catch {
    return "Invalid date";
  }
}

/**
 * Component: Order Tracking Page
 */
function OrderTracking() {
  const [order, setOrder] = useState({ timeline: [] });
  const [error, setError] = useState(null);

  useEffect(() => {
    // 🧠 Example data — replace with real API call
    try {
      const fakeOrder = {
        timeline: [
          {
            status: "processing",
            completed: true,
            title: "Order Received",
            description: "Your order has been received and is being processed.",
            timestamp: new Date().toISOString(),
          },
          {
            status: "shipped",
            completed: false,
            title: "Shipped",
            description: "Your order is on the way!",
            timestamp: new Date().toISOString(),
          },
        ],
      };
      setOrder(fakeOrder);
    } catch (err) {
      setError("Failed to load order details. Please try again later.");
    }
  }, []);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Order Tracking</h2>

      {/* Fade-in for error messages */}
      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-red-600 mt-2 text-sm"
        >
          {error}
        </motion.p>
      )}

      {/* Timeline */}
      {order.timeline.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">
          Timeline is not available for this order yet.
        </p>
      ) : (
        <div className="space-y-4">
          {order.timeline.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
            >
              <div className="flex-shrink-0">
                {getStatusIcon(step.status, step.completed)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4
                    className={`font-medium ${getStatusColor(
                      step.status,
                      step.completed
                    )}`}
                  >
                    {step.title}
                  </h4>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(step.timestamp)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

export default OrderTracking;

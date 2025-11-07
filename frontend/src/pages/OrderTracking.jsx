import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Clock, AlertCircle, Truck, Package, MapPin, RefreshCw } from "lucide-react";
import { useParams } from "react-router-dom";
import axios from "../api/axios";
import { useClerkContext } from "../context/ClerkContext";
import { toast } from "sonner";

/** Helper: choose the correct icon for each step */
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

/** Helper: apply color classes based on status */
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

/** Helper: format date */
function formatDate(timestamp) {
  try {
    return new Date(timestamp).toLocaleString();
  } catch {
    return "Invalid date";
  }
}

function OrderTracking() {
  const { orderId } = useParams();
  const { userData } = useClerkContext();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrderTracking = async (showRefreshIndicator = false) => {
    if (!orderId) {
      setError("No order ID provided");
      setLoading(false);
      return;
    }

    try {
      if (showRefreshIndicator) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await axios.get(`/api/tracking/${orderId}`);

      if (response.data.success) {
        setOrder(response.data.data);
        setError(null);
        if (showRefreshIndicator) {
          toast.success("Order status updated");
        }
      } else {
        setError(response.data.message || "Failed to load order details");
      }
    } catch (err) {
      console.error("Error fetching order:", err);
      setError(
        err.response?.data?.message ||
          "Failed to load order details. Please try again later."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrderTracking();
  }, [orderId]);

  // Real-time updates using polling (can be enhanced with WebSocket later)
  useEffect(() => {
    if (!order) return;

    const interval = setInterval(() => {
      fetchOrderTracking();
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [order]);

  if (loading) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4"
        >
          <AlertCircle className="text-red-600 inline-block mr-2" size={20} />
          <span className="text-red-700">{error}</span>
        </motion.div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <p className="text-gray-500">No order data available</p>
      </div>
    );
  }

  const getCompleted = (currentStatus, stepStatus) => {
    const statusOrder = [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "out_for_delivery",
      "delivered",
    ];
    return (
      statusOrder.indexOf(currentStatus) >= statusOrder.indexOf(stepStatus)
    );
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Order Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-md p-6 mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Order Tracking</h2>
          <button
            onClick={() => fetchOrderTracking(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <Package className="text-blue-500 mt-1" size={20} />
            <div>
              <p className="text-xs text-gray-500 uppercase">Order Status</p>
              <p className="font-semibold text-gray-800 capitalize">{order.status}</p>
            </div>
          </div>

          {order.trackingNumber && (
            <div className="flex items-start gap-3">
              <Truck className="text-green-500 mt-1" size={20} />
              <div>
                <p className="text-xs text-gray-500 uppercase">Tracking Number</p>
                <p className="font-semibold text-gray-800">{order.trackingNumber}</p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3">
            <MapPin className="text-purple-500 mt-1" size={20} />
            <div>
              <p className="text-xs text-gray-500 uppercase">Total Amount</p>
              <p className="font-semibold text-gray-800">
                KSh {order.totalAmount?.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {order.estimatedDelivery && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2">
              <Clock className="text-blue-600" size={16} />
              <span className="text-sm text-blue-800">
                <strong>Estimated Delivery:</strong> {new Date(order.estimatedDelivery).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>
        )}
      </motion.div>

      {/* Order Items */}
      {order.items && order.items.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-md p-6 mb-6"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Items</h3>
          <div className="space-y-3">
            {order.items.map((item, index) => (
              <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                <img
                  src={item.product?.image || '/placeholder.png'}
                  alt={item.product?.name || 'Product'}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800">{item.product?.name || 'Product'}</h4>
                  <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-800">
                    KSh {(item.price * item.quantity).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    KSh {item.price.toLocaleString()} each
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Timeline */}
      {order.timeline && order.timeline.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Tracking Timeline</h3>
          <div className="space-y-4">
            {order.timeline.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition-all"
              >
                <div className="flex-shrink-0">
                  {getStatusIcon(step.status, getCompleted(order.status, step.status))}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4
                      className={`font-medium ${getStatusColor(
                        step.status,
                        getCompleted(order.status, step.status)
                      )}`}
                    >
                      {step.title}
                    </h4>
                    <span className="text-sm text-gray-500">
                      {formatDate(step.timestamp)}
                    </span>
                  </div>
                  {step.description && (
                    <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <RefreshCw className="w-4 h-4" />
              <span>Status updates automatically every 30 seconds</span>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">
              Tracking timeline is not available yet
            </p>
            <p className="text-sm text-gray-400">
              Updates will appear here as your order progresses
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default OrderTracking;

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TruckIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  MapPinIcon,
  PhoneIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

const OrderTracking = () => {
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Mock order data - in real app, this would come from API
  const mockOrders = {
    'BM001': {
      id: 'BM001',
      status: 'delivered',
      customer: 'John Doe',
      email: 'john@example.com',
      phone: '+254712345678',
      total: 2500,
      items: [
        { name: 'Premium Cotton T-Shirt', quantity: 2, price: 1200 },
        { name: 'Running Sneakers', quantity: 1, price: 100 }
      ],
      shippingAddress: {
        street: '123 Main Street',
        city: 'Nairobi',
        postalCode: '00100',
        country: 'Kenya'
      },
      timeline: [
        {
          status: 'ordered',
          title: 'Order Placed',
          description: 'Your order has been placed successfully',
          timestamp: '2025-10-20T10:00:00Z',
          completed: true
        },
        {
          status: 'confirmed',
          title: 'Order Confirmed',
          description: 'We have confirmed your order and payment',
          timestamp: '2025-10-20T10:30:00Z',
          completed: true
        },
        {
          status: 'processing',
          title: 'Processing',
          description: 'Your order is being prepared for shipment',
          timestamp: '2025-10-20T14:00:00Z',
          completed: true
        },
        {
          status: 'shipped',
          title: 'Shipped',
          description: 'Your order has been shipped and is on its way',
          timestamp: '2025-10-21T09:00:00Z',
          completed: true
        },
        {
          status: 'delivered',
          title: 'Delivered',
          description: 'Your order has been delivered successfully',
          timestamp: '2025-10-22T15:30:00Z',
          completed: true
        }
      ]
    },
    'BM002': {
      id: 'BM002',
      status: 'shipped',
      customer: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+254723456789',
      total: 1800,
      items: [
        { name: 'Wireless Bluetooth Headphones', quantity: 1, price: 1800 }
      ],
      shippingAddress: {
        street: '456 Oak Avenue',
        city: 'Mombasa',
        postalCode: '80100',
        country: 'Kenya'
      },
      timeline: [
        {
          status: 'ordered',
          title: 'Order Placed',
          description: 'Your order has been placed successfully',
          timestamp: '2025-10-21T11:00:00Z',
          completed: true
        },
        {
          status: 'confirmed',
          title: 'Order Confirmed',
          description: 'We have confirmed your order and payment',
          timestamp: '2025-10-21T11:15:00Z',
          completed: true
        },
        {
          status: 'processing',
          title: 'Processing',
          description: 'Your order is being prepared for shipment',
          timestamp: '2025-10-21T15:00:00Z',
          completed: true
        },
        {
          status: 'shipped',
          title: 'Shipped',
          description: 'Your order has been shipped and is on its way',
          timestamp: '2025-10-22T08:00:00Z',
          completed: true
        },
        {
          status: 'delivered',
          title: 'Out for Delivery',
          description: 'Your order is out for delivery',
          timestamp: null,
          completed: false
        }
      ]
    }
  };

  const getStatusIcon = (status, completed) => {
    if (completed) {
      return <CheckCircleIcon className="w-6 h-6 text-green-500" />;
    }
    
    switch (status) {
      case 'ordered':
      case 'confirmed':
      case 'processing':
        return <ClockIcon className="w-6 h-6 text-yellow-500" />;
      case 'shipped':
        return <TruckIcon className="w-6 h-6 text-blue-500" />;
      case 'delivered':
        return <CheckCircleIcon className="w-6 h-6 text-green-500" />;
      default:
        return <ExclamationCircleIcon className="w-6 h-6 text-gray-400" />;
    }
  };

  const getStatusColor = (status, completed) => {
    if (completed) return 'text-green-600';
    
    switch (status) {
      case 'ordered':
      case 'confirmed':
      case 'processing':
        return 'text-yellow-600';
      case 'shipped':
        return 'text-blue-600';
      case 'delivered':
        return 'text-green-600';
      default:
        return 'text-gray-400';
    }
  };

  const trackOrder = async () => {
    if (!orderId.trim()) {
      setError('Please enter an order ID');
      return;
    }

    setLoading(true);
    setError('');

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const foundOrder = mockOrders[orderId.toUpperCase()];
    if (foundOrder) {
      setOrder(foundOrder);
    } else {
      setError('Order not found. Please check your order ID and try again.');
    }

    setLoading(false);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Pending';
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
        >
          {/* Header */}
          <div className="bg-green-600 text-white p-6">
            <h1 className="text-3xl font-bold">Track Your Order</h1>
            <p className="text-green-100 mt-2">Enter your order ID to track your package</p>
          </div>

          {/* Search Form */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Enter your order ID (e.g., BM001)"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && trackOrder()}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <button
                onClick={trackOrder}
                disabled={loading}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {loading ? 'Tracking...' : 'Track Order'}
              </button>
            </div>
            {error && (
              <p className="text-red-600 mt-2 text-sm">{error}</p>
            )}
          </div>

          {/* Order Details */}
          {order && (
            <div className="p-6">
              {/* Order Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Order ID:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{order.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Status:</span>
                      <span className={`font-medium capitalize ${getStatusColor(order.status, true)}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Total:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        KSh {order.total.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Customer Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Name:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{order.customer}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Email:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{order.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Phone:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{order.phone}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <MapPinIcon className="w-5 h-5" />
                  Shipping Address
                </h3>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-gray-900 dark:text-white">{order.shippingAddress.street}</p>
                  <p className="text-gray-900 dark:text-white">
                    {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                  </p>
                  <p className="text-gray-900 dark:text-white">{order.shippingAddress.country}</p>
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Items</h3>
                <div className="space-y-2">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        KSh {item.price.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Order Timeline</h3>
                <div className="space-y-4">
                  {order.timeline.map((step, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-4"
                    >
                      <div className="flex-shrink-0">
                        {getStatusIcon(step.status, step.completed)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className={`font-medium ${getStatusColor(step.status, step.completed)}`}>
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
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default OrderTracking;

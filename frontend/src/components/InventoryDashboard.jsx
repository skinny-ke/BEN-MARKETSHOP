import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Package,
  AlertTriangle,
  TrendingUp,
  Users,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../api/axios';

const InventoryDashboard = () => {
  const [inventoryData, setInventoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [stockForm, setStockForm] = useState({
    quantity: '',
    type: 'stock_in',
    reason: '',
    cost: ''
  });

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/inventory/dashboard');
      if (response.data.success) {
        setInventoryData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching inventory data:', error);
      toast.error('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  const handleStockUpdate = async () => {
    if (!selectedProduct || !stockForm.quantity) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const response = await api.post('/api/inventory/stock', {
        productId: selectedProduct._id,
        ...stockForm,
        quantity: parseInt(stockForm.quantity),
        cost: stockForm.cost ? parseFloat(stockForm.cost) : 0
      });

      if (response.data.success) {
        toast.success('Stock updated successfully');
        setShowStockModal(false);
        setSelectedProduct(null);
        setStockForm({ quantity: '', type: 'stock_in', reason: '', cost: '' });
        fetchInventoryData();
      }
    } catch (error) {
      console.error('Error updating stock:', error);
      toast.error('Failed to update stock');
    }
  };

  const acknowledgeAlert = async (alertId) => {
    try {
      await api.post(`/api/inventory/alerts/${alertId}/acknowledge`);
      toast.success('Alert acknowledged');
      fetchInventoryData();
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      toast.error('Failed to acknowledge alert');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!inventoryData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No inventory data available</p>
      </div>
    );
  }

  const { overview, lowStockProducts, outOfStockProducts, recentLogs, activeAlerts } = inventoryData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Inventory Management</h2>
        <button
          onClick={() => setActiveTab('dashboard')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh Data
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-800">{overview.totalProducts}</p>
            </div>
            <Package className="w-8 h-8 text-blue-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Low Stock Items</p>
              <p className="text-2xl font-bold text-yellow-600">{overview.lowStockCount}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Out of Stock</p>
              <p className="text-2xl font-bold text-red-600">{overview.outOfStockCount}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Inventory Value</p>
              <p className="text-2xl font-bold text-green-600">
                KSh {overview.totalValue.toLocaleString()}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
              { id: 'alerts', label: 'Alerts', icon: AlertTriangle },
              { id: 'logs', label: 'Activity Logs', icon: Clock },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Low Stock Products */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Low Stock Products</h3>
                <div className="space-y-3">
                  {lowStockProducts.map((product) => (
                    <div key={product._id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-gray-800">{product.name}</p>
                        <p className="text-sm text-yellow-600">{product.stock} remaining</p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedProduct(product);
                          setShowStockModal(true);
                        }}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                      >
                        Update Stock
                      </button>
                    </div>
                  ))}
                  {lowStockProducts.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No low stock items</p>
                  )}
                </div>
              </div>

              {/* Out of Stock Products */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Out of Stock Products</h3>
                <div className="space-y-3">
                  {outOfStockProducts.map((product) => (
                    <div key={product._id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-gray-800">{product.name}</p>
                        <p className="text-sm text-red-600">Out of stock</p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedProduct(product);
                          setShowStockModal(true);
                        }}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                      >
                        Restock
                      </button>
                    </div>
                  ))}
                  {outOfStockProducts.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No out of stock items</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Alerts Tab */}
          {activeTab === 'alerts' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Active Alerts</h3>
              {activeAlerts.map((alert) => (
                <div key={alert._id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className={`w-5 h-5 ${
                      alert.type === 'low_stock' ? 'text-yellow-500' :
                      alert.type === 'out_of_stock' ? 'text-red-500' : 'text-orange-500'
                    }`} />
                    <div>
                      <p className="font-medium text-gray-800">{alert.productId?.name}</p>
                      <p className="text-sm text-gray-600">{alert.message}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => acknowledgeAlert(alert._id)}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                  >
                    Acknowledge
                  </button>
                </div>
              ))}
              {activeAlerts.length === 0 && (
                <p className="text-gray-500 text-center py-8">No active alerts</p>
              )}
            </div>
          )}

          {/* Activity Logs Tab */}
          {activeTab === 'logs' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Recent Activity</h3>
              {recentLogs.map((log) => (
                <div key={log._id} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className={`w-3 h-3 rounded-full ${
                    log.type === 'stock_in' ? 'bg-green-500' :
                    log.type === 'stock_out' ? 'bg-red-500' :
                    log.type === 'adjustment' ? 'bg-blue-500' : 'bg-gray-500'
                  }`} />
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">
                      {log.productId?.name} - {log.type.replace('_', ' ').toUpperCase()}
                    </p>
                    <p className="text-sm text-gray-600">{log.reason}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {log.type === 'stock_in' ? '+' : log.type === 'stock_out' ? '-' : ''}
                      {log.quantity}
                    </p>
                    <p className="text-xs text-gray-500">
                      Stock: {log.newStock}
                    </p>
                  </div>
                </div>
              ))}
              {recentLogs.length === 0 && (
                <p className="text-gray-500 text-center py-8">No recent activity</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Stock Update Modal */}
      {showStockModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Update Stock - {selectedProduct.name}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Update Type</label>
                <select
                  value={stockForm.type}
                  onChange={(e) => setStockForm({ ...stockForm, type: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="stock_in">Stock In</option>
                  <option value="stock_out">Stock Out</option>
                  <option value="adjustment">Adjustment</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  {stockForm.type === 'adjustment' ? 'New Stock Level' : 'Quantity'}
                </label>
                <input
                  type="number"
                  value={stockForm.quantity}
                  onChange={(e) => setStockForm({ ...stockForm, quantity: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  placeholder={stockForm.type === 'adjustment' ? 'New stock level' : 'Enter quantity'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Reason</label>
                <input
                  type="text"
                  value={stockForm.reason}
                  onChange={(e) => setStockForm({ ...stockForm, reason: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Reason for stock change"
                />
              </div>

              {stockForm.type === 'stock_in' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Cost per Unit (Optional)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={stockForm.cost}
                    onChange={(e) => setStockForm({ ...stockForm, cost: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    placeholder="Cost per unit"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowStockModal(false);
                  setSelectedProduct(null);
                  setStockForm({ quantity: '', type: 'stock_in', reason: '', cost: '' });
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleStockUpdate}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Update Stock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryDashboard;
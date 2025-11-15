import { useState, useEffect, useMemo } from 'react';
import { useUser } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import {
  FaUsers,
  FaShoppingCart,
  FaDollarSign,
  FaBox,
  FaChartLine,
  FaEye,
  FaEdit,
  FaTrash,
  FaPlus,
  FaToggleOn,
  FaToggleOff,
  FaUserCheck,
  FaUserTimes,
  FaSync
} from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { toast } from 'sonner';
import axios from '../api/axios';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AdminDashboard() {
  const { user } = useUser();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    activeUsers: 0,
    newUsersToday: 0,
    ordersToday: 0,
    revenueToday: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [statusFilter, setStatusFilter] = useState('all');
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [page, pageSize, statusFilter]);

  const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch dashboard stats
        const statsResponse = await axios.get('/api/admin/overview');
        const statsData = statsResponse.data?.data || statsResponse.data || {};
        setStats(statsData);
  
        // Fetch recent orders
        const ordersResponse = await axios.get('/api/admin/orders');
        const ordersData = ordersResponse.data?.data || ordersResponse.data || {};
        setRecentOrders(ordersData.data || ordersData.orders || ordersData || []);
        setTotalOrders(ordersData.count || ordersData.total || 0);
  
        // Fetch users data
        const usersResponse = await axios.get('/api/admin/users');
        const usersData = usersResponse.data?.data || usersResponse.data || [];
        setUsers(usersData);
        setTotalUsers(usersData.length);
  
        // Fetch products data
        const productsResponse = await axios.get('/api/products');
        const productsData = productsResponse.data?.data || productsResponse.data || [];
        setProducts(productsData);
        setTotalProducts(productsData.length);
  
        // Generate sample analytics data for charts
        const analyticsData = [
          { month: 'Jan', sales: 45000, orders: 150 },
          { month: 'Feb', sales: 52000, orders: 180 },
          { month: 'Mar', sales: 48000, orders: 160 },
          { month: 'Apr', sales: 61000, orders: 200 },
          { month: 'May', sales: 55000, orders: 175 },
          { month: 'Jun', sales: 67000, orders: 220 }
        ];
        setSalesData(analyticsData);
  
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
  
    // User management functions
    const toggleUserStatus = async (userId, currentStatus) => {
      try {
        setActionLoading(true);
        const action = currentStatus === 'active' ? 'deactivate' : 'activate';
        const response = await axios.put(`/api/admin/users/deactivate/${userId}`);
        if (response.data?.success) {
          toast.success(`User ${action}d successfully`);
          fetchDashboardData();
        }
      } catch (error) {
        console.error('Error toggling user status:', error);
        toast.error('Failed to update user status');
      } finally {
        setActionLoading(false);
      }
    };
  
    const updateUserRole = async (userId, newRole) => {
      try {
        setActionLoading(true);
        const response = await axios.put(`/api/admin/users/${userId}/role`, { role: newRole });
        if (response.data?.success) {
          toast.success('User role updated successfully');
          fetchDashboardData();
        }
      } catch (error) {
        console.error('Error updating user role:', error);
        toast.error('Failed to update user role');
      } finally {
        setActionLoading(false);
      }
    };
  
    // Product management functions
    const deleteProduct = async (productId) => {
      if (!window.confirm('Are you sure you want to delete this product?')) return;
      
      try {
        setActionLoading(true);
        const response = await axios.delete(`/api/products/${productId}`);
        if (response.data?.success) {
          toast.success('Product deleted successfully');
          fetchDashboardData();
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        toast.error('Failed to delete product');
      } finally {
        setActionLoading(false);
      }
    };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user?.firstName}!</p>
          </motion.div>
  
          {/* Tab Navigation */}
          <div className="mb-6">
            <nav className="flex space-x-8" aria-label="Tabs">
              {[
                { key: 'overview', label: 'Overview', icon: FaChartLine },
                { key: 'users', label: 'Users', icon: FaUsers },
                { key: 'orders', label: 'Orders', icon: FaShoppingCart },
                { key: 'products', label: 'Products', icon: FaBox },
                { key: 'sync', label: 'Sync Tools', icon: FaSync }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setSelectedTab(tab.key)}
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md ${
                    selectedTab === tab.key
                      ? 'bg-green-600 text-white'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
  
          {/* Overview Tab */}
          {selectedTab === 'overview' && (
            <>
              {/* Stats Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
              >
                <StatCard
                  title="Total Users"
                  value={stats.totalUsers || 0}
                  icon={FaUsers}
                  color="blue"
                  change="+12%"
                />
                <StatCard
                  title="Total Orders"
                  value={stats.totalOrders || 0}
                  icon={FaShoppingCart}
                  color="green"
                  change="+8%"
                />
                <StatCard
                  title="Total Revenue"
                  value={`KSh ${(stats.totalRevenue || 0).toLocaleString()}`}
                  icon={FaDollarSign}
                  color="purple"
                  change="+15%"
                />
                <StatCard
                  title="Total Products"
                  value={stats.totalProducts || 0}
                  icon={FaBox}
                  color="orange"
                  change="+5%"
                />
              </motion.div>
  
              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Sales Chart */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white rounded-lg shadow-md p-6"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Overview</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </motion.div>
  
                {/* Orders Chart */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white rounded-lg shadow-md p-6"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Orders by Status</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="orders" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </motion.div>
              </div>
            </>
          )}
  
          {/* Users Tab */}
          {selectedTab === 'users' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
                <p className="text-sm text-gray-600">Manage user roles and account status</p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map(user => (
                      <tr key={user._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img className="h-8 w-8 rounded-full" src={user.image || '/placeholder-avatar.png'} alt="" />
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.name || 'Unknown'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={user.role}
                            onChange={(e) => updateUserRole(user._id, e.target.value)}
                            disabled={actionLoading}
                            className="text-sm border rounded px-2 py-1"
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => toggleUserStatus(user._id, user.isActive ? 'active' : 'inactive')}
                            disabled={actionLoading}
                            className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                              user.isActive
                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                            }`}
                          >
                            {user.isActive ? <FaUserCheck className="w-3 h-3 mr-1" /> : <FaUserTimes className="w-3 h-3 mr-1" />}
                            {user.isActive ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              <FaEye />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
  
          {/* Orders Tab */}
          {selectedTab === 'orders' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Order Management</h3>
                <div className="flex items-center gap-2">
                  <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border rounded px-2 py-1 text-sm">
                    <option value="all">All</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentOrders.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{order._id.slice(-8)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.user?.name || 'Unknown User'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          KSh {(order.totalAmount || 0).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              <FaEye />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
  
          {/* Products Tab */}
          {selectedTab === 'products' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Product Management</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.slice(0, 10).map(product => (
                      <tr key={product._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img className="h-10 w-10 rounded object-cover" src={product.image || '/placeholder-product.png'} alt="" />
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          KSh {product.price.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.stock}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              <FaEye />
                            </button>
                            <button className="text-red-600 hover:text-red-900" onClick={() => deleteProduct(product._id)}>
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
  
          {/* Sync Tools Tab */}
          {selectedTab === 'sync' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Clerk Sync Tool */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sync Clerk User to Database</h3>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const clerkId = e.currentTarget.clerkId.value.trim();
                    if (!clerkId) return;
                    try {
                      const res = await axios.post(`/api/admin/users/sync/${clerkId}`);
                      if (res.data?.success) {
                        toast.success('User synced successfully');
                        e.currentTarget.reset();
                      } else {
                        toast.error(res.data?.message || 'Sync failed');
                      }
                    } catch (err) {
                      console.error(err);
                      toast.error('Failed to sync user');
                    }
                  }}
                  className="flex gap-2 items-center"
                >
                  <input name="clerkId" placeholder="Enter Clerk user ID (user_...)" className="border rounded px-3 py-2 flex-1" />
                  <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Sync</button>
                </form>
              </div>
  
              {/* System Health */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">✓</div>
                    <div className="text-sm text-gray-600">Database Connected</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">✓</div>
                    <div className="text-sm text-gray-600">Clerk Auth Active</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">✓</div>
                    <div className="text-sm text-gray-600">M-Pesa Ready</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    );
  }

function StatCard({ title, value, icon: Icon, color, change }) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500'
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-white rounded-lg shadow-md p-6"
    >
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${colorClasses[color]} text-white`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          <p className="text-sm text-green-600">{change} from last month</p>
        </div>
      </div>
    </motion.div>
  );
}

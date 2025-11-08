import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useUser } from "@clerk/clerk-react";
import { FaPlus, FaEdit, FaTrash, FaEye, FaChartBar, FaBox, FaUsers, FaShoppingCart, FaComments, FaUserCog } from "react-icons/fa";
import { productService } from "../api/services";
import { useClerkContext } from "../context/ClerkContext";
import AdminChatDashboard from "../components/AdminChatDashboard";
import UserManagement from "../components/UserManagement";
import { toast } from "sonner";

export default function Admin() {
  const { user: clerkUser } = useUser();
  const { isAdmin, userRole, loading: authLoading } = useClerkContext();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', cost: '', image: '', category: '', stock: '' });

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && !isAdmin) {
      toast.error("Access denied. Admin privileges required.");
      window.location.href = "/";
    }
  }, [isAdmin, authLoading]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch products
      const productsRes = await productService.getProducts();
      const productsData = productsRes.data?.data || productsRes.data || productsRes;
      setProducts(Array.isArray(productsData) ? productsData : []);

      // Fetch orders from admin endpoint
      const axios = require("../api/axios").default;
      try {
        const ordersRes = await axios.get('/api/admin/orders');
        const ordersData = ordersRes.data?.data || ordersRes.data || [];
        setOrders(Array.isArray(ordersData) ? ordersData : []);
      } catch (orderError) {
        console.error("Error fetching orders:", orderError);
        setOrders([]);
      }

      // Fetch analytics data
      try {
        const analyticsRes = await axios.get('/api/analytics/dashboard');
        const analyticsData = analyticsRes.data?.data;
        if (analyticsData) {
          setAnalyticsData(analyticsData);
        }
      } catch (analyticsError) {
        console.error("Error fetching analytics:", analyticsError);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      const response = await productService.deleteProduct(id);
      if (response.data.success !== false) {
        setProducts(products.filter((p) => p._id !== id));
        toast.success("Product deleted successfully");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error.response?.data?.message || "Failed to delete product");
    }
  };

  const handleUpdateProduct = async (id, updatedData) => {
    try {
      const response = await productService.updateProduct(id, updatedData);
      if (response.data.success !== false) {
        fetchData(); // Refresh list
        toast.success("Product updated successfully");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update product");
    }
  };

  const handleCreateProduct = async () => {
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        cost: form.cost !== '' ? Number(form.cost) : undefined,
        image: form.image.trim(),
        category: form.category.trim(),
        stock: form.stock !== '' ? Number(form.stock) : 0,
      };
      if (!payload.name || !payload.price) {
        toast.error('Name and price are required');
        return;
      }
      const response = await productService.createProduct(payload);
      if (response.data?.success !== false) {
        toast.success('Product created');
        setShowProductForm(false);
        setEditingProduct(null);
        setForm({ name: '', description: '', price: '', cost: '', image: '', category: '', stock: '' });
        fetchData();
      }
    } catch (error) {
      console.error('Create product error:', error);
      toast.error(error.response?.data?.message || 'Failed to create product');
    }
  };

  // Stats calculation
  const stats = analyticsData ? {
    totalProducts: analyticsData.overview.totalProducts,
    totalOrders: analyticsData.overview.totalOrders,
    totalRevenue: analyticsData.overview.totalRevenue,
    pendingOrders: analyticsData.sales.statusDistribution.find(s => s._id === 'pending')?.count || 0,
    netProfit: analyticsData.financial.netProfit,
    profitMargin: analyticsData.financial.profitMargin,
  } : {
    totalProducts: products.length,
    totalOrders: orders.length,
    totalRevenue: orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0),
    pendingOrders: orders.filter((order) => order.paymentStatus === "pending").length,
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Access denied. Admin privileges required.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // Reusable StatCard
  const StatCard = ({ label, value, icon: Icon, color }) => (
    <motion.div whileHover={{ scale: 1.05 }} className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <Icon className={`text-4xl ${color}`} />
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Manage your store and monitor performance</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard label="Total Products" value={stats.totalProducts} icon={FaBox} color="text-green-500" />
            <StatCard label="Total Orders" value={stats.totalOrders} icon={FaShoppingCart} color="text-blue-500" />
            <StatCard
              label="Total Revenue"
              value={`KSh ${stats.totalRevenue.toLocaleString()}`}
              icon={FaChartBar}
              color="text-yellow-500"
            />
            <StatCard label="Pending Orders" value={stats.pendingOrders} icon={FaUsers} color="text-red-500" />
            {stats.netProfit !== undefined && (
              <StatCard
                label="Net Profit"
                value={`KSh ${stats.netProfit.toLocaleString()}`}
                icon={FaChartBar}
                color={stats.netProfit >= 0 ? "text-green-500" : "text-red-500"}
              />
            )}
            {stats.profitMargin !== undefined && (
              <StatCard
                label="Profit Margin"
                value={`${stats.profitMargin.toFixed(1)}%`}
                icon={FaChartBar}
                color={stats.profitMargin >= 0 ? "text-green-500" : "text-red-500"}
              />
            )}
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-lg mb-8">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: "dashboard", label: "Dashboard", icon: FaChartBar },
                  { id: "products", label: "Products", icon: FaBox },
                  { id: "orders", label: "Orders", icon: FaShoppingCart },
                  { id: "users", label: "User Management", icon: FaUserCog },
                  { id: "chat", label: "Customer Chat", icon: FaComments },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? "border-green-500 text-green-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <tab.icon />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {/* Product Tab */}
              {activeTab === "products" && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Products</h2>
                    <button
                      onClick={() => setShowProductForm(true)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                      <FaPlus />
                      Add Product
                    </button>
                  </div>

                  {loading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Product
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Category
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Price
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Stock
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {products.map((product) => (
                            <tr key={product._id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <img
                                    className="h-12 w-12 rounded-lg object-cover"
                                    src={product.image || "/placeholder.png"}
                                    alt={product.name}
                                  />
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                    <div className="text-sm text-gray-500 truncate max-w-xs">{product.description}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                  {product.category || "Uncategorized"}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                KSh {product.price?.toLocaleString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.stock || 0}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex space-x-2">
                                  <button onClick={() => { setEditingProduct(product); setShowProductForm(true); setForm({ name: product.name || '', description: product.description || '', price: String(product.price || ''), cost: product.cost != null ? String(product.cost) : '', image: product.image || '', category: product.category || '', stock: String(product.stock || 0) }); }} className="text-indigo-600 hover:text-indigo-900">
                                    <FaEdit />
                                  </button>
                                  <button onClick={() => handleDeleteProduct(product._id)} className="text-red-600 hover:text-red-900">
                                    <FaTrash />
                                  </button>
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
                  )}
                </div>
              )}

              {/* Orders Tab */}
              {activeTab === "orders" && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Orders</h2>
                  {orders.length === 0 ? (
                    <div className="text-center py-12">
                      <FaShoppingCart className="text-6xl text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-600 mb-2">No orders yet</h3>
                      <p className="text-gray-500">Orders will appear here once customers start making purchases.</p>
                    </div>
                  ) : (
                    <div> {/* Future orders table goes here */} </div>
                  )}
                </div>
              )}

              {/* Users Tab */}
              {activeTab === "users" && (
                <div>
                  <UserManagement />
                </div>
              )}

              {/* Chat Tab */}
              {activeTab === "chat" && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Customer Support Chat</h2>
                  <AdminChatDashboard />
                </div>
              )}

              {/* Dashboard Tab */}
              {activeTab === "dashboard" && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Overview</h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Selling Products</h3>
                      <div className="space-y-3">
                        {analyticsData?.sales?.topProducts?.slice(0, 5).map((product, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">{product.name}</span>
                            <span className="text-sm font-semibold text-gray-800">{product.totalSold} sold</span>
                          </div>
                        )) || (
                          <div className="text-sm text-gray-500">No sales data available</div>
                        )}
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Low Stock Alerts</h3>
                      <div className="space-y-3">
                        {analyticsData?.inventory?.lowStock?.slice(0, 5).map((product, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">{product.name}</span>
                            <span className="text-sm font-semibold text-red-600">{product.stock} left</span>
                          </div>
                        )) || (
                          <div className="text-sm text-gray-500">No low stock items</div>
                        )}
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Sales Trend</h3>
                      <div className="space-y-3">
                        {analyticsData?.sales?.monthly?.slice(-6).map((month, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                              {new Date(month._id.year, month._id.month - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                            </span>
                            <span className="text-sm font-semibold text-gray-800">KSh {month.revenue.toLocaleString()}</span>
                          </div>
                        )) || (
                          <div className="text-sm text-gray-500">No sales trend data</div>
                        )}
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
                      <div className="space-y-2">
                        <button
                          onClick={() => setActiveTab("products")}
                          className="w-full text-left px-4 py-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          Add New Product
                        </button>
                        <button
                          onClick={() => setActiveTab("orders")}
                          className="w-full text-left px-4 py-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          View All Orders
                        </button>
                        <button className="w-full text-left px-4 py-2 bg-white rounded-lg hover:bg-gray-100 transition-colors">
                          Export Data
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Product Form Modal */}
          {showProductForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-96">
                <h3 className="text-lg font-semibold mb-4">{editingProduct ? "Edit Product" : "Add Product"}</h3>
                <div className="space-y-3">
                  {[
                    { key: 'name', label: 'Name', type: 'text' },
                    { key: 'description', label: 'Description', type: 'text' },
                    { key: 'price', label: 'Price', type: 'number' },
                    { key: 'cost', label: 'Cost (optional)', type: 'number' },
                    { key: 'image', label: 'Image URL', type: 'text' },
                    { key: 'category', label: 'Category', type: 'text' },
                    { key: 'stock', label: 'Stock', type: 'number' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="block text-sm text-gray-700 mb-1">{f.label}</label>
                      <input
                        type={f.type}
                        value={form[f.key]}
                        onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                        className="w-full border rounded px-3 py-2"
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <button
                    onClick={() => { setShowProductForm(false); setEditingProduct(null); }}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  {editingProduct ? (
                    <button
                      onClick={() => handleUpdateProduct(editingProduct._id, {
                        name: form.name,
                        description: form.description,
                        price: Number(form.price),
                        cost: form.cost !== '' ? Number(form.cost) : undefined,
                        image: form.image,
                        category: form.category,
                        stock: form.stock !== '' ? Number(form.stock) : 0,
                      })}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Save Changes
                    </button>
                  ) : (
                    <button
                      onClick={handleCreateProduct}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Create Product
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

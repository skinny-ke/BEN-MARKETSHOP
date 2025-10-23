import { useState, useEffect, memo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import {
  ChartBarIcon, ShoppingCartIcon, CurrencyDollarIcon, UsersIcon, ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];

const StatCard = memo(({ title, value, change, icon: Icon, color = 'green' }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        <div className="flex items-center mt-2">
          <ArrowTrendingUpIcon className={`w-4 h-4 ${change >= 0 ? 'text-green-500' : 'text-red-500'}`} />
          <span className={`text-sm font-medium ml-1 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change >= 0 ? '+' : ''}{change}%
          </span>
          <span className="text-sm text-gray-500 ml-1">vs last period</span>
        </div>
      </div>
      <div className={`p-3 rounded-lg`} style={{ backgroundColor: `${color}20` }}>
        <Icon className={`w-6 h-6`} style={{ color: `${color}` }} />
      </div>
    </div>
  </motion.div>
));

export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState({
    overview: {
      totalSales: 125000, totalOrders: 89, totalUsers: 156,
      conversionRate: 12.5, revenueGrowth: 8.2, orderGrowth: 15.3
    },
    salesData: [
      { name: 'Mon', sales: 12000, orders: 8 }, { name: 'Tue', sales: 15000, orders: 12 },
      { name: 'Wed', sales: 18000, orders: 15 }, { name: 'Thu', sales: 22000, orders: 18 },
      { name: 'Fri', sales: 25000, orders: 22 }, { name: 'Sat', sales: 20000, orders: 16 },
      { name: 'Sun', sales: 13000, orders: 10 }
    ],
    categoryData: [
      { name: 'Electronics', value: 35, count: 45 }, { name: 'Clothing', value: 25, count: 32 },
      { name: 'Accessories', value: 20, count: 28 }, { name: 'Sports', value: 12, count: 15 },
      { name: 'Home & Kitchen', value: 8, count: 12 }
    ],
    topProducts: [
      { name: 'Wireless Headphones', sales: 15, revenue: 52500 },
      { name: 'Running Sneakers', sales: 12, revenue: 54000 },
      { name: 'Premium T-Shirt', sales: 18, revenue: 21600 },
      { name: 'Smartphone Case', sales: 25, revenue: 20000 },
      { name: 'Yoga Mat', sales: 8, revenue: 14400 }
    ],
    recentOrders: [
      { id: '#BM001', customer: 'John Doe', amount: 2500, status: 'completed', date: '2025-10-22' },
      { id: '#BM002', customer: 'Jane Smith', amount: 1800, status: 'pending', date: '2025-10-22' },
      { id: '#BM003', customer: 'Mike Johnson', amount: 3200, status: 'shipped', date: '2025-10-21' },
      { id: '#BM004', customer: 'Sarah Wilson', amount: 1500, status: 'completed', date: '2025-10-21' },
      { id: '#BM005', customer: 'David Brown', amount: 4200, status: 'processing', date: '2025-10-20' }
    ]
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      await new Promise(r => setTimeout(r, 1000));
      setLoading(false);
    };
    fetchAnalytics();
  }, [timeRange]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">Track your business performance and insights</p>
          <div className="mt-4 flex gap-2">
            {['24h', '7d', '30d', '90d'].map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  timeRange === range ? 'bg-green-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >{range}</button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Revenue" value={`KSh ${analyticsData.overview.totalSales.toLocaleString()}`} change={analyticsData.overview.revenueGrowth} icon={CurrencyDollarIcon} color="#10B981" />
          <StatCard title="Total Orders" value={analyticsData.overview.totalOrders} change={analyticsData.overview.orderGrowth} icon={ShoppingCartIcon} color="#3B82F6" />
          <StatCard title="Total Users" value={analyticsData.overview.totalUsers} change={5.2} icon={UsersIcon} color="#8B5CF6" />
          <StatCard title="Conversion Rate" value={`${analyticsData.overview.conversionRate}%`} change={2.1} icon={ChartBarIcon} color="#F59E0B" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Overview</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analyticsData.salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="sales" stroke="#10B981" fill="#10B981" fillOpacity={0.1} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={analyticsData.categoryData} cx="50%" cy="50%" labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80} fill="#8884d8" dataKey="value">
                  {analyticsData.categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  ShoppingBag,
  Eye,
  MousePointerClick,
  DollarSign,
  Plus,
  ArrowUpRight,
  Calendar,
  RefreshCw
} from 'lucide-react';
import { adminAPI } from '../../utils/api';
import { handleApiError } from '../../utils/api';
import { formatCurrency, formatNumber, formatPercentage } from '../../utils/helpers';
import AdminLayout from '../../components/admin/AdminLayout';
import MetricsCard from '../../components/admin/MetricsCard';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState(30); // Last 30 days
  const [refreshing, setRefreshing] = useState(false);

  const loadMetrics = useCallback(async (showRefreshMsg = false) => {
    try {
      if (showRefreshMsg) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const response = await adminAPI.getMetrics({ days: dateRange });

      if (response.data.success) {
        setMetrics(response.data.data);
      }
      
      if (showRefreshMsg) {
        toast.success('Dashboard refreshed from database');
      }
    } catch (error) {
      console.error('Error loading metrics:', error);
      const { message } = handleApiError(error);
      setError(message);
      toast.error('Failed to load dashboard metrics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [dateRange]);

  const handleRefresh = () => {
    loadMetrics(true);
  };

  useEffect(() => {
    loadMetrics();
    
    // Auto-refresh every 2 minutes for dashboard
    const interval = setInterval(() => {
      loadMetrics(false); // Silent refresh for dashboard
    }, 2 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [loadMetrics]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !metrics) {
    return (
      <AdminLayout>
        <div className="text-center py-16">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Failed to load dashboard
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button onClick={loadMetrics} className="btn-primary">
            Try Again
          </button>
        </div>
      </AdminLayout>
    );
  }

  const { overview, topProducts, productsByNetwork, monthlyTrends } = metrics;

  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-serif font-bold text-navy-800 mb-2">
              Dashboard Overview
            </h1>
            <p className="text-gray-600">
              Monitor your affiliate marketing performance and insights
            </p>
          </div>

          <div className="flex items-center space-x-4 mt-4 lg:mt-0">
            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-white border border-gray-200 rounded-lg p-2 shadow-sm hover:shadow-md transition-all duration-200 hover:bg-gray-50"
              title="Refresh dashboard from database"
            >
              <RefreshCw 
                className={`w-4 h-4 text-gray-600 ${
                  refreshing ? 'animate-spin' : 'hover:text-primary-600'
                }`} 
              />
            </button>

            {/* Date Range Selector */}
            <select
              value={dateRange}
              onChange={(e) => setDateRange(parseInt(e.target.value))}
              className="input-field py-2 px-3 text-sm"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 3 months</option>
              <option value={365}>Last year</option>
            </select>

            <Link to="/admin/products" className="btn-primary inline-flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Link>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricsCard
            title="Total Products"
            value={formatNumber(overview.totalProducts)}
            icon={ShoppingBag}
            color="blue"
            trend={`${overview.activeProducts} active`}
          />
          
          <MetricsCard
            title="Total Clicks"
            value={formatNumber(overview.totalClicks)}
            icon={MousePointerClick}
            color="green"
            trend={`${formatPercentage(overview.overallCTR)} CTR`}
          />
          
          <MetricsCard
            title="Conversions"
            value={formatNumber(overview.totalConversions)}
            icon={TrendingUp}
            color="purple"
            trend={`${formatPercentage(overview.overallCTR)} rate`}
          />
          
          <MetricsCard
            title="Est. Revenue"
            value={formatCurrency(overview.estimatedRevenue)}
            icon={DollarSign}
            color="gold"
            trend="This period"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Monthly Trends Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-navy-800">Monthly Trends</h3>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            
            {monthlyTrends && monthlyTrends.length > 0 ? (
              <div className="space-y-4">
                {monthlyTrends.slice(-6).map((trend, index) => (
                  <div key={trend.month} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-700">
                        {new Date(trend.month + '-01').toLocaleDateString('en-US', { 
                          month: 'short', 
                          year: 'numeric' 
                        })}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-blue-600">
                        {formatNumber(trend.clicks, true)} clicks
                      </span>
                      <span className="text-green-600">
                        {formatNumber(trend.conversions, true)} conv.
                      </span>
                      <span className="text-purple-600">
                        {trend.ctr}% CTR
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No trend data available
              </div>
            )}
          </div>

          {/* Network Performance */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-navy-800">Performance by Network</h3>
              <Eye className="w-5 h-5 text-gray-400" />
            </div>
            
            {productsByNetwork && productsByNetwork.length > 0 ? (
              <div className="space-y-4">
                {productsByNetwork.slice(0, 5).map((network, index) => (
                  <div key={network._id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 bg-gradient-to-r ${
                        index === 0 ? 'from-blue-500 to-blue-600' :
                        index === 1 ? 'from-green-500 to-green-600' :
                        index === 2 ? 'from-purple-500 to-purple-600' :
                        index === 3 ? 'from-yellow-500 to-yellow-600' :
                        'from-gray-500 to-gray-600'
                      }`} />
                      <span className="text-sm font-medium text-gray-700">
                        {network._id}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-gray-600">
                        {formatNumber(network.count, true)} products
                      </span>
                      <span className="text-blue-600">
                        {formatNumber(network.totalClicks, true)} clicks
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No network data available
              </div>
            )}
          </div>
        </div>

        {/* Top Products Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-navy-800">Top Performing Products</h3>
              <Link 
                to="/admin/products" 
                className="text-primary-600 hover:text-primary-700 inline-flex items-center text-sm font-medium"
              >
                View All
                <ArrowUpRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clicks
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Conversions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CTR
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Est. Revenue
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topProducts && topProducts.length > 0 ? (
                  topProducts.slice(0, 10).map((product, index) => (
                    <tr key={product._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img
                              className="h-10 w-10 rounded-lg object-cover"
                              src={product.images?.[0] || '/api/placeholder/40/40'}
                              alt={product.title}
                              onError={(e) => {
                                e.target.src = '/api/placeholder/40/40';
                              }}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 line-clamp-1">
                              {product.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {product.slug}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(product.price)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatNumber(product.clicks)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatNumber(product.conversions)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatPercentage(product.ctr)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-green-600">
                          {formatCurrency(product.estimatedRevenue)}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      No products data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </AdminLayout>
  );
};

export default AdminDashboard;
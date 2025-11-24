import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  BarChart3,
  PieChart,
  Calendar,
  Download,
  RefreshCw
} from 'lucide-react';
import { adminAPI, handleApiError } from '../../utils/api';
import { formatCurrency, formatNumber, formatPercentage, formatDate } from '../../utils/helpers';
import AdminLayout from '../../components/admin/AdminLayout';
import MetricsCard from '../../components/admin/MetricsCard';
import toast from 'react-hot-toast';

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState(30);
  const [refreshing, setRefreshing] = useState(false);

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await adminAPI.getMetrics({ days: dateRange, detailed: true });

      if (response.data.success) {
        setAnalytics(response.data.data);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
      const { message } = handleApiError(error);
      setError(message);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAnalytics();
    setRefreshing(false);
    toast.success('Analytics data refreshed');
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !analytics) {
    return (
      <AdminLayout>
        <div className="text-center py-16">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Failed to load analytics
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button onClick={loadAnalytics} className="btn-primary">
            Try Again
          </button>
        </div>
      </AdminLayout>
    );
  }

  const { overview, trends, topPerformers, categoryBreakdown } = analytics;

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
              Analytics & Reports
            </h1>
            <p className="text-gray-600">
              Detailed performance analytics and insights for your affiliate business
            </p>
          </div>

          <div className="flex items-center space-x-4 mt-4 lg:mt-0">
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

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="btn-secondary inline-flex items-center"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>

            <button className="btn-primary inline-flex items-center">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </button>
          </div>
        </div>

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricsCard
            title="Revenue Growth"
            value={formatPercentage(overview.revenueGrowth)}
            icon={TrendingUp}
            color="green"
            trend="vs previous period"
            trendDirection={overview.revenueGrowth >= 0 ? 'up' : 'down'}
          />
          
          <MetricsCard
            title="Conversion Rate"
            value={formatPercentage(overview.conversionRate)}
            icon={BarChart3}
            color="blue"
            trend={`${formatNumber(overview.totalConversions, true)} conversions`}
          />
          
          <MetricsCard
            title="Avg. Commission"
            value={formatCurrency(overview.avgCommission)}
            icon={PieChart}
            color="purple"
            trend="per conversion"
          />
          
          <MetricsCard
            title="Active Products"
            value={formatNumber(overview.activeProducts)}
            icon={Calendar}
            color="gold"
            trend={`${overview.totalProducts} total`}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Performance Trends */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-navy-800">Performance Trends</h3>
              <TrendingUp className="w-5 h-5 text-gray-400" />
            </div>
            
            {trends && trends.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-sm font-medium text-gray-500 pb-2 border-b">
                  <span>Period</span>
                  <span>Clicks</span>
                  <span>Revenue</span>
                </div>
                {trends.slice(-10).map((trend, index) => (
                  <div key={trend.date || index} className="grid grid-cols-3 gap-4 text-sm">
                    <span className="text-gray-700">
                      {formatDate(trend.date, { month: 'short', day: 'numeric' })}
                    </span>
                    <span className="text-blue-600 font-medium">
                      {formatNumber(trend.clicks, true)}
                    </span>
                    <span className="text-green-600 font-medium">
                      {formatCurrency(trend.revenue)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No trend data available
              </div>
            )}
          </div>

          {/* Category Performance */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-navy-800">Category Performance</h3>
              <PieChart className="w-5 h-5 text-gray-400" />
            </div>
            
            {categoryBreakdown && categoryBreakdown.length > 0 ? (
              <div className="space-y-4">
                {categoryBreakdown.slice(0, 8).map((category, index) => (
                  <div key={category.name} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 bg-gradient-to-r ${
                        index === 0 ? 'from-blue-500 to-blue-600' :
                        index === 1 ? 'from-green-500 to-green-600' :
                        index === 2 ? 'from-purple-500 to-purple-600' :
                        index === 3 ? 'from-yellow-500 to-yellow-600' :
                        index === 4 ? 'from-red-500 to-red-600' :
                        index === 5 ? 'from-indigo-500 to-indigo-600' :
                        index === 6 ? 'from-pink-500 to-pink-600' :
                        'from-gray-500 to-gray-600'
                      }`} />
                      <span className="text-sm font-medium text-gray-700">
                        {category.name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-gray-600">
                        {formatNumber(category.products)} products
                      </span>
                      <span className="text-green-600 font-medium">
                        {formatCurrency(category.revenue)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No category data available
              </div>
            )}
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-navy-800">Top Performing Products</h3>
              <span className="text-sm text-gray-500">Last {dateRange} days</span>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clicks
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Conversions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CVR
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topPerformers && topPerformers.length > 0 ? (
                  topPerformers.slice(0, 10).map((product, index) => (
                    <tr key={product._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-primary-600 to-secondary-600 text-white text-sm font-medium">
                          {index + 1}
                        </div>
                      </td>
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
                            <div className="text-sm font-medium text-gray-900 line-clamp-1 max-w-xs">
                              {product.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {product.category}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatNumber(product.clicks, true)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatNumber(product.conversions, true)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatPercentage(product.conversionRate)}
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
                      No performance data available
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

export default AdminAnalytics;
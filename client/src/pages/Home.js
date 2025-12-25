import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { productsAPI } from '../utils/api';
import { handleApiError } from '../utils/api';
import toast from 'react-hot-toast';

// Components
import HeroSection from '../components/sections/HeroSection';
import FeaturedProducts from '../components/sections/FeaturedProducts';
import LatestProducts from '../components/sections/LatestProducts';
import CategoryProducts from '../components/sections/CategoryProducts';
import CategoriesAvailable from '../components/sections/CategoriesAvailable';
import CTASection from '../components/sections/CTASection';

const Home = () => {
  const [topSellingProducts, setTopSellingProducts] = useState([]);
  const [latestProducts, setLatestProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadHomeData = useCallback(async (showRefreshMsg = false) => {
    try {
      if (showRefreshMsg) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Load all home page data in parallel
      const [topSellingRes, latestRes] = await Promise.all([
        productsAPI.getTopSellingProducts(8),
        productsAPI.getLatestProducts(12)
      ]);

      if (topSellingRes.data.success) {
        setTopSellingProducts(topSellingRes.data.data.products);
      }

      if (latestRes.data.success) {
        setLatestProducts(latestRes.data.data.products);
      }

      if (showRefreshMsg) {
        toast.success('Content refreshed from database');
      }

    } catch (error) {
      console.error('Error loading home data:', error);
      const { message } = handleApiError(error);
      setError(message);
      toast.error('Failed to load some content. Please refresh the page.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadHomeData();
    
    // Auto-refresh every 5 minutes to get latest data
    const interval = setInterval(loadHomeData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadHomeData]);

  const handleRefresh = () => {
    loadHomeData(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading premium products...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Oops! Something went wrong
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={loadHomeData}
            className="btn-primary"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      {/* Refresh Button */}
      <div className="fixed top-20 sm:top-24 right-4 z-50">
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200 hover:bg-white active:scale-95 touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
          title="Refresh content from database"
        >
          <RefreshCw 
            className={`w-5 h-5 text-gray-600 ${
              refreshing ? 'animate-spin' : 'hover:text-primary-600'
            }`} 
          />
        </button>
      </div>

      {/* Hero Section */}
      <HeroSection />

      {/* Top Selling Products */}
      <section id="top-selling" className="py-20 bg-gray-50">
        <FeaturedProducts products={topSellingProducts} />
      </section>

      {/* Latest Products */}
      <section id="products" className="py-20 bg-gray-50">
        <LatestProducts products={latestProducts} />
      </section>

      {/* Products by Category */}
      <section className="py-20 bg-white">
        <CategoryProducts />
      </section>

      {/* Categories Available */}
      <section className="py-20 bg-gray-50">
        <CategoriesAvailable />
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-navy-800 to-navy-900">
        <CTASection />
      </section>
    </div>
  );
};

export default Home;
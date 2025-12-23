import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { productsAPI } from '../utils/api';
import { handleApiError } from '../utils/api';
import toast from 'react-hot-toast';
import { Search, Grid, List, Star, ExternalLink, RefreshCw } from 'lucide-react';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Filters and search
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [topSellingOnly, setTopSellingOnly] = useState(searchParams.get('topSelling') === 'true');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'latest');
  const [viewMode, setViewMode] = useState('grid');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  
  const loadProducts = useCallback(async (silent = false) => {
    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const params = {
        page: currentPage,
        limit: 12,
        search: searchTerm || undefined,
        categories: selectedCategory !== 'all' ? selectedCategory : undefined,
        topSelling: topSellingOnly || undefined,
        sortBy: sortBy === 'latest' ? 'createdAt' : sortBy,
        sortOrder: 'desc'
      };
      
      // Remove undefined values
      Object.keys(params).forEach(key => {
        if (params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await productsAPI.getProducts(params);
      
      if (response.data.success) {
        const { products, pagination } = response.data.data;
        setProducts(products || []);
        setTotalPages(pagination?.totalPages || 1);
        setTotalProducts(pagination?.total || 0);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      const { message } = handleApiError(error);
      setError(message);
      if (!silent) {
        toast.error('Failed to load products');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentPage, searchTerm, selectedCategory, topSellingOnly, sortBy]);

  const handleRefresh = useCallback(() => {
    loadProducts();
    toast.success('Products refreshed from database');
  }, [loadProducts]);

  const loadCategories = useCallback(async () => {
    try {
      const response = await productsAPI.getCategories();
      if (response.data.success) {
        setCategories(response.data.data.categories);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }, []);

  // Effects
  useEffect(() => {
    loadProducts();
    loadCategories();
  }, [loadProducts, loadCategories]);
  
  useEffect(() => {
    // Auto-refresh every 3 minutes for products page
    const interval = setInterval(() => {
      loadProducts(true); // Silent refresh
    }, 3 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [loadProducts]);

  useEffect(() => {
    // Update URL params when filters change
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    if (topSellingOnly) params.set('topSelling', 'true');
    if (sortBy !== 'latest') params.set('sort', sortBy);
    if (currentPage > 1) params.set('page', currentPage.toString());
    
    setSearchParams(params);
  }, [searchTerm, selectedCategory, sortBy, currentPage, topSellingOnly, setSearchParams]);



  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    // searchTerm is already set by the input onChange
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
    setCurrentPage(1);
  };

  const ProductCard = ({ product }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group ${
        viewMode === 'list' ? 'flex' : ''
      }`}
    >
      {/* Product Image */}
      <div className={`relative overflow-hidden ${viewMode === 'list' ? 'w-32 sm:w-48' : 'aspect-square'}`}>
        <img
          src={product.images?.[0] || '/api/placeholder/400/400'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {product.topSelling && (
          <div className="absolute top-2 left-2">
            <span className="bg-gold-500 text-white text-[10px] md:text-xs font-semibold px-2 py-0.5 md:py-1 rounded-full">
              Top Selling
            </span>
          </div>
        )}
        {product.discount && (
          <div className="absolute top-2 right-2">
            <span className="bg-red-500 text-white text-[10px] md:text-xs font-semibold px-2 py-0.5 md:py-1 rounded-full">
              -{product.discount}%
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className={`p-3 md:p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
        <div className={viewMode === 'list' ? 'flex justify-between items-start' : ''}>
          <div className={viewMode === 'list' ? 'flex-1 pr-4' : ''}>
            <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
              {product.name}
            </h3>
            
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {product.description}
            </p>

            {/* Categories */}
            <div className="flex flex-wrap gap-1 mb-3">
              {product.categories?.slice(0, 2).map((category, index) => (
                <span
                  key={index}
                  className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                >
                  {category}
                </span>
              ))}
            </div>

            {/* Rating */}
            {product.rating && (
              <div className="flex items-center mb-3">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="text-sm text-gray-600 ml-1">
                    ({product.rating.toFixed(1)})
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Price and Actions */}
          <div className={viewMode === 'list' ? 'text-right' : ''}>
            <div className="mb-3">
              <div className="text-lg font-bold text-gray-800">
                ${product.price}
              </div>
              {product.originalPrice && (
                <div className="text-sm text-gray-500 line-through">
                  ${product.originalPrice}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/product/${product._id}`)}
                className="btn-primary text-sm px-3 py-2 flex items-center"
              >
                <span className="mr-1">View</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom py-6 md:py-8 px-4">
        {/* Header */}
        <div className="mb-6 md:mb-8 relative">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-navy-800 mb-2 md:mb-4">
                All Products
              </h1>
              <p className="text-sm md:text-base text-gray-600">
                Discover our complete collection of premium products
              </p>
            </div>
            
            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-white border border-gray-200 rounded-lg p-2 shadow-sm hover:shadow-md transition-all duration-200 hover:bg-gray-50 touch-manipulation min-h-[44px] min-w-[44px]"
              title="Refresh products from database"
            >
              <RefreshCw 
                className={`w-5 h-5 text-gray-600 ${
                  refreshing ? 'animate-spin' : 'hover:text-primary-600'
                }`} 
              />
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 mb-6 md:mb-8">
          <div className="flex flex-col gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 md:pl-10 pr-4 py-2.5 md:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm md:text-base touch-manipulation"
                />
              </div>
            </form>

            {/* Filters Row */}
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="flex-1 sm:flex-none px-3 md:px-4 py-2.5 md:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm md:text-base touch-manipulation min-h-[44px]"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              {/* Top Selling Toggle */}
              <label className="flex-1 sm:flex-none flex items-center px-3 md:px-4 py-2.5 md:py-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 touch-manipulation min-h-[44px]">
                <input
                  type="checkbox"
                  checked={topSellingOnly}
                  onChange={(e) => {
                    setTopSellingOnly(e.target.checked);
                    setCurrentPage(1);
                  }}
                  className="mr-2 text-primary-500 focus:ring-primary-500"
                />
                <span className="text-xs md:text-sm text-gray-700 whitespace-nowrap">Top Selling Only</span>
              </label>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="flex-1 sm:flex-none px-3 md:px-4 py-2.5 md:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm md:text-base touch-manipulation min-h-[44px]"
              >
                <option value="latest">Latest</option>
                <option value="name">Name A-Z</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="rating">Rating</option>
              </select>

              {/* View Mode - Hidden on mobile */}
              <div className="hidden sm:flex border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 md:p-3 touch-manipulation ${viewMode === 'grid' ? 'bg-primary-500 text-white' : 'text-gray-400'}`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2.5 md:p-3 touch-manipulation ${viewMode === 'list' ? 'bg-primary-500 text-white' : 'text-gray-400'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
            <div className="text-xs md:text-sm text-gray-600">
              Showing {products.length} of {totalProducts} products
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <AnimatePresence>
          {error ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 md:py-16 px-4">
              <p className="text-sm md:text-base text-gray-600 mb-4">{error}</p>
              <button onClick={loadProducts} className="btn-primary">
                Try Again
              </button>
            </motion.div>
          ) : products.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 md:py-16 px-4">
              <p className="text-sm md:text-base text-gray-600 mb-4">No products found</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setTopSellingOnly(false);
                  setSortBy('latest');
                }}
                className="btn-secondary"
              >
                Clear Filters
              </button>
            </motion.div>
          ) : (
            <motion.div
              layout
              className={`${
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6'
                  : 'space-y-4'
              }`}
            >
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-12">
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              
              {[...Array(Math.min(totalPages, 5))].map((_, index) => {
                const page = index + 1;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 border rounded-lg ${
                      currentPage === page
                        ? 'bg-primary-500 text-white border-primary-500'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { productsAPI } from '../utils/api';
import { handleApiError } from '../utils/api';
import { formatCurrency } from '../utils/helpers';
import toast from 'react-hot-toast';
import { Search, Grid, List, Star, ExternalLink, RefreshCw, Filter, TrendingUp } from 'lucide-react';
import SEO from '../components/SEO';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [networks, setNetworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Filters and search
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || searchParams.get('q') || '');
  const [selectedCategories, setSelectedCategories] = useState(
    searchParams.get('categories')?.split(',').filter(Boolean) || []
  );
  const [selectedNetworks, setSelectedNetworks] = useState(
    searchParams.get('networks')?.split(',').filter(Boolean) || []
  );
  const [priceRange, setPriceRange] = useState({
    min: searchParams.get('min_price') || '',
    max: searchParams.get('max_price') || ''
  });
  const [topSellingOnly, setTopSellingOnly] = useState(searchParams.get('topSelling') === 'true');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'latest');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
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

      // If we have advanced filters or search, use POST /search endpoint
      const hasAdvancedFilters = selectedNetworks.length > 0 || priceRange.min || priceRange.max || searchTerm;
      
      if (hasAdvancedFilters) {
        // Use search endpoint for advanced filtering
        const response = await productsAPI.searchProducts({
          search: searchTerm || undefined,
          categories: selectedCategories,
          networks: selectedNetworks,
          minPrice: priceRange.min || undefined,
          maxPrice: priceRange.max || undefined,
          sort: sortBy,
          limit: 100 // Get more for advanced search
        });

        if (response.data.success) {
          let products = response.data.data.products || [];
          
          // Apply topSelling filter client-side if needed
          if (topSellingOnly) {
            products = products.filter(p => p.topSelling);
          }
          
          // Client-side pagination
          const startIndex = (currentPage - 1) * 12;
          const endIndex = startIndex + 12;
          const paginatedProducts = products.slice(startIndex, endIndex);
          
          setProducts(paginatedProducts);
          setTotalPages(Math.ceil(products.length / 12));
          setTotalProducts(products.length);
        }
      } else {
        // Use simple GET endpoint for basic listing
        let sortField = 'createdAt';
        let sortOrder = 'desc';

        switch (sortBy) {
          case 'price_low':
            sortField = 'price';
            sortOrder = 'asc';
            break;
          case 'price_high':
            sortField = 'price';
            sortOrder = 'desc';
            break;
          case 'name':
            sortField = 'title';
            sortOrder = 'asc';
            break;
          case 'rating':
            sortField = 'clicks';
            sortOrder = 'desc';
            break;
          case 'latest':
          default:
            sortField = 'createdAt';
            sortOrder = 'desc';
        }

        const params = {
          page: currentPage,
          limit: 12,
          categories: selectedCategories.length ? selectedCategories.join(',') : undefined,
          topSelling: topSellingOnly || undefined,
          sortBy: sortField,
          sortOrder: sortOrder
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
  }, [currentPage, searchTerm, selectedCategories, selectedNetworks, priceRange, topSellingOnly, sortBy]);

  const handleRefresh = useCallback(() => {
    loadProducts();
    toast.success('Products refreshed from database');
  }, [loadProducts]);

  const loadCategories = useCallback(async () => {
    try {
      const [categoriesRes, networksRes] = await Promise.all([
        productsAPI.getCategories(),
        productsAPI.getNetworks()
      ]);
      
      if (categoriesRes.data.success) {
        setCategories(categoriesRes.data.data.categories);
      }
      
      if (networksRes.data.success) {
        setNetworks(networksRes.data.data.networks);
      }
    } catch (error) {
      console.error('Error loading filters:', error);
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
    if (selectedCategories.length) params.set('categories', selectedCategories.join(','));
    if (selectedNetworks.length) params.set('networks', selectedNetworks.join(','));
    if (priceRange.min) params.set('min_price', priceRange.min);
    if (priceRange.max) params.set('max_price', priceRange.max);
    if (topSellingOnly) params.set('topSelling', 'true');
    if (sortBy !== 'latest') params.set('sort', sortBy);
    if (currentPage > 1) params.set('page', currentPage.toString());
    
    setSearchParams(params);
  }, [searchTerm, selectedCategories, selectedNetworks, priceRange, topSellingOnly, sortBy, currentPage, setSearchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadProducts();
  };

  const toggleCategory = (category) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
    setCurrentPage(1);
  };

  const toggleNetwork = (network) => {
    setSelectedNetworks(prev => 
      prev.includes(network)
        ? prev.filter(n => n !== network)
        : [...prev, network]
    );
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategories([]);
    setSelectedNetworks([]);
    setPriceRange({ min: '', max: '' });
    setTopSellingOnly(false);
    setSortBy('latest');
    setCurrentPage(1);
  };

  const handlePopularSearch = (term) => {
    setSearchTerm(term);
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
              <div className="text-lg font-bold text-primary-600">
                {product.affiliateLinks && product.affiliateLinks.length > 1 
                  ? `From ${formatCurrency(product.price)}` 
                  : formatCurrency(product.price)}
              </div>
              {product.originalPrice && (
                <div className="text-sm text-gray-500 line-through">
                  {formatCurrency(product.originalPrice)}
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
      {/* SEO for Products Page */}
      <SEO 
        title={searchTerm 
          ? `${searchTerm} - Search Results | Purcmium` 
          : selectedCategories.length > 0 
            ? `${selectedCategories[0]} Products - Best Deals in Nepal | Purcmium`
            : 'All Products - Best Deals in Nepal | Purcmium'
        }
        description={searchTerm 
          ? `Buy "${searchTerm}" from top brands like Sony, Samsung, Apple, Nike, Dell, HP. Find the best deals in Nepal from Amazon, ShareASale, and premium retailers.`
          : selectedCategories.length > 0
            ? `Buy ${selectedCategories[0]} products from top brands at the best prices in Nepal. ${totalProducts} products available from Amazon, ShareASale, and more.`
            : `Buy products from top brands like Sony, Samsung, Apple, Nike, Adidas, Dell, HP, and more. ${totalProducts}+ verified products with direct links to Amazon, ShareASale, and premium retailers.`
        }
        keywords={searchTerm 
          ? `buy ${searchTerm}, ${searchTerm} Nepal, ${searchTerm} price, ${searchTerm} online shopping, Amazon ${searchTerm}, best ${searchTerm} deals Nepal`
          : selectedCategories.length > 0
            ? `buy ${selectedCategories.join(', ')}, Sony Nepal, Samsung Nepal, Apple Nepal, Nike Nepal, Dell Nepal, best deals Nepal, online shopping Nepal`
            : 'buy products Nepal, Sony Nepal, Samsung Nepal, Apple Nepal, Nike Nepal, Dell Nepal, HP Nepal, online shopping Nepal, Amazon Nepal, ShareASale Nepal'
        }
        url={`https://purcmium.com/products${searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : selectedCategories.length > 0 ? `?categories=${selectedCategories.join(',')}` : ''}`}
        type="website"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": searchTerm ? `${searchTerm} - Search Results` : "All Products",
          "description": `Browse ${searchTerm || 'all'} products at Purcmium`,
          "url": `https://purcmium.com/products`,
          "mainEntity": {
            "@type": "ItemList",
            "numberOfItems": totalProducts,
            "itemListElement": products.slice(0, 10).map((product, index) => ({
              "@type": "ListItem",
              "position": index + 1,
              "item": {
                "@type": "Product",
                "name": product.name,
                "description": product.description,
                "image": product.images?.[0],
                "offers": {
                  "@type": "Offer",
                  "priceCurrency": "NPR",
                  "price": product.price,
                  "availability": "https://schema.org/InStock"
                }
              }
            }))
          }
        }}
      />
      
      <div className="container-custom py-6 md:py-8 px-4">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8 relative">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-navy-800 mb-3 md:mb-4">
            {searchTerm ? 'Search Results' : 'All Products'}
          </h1>
          <p className="text-sm md:text-base text-gray-600 px-4">
            {searchTerm 
              ? `Find exactly what you're looking for from our premium collection` 
              : 'Discover our complete collection of premium products'}
          </p>
          
          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="absolute top-0 right-0 bg-white border border-gray-200 rounded-lg p-2 shadow-sm hover:shadow-md transition-all duration-200 hover:bg-gray-50 touch-manipulation min-h-[44px] min-w-[44px]"
            title="Refresh products from database"
          >
            <RefreshCw 
              className={`w-5 h-5 text-gray-600 ${
                refreshing ? 'animate-spin' : 'hover:text-primary-600'
              }`} 
            />
          </button>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 mb-6 md:mb-8">
          <form onSubmit={handleSearch} className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 md:w-6 md:h-6" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 md:pl-12 pr-16 md:pr-20 py-3 md:py-4 text-base md:text-lg border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent touch-manipulation"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 btn-primary px-3 md:px-6 py-1.5 md:py-2 text-xs md:text-sm touch-manipulation"
              >
                Search
              </button>
            </div>
          </form>

          {/* Popular Searches */}
          {!searchTerm && categories.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-gray-400" />
                <span className="text-xs md:text-sm font-medium text-gray-600">Popular Searches:</span>
              </div>
              <div className="flex flex-wrap gap-1.5 md:gap-2">
                {categories.slice(0, 10).map((term) => (
                  <button
                    key={term}
                    onClick={() => handlePopularSearch(term)}
                    className="px-2.5 md:px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs md:text-sm rounded-full transition-colors touch-manipulation min-h-[32px]"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Advanced Filters Toggle */}
          <div className="pt-4 border-t border-gray-100">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 touch-manipulation min-h-[44px] text-sm md:text-base"
            >
              <Filter className="w-4 h-4" />
              Advanced Filters
              {(selectedCategories.length > 0 || selectedNetworks.length > 0 || priceRange.min || priceRange.max || topSellingOnly) && (
                <span className="bg-primary-100 text-primary-600 text-xs px-2 py-0.5 md:py-1 rounded-full">
                  Active
                </span>
              )}
            </button>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 pb-4">
                    {/* Categories */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-800 mb-3 text-sm md:text-base flex items-center">
                        <Filter className="w-4 h-4 mr-2" />
                        Categories
                      </h3>
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                        {categories.length > 0 ? categories.map((category) => (
                          <label key={category} className="flex items-center cursor-pointer hover:bg-white p-2 rounded transition-colors">
                            <input
                              type="checkbox"
                              checked={selectedCategories.includes(category)}
                              onChange={() => toggleCategory(category)}
                              className="mr-2 text-primary-500 focus:ring-primary-500 w-4 h-4 flex-shrink-0"
                            />
                            <span className="text-xs md:text-sm text-gray-700 truncate">{category}</span>
                          </label>
                        )) : (
                          <p className="text-xs text-gray-500">No categories available</p>
                        )}
                      </div>
                    </div>

                    {/* Networks */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-800 mb-3 text-sm md:text-base flex items-center">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Networks
                      </h3>
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                        {networks.length > 0 ? networks.map((network) => (
                          <label key={network} className="flex items-center cursor-pointer hover:bg-white p-2 rounded transition-colors">
                            <input
                              type="checkbox"
                              checked={selectedNetworks.includes(network)}
                              onChange={() => toggleNetwork(network)}
                              className="mr-2 text-primary-500 focus:ring-primary-500 w-4 h-4 flex-shrink-0"
                            />
                            <span className="text-xs md:text-sm text-gray-700 truncate">{network}</span>
                          </label>
                        )) : (
                          <p className="text-xs text-gray-500">No networks available</p>
                        )}
                      </div>
                    </div>

                    {/* Price Range */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-800 mb-3 text-sm md:text-base">Price Range (₹)</h3>
                      <div className="space-y-3">
                        <div className="flex flex-col gap-2">
                          <input
                            type="number"
                            placeholder="Min Price"
                            value={priceRange.min}
                            onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm bg-white"
                          />
                          <input
                            type="number"
                            placeholder="Max Price"
                            value={priceRange.max}
                            onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm bg-white"
                          />
                        </div>
                        {(priceRange.min || priceRange.max) && (
                          <p className="text-xs text-gray-600">
                            {priceRange.min && `Min: ₹${priceRange.min}`}
                            {priceRange.min && priceRange.max && ' - '}
                            {priceRange.max && `Max: ₹${priceRange.max}`}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Top Selling Filter */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-800 mb-3 text-sm md:text-base">Quick Filters</h3>
                      <div className="space-y-3">
                        <label className="flex items-center cursor-pointer hover:bg-white p-2 rounded transition-colors">
                          <input
                            type="checkbox"
                            checked={topSellingOnly}
                            onChange={(e) => {
                              setTopSellingOnly(e.target.checked);
                              setCurrentPage(1);
                            }}
                            className="mr-2 text-primary-500 focus:ring-primary-500 w-4 h-4 flex-shrink-0"
                          />
                          <span className="text-xs md:text-sm text-gray-700">Top Selling Only</span>
                        </label>
                        {(selectedCategories.length > 0 || selectedNetworks.length > 0 || priceRange.min || priceRange.max || topSellingOnly) && (
                          <button 
                            onClick={clearFilters}
                            className="w-full text-xs md:text-sm text-red-600 hover:text-red-700 font-medium py-2 px-3 bg-white rounded-lg hover:bg-red-50 transition-colors"
                          >
                            Clear All Filters
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Sort & View Options */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
                {(selectedCategories.length > 0 || selectedNetworks.length > 0 || priceRange.min || priceRange.max || topSellingOnly) && (
                  <span className="flex items-center gap-2">
                    <span className="font-medium">{selectedCategories.length + selectedNetworks.length + (priceRange.min ? 1 : 0) + (priceRange.max ? 1 : 0) + (topSellingOnly ? 1 : 0)} filters active</span>
                  </span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2 md:gap-3 items-stretch sm:items-center">
                {/* Sort Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
                  className="px-3 md:px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm md:text-base bg-white"
                >
                  <option value="latest">Latest First</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="name">Name: A to Z</option>
                  <option value="rating">Most Popular</option>
                </select>

                {/* View Mode Toggle - Desktop */}
                <div className="hidden sm:flex border border-gray-200 rounded-lg overflow-hidden bg-white">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2.5 transition-colors ${viewMode === 'grid' ? 'bg-primary-500 text-white' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
                    title="Grid View"
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2.5 transition-colors ${viewMode === 'list' ? 'bg-primary-500 text-white' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
                    title="List View"
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
            <div className="text-xs md:text-sm text-gray-600">
              {searchTerm && products.length > 0 && (
                <span>Found {totalProducts} result{totalProducts === 1 ? '' : 's'} for "{searchTerm}" • </span>
              )}
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
              <button onClick={() => loadProducts()} className="btn-primary">
                Try Again
              </button>
            </motion.div>
          ) : products.length === 0 && !loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 md:py-16 px-4">
              <Search className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg md:text-xl font-semibold text-gray-700 mb-2">
                No products found
              </h3>
              <p className="text-sm md:text-base text-gray-500 mb-6">
                {searchTerm ? 'Try adjusting your search terms or filters' : 'No products available at the moment'}
              </p>
              <button
                onClick={clearFilters}
                className="btn-secondary"
              >
                Clear All Filters
              </button>
            </motion.div>
          ) : loading ? (
            <div className="text-center py-12">
              <div className="spinner mx-auto mb-4"></div>
              <p className="text-sm md:text-base text-gray-600">Loading products...</p>
            </div>
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
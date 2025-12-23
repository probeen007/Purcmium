import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { productsAPI } from '../utils/api';
import { handleApiError } from '../utils/api';
import toast from 'react-hot-toast';
import { Search, Filter, Star, ExternalLink, TrendingUp } from 'lucide-react';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [networks, setNetworks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Search and filters
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
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
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'relevance');
  const [showFilters, setShowFilters] = useState(false);
  
  // Popular searches
  const popularSearches = [
    'Electronics', 'Fashion', 'Home', 'Sports', 'Books',
    'Gaming', 'Beauty', 'Health', 'Travel', 'Food'
  ];

  const loadFilters = async () => {
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
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setProducts([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await productsAPI.searchProducts({
        search: searchTerm,
        categories: selectedCategories.length ? selectedCategories : undefined,
        networks: selectedNetworks.length ? selectedNetworks : undefined,
        minPrice: priceRange.min || undefined,
        maxPrice: priceRange.max || undefined,
        sortBy
      });

      if (response.data.success) {
        setProducts(response.data.data.products);
      }
    } catch (error) {
      console.error('Error searching products:', error);
      const { message } = handleApiError(error);
      setError(message);
      toast.error('Failed to search products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (searchTerm.trim()) {
      handleSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedCategories, selectedNetworks, priceRange, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleSearch();
  };

  const toggleCategory = (category) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleNetwork = (network) => {
    setSelectedNetworks(prev => 
      prev.includes(network)
        ? prev.filter(n => n !== network)
        : [...prev, network]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedNetworks([]);
    setPriceRange({ min: '', max: '' });
    setSortBy('relevance');
  };

  const handlePopularSearch = (term) => {
    setSearchTerm(term);
    // Trigger search after state update
    setTimeout(() => handleSearch(), 100);
  };

  const ProductCard = ({ product }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
    >
      <div className="relative aspect-square overflow-hidden">
        <img
          src={product.images?.[0] || '/api/placeholder/400/400'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {product.topSelling && (
          <div className="absolute top-3 left-3">
            <span className="bg-gold-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
              Top Selling
            </span>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <span className="bg-primary-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
            {product.network}
          </span>
        </div>
      </div>

      <div className="p-4">
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

        {/* Price and Actions */}
        <div className="flex justify-between items-center">
          <div>
            <div className="text-lg font-bold text-gray-800">
              ${product.price}
            </div>
          </div>

          <button
            onClick={() => navigate(`/product/${product._id}`)}
            className="btn-primary text-sm px-3 py-2 flex items-center"
          >
            <span className="mr-1">View</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom py-8">
        {/* Search Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-navy-800 mb-4">
            Search Products
          </h1>
          <p className="text-gray-600">
            Find exactly what you're looking for from our premium collection
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <form onSubmit={handleSearchSubmit} className="mb-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
              <input
                type="text"
                placeholder="Search for products, brands, or categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-20 py-4 text-lg border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 btn-primary px-6 py-2"
              >
                Search
              </button>
            </div>
          </form>

          {/* Popular Searches */}
          {!searchTerm && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-gray-400" />
                <span className="text-xs md:text-sm font-medium text-gray-600">Popular Searches:</span>
              </div>
              <div className="flex flex-wrap gap-1.5 md:gap-2">
                {popularSearches.map((term) => (
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

          {/* Advanced Filters */}
          <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-gray-100">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 touch-manipulation min-h-[44px] text-sm md:text-base"
            >
              <Filter className="w-4 h-4" />
              Advanced Filters
              {(selectedCategories.length > 0 || selectedNetworks.length > 0 || priceRange.min || priceRange.max) && (
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
                  className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6"
                >
                  {/* Categories */}
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2 md:mb-3 text-sm md:text-base">Categories</h3>
                    <div className="space-y-1.5 md:space-y-2 max-h-40 md:max-h-32 overflow-y-auto">
                      {categories.map((category) => (
                        <label key={category} className="flex items-center touch-manipulation min-h-[36px]">
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(category)}
                            onChange={() => toggleCategory(category)}
                            className="mr-2 text-primary-500 focus:ring-primary-500 w-4 h-4"
                          />
                          <span className="text-xs md:text-sm text-gray-700">{category}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Networks */}
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2 md:mb-3 text-sm md:text-base">Networks</h3>
                    <div className="space-y-1.5 md:space-y-2 max-h-40 md:max-h-32 overflow-y-auto">
                      {networks.map((network) => (
                        <label key={network} className="flex items-center touch-manipulation min-h-[36px]">
                          <input
                            type="checkbox"
                            checked={selectedNetworks.includes(network)}
                            onChange={() => toggleNetwork(network)}
                            className="mr-2 text-primary-500 focus:ring-primary-500 w-4 h-4"
                          />
                          <span className="text-xs md:text-sm text-gray-700">{network}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2 md:mb-3 text-sm md:text-base">Price Range</h3>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                        className="flex-1 px-2 md:px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm md:text-base touch-manipulation min-h-[44px]"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Filter Actions */}
            <div className="flex justify-between items-center mt-4">
              <div className="flex gap-4">
                <button onClick={handleSearch} className="btn-primary">
                  Apply Filters
                </button>
                <button onClick={clearFilters} className="btn-secondary">
                  Clear All
                </button>
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="relevance">Sort by Relevance</option>
                <option value="latest">Latest</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="rating">Rating</option>
                <option value="name">Name A-Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Search Results */}
        {loading && (
          <div className="text-center py-12">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-gray-600">Searching...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">{error}</p>
            <button onClick={handleSearch} className="btn-primary">
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && searchTerm && (
          <div className="mb-6">
            <p className="text-gray-600">
              {products.length === 0 
                ? `No results found for "${searchTerm}"`
                : `Found ${products.length} result${products.length === 1 ? '' : 's'} for "${searchTerm}"`
              }
            </p>
          </div>
        )}

        {/* Products Grid */}
        <AnimatePresence>
          {products.length > 0 && (
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* No Results */}
        {!loading && searchTerm && products.length === 0 && (
          <div className="text-center py-16">
            <div className="mb-6">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No products found
              </h3>
              <p className="text-gray-500 mb-6">
                Try adjusting your search terms or filters
              </p>
            </div>
            
            <div className="space-y-4">
              <button
                onClick={() => {
                  setSearchTerm('');
                  clearFilters();
                }}
                className="btn-secondary mr-4"
              >
                Clear Search
              </button>
              <button
                onClick={() => navigate('/products')}
                className="btn-primary"
              >
                Browse All Products
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
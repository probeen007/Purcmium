import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tag, Search, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const CategoriesAvailable = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get('/categories?active=true');
      if (response.data.success) {
        setCategories(response.data.data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <section className="py-12 md:py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        </div>
      </section>
    );
  }

  // Always show the section, even if no categories exist yet

  return (
    <section className="py-12 md:py-16 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 md:mb-12"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <Tag className="w-6 h-6 md:w-7 md:h-7 text-blue-600" />
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
              Categories Available
            </h2>
          </div>
          <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto">
            Explore our wide range of product categories
          </p>
        </motion.div>

        {/* Search Bar */}
        {categories.length > 8 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-md mx-auto mb-8"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search categories..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </motion.div>
        )}

        {/* Categories Grid */}
        {filteredCategories.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {filteredCategories.map((category, index) => (
            <motion.div
              key={category._id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                to={`/products?category=${encodeURIComponent(category.name)}`}
                className="group block"
              >
                <motion.div
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-4 md:p-6 text-center border border-gray-100 hover:border-blue-200"
                >
                  {/* Category Image */}
                  <div className="w-full h-32 md:h-40 lg:h-48 flex items-center justify-center p-6">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="max-w-full max-h-full object-contain"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://via.placeholder.com/400/4F46E5/ffffff?text=${category.name.charAt(0)}`;
                      }}
                    />
                  </div>

                  {/* Category Name */}
                  <h3 className="text-sm md:text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-300 line-clamp-2 min-h-[2.5rem] flex items-center justify-center">
                    {category.name}
                  </h3>

                  {/* Product Count Badge */}
                  {category.productCount > 0 && (
                    <div className="mt-2">
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                        {category.productCount} {category.productCount === 1 ? 'Product' : 'Products'}
                      </span>
                    </div>
                  )}
                </motion.div>
              </Link>
            </motion.div>
          ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="bg-white rounded-xl shadow-md p-8 max-w-md mx-auto">
              <Tag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {searchTerm ? `No categories found matching "${searchTerm}"` : 'No Categories Yet'}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm 
                  ? 'Try a different search term' 
                  : 'Categories will appear here once they are added by the admin'}
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear search
                </button>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default CategoriesAvailable;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, ChevronLeft, Tag } from 'lucide-react';
import ProductCard from '../ProductCard';
import { productsAPI } from '../../utils/api';
import api from '../../utils/api';

const CategoryProducts = () => {
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategoryProducts = async () => {
      try {
        // First fetch categories with images
        const categoriesRes = await api.get('/categories?active=true');
        if (categoriesRes.data.success) {
          const categoriesData = categoriesRes.data.data.categories;
          setCategories(categoriesData);
          
          // Load products for each category
          const categoryData = await Promise.all(
            categoriesData.slice(0, 6).map(async (categoryObj) => {
              const productsRes = await productsAPI.getProducts({
                categories: categoryObj.name,
                limit: 12
              });
              return {
                category: categoryObj.name,
                categoryImage: categoryObj.image,
                products: productsRes.data.data.products || []
              };
            })
          );
          
          // Filter out categories with no products
          setCategoryProducts(categoryData.filter(item => item.products.length > 0));
        }
      } catch (error) {
        console.error('Error loading category products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCategoryProducts();
  }, []);

  const scroll = (containerId, direction) => {
    const container = document.getElementById(containerId);
    if (container) {
      const scrollAmount = 400;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="spinner mx-auto mb-4"></div>
        <p className="text-gray-600">Loading categories...</p>
      </div>
    );
  }

  if (categoryProducts.length === 0) {
    return null;
  }

  return (
    <div className="container-custom px-4 py-12 md:py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-8 md:mb-12"
      >
        <div className="inline-flex items-center space-x-2 bg-purple-100 rounded-full px-3 py-1.5 md:px-4 md:py-2 mb-3 md:mb-4">
          <Tag className="w-3 h-3 md:w-4 md:h-4 text-purple-600" />
          <span className="text-xs md:text-sm font-semibold text-purple-700">
            Shop by Category
          </span>
        </div>
        
        <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-serif font-bold text-navy-800 mb-4 md:mb-6">
          Explore by{' '}
          <span className="text-gradient">Category</span>
        </h2>
        
        <p className="text-sm md:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto">
          Browse our extensive collection organized by categories for easier discovery
        </p>
      </motion.div>

      <div className="space-y-8 md:space-y-12">
        {categoryProducts.map(({ category, categoryImage, products }, idx) => (
          <motion.div
            key={category}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white rounded-2xl shadow-sm p-4 md:p-6"
          >
            {/* Category Header */}
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl flex items-center justify-center p-2">
                  <img 
                    src={categoryImage} 
                    alt={category}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://via.placeholder.com/200/4F46E5/ffffff?text=${category.charAt(0)}`;
                    }}
                  />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-navy-800">
                    {category}
                  </h3>
                  <p className="text-xs md:text-sm text-gray-500">
                    {products.length} product{products.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              
              <Link
                to={`/products?category=${category}`}
                className="text-primary-600 hover:text-primary-700 font-medium text-sm md:text-base flex items-center group"
              >
                View All
                <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Scrollable Products Container */}
            <div className="relative">
              {/* Scroll Buttons */}
              {products.length > 2 && (
                <>
                  <button
                    onClick={() => scroll(`category-${category}`, 'left')}
                    className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white shadow-lg rounded-full items-center justify-center hover:bg-gray-50 transition-colors"
                    aria-label="Scroll left"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-700" />
                  </button>
                  
                  <button
                    onClick={() => scroll(`category-${category}`, 'right')}
                    className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white shadow-lg rounded-full items-center justify-center hover:bg-gray-50 transition-colors"
                    aria-label="Scroll right"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-700" />
                  </button>
                </>
              )}

              {/* Products Horizontal Scroll */}
              <div
                id={`category-${category}`}
                className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
                style={{ scrollSnapType: 'x mandatory' }}
              >
                {products.map((product, productIdx) => (
                  <div
                    key={product._id}
                    className="flex-shrink-0 w-64 md:w-72 lg:w-80"
                    style={{ scrollSnapAlign: 'start' }}
                  >
                    <ProductCard product={product} index={productIdx} />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default CategoryProducts;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../utils/api';

const CategoriesSection = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories?active=true');
      if (response.data.success) {
        setCategories(response.data.data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleCategoryClick = (categoryName) => {
    navigate(`/products?category=${encodeURIComponent(categoryName)}`);
  };

  const sectionVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const titleVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <div className="container-custom">
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.h2 
            variants={titleVariants}
            className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-navy-800 mb-6"
          >
            Shop by{' '}
            <span className="text-gradient">Category</span>
          </motion.h2>

          <motion.p 
            variants={titleVariants}
            className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed"
          >
            Find exactly what you're looking for by browsing our carefully organized categories. 
            Each category is curated with the best products and deals.
          </motion.p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
          {categories.map((category, index) => (
            <motion.div
              key={category._id}
              variants={cardVariants}
              whileHover={{ 
                scale: 1.05,
                y: -10,
                transition: { duration: 0.3 }
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCategoryClick(category.name)}
              className="group cursor-pointer"
            >
              <div className="relative overflow-hidden bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 p-6 lg:p-8">
                {/* Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                
                {/* Brand Logo */}
                <div className="w-20 h-20 lg:w-24 lg:h-24 mb-4 mx-auto flex items-center justify-center">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://via.placeholder.com/200/4F46E5/ffffff?text=${category.name.charAt(0)}`;
                    }}
                  />
                </divcategory.productCount} {category.productCount === 1 ? 'product' : 'products'}
                  </p>
                </div>

                {/* Hover Arrow */}
                <div className="absolute bottom-4 right-4 transform translate-x-8 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center"
                  <p className="text-sm text-gray-500">
                    {typeof category.count === 'string' ? category.count : `${category.count}+`} products
                  </p>
                </div>

                {/* Hover Arrow */}
                <div className="absolute bottom-4 right-4 transform translate-x-8 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                  <div className={`w-8 h-8 bg-gradient-to-br ${category.color} rounded-full flex items-center justify-center`}>
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default CategoriesSection;
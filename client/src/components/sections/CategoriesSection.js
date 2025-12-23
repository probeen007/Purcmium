import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Smartphone, 
  Shirt, 
  Home, 
  Dumbbell, 
  Book, 
  Camera,
  Headphones,
  Watch
} from 'lucide-react';

const CategoriesSection = ({ categories = [] }) => {
  const navigate = useNavigate();

  const handleCategoryClick = (categoryName) => {
    navigate(`/products?category=${encodeURIComponent(categoryName)}`);
  };
  // Default categories with icons if no categories from API
  const defaultCategories = [
    { name: 'Electronics', icon: Smartphone, count: '1.2k', color: 'from-blue-500 to-blue-600' },
    { name: 'Fashion', icon: Shirt, count: '890', color: 'from-pink-500 to-pink-600' },
    { name: 'Home & Garden', icon: Home, count: '650', color: 'from-green-500 to-green-600' },
    { name: 'Sports & Fitness', icon: Dumbbell, count: '420', color: 'from-red-500 to-red-600' },
    { name: 'Books & Media', icon: Book, count: '320', color: 'from-purple-500 to-purple-600' },
    { name: 'Photography', icon: Camera, count: '280', color: 'from-yellow-500 to-yellow-600' },
    { name: 'Audio', icon: Headphones, count: '190', color: 'from-indigo-500 to-indigo-600' },
    { name: 'Watches', icon: Watch, count: '150', color: 'from-gray-500 to-gray-600' },
  ];

  const displayCategories = categories.length > 0 
    ? categories.map((cat, index) => ({
        name: cat,
        icon: defaultCategories[index % defaultCategories.length]?.icon || Smartphone,
        count: Math.floor(Math.random() * 1000) + 100, // Random count for demo
        color: defaultCategories[index % defaultCategories.length]?.color || 'from-blue-500 to-blue-600'
      }))
    : defaultCategories;

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
          {displayCategories.map((category, index) => (
            <motion.div
              key={category.name}
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
                <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                
                {/* Icon */}
                <div className={`w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br ${category.color} rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300`}>
                  <category.icon className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
                </div>

                {/* Category Info */}
                <div className="text-center">
                  <h3 className="text-lg lg:text-xl font-semibold text-navy-800 mb-2 group-hover:text-primary-600 transition-colors duration-300">
                    {category.name}
                  </h3>
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
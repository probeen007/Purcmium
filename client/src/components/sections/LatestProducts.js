import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, ChevronRight, TrendingUp, ChevronLeft } from 'lucide-react';
import ProductCard from '../ProductCard';

const LatestProducts = ({ products = [] }) => {
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

  return (
    <div className="container-custom px-4">
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {/* Section Header */}
        <div className="text-center mb-8 md:mb-12 lg:mb-16">
          <motion.div variants={titleVariants}>
            <div className="inline-flex items-center space-x-2 bg-green-100 rounded-full px-3 py-1.5 md:px-4 md:py-2 mb-3 md:mb-4">
              <Clock className="w-3 h-3 md:w-4 md:h-4 text-green-600" />
              <span className="text-xs md:text-sm font-semibold text-green-700">
                Fresh Arrivals
              </span>
            </div>
          </motion.div>

          <motion.h2 
            variants={titleVariants}
            className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-serif font-bold text-navy-800 mb-4 md:mb-6 px-4"
          >
            Latest{' '}
            <span className="text-gradient">Additions</span>
          </motion.h2>

          <motion.p 
            variants={titleVariants}
            className="text-sm md:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed px-4"
          >
            Stay ahead of the curve with our newest product additions. 
            Be the first to discover trending items and exclusive deals.
          </motion.p>
        </div>

        {/* Products Horizontal Scroll */}
        {products.length > 0 ? (
          <>
            <div className="relative mb-8 md:mb-12">
              {/* Scroll Buttons */}
              {products.length > 2 && (
                <>
                  <button
                    onClick={() => {
                      const container = document.getElementById('latest-products-scroll');
                      container?.scrollBy({ left: -400, behavior: 'smooth' });
                    }}
                    className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white shadow-lg rounded-full items-center justify-center hover:bg-gray-50 transition-colors"
                    aria-label="Scroll left"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-700" />
                  </button>
                  
                  <button
                    onClick={() => {
                      const container = document.getElementById('latest-products-scroll');
                      container?.scrollBy({ left: 400, behavior: 'smooth' });
                    }}
                    className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white shadow-lg rounded-full items-center justify-center hover:bg-gray-50 transition-colors"
                    aria-label="Scroll right"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-700" />
                  </button>
                </>
              )}
              
              <div
                id="latest-products-scroll"
                className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
                style={{ scrollSnapType: 'x mandatory' }}
              >
                {products.map((product, index) => (
                  <div
                    key={product._id}
                    className="flex-shrink-0 w-64 md:w-72 lg:w-80"
                    style={{ scrollSnapAlign: 'start' }}
                  >
                    <ProductCard
                      product={product}
                      index={index}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Load More Section */}
            <motion.div
              variants={titleVariants}
              className="text-center"
            >
              <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-8 lg:p-12 hover:border-primary-300 transition-colors duration-300">
                <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Want to see more?
                </h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  We add new products daily. Browse our complete catalog to discover more amazing deals.
                </p>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link to="/products" className="btn-primary inline-flex items-center">
                    Browse All Products
                  <ChevronRight className="w-5 h-5 ml-2" />
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </>
        ) : (
          <motion.div
            variants={titleVariants}
            className="text-center py-16"
          >
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              New Products Coming Soon
            </h3>
            <p className="text-gray-500 mb-6">
              We're constantly adding new products to our collection. Check back soon for the latest additions.
            </p>
            <Link to="/#top-selling" className="btn-primary">
              View Top Selling Products
            </Link>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default LatestProducts;
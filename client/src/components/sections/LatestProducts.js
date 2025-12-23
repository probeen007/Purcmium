import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, ArrowRight, TrendingUp } from 'lucide-react';
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
    <div className="container-custom">
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.div variants={titleVariants}>
            <div className="inline-flex items-center space-x-2 bg-green-100 rounded-full px-4 py-2 mb-4">
              <Clock className="w-4 h-4 text-green-600" />
              <span className="text-sm font-semibold text-green-700">
                Fresh Arrivals
              </span>
            </div>
          </motion.div>

          <motion.h2 
            variants={titleVariants}
            className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-navy-800 mb-6"
          >
            Latest{' '}
            <span className="text-gradient">Additions</span>
          </motion.h2>

          <motion.p 
            variants={titleVariants}
            className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed"
          >
            Stay ahead of the curve with our newest product additions. 
            Be the first to discover trending items and exclusive deals.
          </motion.p>
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-12">
              {products.map((product, index) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  index={index}
                />
              ))}
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
                    <ArrowRight className="w-5 h-5 ml-2" />
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
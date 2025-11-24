import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, ArrowRight, Sparkles } from 'lucide-react';
import ProductCard from '../ProductCard';

const FeaturedProducts = ({ products = [] }) => {
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
            <div className="inline-flex items-center space-x-2 bg-primary-100 rounded-full px-4 py-2 mb-4">
              <Star className="w-4 h-4 text-primary-600" />
              <span className="text-sm font-semibold text-primary-700">
                Handpicked for You
              </span>
            </div>
          </motion.div>

          <motion.h2 
            variants={titleVariants}
            className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-navy-800 mb-6"
          >
            Featured{' '}
            <span className="text-gradient">Premium</span>{' '}
            Products
          </motion.h2>

          <motion.p 
            variants={titleVariants}
            className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed"
          >
            Discover our carefully curated selection of the finest products. 
            Each item is handpicked for its exceptional quality and value.
          </motion.p>
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {products.map((product, index) => (
              <ProductCard
                key={product._id}
                product={product}
                index={index}
                featured={index === 0} // Make first product larger
              />
            ))}
          </div>
        ) : (
          <motion.div
            variants={titleVariants}
            className="text-center py-16"
          >
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Featured Products Yet
            </h3>
            <p className="text-gray-500 mb-6">
              Our team is working hard to curate the best products for you.
            </p>
            <Link to="/#products" className="btn-primary">
              Browse All Products
            </Link>
          </motion.div>
        )}

        {/* Call to Action */}
        {products.length > 0 && (
          <motion.div
            variants={titleVariants}
            className="text-center"
          >
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-8 lg:p-12">
              <h3 className="text-2xl lg:text-3xl font-serif font-bold text-navy-800 mb-4">
                Discover More Amazing Products
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Explore our full collection and find exactly what you're looking for.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link to="/#products" className="btn-primary inline-flex items-center">
                    View All Products
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link to="/#categories" className="btn-secondary">
                    Browse Categories
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Floating Elements */}
        <div className="absolute top-10 left-10 hidden xl:block">
          <motion.div
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "linear"
            }}
            className="w-16 h-16 bg-gradient-to-br from-gold-400/20 to-gold-600/20 rounded-full blur-sm"
          />
        </div>

        <div className="absolute bottom-10 right-10 hidden xl:block">
          <motion.div
            animate={{ 
              rotate: [360, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "linear"
            }}
            className="w-20 h-20 bg-gradient-to-br from-primary-400/20 to-primary-600/20 rounded-full blur-sm"
          />
        </div>
      </motion.div>
    </div>
  );
};

export default FeaturedProducts;
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
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
            <div className="inline-flex items-center space-x-2 bg-primary-100 rounded-full px-3 py-1.5 md:px-4 md:py-2 mb-3 md:mb-4">
              <Star className="w-3 h-3 md:w-4 md:h-4 text-primary-600" />
              <span className="text-xs md:text-sm font-semibold text-primary-700">
                Handpicked for You
              </span>
            </div>
          </motion.div>

          <motion.h2 
            variants={titleVariants}
            className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-serif font-bold text-navy-800 mb-4 md:mb-6 px-4"
          >
            Top Selling{' '}
            <span className="text-gradient">Premium</span>{' '}
            Products
          </motion.h2>

          <motion.p 
            variants={titleVariants}
            className="text-sm md:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed px-4"
          >
            Discover our carefully curated selection of the finest products. 
            Each item is handpicked for its exceptional quality and value.
          </motion.p>
        </div>

        {/* Products Horizontal Scroll */}
        {products.length > 0 ? (
          <div className="relative mb-8 md:mb-12">
            {/* Scroll Buttons */}
            {products.length > 2 && (
              <>
                <button
                  onClick={() => {
                    const container = document.getElementById('top-selling-scroll');
                    container?.scrollBy({ left: -400, behavior: 'smooth' });
                  }}
                  className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white shadow-lg rounded-full items-center justify-center hover:bg-gray-50 transition-colors"
                  aria-label="Scroll left"
                >
                <ChevronLeft className="w-5 h-5 text-gray-700" />
                  onClick={() => {
                    const container = document.getElementById('top-selling-scroll');
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
              id="top-selling-scroll"
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
                    topSelling={product.topSelling}
                  />
                </div>
              ))}
            </div>
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
              No Top Selling Products Yet
            </h3>
            <p className="text-gray-500 mb-6">
              Our team is working hard to curate the best products for you.
            </p>
            <Link to="/#products" className="btn-primary">
              Browse All Products
            </Link>
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
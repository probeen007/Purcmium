import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, ShoppingBag, Gift } from 'lucide-react';

const CTASection = () => {
  const sectionVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
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

  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <div className="container-custom relative">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-40 h-40 bg-gold-400/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-primary-400/10 rounded-full blur-3xl animate-pulse-slow delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
      </div>

      {/* Floating Icons */}
      <motion.div
        animate={{ 
          y: [-20, 20, -20],
          rotate: [0, 10, -10, 0]
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-16 right-20 hidden lg:block"
      >
        <div className="w-12 h-12 bg-gradient-to-br from-gold-400 to-gold-600 rounded-xl flex items-center justify-center shadow-lg">
          <Gift className="w-6 h-6 text-white" />
        </div>
      </motion.div>

      <motion.div
        animate={{ 
          y: [20, -20, 20],
          rotate: [0, -10, 10, 0]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
        className="absolute bottom-16 left-20 hidden lg:block"
      >
        <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center shadow-lg">
          <ShoppingBag className="w-5 h-5 text-white" />
        </div>
      </motion.div>

      <motion.div
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="relative z-10 text-center text-white"
      >
        {/* Badge */}
        <motion.div variants={titleVariants}>
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-2 mb-8">
            <Sparkles className="w-4 h-4 text-gold-400" />
            <span className="text-sm font-medium">Don't Miss Out</span>
          </div>
        </motion.div>

        {/* Main Heading */}
        <motion.h2 
          variants={titleVariants}
          className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-serif font-bold mb-6 leading-tight"
        >
          Ready to Discover{' '}
          <br className="hidden md:block" />
          <span className="relative">
            <span className="bg-gradient-to-r from-gold-400 via-gold-300 to-gold-500 bg-clip-text text-transparent">
              Amazing Products
            </span>
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: "100%" }}
              viewport={{ once: true }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="absolute bottom-2 left-0 h-1 bg-gradient-to-r from-gold-400 to-gold-600 rounded-full"
            />
          </span>
          ?
        </motion.h2>

        {/* Subtitle */}
        <motion.p 
          variants={titleVariants}
          className="text-lg md:text-xl lg:text-2xl text-gray-200 max-w-3xl mx-auto mb-12 leading-relaxed"
        >
          Join thousands of satisfied customers who've found their perfect products 
          with our curated selection of premium items at unbeatable prices.
        </motion.p>

        {/* Stats Row */}
        <motion.div 
          variants={titleVariants}
          className="flex justify-center items-center space-x-8 mb-12"
        >
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-gold-400">10K+</div>
            <div className="text-sm text-gray-300">Products</div>
          </div>
          <div className="w-px h-12 bg-white/20"></div>
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-gold-400">50K+</div>
            <div className="text-sm text-gray-300">Customers</div>
          </div>
          <div className="w-px h-12 bg-white/20"></div>
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-gold-400">98%</div>
            <div className="text-sm text-gray-300">Satisfaction</div>
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <motion.div
            variants={buttonVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link 
              to="/#featured"
              className="btn-gold text-lg px-8 py-4 inline-flex items-center shadow-2xl"
            >
              <ShoppingBag className="w-5 h-5 mr-2" />
              Start Shopping Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </motion.div>

          <motion.div
            variants={buttonVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link 
              to="/#categories"
              className="bg-white/10 hover:bg-white/20 border-2 border-white/30 text-white hover:border-white/50 font-medium py-4 px-8 rounded-lg transition-all duration-200 ease-in-out text-lg inline-flex items-center backdrop-blur-sm"
            >
              Browse Categories
            </Link>
          </motion.div>
        </div>

        {/* Additional Info */}
        <motion.div 
          variants={titleVariants}
          className="mt-12 pt-8 border-t border-white/20"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Quality Guaranteed</h3>
              <p className="text-sm text-gray-300">Premium products from trusted brands</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Best Prices</h3>
              <p className="text-sm text-gray-300">Exclusive deals and competitive pricing</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Fast & Secure</h3>
              <p className="text-sm text-gray-300">Quick delivery and secure transactions</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default CTASection;
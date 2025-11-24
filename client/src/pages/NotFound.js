import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Search, ArrowLeft, Sparkles } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-gray-100 flex items-center justify-center px-4">
      <div className="max-w-md mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* 404 Number */}
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative mb-8"
          >
            <h1 className="text-8xl lg:text-9xl font-bold text-primary-600/20 select-none">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-16 h-16 text-primary-600" />
            </div>
          </motion.div>

          {/* Main Message */}
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-2xl lg:text-3xl font-serif font-bold text-navy-800 mb-4"
          >
            Oops! Page Not Found
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-gray-600 mb-8 leading-relaxed"
          >
            The page you're looking for doesn't exist or has been moved. 
            Don't worry, let's get you back on track with some amazing products!
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/" className="btn-primary inline-flex items-center justify-center">
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
            
            <Link to="/#products" className="btn-secondary inline-flex items-center justify-center">
              <Search className="w-4 h-4 mr-2" />
              Browse Products
            </Link>
          </motion.div>

          {/* Suggested Actions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-12 p-6 bg-white rounded-xl shadow-sm border border-gray-200"
          >
            <h3 className="text-lg font-semibold text-navy-800 mb-4">
              While you're here...
            </h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-primary-600 rounded-full mr-3"></div>
                Check out our featured products
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-primary-600 rounded-full mr-3"></div>
                Browse by category
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-primary-600 rounded-full mr-3"></div>
                Discover the latest arrivals
              </div>
            </div>
          </motion.div>

          {/* Go Back Button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            onClick={() => window.history.back()}
            className="mt-6 text-primary-600 hover:text-primary-700 inline-flex items-center text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Go back to previous page
          </motion.button>
        </motion.div>

        {/* Floating Elements */}
        <motion.div
          animate={{ 
            y: [-10, 10, -10],
            rotate: [0, 5, -5, 0]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-20 right-20 w-8 h-8 bg-gold-400/20 rounded-full blur-sm hidden lg:block"
        />

        <motion.div
          animate={{ 
            y: [10, -10, 10],
            rotate: [0, -5, 5, 0]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute bottom-20 left-20 w-6 h-6 bg-primary-400/20 rounded-full blur-sm hidden lg:block"
        />
      </div>
    </div>
  );
};

export default NotFound;
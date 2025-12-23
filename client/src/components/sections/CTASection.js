import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ShoppingBag, Gift } from 'lucide-react';

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
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4 md:gap-6">
          <motion.div
            variants={buttonVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full sm:w-auto"
          >
            <Link 
              to="/products?topSelling=true"
              className="btn-gold text-base md:text-lg px-6 md:px-8 py-3 md:py-4 inline-flex items-center justify-center shadow-2xl w-full sm:w-auto"
            >
              <ShoppingBag className="w-4 h-4 md:w-5 md:h-5 mr-2" />
              Start Shopping Now
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2" />
            </Link>
          </motion.div>

          <motion.div
            variants={buttonVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full sm:w-auto"
          >
            <Link 
              to="/products"
              className="bg-white/10 hover:bg-white/20 border-2 border-white/30 text-white hover:border-white/50 font-medium py-3 md:py-4 px-6 md:px-8 rounded-lg transition-all duration-200 ease-in-out text-base md:text-lg inline-flex items-center justify-center backdrop-blur-sm w-full sm:w-auto touch-manipulation min-h-[52px]"
            >
              Browse Categories
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default CTASection;
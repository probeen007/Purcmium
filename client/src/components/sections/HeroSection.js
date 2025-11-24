import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Star, TrendingUp, Shield } from 'lucide-react';

const HeroSection = () => {
  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const features = [
    {
      icon: Star,
      title: "Premium Quality",
      description: "Curated products from trusted brands"
    },
    {
      icon: TrendingUp,
      title: "Best Deals",
      description: "Exclusive offers and competitive prices"
    },
    {
      icon: Shield,
      title: "Secure Shopping",
      description: "Safe and protected transactions"
    }
  ];

  return (
    <section className="relative min-h-screen flex items-center bg-hero-gradient overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gold-400/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl animate-pulse-slow delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/5 rounded-full blur-3xl"></div>
      </div>

      {/* Floating Elements */}
      <motion.div
        animate={{ 
          y: [-20, 20, -20],
          rotate: [0, 5, -5, 0]
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-32 right-20 hidden lg:block"
      >
        <div className="w-16 h-16 bg-gradient-to-br from-gold-400 to-gold-600 rounded-2xl flex items-center justify-center shadow-xl">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
      </motion.div>

      <motion.div
        animate={{ 
          y: [20, -20, 20],
          rotate: [0, -5, 5, 0]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
        className="absolute bottom-32 left-20 hidden lg:block"
      >
        <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
          <Star className="w-6 h-6 text-white" />
        </div>
      </motion.div>

      <div className="container-custom relative z-10">
        <div className="max-w-4xl mx-auto text-center text-white">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            {/* Badge */}
            <motion.div variants={fadeInUp}>
              <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-2 mb-6">
                <Sparkles className="w-4 h-4 text-gold-400" />
                <span className="text-sm font-medium">Premium Products Await</span>
              </div>
            </motion.div>

            {/* Main Heading */}
            <motion.h1 
              variants={fadeInUp}
              className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-serif font-bold leading-tight"
            >
              Discover{' '}
              <span className="relative">
                <span className="bg-gradient-to-r from-gold-400 via-gold-300 to-gold-500 bg-clip-text text-transparent">
                  Premium
                </span>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 1.5, duration: 0.8 }}
                  className="absolute bottom-2 left-0 h-1 bg-gradient-to-r from-gold-400 to-gold-600 rounded-full"
                />
              </span>
              <br />
              Products That Matter
            </motion.h1>

            {/* Subtitle */}
            <motion.p 
              variants={fadeInUp}
              className="text-lg md:text-xl lg:text-2xl text-gray-200 max-w-2xl mx-auto leading-relaxed"
            >
              Curated selection of the finest products from trusted brands. 
              Find exactly what you need with exclusive deals and premium quality guaranteed.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              variants={fadeInUp}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link 
                  to="/products?featured=true"
                  className="btn-gold text-lg px-8 py-4 inline-flex items-center"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Shop Featured Products
                </Link>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link 
                  to="/products"
                  className="btn-secondary bg-white/10 border-white/30 text-white hover:bg-white/20 text-lg px-8 py-4"
                >
                  Browse All Products
                </Link>
              </motion.div>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div 
              variants={fadeInUp}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 pt-8 border-t border-white/20"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  variants={fadeInUp}
                  className="text-center group"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl mb-4 group-hover:bg-white/20 transition-colors duration-300">
                    <feature.icon className="w-6 h-6 text-gold-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-300 text-sm">{feature.description}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Stats */}
            <motion.div 
              variants={fadeInUp}
              className="flex justify-center items-center space-x-8 mt-12 pt-8"
            >
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-gold-400">10K+</div>
                <div className="text-sm text-gray-300">Happy Customers</div>
              </div>
              <div className="w-px h-12 bg-white/20"></div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-gold-400">50K+</div>
                <div className="text-sm text-gray-300">Products Sold</div>
              </div>
              <div className="w-px h-12 bg-white/20"></div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-gold-400">98%</div>
                <div className="text-sm text-gray-300">Satisfaction Rate</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 hidden lg:block"
      >
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white rounded-full mt-2"></div>
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
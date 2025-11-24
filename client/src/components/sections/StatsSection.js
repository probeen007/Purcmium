import React from 'react';
import { motion } from 'framer-motion';
import { Users, ShoppingBag, TrendingUp, Award } from 'lucide-react';
import { formatNumber } from '../../utils/helpers';

const StatsSection = () => {
  const stats = [
    {
      icon: Users,
      value: '50,000+',
      label: 'Happy Customers',
      description: 'Satisfied shoppers worldwide'
    },
    {
      icon: ShoppingBag,
      value: '100,000+',
      label: 'Products Sold',
      description: 'Successfully delivered'
    },
    {
      icon: TrendingUp,
      value: '98%',
      label: 'Satisfaction Rate',
      description: 'Customer approval rating'
    },
    {
      icon: Award,
      value: '500+',
      label: 'Premium Brands',
      description: 'Trusted partnerships'
    }
  ];

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

  const statVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.8 },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const countVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 1, delay: 0.5 }
    }
  };

  return (
    <div className="container-custom relative">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-gold-400/10 rounded-full blur-2xl"></div>
      </div>

      <motion.div
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="relative z-10"
      >
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.h2 
            variants={titleVariants}
            className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-white mb-6"
          >
            Trusted by{' '}
            <span className="text-gold-gradient">Thousands</span>
          </motion.h2>

          <motion.p 
            variants={titleVariants}
            className="text-lg text-gray-200 max-w-2xl mx-auto leading-relaxed"
          >
            Join our growing community of satisfied customers who trust us 
            to deliver quality products and exceptional service.
          </motion.p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              variants={statVariants}
              whileHover={{ 
                scale: 1.05,
                y: -10,
                transition: { duration: 0.3 }
              }}
              className="text-center group"
            >
              <div className="relative">
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-white/10 rounded-2xl blur-xl group-hover:bg-white/20 transition-all duration-300"></div>
                
                {/* Card Content */}
                <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-6 lg:p-8 border border-white/20 group-hover:border-white/30 transition-all duration-300">
                  {/* Icon */}
                  <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-gold-400 to-gold-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <stat.icon className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
                  </div>

                  {/* Value */}
                  <motion.div
                    variants={countVariants}
                    className="mb-2"
                  >
                    <div className="text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-2">
                      <AnimatedNumber value={stat.value} />
                    </div>
                  </motion.div>

                  {/* Label */}
                  <h3 className="text-lg lg:text-xl font-semibold text-gold-400 mb-2">
                    {stat.label}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-300">
                    {stat.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Section */}
        <motion.div
          variants={titleVariants}
          className="text-center mt-16"
        >
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 lg:p-12 border border-white/20">
            <h3 className="text-2xl lg:text-3xl font-serif font-bold text-white mb-4">
              Ready to Join Our Community?
            </h3>
            <p className="text-gray-200 mb-8 max-w-md mx-auto">
              Experience the difference of premium products and exceptional service. 
              Start shopping today!
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-gold text-lg px-8 py-4"
            >
              Start Shopping Now
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

// Animated Number Component
const AnimatedNumber = ({ value }) => {
  return (
    <motion.span
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ 
        duration: 0.8,
        delay: 0.5,
        ease: "easeOut"
      }}
    >
      {value}
    </motion.span>
  );
};

export default StatsSection;
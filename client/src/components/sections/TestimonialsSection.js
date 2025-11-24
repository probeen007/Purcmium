import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const TestimonialsSection = () => {
  const testimonials = [
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'Fashion Blogger',
      avatar: '/api/placeholder/64/64',
      rating: 5,
      text: "Purcmium has completely transformed my shopping experience. The curated selection is incredible, and I always find exactly what I'm looking for at amazing prices.",
      highlight: "incredible selection"
    },
    {
      id: 2,
      name: 'Michael Chen',
      role: 'Tech Enthusiast',
      avatar: '/api/placeholder/64/64',
      rating: 5,
      text: "The quality of products and customer service is outstanding. I've been shopping here for months and every purchase has exceeded my expectations.",
      highlight: "outstanding quality"
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      role: 'Home Designer',
      avatar: '/api/placeholder/64/64',
      rating: 5,
      text: "As someone who values premium quality, Purcmium delivers every time. The attention to detail in product curation is what sets them apart from other platforms.",
      highlight: "premium quality"
    },
    {
      id: 4,
      name: 'David Thompson',
      role: 'Fitness Coach',
      avatar: '/api/placeholder/64/64',
      rating: 5,
      text: "I love how easy it is to discover new products that actually meet my standards. The recommendations are spot-on, and the deals are unbeatable.",
      highlight: "unbeatable deals"
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

  const cardVariants = {
    hidden: { opacity: 0, y: 50, rotateX: -10 },
    visible: { 
      opacity: 1, 
      y: 0,
      rotateX: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const StarRating = ({ rating }) => (
    <div className="flex items-center space-x-1">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < rating 
              ? 'text-gold-400 fill-current' 
              : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );

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
            What Our{' '}
            <span className="text-gradient">Customers</span>{' '}
            Say
          </motion.h2>

          <motion.p 
            variants={titleVariants}
            className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed"
          >
            Don't just take our word for it. Here's what our satisfied customers 
            have to say about their shopping experience with us.
          </motion.p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              variants={cardVariants}
              whileHover={{ 
                scale: 1.02,
                y: -5,
                transition: { duration: 0.3 }
              }}
              className="group relative"
            >
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 relative overflow-hidden">
                {/* Background Quote */}
                <div className="absolute top-4 right-4 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
                  <Quote className="w-16 h-16 text-primary-600" />
                </div>

                {/* Quote Icon */}
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mb-6">
                  <Quote className="w-5 h-5 text-white" />
                </div>

                {/* Rating */}
                <div className="mb-4">
                  <StarRating rating={testimonial.rating} />
                </div>

                {/* Testimonial Text */}
                <blockquote className="text-gray-700 text-lg leading-relaxed mb-6 relative">
                  "{testimonial.text}"
                </blockquote>

                {/* Customer Info */}
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mr-4 overflow-hidden">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 rounded-full items-center justify-center text-white font-semibold text-sm hidden">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold text-navy-800">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {testimonial.role}
                    </div>
                  </div>
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          variants={titleVariants}
          className="text-center"
        >
          <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-8 lg:p-12">
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-8 h-8 text-gold-400 fill-current" />
                ))}
              </div>
              <span className="text-2xl font-bold text-navy-800 ml-4">4.9/5</span>
            </div>
            
            <h3 className="text-2xl lg:text-3xl font-serif font-bold text-navy-800 mb-4">
              Join Over 50,000 Happy Customers
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Experience the difference of premium quality and exceptional service. 
              Your satisfaction is our guarantee.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary"
              >
                Start Shopping
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-secondary"
              >
                Read More Reviews
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 hidden xl:block">
          <motion.div
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear"
            }}
            className="w-12 h-12 bg-gold-400/20 rounded-full blur-sm"
          />
        </div>

        <div className="absolute bottom-20 right-10 hidden xl:block">
          <motion.div
            animate={{ 
              rotate: [360, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "linear"
            }}
            className="w-16 h-16 bg-primary-400/20 rounded-full blur-sm"
          />
        </div>
      </motion.div>
    </div>
  );
};

export default TestimonialsSection;
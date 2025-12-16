import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Tag, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../utils/helpers';
import { trackingAPI } from '../utils/api';

const ProductCard = memo(({ product, index = 0, featured = false }) => {
  const handleProductClick = async () => {
    try {
      // Track click
      await trackingAPI.trackClick({
        productId: product._id,
        referrer: window.location.href,
        userAgent: navigator.userAgent
      });
    } catch (error) {
      console.error('Error tracking click:', error);
    }
  };



  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0.9
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        delay: index * 0.1,
        ease: "easeOut"
      }
    }
  };

  const hoverVariants = {
    hover: {
      y: -10,
      scale: 1.02,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      whileHover="hover"
      viewport={{ once: true, margin: "-50px" }}
      className={`group relative ${featured ? 'lg:col-span-2 lg:row-span-2' : ''}`}
    >
      <Link to={`/product/${product.slug || product._id}`} onClick={handleProductClick}>
        <motion.div
          variants={hoverVariants}
          className={`card-premium overflow-hidden h-full ${
            featured ? 'min-h-[400px] lg:min-h-[500px]' : 'min-h-[350px]'
          }`}
        >
        {/* Featured Badge */}
        {product.featured && (
          <div className="absolute top-4 left-4 z-10">
            <div className="bg-gradient-to-r from-gold-500 to-gold-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center">
              <Star className="w-3 h-3 mr-1" />
              Featured
            </div>
          </div>
        )}

        {/* Multiple Links Badge */}
        {product.affiliateLinks && product.affiliateLinks.length > 1 && (
          <div className="absolute top-4 right-4 z-10">
            <div className="bg-navy-800/90 backdrop-blur-sm text-white px-2 py-1 rounded text-xs font-medium">
              {product.affiliateLinks.length} Links
            </div>
          </div>
        )}

        {/* Product Image */}
        <div className={`relative overflow-hidden ${featured ? 'h-64 lg:h-80' : 'h-48'}`}>
          <img
            src={product.images[0] || '/api/placeholder/400/300'}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
            onError={(e) => {
              e.target.src = '/api/placeholder/400/300';
            }}
          />
          
          {/* Hover Effect Overlay */}
          <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </div>

        {/* Product Info */}
        <div className={`p-6 ${featured ? 'lg:p-8' : ''}`}>
          {/* Categories */}
          {product.categories && product.categories.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {product.categories.slice(0, 2).map((category, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                >
                  <Tag className="w-3 h-3 mr-1" />
                  {category}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h3 className={`font-semibold text-navy-800 mb-2 group-hover:text-primary-600 transition-colors duration-200 ${
            featured ? 'text-xl lg:text-2xl' : 'text-lg'
          } line-clamp-2`}>
            {product.title}
          </h3>

          {/* Short Description */}
          <p className={`text-gray-600 mb-4 ${featured ? 'text-base' : 'text-sm'} line-clamp-2`}>
            {product.shortDescription}
          </p>

          {/* Price and Stats */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-col">
              <span className={`font-bold text-primary-600 ${featured ? 'text-2xl' : 'text-xl'}`}>
                {formatCurrency(product.price)}
              </span>
              {product.clicks > 0 && (
                <span className="text-xs text-gray-500 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {product.clicks} clicks
                </span>
              )}
            </div>
          </div>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {product.tags.slice(0, 3).map((tag, idx) => (
                <span
                  key={idx}
                  className="text-xs text-primary-600 bg-primary-50 px-2 py-1 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Hover Effect Overlay */}
        <div className="absolute inset-0 ring-2 ring-transparent group-hover:ring-primary-200 rounded-xl transition-all duration-300 pointer-events-none" />
        </motion.div>
      </Link>
    </motion.div>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
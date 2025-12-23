import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  ExternalLink, 
  Star, 
  Tag, 
  TrendingUp, 
  Share2,
  ShoppingCart,
  Check,
  AlertCircle
} from 'lucide-react';
import { productsAPI, trackingAPI } from '../utils/api';
import { handleApiError } from '../utils/api';
import { formatCurrency, formatRelativeTime } from '../utils/helpers';
import toast from 'react-hot-toast';

const ProductDetail = () => {
  const { identifier } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const loadProduct = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await productsAPI.getProduct(identifier);

      if (response.data.success) {
        setProduct(response.data.data.product);
      } else {
        setError('Product not found');
      }
    } catch (error) {
      console.error('Error loading product:', error);
      const { message } = handleApiError(error);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [identifier]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  const handleAffiliateClick = async (affiliateUrl, networkName = 'Unknown') => {
    try {
      // Track click
      await trackingAPI.trackClick({
        productId: product._id,
        referrer: window.location.href,
        userAgent: navigator.userAgent,
        network: networkName
      });
      
      // Open affiliate link
      window.open(affiliateUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Error tracking click:', error);
      // Still open the link even if tracking fails
      window.open(affiliateUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: product.shortDescription,
          url: window.location.href
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product details...</p>
        </motion.div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Product Not Found
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link to="/" className="btn-primary">
            Back to Home
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container-custom py-4">
          <motion.nav
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-2 text-sm"
          >
            <Link to="/" className="text-primary-600 hover:text-primary-700">
              Home
            </Link>
            <span className="text-gray-400">/</span>
            {product.categories && product.categories[0] && (
              <>
                <span className="text-gray-600">{product.categories[0]}</span>
                <span className="text-gray-400">/</span>
              </>
            )}
            <span className="text-gray-800 font-medium truncate">
              {product.title}
            </span>
          </motion.nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-custom py-8 lg:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Back Button */}
          <Link 
            to="/"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Products
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* Product Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <motion.div
                layoutId="productImage"
                className="aspect-square bg-white rounded-2xl overflow-hidden shadow-lg"
              >
                <img
                  src={product.images[selectedImageIndex] || '/api/placeholder/600/600'}
                  alt={product.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = '/api/placeholder/600/600';
                  }}
                />
              </motion.div>

              {/* Image Thumbnails */}
              {product.images && product.images.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
                  {product.images.map((image, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden border-2 transition-colors touch-manipulation ${
                        selectedImageIndex === index
                          ? 'border-primary-500'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.title} ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = '/api/placeholder/80/80';
                        }}
                      />
                    </motion.button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Badges */}
              {product.topSelling && (
                <div className="mb-4">
                  <span className="inline-flex items-center bg-gradient-to-r from-gold-500 to-gold-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    <Star className="w-4 h-4 mr-1" />
                    Top Selling
                  </span>
                </div>
              )}

              {/* Title */}
              <h1 className="text-3xl lg:text-4xl font-serif font-bold text-navy-800">
                {product.title}
              </h1>

              {/* Short Description */}
              <p className="text-xl text-gray-600 leading-relaxed">
                {product.shortDescription}
              </p>

              {/* Price */}
              <div className="flex items-center space-x-4">
                <span className="text-4xl font-bold text-primary-600">
                  {formatCurrency(product.price)}
                </span>
                {product.clicks > 0 && (
                  <div className="flex items-center text-gray-500">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span className="text-sm">{product.clicks} clicks</span>
                  </div>
                )}
              </div>

              {/* Categories & Tags */}
              {(product.categories?.length > 0 || product.tags?.length > 0) && (
                <div className="space-y-3">
                  {product.categories?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {product.categories.map((category, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                        >
                          <Tag className="w-3 h-3 mr-1" />
                          {category}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {product.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {product.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="text-sm text-primary-600 bg-primary-50 px-2 py-1 rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-4">
                {/* Multiple Affiliate Links */}
                {product.affiliateLinks && product.affiliateLinks.length > 0 ? (
                  <div className="grid gap-3">
                    {product.affiliateLinks.map((link, index) => (
                      <motion.button
                        key={index}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleAffiliateClick(link.url, link.network)}
                        className={`px-6 py-4 inline-flex items-center justify-between rounded-lg border-2 transition-all ${
                          link.isPrimary
                            ? 'btn-gold border-gold-500'
                            : 'bg-white border-gray-300 text-gray-700 hover:border-primary-300 hover:bg-primary-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <ShoppingCart className="w-5 h-5" />
                          <div className="flex flex-col items-start">
                            <span className="font-semibold text-base">
                              {link.network || 'Store'}
                            </span>
                            <span className="text-xs opacity-70">
                              {link.label || `Buy on ${link.network || 'Store'}`}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-xl text-primary-600">
                            {formatCurrency(link.price || 0)}
                          </span>
                          <ExternalLink className="w-4 h-4 opacity-70" />
                        </div>
                      </motion.button>
                    ))}
                  </div>
                ) : product.affiliateUrl ? (
                  /* Fallback for legacy single affiliate URL */
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAffiliateClick(product.affiliateUrl)}
                    className="btn-gold text-lg px-8 py-4 w-full inline-flex items-center justify-center"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Buy Now
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </motion.button>
                ) : null}
                
                {/* Secondary Actions */}
                <div className="flex gap-3 justify-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleShare}
                    className="p-4 rounded-lg border-2 border-gray-200 bg-white text-gray-600 hover:border-primary-200 hover:text-primary-600 transition-colors flex-1"
                  >
                    <Share2 className="w-5 h-5 mx-auto" />
                  </motion.button>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <div className="text-sm text-green-800">
                    <strong>Safe Purchase:</strong> Secure checkout with trusted payment methods
                  </div>
                </div>
              </div>

              {/* Product Meta */}
              <div className="text-sm text-gray-500 space-y-1">
                <div>Added {formatRelativeTime(product.createdAt)}</div>
                {product.updatedAt !== product.createdAt && (
                  <div>Last updated {formatRelativeTime(product.updatedAt)}</div>
                )}
              </div>
            </div>
          </div>

          {/* Product Description */}
          <div className="bg-white rounded-2xl p-8 lg:p-12 shadow-sm">
            <h2 className="text-2xl font-serif font-bold text-navy-800 mb-6">
              Product Description
            </h2>
            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
              {product.description.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProductDetail;
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, ExternalLink, AlertCircle } from 'lucide-react';
import { adminAPI, handleApiError } from '../../utils/api';
import toast from 'react-hot-toast';

const ProductModal = ({ product, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    shortDescription: '',
    price: '',
    categories: [],
    tags: [],
    images: [],
    affiliateLinks: [{
      url: '',
      network: '',
      label: '',
      isPrimary: true
    }],
    // Legacy fields (kept for backwards compatibility)
    affiliateUrl: '',
    status: 'active',
    featured: false
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [imageUrls, setImageUrls] = useState(['']);
  const [newTag, setNewTag] = useState('');

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    loadOptions();
    
    if (product) {
      // Handle both new and legacy data structures
      let affiliateLinks = [];
      
      if (product.affiliateLinks && product.affiliateLinks.length > 0) {
        // New format
        affiliateLinks = product.affiliateLinks;
      } else if (product.affiliateUrl) {
        // Legacy format - convert to new format
        affiliateLinks = [{
          url: product.affiliateUrl,
          label: 'Buy Now',
          isPrimary: true
        }];
      } else {
        // Default empty link
        affiliateLinks = [{
          url: '',
          network: '',
          label: '',
          isPrimary: true
        }];
      }
      
      setFormData({
        title: product.title || '',
        description: product.description || '',
        shortDescription: product.shortDescription || '',
        price: product.price?.toString() || '',
        categories: product.categories || [],
        tags: product.tags || [],
        images: product.images || [],
        affiliateLinks: affiliateLinks,
        affiliateUrl: product.affiliateUrl || '',
        status: product.status || 'active',
        featured: product.featured || false
      });
      setImageUrls(product.images?.length ? product.images : ['']);
    }
  }, [product]);

  const loadOptions = async () => {
    try {
      // Load categories from the category API
      const categoriesRes = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/categories?active=true`);
      const categoriesData = await categoriesRes.json();
      
      if (categoriesData.success) {
        // Extract category names from the category objects
        const categoryNames = categoriesData.data.categories.map(cat => cat.name);
        setCategories(categoryNames);
      } else {
        // Fallback to old endpoint if category API fails
        const fallbackRes = await adminAPI.getProductCategories();
        if (fallbackRes.data.success) {
          setCategories(fallbackRes.data.data);
        }
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      // Try fallback
      try {
        const fallbackRes = await adminAPI.getProductCategories();
        if (fallbackRes.data.success) {
          setCategories(fallbackRes.data.data);
        }
      } catch (fallbackError) {
        console.error('Error loading fallback categories:', fallbackError);
      }
    }
  };

  // Affiliate links management functions
  const addAffiliateLink = () => {
    setFormData(prev => ({
      ...prev,
      affiliateLinks: [...prev.affiliateLinks, {
        url: '',
        network: '',
        price: '',
        label: '',
        isPrimary: false
      }]
    }));
  };

  const removeAffiliateLink = (index) => {
    if (formData.affiliateLinks.length <= 1) return; // Keep at least one link
    
    const newLinks = formData.affiliateLinks.filter((_, i) => i !== index);
    
    // If we removed the primary link, make the first one primary
    if (formData.affiliateLinks[index].isPrimary && newLinks.length > 0) {
      newLinks[0].isPrimary = true;
    }
    
    setFormData(prev => ({
      ...prev,
      affiliateLinks: newLinks
    }));
  };

  const updateAffiliateLink = (index, field, value) => {
    const newLinks = [...formData.affiliateLinks];
    
    if (field === 'isPrimary' && value) {
      // Only one link can be primary - unset others
      newLinks.forEach((link, i) => {
        link.isPrimary = i === index;
      });
    } else if (field === 'price') {
      // Handle price as number
      newLinks[index][field] = value;
      
      // Auto-calculate main price as minimum
      const prices = newLinks
        .map(link => parseFloat(link.price))
        .filter(p => !isNaN(p) && p > 0);
      
      if (prices.length > 0) {
        setFormData(prev => ({
          ...prev,
          price: Math.min(...prices).toString(),
          affiliateLinks: newLinks
        }));
        return;
      }
    } else {
      newLinks[index][field] = value;
    }
    
    setFormData(prev => ({
      ...prev,
      affiliateLinks: newLinks
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.shortDescription.trim()) {
      newErrors.shortDescription = 'Short description is required';
    }

    if (!formData.price || isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Valid price is required';
    }

    if (!formData.categories || formData.categories.length === 0) {
      newErrors.categories = 'At least one category is required';
    }

    // Validate affiliate links
    if (!formData.affiliateLinks || formData.affiliateLinks.length === 0) {
      newErrors.affiliateLinks = 'At least one affiliate link is required';
    } else {
      formData.affiliateLinks.forEach((link, index) => {
        if (!link.url.trim()) {
          newErrors[`affiliateLinks.${index}.url`] = 'URL is required';
        } else {
          try {
            new URL(link.url);
          } catch {
            newErrors[`affiliateLinks.${index}.url`] = 'Invalid URL format';
          }
        }
        
        if (!link.network.trim()) {
          newErrors[`affiliateLinks.${index}.network`] = 'Network name is required';
        }
        
        if (!link.price || isNaN(link.price) || parseFloat(link.price) <= 0) {
          newErrors[`affiliateLinks.${index}.price`] = 'Valid price is required';
        }
      });
    }

    const validImages = imageUrls.filter(url => url.trim());
    if (validImages.length === 0) {
      newErrors.images = 'At least one image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleImageUrlChange = (index, value) => {
    const newUrls = [...imageUrls];
    newUrls[index] = value;
    setImageUrls(newUrls);
    
    // Update form data with valid URLs
    const validUrls = newUrls.filter(url => url.trim());
    setFormData(prev => ({ ...prev, images: validUrls }));
    
    if (errors.images) {
      setErrors(prev => ({ ...prev, images: '' }));
    }
  };

  const addImageUrl = () => {
    setImageUrls([...imageUrls, '']);
  };

  const removeImageUrl = (index) => {
    if (imageUrls.length > 1) {
      const newUrls = imageUrls.filter((_, i) => i !== index);
      setImageUrls(newUrls);
      
      const validUrls = newUrls.filter(url => url.trim());
      setFormData(prev => ({ ...prev, images: validUrls }));
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      const updatedTags = [...formData.tags, newTag.trim()];
      setFormData(prev => ({ ...prev, tags: updatedTags }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    const updatedTags = formData.tags.filter(tag => tag !== tagToRemove);
    setFormData(prev => ({ ...prev, tags: updatedTags }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors below');
      return;
    }

    setLoading(true);
    
    try {
      // Prepare affiliate links data - filter out empty links
      const validAffiliateLinks = formData.affiliateLinks
        .filter(link => link.url && link.url.trim())
        .map(link => ({
          ...link,
          url: link.url.trim()
        }));

      const submitData = {
        ...formData,
        price: parseFloat(formData.price),
        images: imageUrls.filter(url => url.trim()),
        affiliateLinks: validAffiliateLinks
      };

      // Remove legacy fields from submitData to prevent conflicts
      delete submitData.affiliateUrl;

      if (product) {
        await adminAPI.updateProduct(product._id, submitData);
        toast.success('Product updated successfully');
      } else {
        await adminAPI.createProduct(submitData);
        toast.success('Product created successfully');
      }
      
      onSave();
    } catch (error) {
      console.error('Error saving product:', error);
      const { message, details } = handleApiError(error);
      // Show main message
      toast.error(message || 'Failed to save product');
      // If there are validation details, show them in console and as an extra toast
      if (details && Array.isArray(details) && details.length > 0) {
        console.error('Validation details:', details);
        toast.error(details.join(' — '), { duration: 8000 });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 overflow-y-auto bg-gray-900 bg-opacity-50 flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-serif font-bold text-navy-800">
              {product ? 'Edit Product' : 'Add New Product'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className={`input-field ${errors.title ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="Enter product title"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.title}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categories *
                </label>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {formData.categories.map((category, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800"
                      >
                        {category}
                        <button
                          type="button"
                          onClick={() => {
                            const newCategories = formData.categories.filter((_, i) => i !== index);
                            handleInputChange('categories', newCategories);
                          }}
                          className="ml-2 text-purple-600 hover:text-purple-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <select
                    onChange={(e) => {
                      if (e.target.value && !formData.categories.includes(e.target.value)) {
                        handleInputChange('categories', [...formData.categories, e.target.value]);
                      }
                      e.target.value = '';
                    }}
                    className={`input-field ${errors.categories ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                  >
                    <option value="">Add category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                {errors.categories && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.categories}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price * (₹) - Auto-calculated
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  readOnly
                  className="input-field bg-gray-50 cursor-not-allowed"
                  placeholder="Will be set to lowest affiliate price"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Automatically set to the lowest price from affiliate links
                </p>
              </div>

            </div>

            {/* Descriptions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Short Description *
              </label>
              <textarea
                value={formData.shortDescription}
                onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                rows={2}
                className={`input-field ${errors.shortDescription ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Brief product description (2-3 lines)"
              />
              {errors.shortDescription && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.shortDescription}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className={`input-field ${errors.description ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Detailed product description"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.description}
                </p>
              )}
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Images * (URLs)
              </label>
              <div className="space-y-3">
                {imageUrls.map((url, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => handleImageUrlChange(index, e.target.value)}
                      className="input-field flex-1"
                      placeholder={`Image URL ${index + 1}`}
                    />
                    {imageUrls.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeImageUrl(index)}
                        className="p-2 text-red-600 hover:text-red-800 rounded-md hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={addImageUrl}
                  className="btn-secondary btn-sm inline-flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Another Image
                </button>
                
                {errors.images && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.images}
                  </p>
                )}
              </div>
            </div>

            {/* Affiliate Links */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Affiliate Links *
                </label>
                <button
                  type="button"
                  onClick={addAffiliateLink}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Link
                </button>
              </div>
              
              <div className="space-y-4">
                {formData.affiliateLinks.map((link, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-700">
                          Link #{index + 1}
                        </span>
                        {link.isPrimary && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            Primary
                          </span>
                        )}
                      </div>
                      {formData.affiliateLinks.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeAffiliateLink(index)}
                          className="text-red-600 hover:text-red-800"
                          title="Remove Link"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* URL */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          URL *
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={link.url}
                            onChange={(e) => updateAffiliateLink(index, 'url', e.target.value)}
                            className={`input-field text-sm ${errors[`affiliateLinks.${index}.url`] ? 'border-red-300' : ''}`}
                            placeholder="https://..."
                          />
                          {link.url && (
                            <button
                              type="button"
                              onClick={() => window.open(link.url, '_blank')}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                              title="Test URL"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        {errors[`affiliateLinks.${index}.url`] && (
                          <p className="mt-1 text-xs text-red-600">
                            {errors[`affiliateLinks.${index}.url`]}
                          </p>
                        )}
                      </div>
                      
                      {/* Network */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Network *
                        </label>
                        <input
                          type="text"
                          value={link.network}
                          onChange={(e) => updateAffiliateLink(index, 'network', e.target.value)}
                          className={`input-field text-sm ${errors[`affiliateLinks.${index}.network`] ? 'border-red-300' : ''}`}
                          placeholder="e.g. Amazon, ShareASale"
                        />
                        {errors[`affiliateLinks.${index}.network`] && (
                          <p className="mt-1 text-xs text-red-600">
                            {errors[`affiliateLinks.${index}.network`]}
                          </p>
                        )}
                      </div>
                      
                      {/* Price */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Price (NPR) *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={link.price}
                          onChange={(e) => updateAffiliateLink(index, 'price', e.target.value)}
                          className={`input-field text-sm ${errors[`affiliateLinks.${index}.price`] ? 'border-red-300' : ''}`}
                          placeholder="Enter price"
                        />
                        {errors[`affiliateLinks.${index}.price`] && (
                          <p className="mt-1 text-xs text-red-600">
                            {errors[`affiliateLinks.${index}.price`]}
                          </p>
                        )}
                      </div>
                      
                      {/* Custom Label */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Button Label
                        </label>
                        <input
                          type="text"
                          value={link.label}
                          onChange={(e) => updateAffiliateLink(index, 'label', e.target.value)}
                          className="input-field text-sm"
                          placeholder={link.network ? `Buy on ${link.network}` : 'Buy Now'}
                        />
                      </div>
                      
                      {/* Primary Toggle */}
                      <div className="flex items-center space-x-2 pt-6">
                        <input
                          type="checkbox"
                          id={`primary-${index}`}
                          checked={link.isPrimary}
                          onChange={(e) => updateAffiliateLink(index, 'isPrimary', e.target.checked)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <label htmlFor={`primary-${index}`} className="text-xs font-medium text-gray-600">
                          Primary link
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {errors.affiliateLinks && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.affiliateLinks}
                </p>
              )}
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-primary-600 hover:text-primary-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="input-field flex-1"
                  placeholder="Add a tag..."
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="btn-secondary btn-sm"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="input-field"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="draft">Draft</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => handleInputChange('featured', e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="featured" className="ml-2 text-sm text-gray-700">
                  Featured Product
                </label>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="spinner w-4 h-4 mr-2" />
                    {product ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  product ? 'Update Product' : 'Create Product'
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProductModal;
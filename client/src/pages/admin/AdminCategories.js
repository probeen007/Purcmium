import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Plus,
  Edit2,
  Trash2,
  Tag,
  Save,
  X,
  Search,
  Loader2,
  ArrowLeft
} from 'lucide-react';
import api from '../../utils/api';
import ConfirmDialog from '../../components/admin/ConfirmDialog';

const AdminCategories = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, category: null });
  const [formData, setFormData] = useState({
    name: '',
    image: '',
    description: '',
    order: 0
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get('/categories');
      if (response.data.success) {
        setCategories(response.data.data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        image: category.image,
        description: category.description || '',
        order: category.order || 0
      });
    } else {
      setEditingCategory(null);
      setFormData({ name: '', image: '', description: '', order: 0 });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({ name: '', image: '', description: '', order: 0 });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Category name is required');
      return;
    }
    
    if (!formData.image.trim()) {
      toast.error('Category image URL is required');
      return;
    }

    try {
      setSubmitting(true);
      
      if (editingCategory) {
        // Update existing category
        const response = await api.put(`/admin/categories/${editingCategory._id}`, formData);
        if (response.data.success) {
          toast.success('Category updated successfully');
          fetchCategories();
          handleCloseModal();
        }
      } else {
        // Create new category
        const response = await api.post('/admin/categories', formData);
        if (response.data.success) {
          toast.success('Category created successfully');
          fetchCategories();
          handleCloseModal();
        }
      }
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error(error.response?.data?.error || 'Failed to save category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await api.delete(`/admin/categories/${deleteConfirm.category._id}`);
      if (response.data.success) {
        toast.success('Category deleted successfully');
        fetchCategories();
        setDeleteConfirm({ show: false, category: null });
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error(error.response?.data?.error || 'Failed to delete category');
    }
  };

  const handleToggleActive = async (category) => {
    try {
      const response = await api.put(`/admin/categories/${category._id}`, {
        ...category,
        isActive: !category.isActive
      });
      if (response.data.success) {
        toast.success(`Category ${category.isActive ? 'deactivated' : 'activated'}`);
        fetchCategories();
      }
    } catch (error) {
      console.error('Error toggling category status:', error);
      toast.error('Failed to update category status');
    }
  };

  const updateProductCounts = async () => {
    try {
      const response = await api.post('/admin/categories/update-counts');
      if (response.data.success) {
        toast.success('Product counts updated successfully');
        fetchCategories();
      }
    } catch (error) {
      console.error('Error updating counts:', error);
      toast.error('Failed to update product counts');
    }
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Category Management
        </h1>
        <div className="flex items-center justify-between">
          <p className="text-gray-600">
            Manage product categories and their icons
          </p>
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search categories..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={updateProductCounts}
            className="px-4 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <Tag className="w-4 h-4" />
            Update Counts
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Category
          </button>
        </div>
      </div>

      {/* Categories Grid */}
      {filteredCategories.length === 0 ? (
        <div className="text-center py-12">
          <Tag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg mb-4">
            {searchTerm ? 'No categories found' : 'No categories yet'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => handleOpenModal()}
              className="btn-primary"
            >
              Create Your First Category
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Products
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCategories.map((category) => (
                  <tr key={category._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center p-2 flex-shrink-0">
                          <img
                            src={category.image}
                            alt={category.name}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `https://via.placeholder.com/100/4F46E5/ffffff?text=${category.name.charAt(0)}`;
                            }}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{category.name}</div>
                          <div className="text-xs text-gray-500">{category.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 max-w-xs truncate">
                        {category.description || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {category.productCount || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-sm text-gray-600">{category.order}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleToggleActive(category)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                          category.isActive
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {category.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(category)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ show: true, category })}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingCategory ? 'Edit Category' : 'Add New Category'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Category Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="e.g., Apple, Sony, Samsung"
                    required
                  />
                </div>

                {/* Category Image URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL *
                  </label>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="https://example.com/brand-logo.svg"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use brand logo SVG or PNG with transparent background
                  </p>
                  
                  {/* Image Preview */}
                  {formData.image && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                      <div className="w-24 h-24 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center p-3">
                        <img
                          src={formData.image}
                          alt="Preview"
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                    rows="3"
                    maxLength="200"
                    placeholder="Brief description of this category"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.description.length}/200 characters
                  </p>
                </div>

                {/* Order */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    min="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Lower numbers appear first
                  </p>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        {editingCategory ? 'Update Category' : 'Create Category'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirm.show}
        onClose={() => setDeleteConfirm({ show: false, category: null })}
        onConfirm={handleDelete}
        title="Delete Category"
        message={`Are you sure you want to delete "${deleteConfirm.category?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmStyle="danger"
      />
    </div>
  );
};

export default AdminCategories;

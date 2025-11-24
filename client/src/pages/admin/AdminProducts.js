import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  ExternalLink,
  SortAsc,
  SortDesc,
  Download,
  Upload,
  ShoppingBag,
  RefreshCw
} from 'lucide-react';
import { adminAPI, handleApiError } from '../../utils/api';
import { formatCurrency, formatNumber } from '../../utils/helpers';
import AdminLayout from '../../components/admin/AdminLayout';
import ProductModal from '../../components/admin/ProductModal';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import toast from 'react-hot-toast';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [networkFilter, setNetworkFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedProducts, setSelectedProducts] = useState([]);
  
  // Modal states
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  // Dropdown states
  const [categories, setCategories] = useState([]);
  const [networks, setNetworks] = useState([]);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);

      const params = {
        page: currentPage,
        limit: 10,
        sort: sortOrder === 'asc' ? sortBy : `-${sortBy}`,
        search: searchTerm || undefined,
        category: categoryFilter || undefined,
        network: networkFilter || undefined
      };

      const response = await adminAPI.getProducts(params);

      if (response.data.success) {
        setProducts(response.data.data.products);
        setTotalPages(response.data.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      const { message } = handleApiError(error);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [currentPage, sortBy, sortOrder, searchTerm, categoryFilter, networkFilter]);

  const loadFilterOptions = useCallback(async () => {
    try {
      const [categoriesRes, networksRes] = await Promise.all([
        adminAPI.getProductCategories(),
        adminAPI.getProductNetworks()
      ]);

      if (categoriesRes.data.success) {
        setCategories(categoriesRes.data.data);
      }

      if (networksRes.data.success) {
        setNetworks(networksRes.data.data);
      }
    } catch (error) {
      console.error('Error loading filter options:', error);
    }
  }, []);

  useEffect(() => {
    loadProducts();
    loadFilterOptions();
  }, [loadProducts, loadFilterOptions]);



  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleCategoryFilter = (category) => {
    setCategoryFilter(category);
    setCurrentPage(1);
  };

  const handleNetworkFilter = (network) => {
    setNetworkFilter(network);
    setCurrentPage(1);
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowProductModal(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowProductModal(true);
  };

  const handleDeleteProduct = (product) => {
    setProductToDelete(product);
    setShowDeleteDialog(true);
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;

    try {
      await adminAPI.deleteProduct(productToDelete._id);
      toast.success('Product deleted successfully');
      loadProducts();
      setShowDeleteDialog(false);
      setProductToDelete(null);
    } catch (error) {
      console.error('Error deleting product:', error);
      const { message } = handleApiError(error);
      toast.error(message);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) return;

    try {
      await adminAPI.bulkDeleteProducts(selectedProducts);
      toast.success(`${selectedProducts.length} products deleted successfully`);
      setSelectedProducts([]);
      loadProducts();
    } catch (error) {
      console.error('Error bulk deleting products:', error);
      const { message } = handleApiError(error);
      toast.error(message);
    }
  };

  const handleSelectProduct = (productId) => {
    setSelectedProducts(prev => 
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAllProducts = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(p => p._id));
    }
  };

  const handleExportProducts = async () => {
    try {
      const response = await adminAPI.exportProducts();
      
      // Create download link
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `products-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Products exported successfully');
    } catch (error) {
      console.error('Error exporting products:', error);
      const { message } = handleApiError(error);
      toast.error(message);
    }
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />;
  };

  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-serif font-bold text-navy-800 mb-2">
              Product Management
            </h1>
            <p className="text-gray-600">
              Manage your affiliate products and track their performance
            </p>
          </div>

          <div className="flex items-center space-x-3 mt-4 lg:mt-0">
            <button
              onClick={() => { loadProducts(); toast.success('Products refreshed from database'); }}
              className="bg-white border border-gray-200 rounded-lg p-2 shadow-sm hover:shadow-md transition-all duration-200 hover:bg-gray-50"
              title="Refresh products from database"
            >
              <RefreshCw className="w-4 h-4 text-gray-600 hover:text-primary-600" />
            </button>

            <button
              onClick={handleExportProducts}
              className="btn-secondary inline-flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
            
            <button className="btn-secondary inline-flex items-center">
              <Upload className="w-4 h-4 mr-2" />
              Import
            </button>
            
            <button onClick={handleAddProduct} className="btn-primary inline-flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={handleSearch}
                className="input-field pl-10"
              />
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => handleCategoryFilter(e.target.value)}
              className="input-field"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            {/* Network Filter */}
            <select
              value={networkFilter}
              onChange={(e) => handleNetworkFilter(e.target.value)}
              className="input-field"
            >
              <option value="">All Networks</option>
              {networks.map(network => (
                <option key={network} value={network}>{network}</option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order);
                setCurrentPage(1);
              }}
              className="input-field"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="title-asc">Name A-Z</option>
              <option value="title-desc">Name Z-A</option>
              <option value="price-desc">Price High-Low</option>
              <option value="price-asc">Price Low-High</option>
              <option value="clicks-desc">Most Clicks</option>
              <option value="conversions-desc">Most Conversions</option>
            </select>
          </div>

          {/* Bulk Actions */}
          {selectedProducts.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-800">
                  {selectedProducts.length} products selected
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedProducts([])}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Clear Selection
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    className="btn-secondary btn-sm text-red-600 hover:text-red-700"
                  >
                    Delete Selected
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="spinner mx-auto mb-4"></div>
                <p className="text-gray-600">Loading products...</p>
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedProducts.length === products.length && products.length > 0}
                          onChange={handleSelectAllProducts}
                          className="rounded border-gray-300"
                        />
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('title')}
                      >
                        <div className="flex items-center">
                          Product {getSortIcon('title')}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('category')}
                      >
                        <div className="flex items-center">
                          Category {getSortIcon('category')}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('price')}
                      >
                        <div className="flex items-center">
                          Price {getSortIcon('price')}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('clicks')}
                      >
                        <div className="flex items-center">
                          Clicks {getSortIcon('clicks')}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('conversions')}
                      >
                        <div className="flex items-center">
                          Conversions {getSortIcon('conversions')}
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr key={product._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedProducts.includes(product._id)}
                            onChange={() => handleSelectProduct(product._id)}
                            className="rounded border-gray-300"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-12">
                              <img
                                className="h-12 w-12 rounded-lg object-cover"
                                src={product.images?.[0] || '/api/placeholder/48/48'}
                                alt={product.title}
                                onError={(e) => {
                                  e.target.src = '/api/placeholder/48/48';
                                }}
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 line-clamp-2 max-w-xs">
                                {product.title}
                              </div>
                              <div className="text-sm text-gray-500">
                                {product.network}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-wrap gap-1">
                            {product.categories && product.categories.length > 0 ? (
                              product.categories.map((category, index) => (
                                <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {category}
                                </span>
                              ))
                            ) : (
                              <span className="text-sm text-gray-500">No categories</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(product.price)}
                          </div>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <div className="text-sm text-gray-500 line-through">
                              {formatCurrency(product.originalPrice)}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatNumber(product.clicks)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatNumber(product.conversions)}
                          </div>
                          {product.clicks > 0 && (
                            <div className="text-xs text-gray-500">
                              {((product.conversions / product.clicks) * 100).toFixed(1)}% CVR
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                            product.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : product.status === 'draft'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {product.status || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => window.open(`/product/${product.slug}`, '_blank')}
                              className="text-blue-600 hover:text-blue-900"
                              title="View Product"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => window.open(product.affiliateUrl, '_blank')}
                              className="text-green-600 hover:text-green-900"
                              title="Visit Affiliate Link"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEditProduct(product)}
                              className="text-indigo-600 hover:text-indigo-900"
                              title="Edit Product"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete Product"
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing page <span className="font-medium">{currentPage}</span> of{' '}
                        <span className="font-medium">{totalPages}</span>
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          Previous
                        </button>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                currentPage === pageNum
                                  ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                        <button
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          Next
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}

              {/* Empty State */}
              {!loading && products.length === 0 && (
                <div className="text-center py-16">
                  <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm || categoryFilter || networkFilter
                      ? 'Try adjusting your filters'
                      : 'Get started by adding your first product'
                    }
                  </p>
                  <div className="mt-6">
                    <button onClick={handleAddProduct} className="btn-primary inline-flex items-center">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Product
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>

      {/* Product Modal */}
      {showProductModal && (
        <ProductModal
          product={editingProduct}
          onClose={() => {
            setShowProductModal(false);
            setEditingProduct(null);
          }}
          onSave={() => {
            setShowProductModal(false);
            setEditingProduct(null);
            loadProducts();
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <ConfirmDialog
          title="Delete Product"
          message={`Are you sure you want to delete "${productToDelete?.title}"? This action cannot be undone.`}
          confirmText="Delete"
          confirmClass="btn-danger"
          onConfirm={confirmDeleteProduct}
          onCancel={() => {
            setShowDeleteDialog(false);
            setProductToDelete(null);
          }}
        />
      )}
    </AdminLayout>
  );
};

export default AdminProducts;
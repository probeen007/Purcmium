const express = require('express');
const Product = require('../models/Product');
const Admin = require('../models/Admin');
const Category = require('../models/Category');
const { protect, adminOnly } = require('../middleware/auth');
const {
  createCategory,
  updateCategory,
  deleteCategory,
  updateProductCounts
} = require('../controllers/categoryController');

const router = express.Router();

// @desc    Get admin dashboard metrics
// @route   GET /api/admin/metrics
// @access  Private (Admin only)
router.get('/metrics', protect, adminOnly, async (req, res, next) => {
  try {
    // Get date range from query (default to last 30 days)
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get overall statistics
    const [
      totalProducts,
      activeProducts,
      topSellingProducts,
      totalClicks,
      totalConversions,
      recentProducts
    ] = await Promise.all([
      // Total products count
      Product.countDocuments(),
      
      // Active products count
      Product.countDocuments({ status: 'active' }),
      
      // Top Selling products count
      Product.countDocuments({ topSelling: true, status: 'active' }),
      
      // Total clicks across all products
      Product.aggregate([
        { $group: { _id: null, totalClicks: { $sum: '$clicks' } } }
      ]).then(result => result[0]?.totalClicks || 0),
      
      // Total conversions across all products
      Product.aggregate([
        { $group: { _id: null, totalConversions: { $sum: '$conversions' } } }
      ]).then(result => result[0]?.totalConversions || 0),
      
      // Recent products (last 7 days)
      Product.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      })
    ]);

    // Calculate overall conversion rate
    const overallCTR = totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(2) : 0;

    // Get top performing products
    const topProducts = await Product.find({ status: 'active' })
      .sort({ clicks: -1, conversions: -1 })
      .limit(10)
      .select('title slug clicks conversions price ctr estimatedRevenue');

    // Get products by network
    const productsByNetwork = await Product.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: '$network',
          count: { $sum: 1 },
          totalClicks: { $sum: '$clicks' },
          totalConversions: { $sum: '$conversions' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get products by category
    const productsByCategory = await Product.aggregate([
      { $match: { status: 'active' } },
      { $unwind: '$categories' },
      {
        $group: {
          _id: '$categories',
          count: { $sum: 1 },
          totalClicks: { $sum: '$clicks' },
          totalConversions: { $sum: '$conversions' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Calculate estimated revenue (assuming 5% commission rate)
    const estimatedRevenue = await Product.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: {
              $multiply: ['$conversions', '$price', 0.05] // 5% commission
            }
          }
        }
      }
    ]).then(result => result[0]?.totalRevenue.toFixed(2) || '0.00');

    // Get monthly trends (last 6 months)
    const monthlyTrends = await Product.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000)
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          productsAdded: { $sum: 1 },
          totalClicks: { $sum: '$clicks' },
          totalConversions: { $sum: '$conversions' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Format monthly trends for frontend
    const formattedTrends = monthlyTrends.map(trend => ({
      month: `${trend._id.year}-${String(trend._id.month).padStart(2, '0')}`,
      productsAdded: trend.productsAdded,
      clicks: trend.totalClicks,
      conversions: trend.totalConversions,
      ctr: trend.totalClicks > 0 ? ((trend.totalConversions / trend.totalClicks) * 100).toFixed(2) : 0
    }));

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalProducts,
          activeProducts,
          topSellingProducts,
          recentProducts,
          totalClicks,
          totalConversions,
          overallCTR: parseFloat(overallCTR),
          estimatedRevenue: parseFloat(estimatedRevenue)
        },
        topProducts,
        productsByNetwork,
        productsByCategory,
        monthlyTrends: formattedTrends,
        period: {
          days,
          startDate,
          endDate: new Date()
        }
      }
    });

  } catch (error) {
    next(error);
  }
});

// @desc    Get product performance details
// @route   GET /api/admin/products/:id/performance
// @access  Private (Admin only)
router.get('/products/:id/performance', protect, adminOnly, async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PRODUCT_NOT_FOUND',
          message: 'Product not found'
        }
      });
    }

    // Calculate performance metrics
    const performance = {
      productId: product._id,
      title: product.title,
      slug: product.slug,
      status: product.status,
      topSelling: product.topSelling,
      network: product.network,
      price: product.price,
      clicks: product.clicks,
      conversions: product.conversions,
      conversionRate: parseFloat(product.conversionRate),
      estimatedRevenue: parseFloat(product.estimatedRevenue),
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    };

    res.status(200).json({
      success: true,
      data: { performance }
    });

  } catch (error) {
    next(error);
  }
});

// @desc    Get admin profile
// @route   GET /api/admin/profile
// @access  Private (Admin only)
router.get('/profile', protect, adminOnly, async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.admin.id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ADMIN_NOT_FOUND',
          message: 'Admin not found'
        }
      });
    }

    res.status(200).json({
      success: true,
      data: {
        admin: {
          id: admin._id,
          email: admin.email,
          role: admin.role,
          fullName: admin.fullName,
          firstName: admin.firstName,
          lastName: admin.lastName,
          lastLogin: admin.lastLogin,
          lastActivity: admin.lastActivity,
          createdAt: admin.createdAt,
          isActive: admin.isActive
        }
      }
    });

  } catch (error) {
    next(error);
  }
});

// @desc    Get system stats
// @route   GET /api/admin/stats
// @access  Private (Admin only)
router.get('/stats', protect, adminOnly, async (req, res, next) => {
  try {
    const [
      draftProducts,
      inactiveProducts,
      productsByStatus
    ] = await Promise.all([
      Product.countDocuments({ status: 'draft' }),
      Product.countDocuments({ status: 'inactive' }),
      Product.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    res.status(200).json({
      success: true,
      data: {
        products: {
          draft: draftProducts,
          inactive: inactiveProducts,
          byStatus: productsByStatus
        },
        system: {
          nodeVersion: process.version,
          environment: process.env.NODE_ENV,
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage()
        }
      }
    });

  } catch (error) {
    next(error);
  }
});

// @desc    Get all products for admin
// @route   GET /api/admin/products
// @access  Private (Admin only)
router.get('/products', protect, adminOnly, async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = '-createdAt',
      search,
      category,
      network,
      status
    } = req.query;

    const filter = {};

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    if (category) filter.category = category;
    if (network) filter.network = network;
    if (status) filter.status = status;

    const products = await Product.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    const total = await Product.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          current: parseInt(page),
          totalPages,
          total,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create product
// @route   POST /api/admin/products
// @access  Private (Admin only)
router.post('/products', protect, adminOnly, async (req, res, next) => {
  try {
    const product = new Product(req.body);
    await product.save();
    
    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Product validation failed',
          details: errors
        }
      });
    }
    next(error);
  }
});

// @desc    Update product
// @route   PUT /api/admin/products/:id
// @access  Private (Admin only)
router.put('/products/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PRODUCT_NOT_FOUND',
          message: 'Product not found'
        }
      });
    }
    
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Product validation failed',
          details: errors
        }
      });
    }
    next(error);
  }
});

// @desc    Delete product
// @route   DELETE /api/admin/products/:id
// @access  Private (Admin only)
router.delete('/products/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PRODUCT_NOT_FOUND',
          message: 'Product not found'
        }
      });
    }
    
    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Bulk delete products
// @route   POST /api/admin/products/bulk-delete
// @access  Private (Admin only)
router.post('/products/bulk-delete', protect, adminOnly, async (req, res, next) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_IDS',
          message: 'Product IDs array is required'
        }
      });
    }
    
    const result = await Product.deleteMany({ _id: { $in: ids } });
    
    res.json({
      success: true,
      message: `${result.deletedCount} products deleted successfully`,
      data: { deletedCount: result.deletedCount }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get categories
// @route   GET /api/admin/categories
// @access  Private (Admin only)
router.get('/categories', protect, adminOnly, async (req, res, next) => {
  try {
    // Get categories from the Category model (database-driven)
    const categories = await Category.find({ isActive: true })
      .select('name')
      .sort({ order: 1, name: 1 })
      .lean();
    
    // Extract just the category names
    const categoryNames = categories.map(cat => cat.name);
    
    res.json({
      success: true,
      data: categoryNames
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get networks
// @route   GET /api/admin/networks
// @access  Private (Admin only)
router.get('/networks', protect, adminOnly, async (req, res, next) => {
  try {
    const networks = await Product.distinct('network');
    const existingNetworks = networks.filter(net => net && net.trim());
    
    // Default networks
    const defaultNetworks = ['Amazon Associates', 'ShareASale', 'CJ Affiliate', 'Impact', 'ClickBank', 'Other'];
    
    // Combine and deduplicate
    const allNetworks = [...new Set([...defaultNetworks, ...existingNetworks])];
    
    res.json({
      success: true,
      data: allNetworks
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Export products
// @route   GET /api/admin/products/export
// @access  Private (Admin only)
router.get('/products/export', protect, adminOnly, async (req, res, next) => {
  try {
    const { format = 'csv' } = req.query;
    
    const products = await Product.find({}).lean();
    
    if (format === 'csv') {
      const csvHeaders = [
        'Title',
        'Description', 
        'Category',
        'Price',
        'Network',
        'Clicks',
        'Conversions',
        'Status',
        'Featured',
        'Created'
      ];
      
      const csvRows = products.map(product => [
        `"${(product.title || '').replace(/"/g, '""')}"`,
        `"${(product.description || '').substring(0, 100).replace(/"/g, '""')}"`,
        product.category || '',
        product.price || 0,
        product.network || '',
        product.clicks || 0,
        product.conversions || 0,
        product.status || 'active',
        product.featured ? 'Yes' : 'No',
        new Date(product.createdAt).toLocaleDateString()
      ]);
      
      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.join(','))
      ].join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="products-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csvContent);
    } else {
      res.json({
        success: true,
        data: products
      });
    }
  } catch (error) {
    next(error);
  }
});

// Category Management Routes
// @desc    Create new category
// @route   POST /api/admin/categories
// @access  Private (Admin only)
router.post('/categories', protect, adminOnly, createCategory);

// @desc    Update category
// @route   PUT /api/admin/categories/:id
// @access  Private (Admin only)
router.put('/categories/:id', protect, adminOnly, updateCategory);

// @desc    Delete category
// @route   DELETE /api/admin/categories/:id
// @access  Private (Admin only)
router.delete('/categories/:id', protect, adminOnly, deleteCategory);

// @desc    Update product counts for all categories
// @route   POST /api/admin/categories/update-counts
// @access  Private (Admin only)
router.post('/categories/update-counts', protect, adminOnly, updateProductCounts);

module.exports = router;
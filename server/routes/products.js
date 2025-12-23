const express = require('express');
const Product = require('../models/Product');
const { protect, adminOnly, optionalAuth } = require('../middleware/auth');
const { validate, createProductSchema, updateProductSchema, productQuerySchema } = require('../middleware/validation');

const router = express.Router();

// @desc    Get all products with filtering, search, and pagination
// @route   GET /api/products
// @access  Public
router.get('/', async (req, res, next) => {
  try {
    // Validate query parameters
    const { error, value } = productQuerySchema.validate(req.query);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_QUERY',
          message: error.details[0].message
        }
      });
    }

    const {
      page,
      limit,
      search,
      categories,
      tags,
      topSelling,
      sortBy,
      sortOrder
    } = value;

    // Build query
    const query = { status: 'active' };

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Category filter
    if (categories) {
      const categoryArray = Array.isArray(categories) ? categories : [categories];
      query.categories = { $in: categoryArray };
    }

    // Tags filter
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      query.tags = { $in: tagArray };
    }

    // Top Selling filter
    if (topSelling !== undefined) {
      query.topSelling = topSelling;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const [products, total] = await Promise.all([
      Product.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select('-__v'),
      Product.countDocuments(query)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.status(200).json({
      success: true,
      count: products.length,
      data: {
        products,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage,
          hasPrevPage
        }
      }
    });

  } catch (error) {
    next(error);
  }
});

// @desc    Get top selling products
// @route   GET /api/products/top-selling
// @access  Public
router.get('/top-selling', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    
    const products = await Product.findTopSelling(limit);

    res.status(200).json({
      success: true,
      count: products.length,
      data: { products }
    });

  } catch (error) {
    next(error);
  }
});

// @desc    Get latest products
// @route   GET /api/products/latest
// @access  Public
router.get('/latest', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 12;
    
    const products = await Product.findLatest(limit);

    res.status(200).json({
      success: true,
      count: products.length,
      data: { products }
    });

  } catch (error) {
    next(error);
  }
});

// @desc    Get single product by ID or slug
// @route   GET /api/products/:identifier
// @access  Public
router.get('/:identifier', async (req, res, next) => {
  try {
    const { identifier } = req.params;
    
    let product;

    // Check if identifier is a valid ObjectId
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(identifier);
    
    if (isObjectId) {
      product = await Product.findOne({ 
        _id: identifier, 
        status: 'active' 
      }).select('-__v').lean();
    } else {
      product = await Product.findOne({ 
        slug: identifier, 
        status: 'active' 
      }).select('-__v').lean();
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PRODUCT_NOT_FOUND',
          message: 'Product not found'
        }
      });
    }

    res.status(200).json({
      success: true,
      data: { product }
    });

  } catch (error) {
    next(error);
  }
});

// @desc    Create new product
// @route   POST /api/products
// @access  Private (Admin only)
router.post('/', protect, adminOnly, validate(createProductSchema), async (req, res, next) => {
  try {
    // Create product
    const product = await Product.create({
      ...req.body,
      createdBy: req.admin.id
    });

    res.status(201).json({
      success: true,
      data: { product }
    });

  } catch (error) {
    next(error);
  }
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Admin only)
router.put('/:id', protect, adminOnly, validate(updateProductSchema), async (req, res, next) => {
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

    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        updatedBy: req.admin.id
      },
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      data: { product: updatedProduct }
    });

  } catch (error) {
    next(error);
  }
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Admin only)
router.delete('/:id', protect, adminOnly, async (req, res, next) => {
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

    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    next(error);
  }
});

// @desc    Get product categories
// @route   GET /api/products/meta/categories
// @access  Public
router.get('/meta/categories', async (req, res, next) => {
  try {
    const categories = await Product.distinct('categories', { status: 'active' });
    
    res.status(200).json({
      success: true,
      data: { categories: categories.filter(cat => cat) }
    });

  } catch (error) {
    next(error);
  }
});

// @desc    Get product tags
// @route   GET /api/products/meta/tags
// @access  Public
router.get('/meta/tags', async (req, res, next) => {
  try {
    const tags = await Product.distinct('tags', { status: 'active' });
    
    res.status(200).json({
      success: true,
      data: { tags: tags.filter(tag => tag) }
    });

  } catch (error) {
    next(error);
  }
});

// @desc    Get product networks
// @route   GET /api/products/meta/networks
// @access  Public
router.get('/meta/networks', async (req, res, next) => {
  try {
    const networks = await Product.distinct('network', { status: 'active' });
    
    res.status(200).json({
      success: true,
      data: { networks: networks.filter(network => network) }
    });

  } catch (error) {
    next(error);
  }
});

// @desc    Advanced product search
// @route   POST /api/products/search
// @access  Public
router.post('/search', async (req, res, next) => {
  try {
    const {
      search,
      categories = [],
      networks = [],
      minPrice,
      maxPrice,
      sort = 'relevance',
      limit = 20
    } = req.body;

    // Build query
    const query = { status: 'active' };

    // Text search
    if (search && search.trim()) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { categories: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    // Category filter
    if (categories.length > 0) {
      query.categories = { $in: categories };
    }

    // Network filter
    if (networks.length > 0) {
      query.network = { $in: networks };
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Build sort object
    let sortObj = {};
    switch (sort) {
      case 'price_low':
        sortObj = { price: 1 };
        break;
      case 'price_high':
        sortObj = { price: -1 };
        break;
      case 'name':
        sortObj = { name: 1 };
        break;
      case 'rating':
        sortObj = { rating: -1, createdAt: -1 };
        break;
      case 'latest':
        sortObj = { createdAt: -1 };
        break;
      default:
        // Relevance - prioritize top selling, then by creation date
        sortObj = { topSelling: -1, createdAt: -1 };
    }

    // Execute query
    const products = await Product.find(query)
      .sort(sortObj)
      .limit(parseInt(limit))
      .select('-__v');

    res.status(200).json({
      success: true,
      count: products.length,
      data: { products }
    });

  } catch (error) {
    next(error);
  }
});

// @desc    Get products for admin (includes all statuses)
// @route   GET /api/products/admin/all
// @access  Private (Admin only)
router.get('/admin/all', protect, adminOnly, async (req, res, next) => {
  try {
    // Validate query parameters
    const { error, value } = productQuerySchema.validate(req.query);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_QUERY',
          message: error.details[0].message
        }
      });
    }

    const {
      page,
      limit,
      search,
      categories,
      tags,
      topSelling,
      sortBy,
      sortOrder
    } = value;

    // Build query (no status filter for admin)
    const query = {};

    // Add status filter if specified
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Category filter
    if (categories) {
      const categoryArray = Array.isArray(categories) ? categories : [categories];
      query.categories = { $in: categoryArray };
    }

    // Tags filter
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      query.tags = { $in: tagArray };
    }

    // Top Selling filter
    if (topSelling !== undefined) {
      query.topSelling = topSelling;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const [products, total] = await Promise.all([
      Product.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select('-__v'),
      Product.countDocuments(query)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.status(200).json({
      success: true,
      count: products.length,
      data: {
        products,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage,
          hasPrevPage
        }
      }
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;
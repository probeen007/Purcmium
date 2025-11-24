const express = require('express');
const Product = require('../models/Product');
const { validate, trackClickSchema } = require('../middleware/validation');

const router = express.Router();

// @desc    Track product click
// @route   POST /api/track/click
// @access  Public
router.post('/click', validate(trackClickSchema), async (req, res, next) => {
  try {
    const { productId, referrer, userAgent } = req.body;

    // Find product
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PRODUCT_NOT_FOUND',
          message: 'Product not found'
        }
      });
    }

    // Check if product is active
    if (product.status !== 'active') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'PRODUCT_INACTIVE',
          message: 'Product is not active'
        }
      });
    }

    // Increment click count
    await product.incrementClicks();

    // Log click for analytics (in a real app, you might want to store detailed click data)
    console.log(`Product click tracked: ${product.title} (ID: ${productId})`);
    console.log(`Referrer: ${referrer || 'Direct'}`);
    console.log(`User Agent: ${userAgent || 'Unknown'}`);

    res.status(200).json({
      success: true,
      message: 'Click tracked successfully',
      data: {
        productId: product._id,
        title: product.title,
        affiliateUrl: product.affiliateUrl,
        clicks: product.clicks
      }
    });

  } catch (error) {
    next(error);
  }
});

// @desc    Track conversion (for future use with conversion pixels)
// @route   POST /api/track/conversion
// @access  Public
router.post('/conversion', async (req, res, next) => {
  try {
    const { productId, conversionValue } = req.body;

    // Validate product ID format
    if (!/^[0-9a-fA-F]{24}$/.test(productId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PRODUCT_ID',
          message: 'Invalid product ID format'
        }
      });
    }

    // Find product
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PRODUCT_NOT_FOUND',
          message: 'Product not found'
        }
      });
    }

    // Increment conversion count
    await product.incrementConversions();

    // Log conversion for analytics
    console.log(`Conversion tracked: ${product.title} (ID: ${productId})`);
    console.log(`Conversion Value: ${conversionValue || 'Unknown'}`);

    res.status(200).json({
      success: true,
      message: 'Conversion tracked successfully',
      data: {
        productId: product._id,
        title: product.title,
        conversions: product.conversions,
        conversionRate: product.conversionRate
      }
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;
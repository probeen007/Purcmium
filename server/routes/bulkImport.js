const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parser');
const { Readable } = require('stream');
const Product = require('../models/Product');
const Category = require('../models/Category');
const { protect, adminOnly } = require('../middleware/auth');

// Configure multer for CSV file upload (memory storage)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'), false);
    }
  }
});

/**
 * Helper: Parse CSV buffer to array of objects
 */
const parseCSV = (buffer) => {
  return new Promise((resolve, reject) => {
    const results = [];
    const stream = Readable.from(buffer.toString());
    
    stream
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
};

/**
 * Helper: Normalize category name to slug
 */
const normalizeCategorySlug = (categoryName) => {
  if (!categoryName) return '';
  return categoryName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Helper: Validate affiliate links from CSV
 */
const validateAffiliateLinks = (affiliateLinksJSON) => {
  try {
    const links = JSON.parse(affiliateLinksJSON);
    if (!Array.isArray(links) || links.length === 0) {
      return { valid: false, error: 'Affiliate links must be a non-empty array' };
    }

    let primaryCount = 0;
    const errors = [];

    links.forEach((link, index) => {
      if (!link.network || !link.url || link.price === undefined) {
        errors.push(`Link ${index + 1}: Missing required fields (network, url, price)`);
      }
      if (link.price < 0) {
        errors.push(`Link ${index + 1}: Price cannot be negative`);
      }
      if (link.isPrimary) primaryCount++;
    });

    if (primaryCount === 0) {
      errors.push('At least one link must be marked as primary');
    }
    if (primaryCount > 1) {
      errors.push('Only one link can be marked as primary');
    }

    if (errors.length > 0) {
      return { valid: false, error: errors.join('; ') };
    }

    return { valid: true, links };
  } catch (error) {
    return { valid: false, error: 'Invalid JSON format for affiliate links' };
  }
};

/**
 * Helper: Calculate minimum price from affiliate links
 */
const calculateMinPrice = (affiliateLinks) => {
  if (!affiliateLinks || affiliateLinks.length === 0) return 0;
  return Math.min(...affiliateLinks.map(link => link.price));
};

/**
 * @desc    Download CSV template
 * @route   GET /api/admin/import/template
 * @access  Private/Admin
 */
router.get('/template', protect, adminOnly, (req, res) => {
  const template = `title,categories,shortDescription,description,images,affiliateLinks,tags,topSelling
"Sony PlayStation 5 Digital Edition","Gaming,Electronics","Latest gaming console from Sony","The PlayStation 5 Digital Edition is a powerful gaming console...","https://example.com/ps5-1.jpg|https://example.com/ps5-2.jpg","[{""network"":""Amazon Associates"",""url"":""https://amazon.com/ps5"",""price"":45999,""isPrimary"":true},{""network"":""ShareASale"",""url"":""https://shareasale.com/ps5"",""price"":47999,""isPrimary"":false}]","gaming,console,playstation",true
"Apple iPhone 14 Pro","Electronics,Mobile","Latest iPhone with advanced features","Apple iPhone 14 Pro with A16 Bionic chip...","https://example.com/iphone-1.jpg","[{""network"":""Amazon Associates"",""url"":""https://amazon.com/iphone14"",""price"":99999,""isPrimary"":true}]","smartphone,apple,iphone",false`;

  res.header('Content-Type', 'text/csv');
  res.header('Content-Disposition', 'attachment; filename=product-import-template.csv');
  res.send(template);
});

/**
 * @desc    Upload and preview CSV (Phase 1)
 * @route   POST /api/admin/import/preview
 * @access  Private/Admin
 */
router.post('/preview', protect, adminOnly, upload.single('csvFile'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: { code: 'NO_FILE', message: 'No CSV file uploaded' }
      });
    }

    // Parse CSV
    const rows = await parseCSV(req.file.buffer);

    if (rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'EMPTY_CSV', message: 'CSV file is empty' }
      });
    }

    // Get existing categories from database (lean for read-only efficiency)
    const existingCategories = await Category.find().select('name slug').lean();
    const existingCategorySlugs = new Set(existingCategories.map(cat => cat.slug));
    const existingCategoryMap = {};
    existingCategories.forEach(cat => {
      existingCategoryMap[cat.slug] = cat.name;
    });

    // Get existing products for duplicate detection (lean for read-only efficiency)
    const existingProducts = await Product.find().select('title affiliateLinks').lean();
    const existingProductMap = {};
    existingProducts.forEach(product => {
      const primaryLink = product.affiliateLinks?.find(link => link.isPrimary);
      if (primaryLink) {
        const key = `${product.title.toLowerCase()}|${primaryLink.url}`;
        existingProductMap[key] = true;
      }
    });

    const parsedProducts = [];
    const allNewCategories = new Set();
    const categoryResolutionMap = {}; // slug -> { exists: bool, originalName: string }

    // Process each row
    rows.forEach((row, index) => {
      const rowNumber = index + 2; // +2 because CSV has header row and arrays are 0-indexed
      const errors = [];
      const warnings = [];

      // Required fields validation
      if (!row.title || row.title.trim() === '') {
        errors.push('Title is required');
      }
      if (!row.shortDescription || row.shortDescription.trim() === '') {
        errors.push('Short description is required');
      }
      if (!row.description || row.description.trim() === '') {
        errors.push('Description is required');
      }
      if (!row.affiliateLinks || row.affiliateLinks.trim() === '') {
        errors.push('Affiliate links are required');
      }

      // Parse categories
      const categoryNames = row.categories
        ? row.categories.split(',').map(cat => cat.trim()).filter(cat => cat !== '')
        : [];

      const categoryInfo = [];
      categoryNames.forEach(catName => {
        const slug = normalizeCategorySlug(catName);
        if (!categoryResolutionMap[slug]) {
          categoryResolutionMap[slug] = {
            exists: existingCategorySlugs.has(slug),
            originalName: catName,
            matchedName: existingCategoryMap[slug] || null
          };
        }

        categoryInfo.push({
          originalName: catName,
          slug: slug,
          exists: existingCategorySlugs.has(slug),
          matchedName: existingCategoryMap[slug] || null
        });

        if (!existingCategorySlugs.has(slug)) {
          allNewCategories.add(slug);
        }
      });

      // Parse images
      const images = row.images
        ? row.images.split('|').map(img => img.trim()).filter(img => img !== '')
        : [];

      if (images.length === 0) {
        errors.push('At least one image is required');
      }

      // Parse and validate affiliate links
      let affiliateLinks = [];
      let calculatedPrice = 0;
      const affiliateValidation = validateAffiliateLinks(row.affiliateLinks || '[]');
      
      if (!affiliateValidation.valid) {
        errors.push(affiliateValidation.error);
      } else {
        affiliateLinks = affiliateValidation.links;
        calculatedPrice = calculateMinPrice(affiliateLinks);
      }

      // Parse tags
      const tags = row.tags
        ? row.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
        : [];

      // Parse top selling flag
      const topSelling = row.topSelling === 'true' || row.topSelling === '1' || row.topSelling === 'yes';

      // Check for duplicates
      if (affiliateLinks.length > 0) {
        const primaryLink = affiliateLinks.find(link => link.isPrimary);
        if (primaryLink) {
          const key = `${row.title.toLowerCase()}|${primaryLink.url}`;
          if (existingProductMap[key]) {
            warnings.push('Duplicate: Product with same title and primary affiliate URL already exists');
          }
        }
      }

      // Pricing warnings
      if (affiliateLinks.length > 1) {
        const prices = affiliateLinks.map(link => link.price);
        const maxPrice = Math.max(...prices);
        const minPrice = Math.min(...prices);
        const difference = maxPrice - minPrice;
        const percentDiff = (difference / minPrice) * 100;

        if (percentDiff > 20) {
          warnings.push(`Price variance: ${percentDiff.toFixed(1)}% difference between affiliate links`);
        }
      }

      parsedProducts.push({
        rowNumber,
        title: row.title,
        categories: categoryInfo,
        shortDescription: row.shortDescription,
        description: row.description,
        images,
        affiliateLinks,
        tags,
        topSelling,
        calculatedPrice,
        errors,
        warnings,
        isValid: errors.length === 0
      });
    });

    // Build new categories list for user to create
    const newCategoriesToCreate = Array.from(allNewCategories).map(slug => ({
      slug,
      originalName: categoryResolutionMap[slug].originalName,
      needsCreation: true
    }));

    res.json({
      success: true,
      data: {
        totalRows: rows.length,
        validRows: parsedProducts.filter(p => p.isValid).length,
        invalidRows: parsedProducts.filter(p => !p.isValid).length,
        products: parsedProducts,
        categoryResolution: {
          existing: existingCategories.map(cat => ({
            name: cat.name,
            slug: cat.slug
          })),
          newCategories: newCategoriesToCreate,
          totalNew: newCategoriesToCreate.length
        },
        requiresAction: newCategoriesToCreate.length > 0
      }
    });

  } catch (error) {
    console.error('CSV preview error:', error);
    next(error);
  }
});

/**
 * @desc    Execute bulk import (Phase 2)
 * @route   POST /api/admin/import/execute
 * @access  Private/Admin
 */
router.post('/execute', protect, adminOnly, async (req, res, next) => {
  const session = await Product.startSession();
  
  try {
    const { products, newCategories } = req.body;

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'NO_PRODUCTS', message: 'No products to import' }
      });
    }

    await session.startTransaction();

    const importResults = {
      categoriesCreated: 0,
      productsCreated: 0,
      productsSkipped: 0,
      errors: []
    };

    // Phase 1: Create new categories
    if (newCategories && Array.isArray(newCategories) && newCategories.length > 0) {
      for (const catData of newCategories) {
        try {
          const existingCat = await Category.findOne({ slug: catData.slug }).session(session);
          
          if (!existingCat) {
            const newCategory = new Category({
              name: catData.name,
              // Don't set slug explicitly - let pre-save hook generate it
              image: catData.image,
              description: catData.description || '',
              order: catData.order || 0,
              isActive: true
            });
            
            await newCategory.save({ session });
            importResults.categoriesCreated++;
          }
        } catch (error) {
          // If duplicate key error, category was created by another process - skip
          if (error.code === 11000) {
            console.log(`Category ${catData.slug} already exists, skipping...`);
          } else {
            throw error;
          }
        }
      }
    }

    // Re-fetch all categories to get IDs
    const allCategories = await Category.find().session(session);
    const categorySlugToNameMap = {};
    allCategories.forEach(cat => {
      categorySlugToNameMap[cat.slug] = cat.name;
    });

    // Phase 2: Import products in batches
    const BATCH_SIZE = 50;
    for (let i = 0; i < products.length; i += BATCH_SIZE) {
      const batch = products.slice(i, i + BATCH_SIZE);

      for (const productData of batch) {
        try {
          // Skip invalid products
          if (!productData.isValid) {
            importResults.productsSkipped++;
            importResults.errors.push({
              row: productData.rowNumber,
              title: productData.title,
              error: 'Product validation failed'
            });
            continue;
          }

          // Resolve category names from slugs
          const resolvedCategories = productData.categories
            .map(catInfo => categorySlugToNameMap[catInfo.slug])
            .filter(name => name !== undefined);

          if (resolvedCategories.length === 0) {
            importResults.productsSkipped++;
            importResults.errors.push({
              row: productData.rowNumber,
              title: productData.title,
              error: 'No valid categories resolved'
            });
            continue;
          }

          // Create product
          const product = new Product({
            title: productData.title,
            shortDescription: productData.shortDescription,
            description: productData.description,
            images: productData.images,
            affiliateLinks: productData.affiliateLinks,
            price: productData.calculatedPrice,
            categories: resolvedCategories,
            tags: productData.tags || [],
            topSelling: productData.topSelling || false
          });

          await product.save({ session });
          importResults.productsCreated++;

        } catch (error) {
          importResults.productsSkipped++;
          importResults.errors.push({
            row: productData.rowNumber,
            title: productData.title,
            error: error.message
          });
        }
      }
    }

    // Commit transaction
    await session.commitTransaction();

    // Update category product counts (outside transaction)
    for (const cat of allCategories) {
      await Category.updateProductCount(cat.name);
    }

    res.json({
      success: true,
      data: importResults
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Bulk import execution error:', error);
    next(error);
  } finally {
    session.endSession();
  }
});

module.exports = router;

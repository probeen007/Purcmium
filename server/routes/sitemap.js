const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

/**
 * GET /sitemap.xml
 * Generate XML sitemap for search engines
 */
router.get('/', async (req, res) => {
  try {
    // Set XML headers immediately
    res.header('Content-Type', 'application/xml; charset=utf-8');
    res.header('Cache-Control', 'public, max-age=3600');
    
    // Get all active products (lean for read-only efficiency)
    const products = await Product.find({ active: { $ne: false }, status: 'active' })
      .select('slug _id updatedAt')
      .sort({ updatedAt: -1 })
      .lean();

    // Get categories (unique)
    const categories = await Product.distinct('categories', { status: 'active' });

    const baseUrl = process.env.FRONTEND_URL || 'https://purcmium.com';
    const currentDate = new Date().toISOString();

    // Pre-build URL strings for faster XML generation
    const urls = [];
    
    // Homepage
    urls.push(`  <url>\n    <loc>${baseUrl}</loc>\n    <lastmod>${currentDate}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>`);

    // Products page
    urls.push(`  <url>\n    <loc>${baseUrl}/products</loc>\n    <lastmod>${currentDate}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n  </url>`);

    // Category pages
    categories.forEach(category => {
      if (category) {
        urls.push(`  <url>\n    <loc>${baseUrl}/products?categories=${encodeURIComponent(category)}</loc>\n    <lastmod>${currentDate}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`);
      }
    });

    // Individual product pages
    products.forEach(product => {
      const productUrl = product.slug || product._id;
      const lastMod = product.updatedAt ? new Date(product.updatedAt).toISOString() : currentDate;
      
      urls.push(`  <url>\n    <loc>${baseUrl}/product/${productUrl}</loc>\n    <lastmod>${lastMod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>`);
    });

    // Build sitemap from pre-built URLs array (more efficient than string concatenation)
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`;
    
    // Headers already set at the start
    res.send(sitemap);

  } catch (error) {
    res.status(500).header('Content-Type', 'text/plain').send('Error generating sitemap');
  }
});

module.exports = router;

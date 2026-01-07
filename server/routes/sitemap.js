const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

/**
 * GET /sitemap.xml
 * Generate XML sitemap for search engines
 */
router.get('/', async (req, res) => {
  try {
    console.log('🗺️ Sitemap request received');
    
    // Set XML headers immediately
    res.header('Content-Type', 'application/xml; charset=utf-8');
    res.header('Cache-Control', 'public, max-age=3600');
    
    // Get all active products
    const products = await Product.find({ active: { $ne: false } })
      .select('slug _id updatedAt title')
      .sort({ updatedAt: -1 });

    // Get categories (unique)
    const categories = await Product.distinct('categories');

    const baseUrl = process.env.FRONTEND_URL || 'https://purcmium.com';
    const currentDate = new Date().toISOString();

    // Build XML sitemap
    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Homepage
    sitemap += '  <url>\n';
    sitemap += `    <loc>${baseUrl}</loc>\n`;
    sitemap += `    <lastmod>${currentDate}</lastmod>\n`;
    sitemap += '    <changefreq>daily</changefreq>\n';
    sitemap += '    <priority>1.0</priority>\n';
    sitemap += '  </url>\n';

    // Products page
    sitemap += '  <url>\n';
    sitemap += `    <loc>${baseUrl}/products</loc>\n`;
    sitemap += `    <lastmod>${currentDate}</lastmod>\n`;
    sitemap += '    <changefreq>daily</changefreq>\n';
    sitemap += '    <priority>0.9</priority>\n';
    sitemap += '  </url>\n';

    // Category pages
    categories.forEach(category => {
      if (category) {
        sitemap += '  <url>\n';
        sitemap += `    <loc>${baseUrl}/products?categories=${encodeURIComponent(category)}</loc>\n`;
        sitemap += `    <lastmod>${currentDate}</lastmod>\n`;
        sitemap += '    <changefreq>weekly</changefreq>\n';
        sitemap += '    <priority>0.8</priority>\n';
        sitemap += '  </url>\n';
      }
    });

    // Individual product pages
    products.forEach(product => {
      const productUrl = product.slug || product._id;
      const lastMod = product.updatedAt ? new Date(product.updatedAt).toISOString() : currentDate;
      
      sitemap += '  <url>\n';
      sitemap += `    <loc>${baseUrl}/product/${productUrl}</loc>\n`;
      sitemap += `    <lastmod>${lastMod}</lastmod>\n`;
      sitemap += '    <changefreq>weekly</changefreq>\n';
      sitemap += '    <priority>0.7</priority>\n';
      sitemap += '  </url>\n';
    });

    sitemap += '</urlset>';

    console.log(`✅ Sitemap generated: ${products.length} products`);
    
    // Headers already set at the start
    res.send(sitemap);

  } catch (error) {
    console.error('❌ Error generating sitemap:', error);
    res.status(500).header('Content-Type', 'text/plain').send('Error generating sitemap');
  }
});

module.exports = router;

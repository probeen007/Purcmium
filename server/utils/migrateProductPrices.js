/**
 * Migration script to add price field to existing affiliate links
 * Run this once to update all existing products in the database
 */

const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

const migrateProductPrices = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_ATLAS_URI || process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Find all products
    const products = await Product.find({});
    console.log(`Found ${products.length} products to migrate`);

    let updated = 0;
    let skipped = 0;

    for (const product of products) {
      let needsUpdate = false;

      // Check if any affiliate link is missing a price
      if (product.affiliateLinks && product.affiliateLinks.length > 0) {
        product.affiliateLinks.forEach((link, index) => {
          if (link.price == null || link.price === undefined) {
            // Set price to the product's main price if available, otherwise 0
            link.price = product.price || 0;
            needsUpdate = true;
            console.log(`  - Product "${product.title}": Set affiliate link ${index + 1} (${link.network || 'Unknown'}) price to ₹${link.price}`);
          }
        });
      }

      // Save the product if it was updated
      if (needsUpdate) {
        await product.save();
        updated++;
        console.log(`✅ Updated: ${product.title}`);
      } else {
        skipped++;
      }
    }

    console.log('\n📊 Migration Summary:');
    console.log(`  - Total products: ${products.length}`);
    console.log(`  - Updated: ${updated}`);
    console.log(`  - Skipped (already up-to-date): ${skipped}`);
    console.log('\n✅ Migration completed successfully!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

// Run migration
migrateProductPrices();

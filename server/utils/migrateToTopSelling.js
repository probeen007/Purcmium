const mongoose = require('mongoose');
const Product = require('../models/Product');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const migrateToTopSelling = async () => {
  try {
    console.log('Connecting to MongoDB...');
    
    // Prefer Atlas URI over local MongoDB
    const mongoUri = process.env.MONGODB_ATLAS_URI || process.env.MONGODB_URI || process.env.MONGO_URI;
    
    if (!mongoUri) {
      throw new Error('MongoDB URI is not defined in environment variables');
    }
    
    console.log('Using MongoDB URI:', mongoUri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@'));
    
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB successfully');

    // Update all products with featured: true to topSelling: true
    const result = await Product.updateMany(
      { featured: true },
      { 
        $set: { topSelling: true },
        $unset: { featured: "" }
      }
    );

    console.log(`Migration completed successfully!`);
    console.log(`Modified ${result.modifiedCount} products`);
    console.log(`Matched ${result.matchedCount} products`);

    // Verify the changes
    const topSellingCount = await Product.countDocuments({ topSelling: true });
    console.log(`Total top selling products: ${topSellingCount}`);

    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrateToTopSelling();

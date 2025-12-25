require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../models/Category');
const Product = require('../models/Product');

async function updateProductCounts() {
  try {
    const mongoUri = process.env.MONGODB_ATLAS_URI || process.env.MONGO_URI;
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000
    });
    console.log('✅ Connected to MongoDB');

    const categories = await Category.find({});
    
    for (const category of categories) {
      const count = await Product.countDocuments({ categories: category.name });
      category.productCount = count;
      await category.save();
      console.log(`  - ${category.name}: ${count} products`);
    }

    console.log('\n✅ Updated all category product counts');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateProductCounts();

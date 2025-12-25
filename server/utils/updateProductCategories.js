require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');

async function updateCategories() {
  try {
    const mongoUri = process.env.MONGODB_ATLAS_URI || process.env.MONGO_URI;
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000
    });
    console.log('✅ Connected to MongoDB');

    // Update each product to have only brand category
    await Product.updateOne(
      { title: 'iPhone 17 Pro Max' }, 
      { $set: { categories: ['Apple'] } }
    );
    
    await Product.updateOne(
      { title: /MacBook/ }, 
      { $set: { categories: ['Apple'] } }
    );
    
    await Product.updateOne(
      { title: /PlayStation/ }, 
      { $set: { categories: ['Sony'] } }
    );

    console.log('✅ Updated all products to have only brand categories');
    
    // Show updated products
    const products = await Product.find({}).select('title categories');
    console.log('\nUpdated products:');
    products.forEach(p => {
      console.log(`  - ${p.title}: ${p.categories.join(', ')}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateCategories();

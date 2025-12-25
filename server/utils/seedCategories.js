require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../models/Category');

const categories = [
  {
    name: 'Apple',
    image: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg',
    description: 'Premium Apple products including iPhone, MacBook, and more',
    isActive: true,
    order: 1
  },
  {
    name: 'Sony',
    image: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/Sony_logo.svg',
    description: 'Sony electronics including PlayStation, cameras, and audio devices',
    isActive: true,
    order: 2
  }
];

async function seedCategories() {
  try {
    // Connect to MongoDB with increased timeout
    const mongoUri = process.env.MONGODB_ATLAS_URI || process.env.MONGO_URI;
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000
    });
    console.log('✅ Connected to MongoDB');

    // Drop the categories collection to remove all data including indexes
    await mongoose.connection.db.dropCollection('categories').catch(() => {
      console.log('⚠️  Categories collection does not exist, creating new one');
    });
    console.log('🗑️  Dropped categories collection');

    // Insert new categories
    const insertedCategories = await Category.insertMany(categories);
    console.log(`✅ Added ${insertedCategories.length} categories:`);
    insertedCategories.forEach(cat => {
      console.log(`   - ${cat.name} (${cat.slug})`);
    });

    console.log('\n✅ Category seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    process.exit(1);
  }
}

seedCategories();

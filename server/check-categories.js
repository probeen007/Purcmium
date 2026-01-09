require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./models/Category');

async function checkCategories() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_ATLAS_URI || process.env.MONGO_URI;
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000
    });
    console.log('✅ Connected to MongoDB\n');

    // Fetch all categories
    const categories = await Category.find().select('name slug').sort({ name: 1 });
    
    if (categories.length === 0) {
      console.log('⚠️  NO CATEGORIES FOUND IN DATABASE!\n');
    } else {
      console.log(`📦 Found ${categories.length} categories in database:\n`);
      categories.forEach((cat, idx) => {
        console.log(`   ${idx + 1}. Name: "${cat.name}" → Slug: "${cat.slug}"`);
      });
    }

    // Test category slug normalization for CSV categories
    console.log('\n\n📝 Testing CSV Categories from sample-import.csv:\n');
    const csvCategories = ['Sony', 'Apple', 'Samsung', 'Dell'];
    const existingSlugs = new Set(categories.map(c => c.slug));
    const existingNames = new Set(categories.map(c => c.name));
    
    csvCategories.forEach(catName => {
      const slug = catName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      const existsBySlug = existingSlugs.has(slug);
      const existsByName = existingNames.has(catName);
      const status = existsBySlug ? '✅ EXISTS IN DB' : '❌ NEW (needs creation)';
      console.log(`   CSV: "${catName}" → Slug: "${slug}" → ${status}`);
    });

    console.log('\n');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkCategories();

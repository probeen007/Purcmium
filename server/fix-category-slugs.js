require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./models/Category');

async function fixCategorySlugs() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_ATLAS_URI || process.env.MONGO_URI;
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000
    });
    console.log('✅ Connected to MongoDB\n');

    // Find all categories
    const categories = await Category.find();
    console.log(`📦 Found ${categories.length} categories\n`);

    let fixed = 0;
    for (const cat of categories) {
      const oldSlug = cat.slug;
      
      // Generate proper slug from name
      const newSlug = cat.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      // Update only if slug is missing or incorrect
      if (!oldSlug || oldSlug === 'undefined' || oldSlug !== newSlug) {
        cat.slug = newSlug;
        await cat.save();
        console.log(`✅ Fixed: "${cat.name}" → Slug: "${oldSlug}" → "${newSlug}"`);
        fixed++;
      } else {
        console.log(`✓ OK: "${cat.name}" → Slug: "${cat.slug}"`);
      }
    }

    console.log(`\n🎉 Fixed ${fixed} category slugs!`);
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixCategorySlugs();

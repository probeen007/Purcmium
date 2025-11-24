const mongoose = require('mongoose');
require('dotenv').config();

const testAtlasConnection = async () => {
  const atlasUri = process.env.MONGODB_ATLAS_URI;
  
  console.log('🔍 Testing MongoDB Atlas Connection...');
  console.log('📍 URI (masked):', atlasUri ? atlasUri.replace(/:([^:@]{8})[^:@]*@/, ':$1***@') : 'Not found');
  
  if (!atlasUri) {
    console.error('❌ MONGODB_ATLAS_URI not found in .env file');
    return;
  }
  
  try {
    console.log('⏰ Attempting connection with 10-second timeout...');
    
    const conn = await mongoose.connect(atlasUri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 10000,
    });
    
    console.log('✅ Atlas Connection Successful!');
    console.log('📊 Host:', conn.connection.host);
    console.log('💾 Database:', conn.connection.name);
    console.log('🔗 Ready State:', conn.connection.readyState);
    
    // Test a simple operation
    const collections = await conn.connection.db.listCollections().toArray();
    console.log('📁 Collections found:', collections.length);
    
    await mongoose.disconnect();
    console.log('✅ Test completed successfully');
    
  } catch (error) {
    console.error('❌ Atlas Connection Failed:', error.message);
    
    if (error.message.includes('authentication failed')) {
      console.log('🔑 Issue: Invalid credentials');
      console.log('💡 Solution: Check username/password in Atlas URI');
    } else if (error.message.includes('timeout') || error.message.includes('ENOTFOUND')) {
      console.log('🌐 Issue: Network/DNS problem');
      console.log('💡 Solutions:');
      console.log('   - Check internet connection');
      console.log('   - Verify Atlas cluster is running');
      console.log('   - Add your IP to Atlas whitelist (0.0.0.0/0 for testing)');
    } else if (error.message.includes('bad auth')) {
      console.log('🔒 Issue: Authentication problem');
      console.log('💡 Solution: Verify database user permissions in Atlas');
    }
  }
  
  process.exit(0);
};

testAtlasConnection();
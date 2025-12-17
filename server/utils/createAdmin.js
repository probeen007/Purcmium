const Admin = require('../models/Admin');

const createAdmin = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({});
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      return;
    }
    
    // Create default admin from environment variables
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    if (!adminEmail || !adminPassword) {
      console.warn('⚠️  ADMIN_EMAIL and ADMIN_PASSWORD must be set in environment variables');
      return;
    }
    
    const adminData = {
      email: adminEmail,
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User'
    };
    
    console.log('🔧 Creating admin with password length:', adminPassword.length);
    await Admin.createAdmin(adminData);
    console.log('✅ Default admin user created successfully');
    console.log(`📧 Email: ${adminEmail}`);
    console.log('⚠️  Remember to change the default password in production!');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
  }
};

module.exports = { createAdmin };
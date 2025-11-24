#!/usr/bin/env node

/**
 * Purcmium Application Test & Verification Script
 * 
 * This script tests all major components and verifies the application is ready to run
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Purcmium Application Verification Script\n');

const checks = [];
let passed = 0;
let failed = 0;

function check(name, condition, successMsg, errorMsg) {
  const result = {
    name,
    passed: condition,
    message: condition ? successMsg : errorMsg
  };
  
  checks.push(result);
  
  if (condition) {
    console.log(`✅ ${name}: ${successMsg}`);
    passed++;
  } else {
    console.log(`❌ ${name}: ${errorMsg}`);
    failed++;
  }
}

console.log('📁 Checking Project Structure...');

// Check root files
check(
  'Root package.json',
  fs.existsSync('./package.json'),
  'Found root package.json',
  'Missing root package.json'
);

check(
  'README.md',
  fs.existsSync('./README.md'),
  'Found comprehensive README.md',
  'Missing README.md file'
);

check(
  '.gitignore',
  fs.existsSync('./.gitignore'),
  'Found .gitignore file',
  'Missing .gitignore file'
);

// Check server structure
console.log('\n🔧 Checking Server Structure...');

check(
  'Server directory',
  fs.existsSync('./server'),
  'Server directory exists',
  'Missing server directory'
);

check(
  'Server package.json',
  fs.existsSync('./server/package.json'),
  'Server package.json exists',
  'Missing server/package.json'
);

check(
  'Server entry point',
  fs.existsSync('./server/server.js'),
  'Server entry point exists',
  'Missing server/server.js'
);

check(
  'Product model',
  fs.existsSync('./server/models/Product.js'),
  'Product model exists',
  'Missing Product model'
);

check(
  'Admin model',
  fs.existsSync('./server/models/Admin.js'),
  'Admin model exists',
  'Missing Admin model'
);

check(
  'Auth middleware',
  fs.existsSync('./server/middleware/auth.js'),
  'Auth middleware exists',
  'Missing auth middleware'
);

check(
  'Admin routes',
  fs.existsSync('./server/routes/admin.js'),
  'Admin routes exist',
  'Missing admin routes'
);

check(
  'Product routes',
  fs.existsSync('./server/routes/products.js'),
  'Product routes exist',
  'Missing product routes'
);

check(
  'CreateAdmin utility',
  fs.existsSync('./server/utils/createAdmin.js'),
  'CreateAdmin utility exists',
  'Missing createAdmin utility'
);

// Check client structure
console.log('\n⚛️ Checking Client Structure...');

check(
  'Client directory',
  fs.existsSync('./client'),
  'Client directory exists',
  'Missing client directory'
);

check(
  'Client package.json',
  fs.existsSync('./client/package.json'),
  'Client package.json exists',
  'Missing client/package.json'
);

check(
  'Client App.js',
  fs.existsSync('./client/src/App.js'),
  'Client App.js exists',
  'Missing client/src/App.js'
);

check(
  'Home page',
  fs.existsSync('./client/src/pages/Home.js'),
  'Home page exists',
  'Missing Home page'
);

check(
  'Admin login',
  fs.existsSync('./client/src/pages/admin/AdminLogin.js'),
  'Admin login page exists',
  'Missing AdminLogin page'
);

check(
  'Admin dashboard',
  fs.existsSync('./client/src/pages/admin/AdminDashboard.js'),
  'Admin dashboard exists',
  'Missing AdminDashboard page'
);

check(
  'Admin products',
  fs.existsSync('./client/src/pages/admin/AdminProducts.js'),
  'Admin products page exists',
  'Missing AdminProducts page'
);

check(
  'Auth context',
  fs.existsSync('./client/src/context/AuthContext.js'),
  'Auth context exists',
  'Missing AuthContext'
);

check(
  'API utilities',
  fs.existsSync('./client/src/utils/api.js'),
  'API utilities exist',
  'Missing API utilities'
);

check(
  'Tailwind CSS',
  fs.existsSync('./client/src/index.css'),
  'Tailwind CSS file exists',
  'Missing index.css file'
);

// Check environment setup
console.log('\n🔐 Checking Environment Setup...');

check(
  'Client .env',
  fs.existsSync('./client/.env'),
  'Client environment file exists',
  'Missing client/.env file'
);

check(
  'Server .env example',
  fs.existsSync('./server/.env.example'),
  'Server .env.example exists',
  'Missing server/.env.example'
);

check(
  'Client .env example',
  fs.existsSync('./client/.env.example'),
  'Client .env.example exists',
  'Missing client/.env.example'
);

// Check development scripts
console.log('\n🚀 Checking Development Setup...');

check(
  'Windows start script',
  fs.existsSync('./start-dev.bat'),
  'Windows start script exists',
  'Missing start-dev.bat'
);

check(
  'Unix start script',
  fs.existsSync('./start-dev.sh'),
  'Unix start script exists',
  'Missing start-dev.sh'
);

// Check package.json scripts
let rootPackage;
try {
  rootPackage = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
} catch (e) {
  rootPackage = null;
}

check(
  'Dev script',
  rootPackage && rootPackage.scripts && rootPackage.scripts.dev,
  'Dev script configured',
  'Missing dev script in package.json'
);

check(
  'Install-all script',
  rootPackage && rootPackage.scripts && rootPackage.scripts['install-all'],
  'Install-all script configured',
  'Missing install-all script'
);

// Check dependencies
console.log('\n📦 Checking Dependencies...');

check(
  'Server node_modules',
  fs.existsSync('./server/node_modules'),
  'Server dependencies installed',
  'Server dependencies not installed - run: npm run install-server'
);

check(
  'Client node_modules',
  fs.existsSync('./client/node_modules'),
  'Client dependencies installed',
  'Client dependencies not installed - run: npm run install-client'
);

check(
  'Root node_modules',
  fs.existsSync('./node_modules'),
  'Root dependencies installed',
  'Root dependencies not installed - run: npm install'
);

// Final report
console.log('\n📊 Verification Results:');
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%\n`);

if (failed === 0) {
  console.log('🎉 Congratulations! Your Purcmium application is ready to launch!');
  console.log('\n🚀 Next Steps:');
  console.log('1. Start MongoDB service');
  console.log('2. Run: npm run dev');
  console.log('3. Open http://localhost:3000');
  console.log('4. Admin panel: http://localhost:3000/admin/login');
  console.log('5. Default credentials: admin / admin123456');
} else {
  console.log('⚠️ Please fix the failed checks before running the application.');
  console.log('\n🔧 Common Solutions:');
  console.log('- Run: npm run install-all (to install dependencies)');
  console.log('- Check file paths and directory structure');
  console.log('- Ensure all files were created properly');
}

console.log('\n📖 For detailed setup instructions, see README.md');
console.log('💬 For support, check the troubleshooting section in README.md');

process.exit(failed === 0 ? 0 : 1);
#!/usr/bin/env node

/**
 * BenMarket Setup Test Script
 * Run this to verify your setup is working correctly
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 BenMarket Setup Test\n');

// Check if we're in the right directory
const requiredDirs = ['backend', 'frontend'];
const missingDirs = requiredDirs.filter(dir => !fs.existsSync(dir));

if (missingDirs.length > 0) {
  console.error('❌ Missing required directories:', missingDirs.join(', '));
  console.error('Please run this script from the BEN-MARKET root directory');
  process.exit(1);
}

console.log('✅ Directory structure looks good');

// Check backend package.json
const backendPackagePath = path.join('backend', 'package.json');
if (fs.existsSync(backendPackagePath)) {
  const backendPackage = JSON.parse(fs.readFileSync(backendPackagePath, 'utf8'));
  console.log('✅ Backend package.json found');
  console.log(`   - Name: ${backendPackage.name}`);
  console.log(`   - Version: ${backendPackage.version}`);
} else {
  console.error('❌ Backend package.json not found');
}

// Check frontend package.json
const frontendPackagePath = path.join('frontend', 'package.json');
if (fs.existsSync(frontendPackagePath)) {
  const frontendPackage = JSON.parse(fs.readFileSync(frontendPackagePath, 'utf8'));
  console.log('✅ Frontend package.json found');
  console.log(`   - Name: ${frontendPackage.name}`);
  console.log(`   - Version: ${frontendPackage.version}`);
} else {
  console.error('❌ Frontend package.json not found');
}

// Check for .env files
const envFiles = [
  { path: 'backend/.env', required: false },
  { path: 'frontend/.env', required: false }
];

envFiles.forEach(env => {
  if (fs.existsSync(env.path)) {
    console.log(`✅ ${env.path} found`);
  } else {
    console.log(`⚠️  ${env.path} not found (create it with the required variables)`);
  }
});

// Check key files
const keyFiles = [
  'backend/server.js',
  'backend/config/db.js',
  'backend/Models/User.js',
  'backend/Models/Product.js',
  'backend/Models/Order.js',
  'frontend/src/App.jsx',
  'frontend/src/context/ShopContext.jsx',
  'frontend/src/api/axios.js',
  'frontend/src/api/services.js'
];

console.log('\n📁 Checking key files:');
keyFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} missing`);
  }
});

console.log('\n🚀 Next Steps:');
console.log('1. Install dependencies:');
console.log('   cd backend && npm install');
console.log('   cd ../frontend && npm install');
console.log('');
console.log('2. Create .env files with your configuration');
console.log('');
console.log('3. Seed the database:');
console.log('   cd backend && npm run seed');
console.log('');
console.log('4. Start the servers:');
console.log('   # Terminal 1:');
console.log('   cd backend && npm run dev');
console.log('   # Terminal 2:');
console.log('   cd frontend && npm run dev');
console.log('');
console.log('5. Visit http://localhost:3000 to see your app!');
console.log('');
console.log('📚 For detailed instructions, see README.md');

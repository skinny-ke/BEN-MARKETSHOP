#!/usr/bin/env node

const axios = require('axios');

const API_URL = 'http://localhost:5001';
const FRONTEND_URL = 'http://localhost:5173';

async function testApplication() {
  console.log('🧪 Testing BEN-MARKET Application...\n');

  try {
    // Test backend health
    console.log('1. Testing Backend Health...');
    const healthResponse = await axios.get(`${API_URL}/`);
    console.log('✅ Backend is running:', healthResponse.data);

    // Test products endpoint (should work even without DB)
    console.log('\n2. Testing Products Endpoint...');
    try {
      const productsResponse = await axios.get(`${API_URL}/api/products`);
      console.log('✅ Products endpoint working:', productsResponse.data.length, 'products');
    } catch (error) {
      console.log('⚠️  Products endpoint error (expected without DB):', error.response?.data?.message || error.message);
    }

    // Test auth endpoints
    console.log('\n3. Testing Auth Endpoints...');
    try {
      const authResponse = await axios.get(`${API_URL}/api/auth/health`);
      console.log('✅ Auth endpoint working:', authResponse.data);
    } catch (error) {
      console.log('⚠️  Auth endpoint error:', error.response?.data?.message || error.message);
    }

    // Test frontend (if running)
    console.log('\n4. Testing Frontend...');
    try {
      const frontendResponse = await axios.get(FRONTEND_URL, { timeout: 5000 });
      console.log('✅ Frontend is running (status:', frontendResponse.status, ')');
    } catch (error) {
      console.log('⚠️  Frontend not accessible:', error.message);
    }

    console.log('\n🎉 Application test completed!');
    console.log('\n📋 Next Steps:');
    console.log('1. Set up MongoDB for full functionality');
    console.log('2. Configure Cloudinary for image uploads');
    console.log('3. Set up MPesa credentials for payments');
    console.log('4. Update environment variables for production');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testApplication();

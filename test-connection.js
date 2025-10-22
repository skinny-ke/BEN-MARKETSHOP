const axios = require('axios');

const testConnection = async () => {
  console.log('🔍 Testing Frontend-Backend Connection...\n');
  
  const backendUrl = 'http://localhost:5000';
  const frontendUrl = 'http://localhost:5173';
  
  try {
    // Test backend health
    console.log('1. Testing Backend Health...');
    const healthResponse = await axios.get(`${backendUrl}/health`);
    console.log('✅ Backend is running:', healthResponse.data);
    
    // Test backend products endpoint
    console.log('\n2. Testing Backend Products Endpoint...');
    const productsResponse = await axios.get(`${backendUrl}/api/products`);
    console.log('✅ Products endpoint working:', productsResponse.data.length, 'products found');
    
    // Test backend auth endpoint
    console.log('\n3. Testing Backend Auth Endpoint...');
    const authResponse = await axios.get(`${backendUrl}/api/auth/health`);
    console.log('✅ Auth endpoint working:', authResponse.data);
    
    console.log('\n🎉 All backend tests passed!');
    console.log('\n📋 Next steps:');
    console.log('1. Start the backend: cd backend && npm run dev');
    console.log('2. Start the frontend: cd frontend && npm run dev');
    console.log('3. Open http://localhost:5173 in your browser');
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure to start the backend server first:');
      console.log('   cd backend && npm run dev');
    }
  }
};

testConnection();

import fetch from 'node-fetch';

async function testCORS() {
  console.log('🧪 Testing CORS configuration...\n');
  
  // Test 1: Health check
  try {
    const response = await fetch('http://localhost:3000/health', {
      headers: { 'Origin': 'http://localhost:5173' }
    });
    const data = await response.json();
    console.log('✅ Health check:', data);
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
  }
  
  // Test 2: Login endpoint
  try {
    const response = await fetch('http://localhost:3000/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:5173'
      },
      body: JSON.stringify({
        email: 'manager@buildtrack.com',
        password: 'password123'
      })
    });
    const data = await response.json();
    console.log('✅ Login response:', data);
  } catch (error) {
    console.log('❌ Login failed:', error.message);
  }
}

testCORS();

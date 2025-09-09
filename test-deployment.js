// Simple script to test if the deployed API is working
const https = require('https');
const http = require('http');

// Replace with your actual Railway URL
const API_URL = process.argv[2] || 'https://your-app.railway.app';

console.log(`Testing API at: ${API_URL}`);

// Test health endpoint
const testHealth = () => {
  return new Promise((resolve, reject) => {
    const client = API_URL.startsWith('https') ? https : http;
    client.get(`${API_URL}/health`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('✅ Health check:', JSON.parse(data));
        resolve();
      });
    }).on('error', reject);
  });
};

// Test API routes
const testAPI = () => {
  return new Promise((resolve, reject) => {
    const client = API_URL.startsWith('https') ? https : http;
    client.get(`${API_URL}/api/test`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('✅ API routes:', JSON.parse(data));
        resolve();
      });
    }).on('error', reject);
  });
};

// Test signup endpoint (should return validation error)
const testSignup = () => {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      name: '',
      email: '',
      password: ''
    });

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const client = API_URL.startsWith('https') ? https : http;
    const req = client.request(`${API_URL}/api/auth/signup`, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('✅ Signup endpoint (validation):', JSON.parse(data));
        resolve();
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
};

// Run all tests
async function runTests() {
  try {
    await testHealth();
    await testAPI();
    await testSignup();
    console.log('\n🎉 All tests passed! Your API is working correctly.');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

runTests();

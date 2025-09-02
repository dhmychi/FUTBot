import axios from 'axios';

// KeyAuth config from your Vercel env
const KEYAUTH_CONFIG = {
  name: "futbot",
  ownerid: "j5oBWrvrnm", // Owner ID from KeyAuth
  secret: "71d7d7717aea788ae29b063fab062482e707ae9826c1e425acffaa7cd816dfc5",
  version: "1.0",
  url: "https://keyauth.win/api/1.2/"
};

async function testKeyAuth() {
  console.log('🔍 Testing KeyAuth API connection...');
  console.log('Config:', {
    name: KEYAUTH_CONFIG.name,
    ownerid: KEYAUTH_CONFIG.ownerid || 'MISSING',
    secret: KEYAUTH_CONFIG.secret ? '***' : 'MISSING',
    version: KEYAUTH_CONFIG.version,
    url: KEYAUTH_CONFIG.url
  });

  try {
    // Test 1: Initialize session
    console.log('\n1️⃣ Testing KeyAuth init...');
    const initPayload = {
      type: 'init',
      name: KEYAUTH_CONFIG.name,
      ownerid: KEYAUTH_CONFIG.ownerid,
      secret: KEYAUTH_CONFIG.secret,
      version: KEYAUTH_CONFIG.version
    };
    
    console.log('Sending payload:', initPayload);
    
    // Convert to form-encoded format
    const formData = new URLSearchParams();
    Object.keys(initPayload).forEach(key => {
      formData.append(key, initPayload[key]);
    });
    
    const initResponse = await axios.post(KEYAUTH_CONFIG.url, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      }
    });

    console.log('Init Response:', initResponse.data);

    if (!initResponse.data.success) {
      console.error('❌ KeyAuth init failed:', initResponse.data.message);
      return;
    }

    console.log('✅ KeyAuth init successful!');
    const sessionId = initResponse.data.sessionid;
    console.log('Session ID:', sessionId);

    // Test 2: Use an existing license key (you should create one manually in KeyAuth dashboard)
    console.log('\n2️⃣ Using existing license key...');
    // You need to create a license manually in KeyAuth dashboard and put it here
    const testLicense = 'TEST-XXXX-XXXX-XXXX'; // Replace with actual license from KeyAuth dashboard
    console.log('Using test license:', testLicense);

    // Test 3: Register a test user
    console.log('\n3️⃣ Testing user registration...');
    const testUsername = 'testuser_' + Date.now();
    const testPassword = 'testpass123';
    const testEmail = 'test@example.com';

    const registerPayload = {
      type: 'register',
      name: KEYAUTH_CONFIG.name,
      ownerid: KEYAUTH_CONFIG.ownerid,
      secret: KEYAUTH_CONFIG.secret,
      sessionid: sessionId, // Add session ID
      username: testUsername,
      password: testPassword,
      key: testLicense, // Use the license we just created
      email: testEmail
    };

    const registerFormData = new URLSearchParams();
    Object.keys(registerPayload).forEach(key => {
      registerFormData.append(key, registerPayload[key]);
    });

    const registerResponse = await axios.post(KEYAUTH_CONFIG.url, registerFormData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      }
    });

    console.log('Register Response:', registerResponse.data);

    if (!registerResponse.data.success) {
      console.error('❌ User registration failed:', registerResponse.data.message);
      return;
    }

    console.log('✅ Test user registered successfully!');
    console.log('Test User Details:', {
      username: testUsername,
      password: testPassword,
      email: testEmail,
      license: testLicense
    });

  } catch (error) {
    console.error('❌ KeyAuth API Error:', {
      message: error.message,
      response: error.response?.data || 'No response data',
      status: error.response?.status
    });
  }
}

// Run the test
testKeyAuth();

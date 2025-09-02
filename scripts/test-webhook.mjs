import axios from 'axios';

// Test webhook directly
async function testWebhook() {
  console.log('🔍 Testing PayPal webhook directly...');
  
  // Mock PayPal webhook event
  const mockEvent = {
    event_type: 'PAYMENT.SALE.COMPLETED',
    resource: {
      id: 'test_payment_' + Date.now(),
      amount: {
        total: '15.00',
        currency: 'USD'
      },
      gross_amount: {
        value: '15.00',
        currency_code: 'USD'
      },
      payer: {
        email_address: 'test@example.com'
      },
      payer_info: {
        email: 'test@example.com'
      },
      purchase_units: [{
        custom_id: JSON.stringify({
          planId: '1',
          email: 'test@example.com',
          accessCode: 'testpass123',
          timestamp: Date.now()
        })
      }]
    }
  };

  try {
    // Test local webhook (if running locally)
    console.log('\n1️⃣ Testing local webhook...');
    const localResponse = await axios.post('http://localhost:3000/api/webhook', mockEvent, {
      headers: {
        'Content-Type': 'application/json',
        'paypal-transmission-id': 'test-transmission-id',
        'paypal-auth-algo': 'SHA256withRSA',
        'paypal-transmission-sig': 'test-signature',
        'paypal-transmission-time': new Date().toISOString(),
        'paypal-cert-url': 'https://api.sandbox.paypal.com/v1/notifications/certs/test'
      },
      timeout: 10000
    });
    
    console.log('Local webhook response:', localResponse.data);
    
  } catch (error) {
    console.log('❌ Local webhook not available or failed:', error.message);
    
    // Test production webhook
    console.log('\n2️⃣ Testing production webhook...');
    try {
      const prodResponse = await axios.post('https://www.futbot.club/api/webhook', mockEvent, {
        headers: {
          'Content-Type': 'application/json',
          'paypal-transmission-id': 'test-transmission-id',
          'paypal-auth-algo': 'SHA256withRSA',
          'paypal-transmission-sig': 'test-signature',
          'paypal-transmission-time': new Date().toISOString(),
          'paypal-cert-url': 'https://api.sandbox.paypal.com/v1/notifications/certs/test'
        },
        timeout: 15000
      });
      
      console.log('✅ Production webhook response:', prodResponse.data);
      
    } catch (prodError) {
      console.error('❌ Production webhook failed:', {
        message: prodError.message,
        status: prodError.response?.status,
        data: prodError.response?.data
      });
    }
  }
}

// Test KeyAuth separately
async function testKeyAuthDirect() {
  console.log('\n🔑 Testing KeyAuth registration directly...');
  
  const KEYAUTH_CONFIG = {
    name: "futbot",
    ownerid: "j5oBWrvrnm",
    secret: "71d7d7717aea788ae29b063fab062482e707ae9826c1e425acffaa7cd816dfc5",
    version: "1.0",
    url: "https://keyauth.win/api/1.2/"
  };

  try {
    // Initialize session
    const initPayload = new URLSearchParams();
    initPayload.append('type', 'init');
    initPayload.append('name', KEYAUTH_CONFIG.name);
    initPayload.append('ownerid', KEYAUTH_CONFIG.ownerid);
    initPayload.append('secret', KEYAUTH_CONFIG.secret);
    initPayload.append('version', KEYAUTH_CONFIG.version);

    const initResponse = await axios.post(KEYAUTH_CONFIG.url, initPayload, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    if (!initResponse.data.success) {
      console.error('❌ KeyAuth init failed:', initResponse.data.message);
      return;
    }

    console.log('✅ KeyAuth init successful');
    const sessionId = initResponse.data.sessionid;

    // Try to register a test user (this will fail without a valid license, but we can see the error)
    const testUsername = 'testuser_' + Date.now();
    const testPassword = 'testpass123';
    const testEmail = 'test@example.com';
    const testLicense = 'TEST-INVALID-LICENSE'; // This will fail but show us the error

    const registerPayload = new URLSearchParams();
    registerPayload.append('type', 'register');
    registerPayload.append('name', KEYAUTH_CONFIG.name);
    registerPayload.append('ownerid', KEYAUTH_CONFIG.ownerid);
    registerPayload.append('secret', KEYAUTH_CONFIG.secret);
    registerPayload.append('sessionid', sessionId);
    registerPayload.append('username', testUsername);
    registerPayload.append('password', testPassword);
    registerPayload.append('key', testLicense);
    registerPayload.append('email', testEmail);

    const registerResponse = await axios.post(KEYAUTH_CONFIG.url, registerPayload, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    console.log('Register response:', registerResponse.data);
    
    if (registerResponse.data.success) {
      console.log('✅ KeyAuth registration successful!');
    } else {
      console.log('❌ KeyAuth registration failed (expected with invalid license):', registerResponse.data.message);
    }

  } catch (error) {
    console.error('❌ KeyAuth test error:', {
      message: error.message,
      response: error.response?.data
    });
  }
}

// Run tests
async function runAllTests() {
  await testWebhook();
  await testKeyAuthDirect();
}

runAllTests();

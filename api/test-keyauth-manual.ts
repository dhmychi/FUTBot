import type { VercelRequest, VercelResponse } from '@vercel/node';

// Manual KeyAuth user creation for testing
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, accessCode } = req.body;

    if (!email || !accessCode) {
      return res.status(400).json({ 
        error: 'Missing required fields: email, accessCode' 
      });
    }

    // Import webhook functions
    const webhookModule = await import('./webhook');
    
    // Simulate successful payment event
    const mockEvent = {
      event_type: 'PAYMENT.SALE.COMPLETED',
      resource: {
        id: 'manual_test_' + Date.now(),
        amount: {
          total: '9.99',
          currency: 'USD'
        },
        payer: {
          email_address: email
        },
        purchase_units: [{
          custom_id: JSON.stringify({
            planId: 'manual-test',
            email: email,
            accessCode: accessCode,
            timestamp: Date.now()
          })
        }]
      }
    };

    console.log('🧪 Manual KeyAuth test started:', { email, accessCodeLength: accessCode.length });

    // Call handleSuccessfulPayment directly
    // We need to extract the function from the webhook module
    // For now, let's manually create the KeyAuth user
    
    const axios = (await import('axios')).default;
    
    // KeyAuth configuration
    const KEYAUTH_CONFIG = {
      name: process.env.KEYAUTH_NAME || process.env.KEYAUTH_APP_NAME || "futbot",
      ownerid: process.env.KEYAUTH_OWNER_ID || "",
      secret: process.env.KEYAUTH_SECRET || process.env.KEYAUTH_APP_SECRET || "",
      version: process.env.KEYAUTH_VERSION || process.env.KEYAUTH_APP_VERSION || "1.0.0",
      url: process.env.KEYAUTH_URL || "https://keyauth.win/api/1.2/"
    };

    console.log('KeyAuth Config:', {
      name: KEYAUTH_CONFIG.name,
      ownerid: KEYAUTH_CONFIG.ownerid ? '***' : 'MISSING',
      secret: KEYAUTH_CONFIG.secret ? '***' : 'MISSING',
      url: KEYAUTH_CONFIG.url
    });

    // Initialize KeyAuth session
    const initPayload = new URLSearchParams();
    initPayload.append('type', 'init');
    initPayload.append('name', KEYAUTH_CONFIG.name);
    initPayload.append('ownerid', KEYAUTH_CONFIG.ownerid);
    initPayload.append('secret', KEYAUTH_CONFIG.secret);
    initPayload.append('version', KEYAUTH_CONFIG.version);

    console.log('🔄 Initializing KeyAuth session...');
    const initResponse = await axios.post(KEYAUTH_CONFIG.url, initPayload, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    console.log('KeyAuth init response:', initResponse.data);

    if (!initResponse.data.success) {
      throw new Error(`KeyAuth initialization failed: ${initResponse.data.message}`);
    }

    const sessionId = initResponse.data.sessionid;
    console.log('✅ KeyAuth session initialized:', sessionId);

    // Create license key
    const licenseKey = `FUTBOT-MANUAL-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    console.log('🎫 Generated license key:', licenseKey);

    // Register user
    const registerPayload = new URLSearchParams();
    registerPayload.append('type', 'register');
    registerPayload.append('name', KEYAUTH_CONFIG.name);
    registerPayload.append('ownerid', KEYAUTH_CONFIG.ownerid);
    registerPayload.append('secret', KEYAUTH_CONFIG.secret);
    registerPayload.append('sessionid', sessionId);
    registerPayload.append('username', email); // Use email as username
    registerPayload.append('password', accessCode);
    registerPayload.append('key', licenseKey);
    registerPayload.append('email', email);

    console.log('🔄 Registering KeyAuth user...');
    const registerResponse = await axios.post(KEYAUTH_CONFIG.url, registerPayload, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    console.log('KeyAuth register response:', registerResponse.data);

    if (!registerResponse.data.success) {
      throw new Error(`KeyAuth registration failed: ${registerResponse.data.message || 'Unknown error'}`);
    }

    console.log('✅ KeyAuth user registered successfully!');

    res.status(200).json({ 
      success: true, 
      message: 'KeyAuth user created successfully',
      data: {
        email: email,
        username: email,
        licenseKey: licenseKey,
        keyAuthResponse: registerResponse.data
      }
    });

  } catch (error) {
    console.error('❌ Manual KeyAuth test failed:', error);
    res.status(500).json({ 
      error: 'KeyAuth user creation failed',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}

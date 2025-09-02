import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
import { Resend } from 'resend';

// This endpoint will be called directly from the frontend after successful PayPal payment
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
    const { email, accessCode, paymentId, planId, amount } = req.body;

    if (!email || !accessCode || !paymentId) {
      return res.status(400).json({ 
        error: 'Missing required fields: email, accessCode, paymentId' 
      });
    }

    console.log('🎯 Creating KeyAuth user after payment:', { 
      email, 
      paymentId, 
      planId, 
      amount,
      accessCodeLength: accessCode.length 
    });

    // KeyAuth configuration
    const KEYAUTH_CONFIG = {
      name: process.env.KEYAUTH_NAME || process.env.KEYAUTH_APP_NAME || "futbot",
      ownerid: process.env.KEYAUTH_OWNER_ID || "",
      secret: process.env.KEYAUTH_SECRET || process.env.KEYAUTH_APP_SECRET || "",
      version: process.env.KEYAUTH_VERSION || process.env.KEYAUTH_APP_VERSION || "1.0.0",
      url: process.env.KEYAUTH_URL || "https://keyauth.win/api/1.2/"
    };

    // Validate KeyAuth config
    if (!KEYAUTH_CONFIG.ownerid || !KEYAUTH_CONFIG.secret) {
      throw new Error('KeyAuth configuration missing');
    }

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

    if (!initResponse.data.success) {
      console.error('KeyAuth init failed:', initResponse.data);
      throw new Error(`KeyAuth initialization failed: ${initResponse.data.message}`);
    }

    const sessionId = initResponse.data.sessionid;
    console.log('✅ KeyAuth session initialized');

    // Generate license key
    const licenseKey = `FUTBOT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    console.log('🎫 Generated license key:', licenseKey);

    // Register user in KeyAuth
    const registerPayload = new URLSearchParams();
    registerPayload.append('type', 'register');
    registerPayload.append('name', KEYAUTH_CONFIG.name);
    registerPayload.append('ownerid', KEYAUTH_CONFIG.ownerid);
    registerPayload.append('secret', KEYAUTH_CONFIG.secret);
    registerPayload.append('sessionid', sessionId);
    registerPayload.append('username', email); // Use email as username
    registerPayload.append('pass', accessCode); // KeyAuth uses 'pass', not 'password'
    registerPayload.append('key', licenseKey);
    registerPayload.append('email', email);

    console.log('🔄 Registering KeyAuth user...');
    const registerResponse = await axios.post(KEYAUTH_CONFIG.url, registerPayload, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    console.log('KeyAuth register response:', registerResponse.data);

    if (!registerResponse.data.success) {
      console.error('KeyAuth registration failed:', registerResponse.data);
      throw new Error(`KeyAuth registration failed: ${registerResponse.data.message || 'Unknown error'}`);
    }

    console.log('✅ KeyAuth user registered successfully!');

    // Send welcome email
    const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
    const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev';
    
    if (RESEND_API_KEY) {
      try {
        const resend = new Resend(RESEND_API_KEY);
        
        const emailResult = await resend.emails.send({
          from: FROM_EMAIL,
          to: email,
          subject: '🎉 Welcome to FUTBot - Your Account is Ready!',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #4169E1;">Welcome to FUTBot! 🚀</h2>
              <p>Your subscription has been activated successfully!</p>
              
              <div style="background: #f8f9fa; padding: 16px; border-radius: 8px; margin: 16px 0;">
                <h3>Your Login Credentials</h3>
                <p><strong>Username:</strong> ${email}</p>
                <p><strong>Password:</strong> ${accessCode}</p>
                <p><strong>License Key:</strong> ${licenseKey}</p>
              </div>
              
              <h3>Next Steps:</h3>
              <ol>
                <li>Install the FUTBot Chrome Extension</li>
                <li>Log in using your email and access code</li>
                <li>Start trading and earning!</li>
              </ol>
              
              <p>Need help? Contact us at support@futbot.club</p>
              <p>Happy Trading!<br/>FUTBot Team</p>
            </div>
          `
        });
        
        console.log('✅ Welcome email sent:', emailResult);
      } catch (emailError) {
        console.error('❌ Failed to send welcome email:', emailError);
      }
    }

    res.status(200).json({ 
      success: true, 
      message: 'KeyAuth user created successfully',
      data: {
        email: email,
        username: email,
        licenseKey: licenseKey,
        paymentId: paymentId
      }
    });

  } catch (error) {
    console.error('❌ KeyAuth user creation failed:', error);
    res.status(500).json({ 
      error: 'Failed to create KeyAuth user',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}

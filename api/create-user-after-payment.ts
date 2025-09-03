import { VercelRequest, VercelResponse } from '@vercel/node';

// KeyAuth configuration
const KEYAUTH_CONFIG = {
  name: process.env.KEYAUTH_NAME || 'futbot',
  ownerid: process.env.KEYAUTH_OWNERID || 'j5oBWrvrnm',
  secret: process.env.KEYAUTH_SECRET || '71d7d7717aea788ae29b063fab062482e707ae9826c1e425acffaa7cd816dfc5',
  version: '1.0'
};

// Plan configurations (map frontend plan ids to KeyAuth subscription names and expiry days)
const PLAN_CONFIGS: Record<string, { subscription: string; expiry: number }> = {
  // Frontend plan ids
  '1_month': { subscription: '1 Month', expiry: 30 },
  '3_months': { subscription: '3 Months', expiry: 90 },
  '12_months': { subscription: '12 Months', expiry: 365 },
  // Backward-compatible aliases
  'basic': { subscription: '1 Month', expiry: 30 },
  'pro': { subscription: '3 Months', expiry: 90 },
  'premium': { subscription: '12 Months', expiry: 365 },
};

interface CreateUserRequest {
  email: string;
  accessCode: string;
  paymentId: string;
  planId: string;
  amount: number;
}

// CORS configuration
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
      .setHeader('Access-Control-Allow-Headers', 'Content-Type')
      .end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed',
      message: 'Only POST requests are supported'
    });
  }

  try {
    const { email, accessCode, paymentId, planId, amount }: CreateUserRequest = req.body;

    console.log('🔄 Creating KeyAuth user after payment:', {
      email,
      accessCode,
      paymentId,
      planId,
      amount
    });

    // Validate required fields
    if (!email || !accessCode || !paymentId || !planId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'Email, access code, payment ID, and plan ID are required'
      });
    }

    // Get plan configuration
    const planConfig = PLAN_CONFIGS[planId as keyof typeof PLAN_CONFIGS];
    if (!planConfig) {
      return res.status(400).json({
        success: false,
        error: 'Invalid plan',
        message: `Plan ${planId} is not supported`
      });
    }

    // Create KeyAuth user
    const keyauthResponse = await fetch('https://keyauth.win/api/1.2/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'FUTBot-KeyAuth-Client/1.0'
      },
      body: new URLSearchParams({
        type: 'adduser',
        username: accessCode,
        pass: accessCode, // Use access code as password
        email: email,
        // For application API adduser, expiry expects number of days
        expiry: String(planConfig.expiry),
        subscription: planConfig.subscription,
        name: KEYAUTH_CONFIG.name,
        ownerid: KEYAUTH_CONFIG.ownerid,
        secret: KEYAUTH_CONFIG.secret,
        version: KEYAUTH_CONFIG.version
      }).toString()
    });

    const keyauthData = await keyauthResponse.json();
    
    console.log('KeyAuth API Response:', keyauthData);

    if (!keyauthData.success) {
      // Handle specific KeyAuth errors
      let errorMessage = keyauthData.message || 'Failed to create user account';
      
      if (errorMessage.includes('already exists')) {
        errorMessage = 'This access code is already registered. Please use a different code.';
      } else if (errorMessage.includes('subscription')) {
        errorMessage = 'Invalid subscription plan. Please contact support.';
      } else if (errorMessage.includes('expiry')) {
        errorMessage = 'Invalid expiry date. Please contact support.';
      }

      return res.status(400).json({
        success: false,
        error: 'KeyAuth error',
        message: errorMessage,
        keyauth_response: keyauthData
      });
    }

    // Success response
    const response = {
      success: true,
      message: 'User created successfully',
      data: {
        username: accessCode,
        email: email,
        subscription: planConfig.subscription,
        expiry_days: planConfig.expiry,
        paymentId: paymentId,
        planId: planId,
        amount: amount
      },
      keyauth_response: keyauthData
    };

    console.log('✅ User created successfully:', response);

    return res.status(200)
      .setHeader('Access-Control-Allow-Origin', '*')
      .json(response);

  } catch (error) {
    console.error('❌ Error creating user after payment:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return res.status(500)
      .setHeader('Access-Control-Allow-Origin', '*')
      .json({
        success: false,
        error: 'Internal server error',
        message: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error : undefined
      });
  }
}

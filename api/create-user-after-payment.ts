import { VercelRequest, VercelResponse } from '@vercel/node';

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

    // Get KEYAUTH_SELLER_KEY from environment
    const KEYAUTH_SELLER_KEY = process.env.KEYAUTH_SELLER_KEY || "e5bb8c336379263e3e19f5939357fac6";
    
    if (!KEYAUTH_SELLER_KEY) {
      return res.status(500).json({
        success: false,
        error: 'KeyAuth configuration incomplete',
        message: 'KEYAUTH_SELLER_KEY not found in environment variables'
      });
    }

    // Step 1: Create license key via Seller API
    console.log('🔑 Creating license key via Seller API...');
    
    const axios = (await import('axios')).default;
    
    const sellerParams = new URLSearchParams();
    sellerParams.append('sellerkey', KEYAUTH_SELLER_KEY);
    sellerParams.append('type', 'add');
    sellerParams.append('expiry', planConfig.expiry.toString());
    sellerParams.append('amount', '1');
    sellerParams.append('level', '1');
    sellerParams.append('mask', '******-******-******-******');
    sellerParams.append('format', 'JSON');
    sellerParams.append('note', `Created for ${email} - Plan: ${planId} - Payment: ${paymentId}`);

    // ✅ fix: use GET instead of POST
    const sellerResponse = await axios.get(`https://keyauth.win/api/seller/?${sellerParams.toString()}`);

    console.log('📥 Seller API Response:', sellerResponse.data);

    if (!sellerResponse.data.success) {
      return res.status(500).json({
        success: false,
        error: 'Failed to create license key via Seller API',
        message: sellerResponse.data.message || 'Seller API failed',
        keyauth_response: sellerResponse.data
      });
    }

    const licenseKey = sellerResponse.data.key || sellerResponse.data.keys?.[0];
    if (!licenseKey) {
      return res.status(500).json({
        success: false,
        error: 'No license key returned from Seller API',
        keyauth_response: sellerResponse.data
      });
    }

    console.log('✅ License key created successfully via Seller API:', licenseKey);

    // Step 2: Create user directly via Seller API activate
    console.log('👤 Creating user via Seller API activate...');
    
    const activateParams = new URLSearchParams();
    activateParams.append('sellerkey', KEYAUTH_SELLER_KEY);
    activateParams.append('type', 'activate');
    activateParams.append('user', email);
    activateParams.append('key', licenseKey);
    activateParams.append('pass', accessCode);

    const activateResponse = await axios.get(`https://keyauth.win/api/seller/?${activateParams.toString()}`);

    console.log('📥 Activate API Response:', activateResponse.data);

    if (!activateResponse.data.success) {
      return res.status(500).json({
        success: false,
        error: 'Failed to create KeyAuth user',
        message: activateResponse.data.message || 'User activation failed',
        keyauth_response: activateResponse.data
      });
    }

    const keyauthData = {
      success: true,
      message: 'User created successfully via Seller API',
      licenseKey: licenseKey,
      user: email
    };
    
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
      message: 'User created successfully via Seller API',
      data: {
        username: email,
        email: email,
        accessCode: accessCode,
        licenseKey: licenseKey,
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

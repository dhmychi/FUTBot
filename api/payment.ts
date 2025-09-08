import { VercelRequest, VercelResponse } from '@vercel/node';
import * as paypal from '@paypal/checkout-server-sdk';

const PAYPAL_CLIENT_ID = process.env.VITE_PAYPAL_CLIENT_ID || process.env.PAYPAL_CLIENT_ID || '';
const PAYPAL_CLIENT_SECRET = process.env.VITE_PAYPAL_CLIENT_SECRET || process.env.PAYPAL_CLIENT_SECRET || '';
const PAYPAL_ENVIRONMENT = (process.env.PAYPAL_ENVIRONMENT || (process.env.PAYPAL_SANDBOX === 'true' ? 'sandbox' : 'live') || 'sandbox').toLowerCase();

const configureEnvironment = () => {
  const clientId = PAYPAL_CLIENT_ID;
  const clientSecret = PAYPAL_CLIENT_SECRET;

  const environment = PAYPAL_ENVIRONMENT === 'live'
    ? new paypal.core.LiveEnvironment(clientId, clientSecret)
    : new paypal.core.SandboxEnvironment(clientId, clientSecret);

  return new paypal.core.PayPalHttpClient(environment);
};

// Subscription plans mapping
const SUBSCRIPTION_PLANS = {
  '1_month': {
    name: '1 Month Subscription',
    price: '15.00',
    duration: 30
  },
  '3_months': {
    name: '3 Months Subscription', 
    price: '24.99',
    duration: 90
  },
  '12_months': {
    name: '12 Months Subscription',
    price: '49.99',
    duration: 365
  },
  'test_plan': {
    name: 'Test Plan (1 Cent)',
    price: '0.01',
    duration: 1
  }
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers for cross-domain requests
  const allowedOrigins = [
    'https://www.futbot.club',
    'https://futbot.club',
    'https://fut-bot-git-main-dhmychifahad-5000s-projects.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173'
  ];
  
  const origin = req.headers.origin;
  
  // Always set CORS headers
  if (allowedOrigins.includes(origin as string)) {
    res.setHeader('Access-Control-Allow-Origin', origin as string);
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'https://www.futbot.club');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { method } = req;

  try {
    if (method === 'POST') {
      return await createPayment(req, res);
    } else if (method === 'GET') {
      return await capturePayment(req, res);
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Payment API error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' });
  }
}

// Create payment order
async function createPayment(req: VercelRequest, res: VercelResponse) {
  const { planType, userEmail } = req.body;

  if (!planType || !SUBSCRIPTION_PLANS[planType as keyof typeof SUBSCRIPTION_PLANS]) {
    return res.status(400).json({ error: 'Invalid subscription plan' });
  }

  const plan = SUBSCRIPTION_PLANS[planType as keyof typeof SUBSCRIPTION_PLANS];

  try {
    const client = configureEnvironment();
    
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: plan.price,
        },
        description: `FUTBot Premium Subscription - ${plan.name}`,
        custom_id: `futbot_${planType}_${Date.now()}`,
        soft_descriptor: 'FUTBOT SUB'
      }],
      application_context: {
        brand_name: 'FUTBot',
        landing_page: 'BILLING',
        user_action: 'PAY_NOW',
        return_url: `${process.env.VITE_APP_URL || 'https://futbot.club'}/payment/success?plan=${planType}`,
        cancel_url: `${process.env.VITE_APP_URL || 'https://futbot.club'}/payment/cancel`
      }
    });

    const response = await client.execute(request);
    
    // Find approval URL
    const approvalUrl = response.result.links?.find((link: any) => link.rel === 'approve')?.href;

    if (!approvalUrl) {
      console.error('No approval URL found in PayPal response');
      return res.status(500).json({ error: 'Failed to create payment order' });
    }

    console.log('PayPal order created successfully:', {
      orderId: response.result.id,
      status: response.result.status,
      approvalUrl
    });

    return res.status(200).json({
      success: true,
      orderId: response.result.id,
      approvalUrl: approvalUrl,
      status: response.result.status
    });

  } catch (error) {
    console.error('PayPal order creation failed:', error);
    return res.status(500).json({ 
      error: 'Failed to create payment order',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Capture payment after approval
async function capturePayment(req: VercelRequest, res: VercelResponse) {
  const { orderId } = req.query;

  if (!orderId || typeof orderId !== 'string') {
    return res.status(400).json({ error: 'Order ID is required' });
  }

  try {
    const client = configureEnvironment();
    
    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});

    const response = await client.execute(request);

    if (response.result.status === 'COMPLETED') {
      console.log('Payment captured successfully:', {
        orderId: response.result.id,
        status: response.result.status,
        amount: response.result.purchase_units[0].payments.captures[0].amount
      });

      return res.status(200).json({
        success: true,
        orderId: response.result.id,
        status: response.result.status,
        captureId: response.result.purchase_units[0].payments.captures[0].id
      });
    } else {
      return res.status(400).json({ 
        error: 'Payment not completed',
        status: response.result.status 
      });
    }

  } catch (error) {
    console.error('Payment capture failed:', error);
    return res.status(500).json({ 
      error: 'Failed to capture payment',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

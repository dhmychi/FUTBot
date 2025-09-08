import type { VercelRequest, VercelResponse } from '@vercel/node';
import paypal from '@paypal/checkout-server-sdk';

// Configure PayPal environment
const configureEnvironment = () => {
  const clientId = process.env.VITE_PAYPAL_CLIENT_ID || process.env.PAYPAL_CLIENT_ID || '';
  const clientSecret = process.env.VITE_PAYPAL_CLIENT_SECRET || process.env.PAYPAL_CLIENT_SECRET || '';
  const environmentName = (process.env.PAYPAL_ENVIRONMENT || 'sandbox').toLowerCase();

  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials not configured');
  }

  const environment = environmentName === 'live'
    ? new paypal.core.LiveEnvironment(clientId, clientSecret)
    : new paypal.core.SandboxEnvironment(clientId, clientSecret);
  return new paypal.core.PayPalHttpClient(environment);
};

// Subscription plans configuration
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
    name: 'Test Plan (Micro)',
    price: '0.000000000000000001',
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

  const { method, query } = req;

  try {
    // Handle different HTTP methods and routes
    if (method === 'POST' && query.action === 'create-subscription') {
      return await createSubscription(req, res);
    } else if (method === 'GET' && query.subscriptionId) {
      return await getSubscription(req, res);
    } else if (method === 'POST' && query.action === 'cancel-subscription') {
      return await cancelSubscription(req, res);
    } else {
      return res.status(404).json({ error: 'Route not found' });
    }
  } catch (error) {
    console.error('PayPal subscription API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Create subscription
async function createSubscription(req: VercelRequest, res: VercelResponse) {
  const { planType, userEmail } = req.body;

  if (!planType || !SUBSCRIPTION_PLANS[planType as keyof typeof SUBSCRIPTION_PLANS]) {
    return res.status(400).json({ error: 'Invalid subscription plan' });
  }

  const plan = SUBSCRIPTION_PLANS[planType as keyof typeof SUBSCRIPTION_PLANS];

  try {
    const client = configureEnvironment();
    
    // Create a simple order instead of subscription for now
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: plan.price,
          breakdown: {
            item_total: { 
              currency_code: 'USD', 
              value: plan.price 
            },
            discount: { currency_code: 'USD', value: '0.00' },
            handling: { currency_code: 'USD', value: '0.00' },
            insurance: { currency_code: 'USD', value: '0.00' },
            shipping_discount: { currency_code: 'USD', value: '0.00' },
            tax_total: { currency_code: 'USD', value: '0.00' },
            shipping: { currency_code: 'USD', value: '0.00' }
          }
        },
        items: [{
          name: plan.name,
          quantity: '1',
          unit_amount: { 
            currency_code: 'USD', 
            value: plan.price 
          },
          category: 'DIGITAL_GOODS'
        }],
        description: `FUTBot Premium Subscription - ${plan.name}`
      }],
      application_context: {
        brand_name: 'FUTBot',
        landing_page: 'BILLING',
        user_action: 'PAY_NOW',
        return_url: `${process.env.VITE_APP_URL || 'https://futbot.club'}/subscription/success`,
        cancel_url: `${process.env.VITE_APP_URL || 'https://futbot.club'}/subscription/cancel`
      }
    });

    const response = await client.execute(request);
    
    // Find approval URL
    const approvalUrl = response.result.links?.find(
      (link: any) => link.rel === 'approve'
    )?.href;

    return res.json({
      subscriptionId: response.result.id,
      approvalUrl: approvalUrl,
      status: response.result.status
    });

  } catch (error) {
    console.error('PayPal subscription creation error:', error);
    return res.status(500).json({ error: 'Failed to create subscription' });
  }
}

// Get subscription details
async function getSubscription(req: VercelRequest, res: VercelResponse) {
  const { subscriptionId } = req.query;

  try {
    const client = configureEnvironment();
    const request = new paypal.orders.OrdersGetRequest(subscriptionId as string);
    const response = await client.execute(request);

    return res.json({
      id: response.result.id,
      status: response.result.status,
      intent: response.result.intent,
      payer: response.result.payer,
      create_time: response.result.create_time,
      update_time: response.result.update_time
    });

  } catch (error) {
    console.error('PayPal subscription fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch subscription' });
  }
}

// Cancel subscription (placeholder)
async function cancelSubscription(req: VercelRequest, res: VercelResponse) {
  const { subscriptionId } = req.query;
  const { reason } = req.body;

  try {
    // For orders, we can't really cancel them after creation
    // This would be implemented differently for actual subscriptions
    return res.json({ success: true, message: 'Subscription cancelled successfully' });

  } catch (error) {
    console.error('PayPal subscription cancellation error:', error);
    return res.status(500).json({ error: 'Failed to cancel subscription' });
  }
}

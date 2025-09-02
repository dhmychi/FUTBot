import type { VercelRequest, VercelResponse } from '@vercel/node';
import paypal from '@paypal/checkout-server-sdk';

// Configure PayPal environment
const configureEnvironment = () => {
  const clientId = process.env.VITE_PAYPAL_CLIENT_ID || process.env.PAYPAL_CLIENT_ID || '';
  const clientSecret = process.env.VITE_PAYPAL_CLIENT_SECRET || process.env.PAYPAL_CLIENT_SECRET || '';
  
  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials not configured');
  }
  
  const environment = new paypal.core.SandboxEnvironment(clientId, clientSecret);
  return new paypal.core.PayPalHttpClient(environment);
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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { plan } = req.body;
    
    if (!plan) {
      return res.status(400).json({ error: 'Plan is required' });
    }

    const client = configureEnvironment();
    const request = new paypal.orders.OrdersCreateRequest();

    // Map plan IDs to their corresponding prices and names
    const plans = {
      '1_month': {
        name: '1 Month Subscription',
        price: '15.00',
        description: '1 month access to FUTBot Premium'
      },
      '3_months': {
        name: '3 Months Subscription',
        price: '24.99',
        description: '3 months access to FUTBot Premium'
      },
      '12_months': {
        name: '12 Months Subscription',
        price: '49.99',
        description: '12 months access to FUTBot Premium'
      }
    };

    const selectedPlan = plans[plan as keyof typeof plans];
    
    if (!selectedPlan) {
      return res.status(400).json({ error: 'Invalid plan ID' });
    }

    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: selectedPlan.price,
            breakdown: {
              item_total: {
                currency_code: 'USD',
                value: selectedPlan.price
              },
              discount: { currency_code: 'USD', value: '0.00' },
              handling: { currency_code: 'USD', value: '0.00' },
              insurance: { currency_code: 'USD', value: '0.00' },
              shipping_discount: { currency_code: 'USD', value: '0.00' },
              tax_total: { currency_code: 'USD', value: '0.00' },
              shipping: { currency_code: 'USD', value: '0.00' }
            }
          },
          items: [
            {
              name: selectedPlan.name,
              description: selectedPlan.description,
              quantity: '1',
              unit_amount: {
                currency_code: 'USD',
                value: selectedPlan.price
              },
              category: 'DIGITAL_GOODS'
            }
          ]
        }
      ],
      application_context: {
        brand_name: 'FUTBot',
        landing_page: 'BILLING',
        user_action: 'PAY_NOW',
        return_url: `${process.env.VITE_APP_URL || 'https://futbot.club'}/subscription/success`,
        cancel_url: `${process.env.VITE_APP_URL || 'https://futbot.club'}/subscription/canceled`
      }
    });

    const order = await client.execute(request);
    
    // Get approval URL
    const approvalUrl = order.result.links?.find(
      (link: any) => link.rel === 'approve'
    )?.href;

    return res.status(200).json({
      success: true,
      id: order.result.id,
      approvalUrl: approvalUrl,
      links: order.result.links
    });
    
  } catch (error) {
    console.error('Error creating subscription:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ 
      error: 'Failed to create subscription',
      details: errorMessage
    });
  }
}

import paypal from '@paypal/checkout-server-sdk';

// PayPal environment setup - Using live environment
const environment = new paypal.core.LiveEnvironment(
  'AX6mXdqElTQ87jSXefb4-AFzDj82pMXKDpSWVXhD9ESCTy6uTQB2ZRbYpva4uayp7fGmvKLw63l',
  'EBw3gZ0Y5-4csTdQh8dN4Zzc67UELAbNswexpHAaim-QRarQ2iSTz8fhWpqK3pzfpGnivCtwXyp4Ypvw'
);

const client = new paypal.core.PayPalHttpClient(environment);

// Subscription plans configuration
const SUBSCRIPTION_PLANS = {
  '1-month': {
    id: 'P-1MONTH-PLAN-ID', // Replace with actual PayPal plan ID
    name: '1 Month Subscription',
    price: '15.00',
    duration: 30
  },
  '3-months': {
    id: 'P-3MONTHS-PLAN-ID', // Replace with actual PayPal plan ID
    name: '3 Months Subscription',
    price: '24.99',
    duration: 90
  },
  '12-months': {
    id: 'P-12MONTHS-PLAN-ID', // Replace with actual PayPal plan ID
    name: '12 Months Subscription',
    price: '49.99',
    duration: 365
  }
};

// Main handler for Vercel serverless function
export default async function handler(req: any, res: any) {
  const { method, query, body } = req;

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
async function createSubscription(req: any, res: any) {
  const { planType, userEmail } = req.body;

  if (!planType || !SUBSCRIPTION_PLANS[planType]) {
    return res.status(400).json({ error: 'Invalid subscription plan' });
  }

  const plan = SUBSCRIPTION_PLANS[planType];

  try {
    const request = new paypal.subscriptions.SubscriptionsCreateRequest();
    request.requestBody({
      plan_id: plan.id,
      subscriber: {
        email_address: userEmail,
      },
      application_context: {
        brand_name: 'FUTBot',
        locale: 'en-US',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'SUBSCRIBE_NOW',
        payment_method: {
          payer_selected: 'PAYPAL',
          payee_preferred: 'IMMEDIATE_PAYMENT_REQUIRED'
        },
        return_url: `${process.env.FRONTEND_URL}/subscription/success`,
        cancel_url: `${process.env.FRONTEND_URL}/subscription/cancel`
      }
    });

    const response = await client.execute(request);
    
    // Find approval URL
    const approvalUrl = response.result.links.find(
      link => link.rel === 'approve'
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
async function getSubscription(req: any, res: any) {
  const { subscriptionId } = req.query;

  try {
    const request = new paypal.subscriptions.SubscriptionsGetRequest(subscriptionId);
    const response = await client.execute(request);

    return res.json({
      id: response.result.id,
      status: response.result.status,
      plan_id: response.result.plan_id,
      subscriber: response.result.subscriber,
      create_time: response.result.create_time,
      start_time: response.result.start_time
    });

  } catch (error) {
    console.error('PayPal subscription fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch subscription' });
  }
}

// Cancel subscription
async function cancelSubscription(req: any, res: any) {
  const { subscriptionId } = req.query;
  const { reason } = req.body;

  try {
    const request = new paypal.subscriptions.SubscriptionsCancelRequest(subscriptionId);
    request.requestBody({
      reason: reason || 'User requested cancellation'
    });

    await client.execute(request);
    return res.json({ success: true, message: 'Subscription cancelled successfully' });

  } catch (error) {
    console.error('PayPal subscription cancellation error:', error);
    return res.status(500).json({ error: 'Failed to cancel subscription' });
  }
}

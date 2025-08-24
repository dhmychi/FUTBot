import express from 'express';
import { PayPalApi } from '@paypal/checkout-server-sdk';
import paypal from '@paypal/checkout-server-sdk';

const router = express.Router();

// PayPal environment setup
const environment = process.env.PAYPAL_SANDBOX === 'true' 
  ? new paypal.core.SandboxEnvironment(
      process.env.PAYPAL_CLIENT_ID!,
      process.env.PAYPAL_CLIENT_SECRET!
    )
  : new paypal.core.LiveEnvironment(
      process.env.PAYPAL_CLIENT_ID!,
      process.env.PAYPAL_CLIENT_SECRET!
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

// Create subscription
router.post('/create-subscription', async (req, res) => {
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

    res.json({
      subscriptionId: response.result.id,
      approvalUrl: approvalUrl,
      status: response.result.status
    });

  } catch (error) {
    console.error('PayPal subscription creation error:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

// Get subscription details
router.get('/subscription/:subscriptionId', async (req, res) => {
  const { subscriptionId } = req.params;

  try {
    const request = new paypal.subscriptions.SubscriptionsGetRequest(subscriptionId);
    const response = await client.execute(request);

    res.json({
      id: response.result.id,
      status: response.result.status,
      plan_id: response.result.plan_id,
      subscriber: response.result.subscriber,
      create_time: response.result.create_time,
      start_time: response.result.start_time
    });

  } catch (error) {
    console.error('PayPal subscription fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch subscription' });
  }
});

// Cancel subscription
router.post('/cancel-subscription/:subscriptionId', async (req, res) => {
  const { subscriptionId } = req.params;
  const { reason } = req.body;

  try {
    const request = new paypal.subscriptions.SubscriptionsCancelRequest(subscriptionId);
    request.requestBody({
      reason: reason || 'User requested cancellation'
    });

    await client.execute(request);
    res.json({ success: true, message: 'Subscription cancelled successfully' });

  } catch (error) {
    console.error('PayPal subscription cancellation error:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

export default router;

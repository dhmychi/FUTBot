import crypto from 'crypto';
import axios from 'axios';

// PayPal webhook configuration
const PAYPAL_WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID || '';
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || '';
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || '';
const PAYPAL_SANDBOX = process.env.PAYPAL_SANDBOX === 'true';

// Helper to safely read header values (handles string | string[])
function getHeader(headers: any, name: string): string | undefined {
  if (!headers) return undefined;
  const key = name.toLowerCase();
  const val = headers[key] ?? headers[name] ?? headers[name.toLowerCase()];
  if (Array.isArray(val)) return val[0];
  if (typeof val === 'string') return val;
  return undefined;
}

// KeyAuth configuration
const KEYAUTH_CONFIG = {
  name: "FUTBot",
  ownerid: process.env.KEYAUTH_OWNER_ID || '',
  secret: process.env.KEYAUTH_SECRET || '',
  version: "1.0.0",
  url: "https://keyauth.win/api/1.2/"
};

// Subscription plans mapping
const SUBSCRIPTION_PLANS = {
  '15.00': { duration: 30, plan: '1-month' },      // 1 Month - $15
  '24.99': { duration: 90, plan: '3-months' },     // 3 Months - $24.99
  '49.99': { duration: 365, plan: '12-months' }    // 12 Months - $49.99
};

// PayPal API helper functions
async function getPayPalAccessToken(): Promise<string> {
  const baseURL = PAYPAL_SANDBOX ? 'https://api.sandbox.paypal.com' : 'https://api.paypal.com';
  
  try {
    const response = await axios.post(`${baseURL}/v1/oauth2/token`, 
      'grant_type=client_credentials',
      {
        headers: {
          'Accept': 'application/json',
          'Accept-Language': 'en_US',
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        auth: {
          username: PAYPAL_CLIENT_ID,
          password: PAYPAL_CLIENT_SECRET
        }
      }
    );
    return response.data.access_token;
  } catch (error) {
    console.error('Failed to get PayPal access token:', error);
    throw new Error('PayPal authentication failed');
  }
}

async function verifyPayPalWebhook(headers: any, body: string): Promise<boolean> {
  if (!PAYPAL_WEBHOOK_ID) {
    console.log('No PAYPAL_WEBHOOK_ID configured, skipping verification');
    return false;
  }

  const baseURL = PAYPAL_SANDBOX ? 'https://api.sandbox.paypal.com' : 'https://api.paypal.com';
  
  try {
    const accessToken = await getPayPalAccessToken();
    
    const auth_algo = getHeader(headers, 'paypal-auth-algo');
    const cert_url = getHeader(headers, 'paypal-cert-url');
    const transmission_id = getHeader(headers, 'paypal-transmission-id');
    const transmission_sig = getHeader(headers, 'paypal-transmission-sig');
    const transmission_time = getHeader(headers, 'paypal-transmission-time');

    if (!cert_url) {
      console.warn('[Webhook] Missing paypal-cert-url header — PayPal verification may fail with 400.');
    }

    const verificationData = {
      auth_algo,
      cert_url,
      transmission_id,
      transmission_sig,
      transmission_time,
      webhook_id: PAYPAL_WEBHOOK_ID,
      webhook_event: JSON.parse(body)
    } as any;

    const response = await axios.post(
      `${baseURL}/v1/notifications/verify-webhook-signature`,
      verificationData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    return response.data.verification_status === 'SUCCESS';
  } catch (error) {
    console.error('PayPal webhook verification failed:', error);
    return false;
  }
}

// KeyAuth API helper functions
async function createKeyAuthLicense(username: string, email: string, duration: number): Promise<string> {
  try {
    // Initialize KeyAuth session
    const initResponse = await axios.post(KEYAUTH_CONFIG.url, {
      type: 'init',
      name: KEYAUTH_CONFIG.name,
      ownerid: KEYAUTH_CONFIG.ownerid,
      secret: KEYAUTH_CONFIG.secret,
      version: KEYAUTH_CONFIG.version
    });

    if (!initResponse.data.success) {
      throw new Error('KeyAuth initialization failed');
    }

    // Create license key
    const licenseResponse = await axios.post(KEYAUTH_CONFIG.url, {
      type: 'addkey',
      name: KEYAUTH_CONFIG.name,
      ownerid: KEYAUTH_CONFIG.ownerid,
      secret: KEYAUTH_CONFIG.secret,
      expiry: duration, // days
      mask: 'XXXX-XXXX-XXXX-XXXX',
      level: '1',
      note: `PayPal subscription for ${email}`
    });

    if (!licenseResponse.data.success) {
      throw new Error('Failed to create license key');
    }

    return licenseResponse.data.key;
  } catch (error) {
    console.error('KeyAuth license creation failed:', error);
    throw error;
  }
}

async function extendKeyAuthSubscription(username: string, duration: number): Promise<boolean> {
  try {
    const response = await axios.post(KEYAUTH_CONFIG.url, {
      type: 'extend',
      name: KEYAUTH_CONFIG.name,
      ownerid: KEYAUTH_CONFIG.ownerid,
      secret: KEYAUTH_CONFIG.secret,
      username: username,
      expiry: duration
    });

    return response.data.success;
  } catch (error) {
    console.error('KeyAuth subscription extension failed:', error);
    return false;
  }
}

async function handleSuccessfulPayment(event: any) {
  try {
    // Extract payment information
    const amount = event.resource?.amount?.total || event.resource?.gross_amount?.value;
    const currency = event.resource?.amount?.currency || event.resource?.gross_amount?.currency_code;
    const payerEmail = event.resource?.payer?.email_address || event.resource?.payer_info?.email;
    const paymentId = event.resource?.id;
    
    console.log('Processing payment:', { amount, currency, payerEmail, paymentId });

    // Validate currency
    if (currency !== 'USD') {
      console.warn(`Unsupported currency received (${currency}), ignoring event.`);
      return; // don't fail the webhook, just ignore
    }

    // Find matching subscription plan
    const subscriptionPlan = SUBSCRIPTION_PLANS[amount];
    if (!subscriptionPlan) {
      console.warn(`Unknown subscription amount (${amount}), ignoring event.`);
      return; // ignore unrecognized simulator/test amounts
    }

    // Generate username from email
    const username = payerEmail.split('@')[0] + '_' + Date.now();

    // Create KeyAuth license
    const licenseKey = await createKeyAuthLicense(username, payerEmail, subscriptionPlan.duration);

    console.log('License created successfully:', {
      username,
      email: payerEmail,
      licenseKey,
      plan: subscriptionPlan.plan,
      duration: subscriptionPlan.duration
    });

    // TODO: Send license key to user via email
    // You can integrate with your email service here
    
  } catch (error) {
    console.error('Payment processing error:', error);
    throw error;
  }
}

async function handleSubscriptionCancellation(event: any) {
  try {
    const subscriptionId = event.resource?.id;
    const payerEmail = event.resource?.subscriber?.email_address;
    
    console.log('Processing subscription cancellation:', { subscriptionId, payerEmail });
    
    // TODO: Implement subscription cancellation logic
    // You might want to deactivate the user's license in KeyAuth
    
  } catch (error) {
    console.error('Subscription cancellation error:', error);
    throw error;
  }
}

// Main webhook handler for Vercel
export default async function handler(req: any, res: any) {
  // Log all incoming requests
  console.log('=== PayPal Webhook Request Received ===');
  console.log('Method:', req.method);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Body:', req.body);
  console.log('========================================');

  if (req.method !== 'POST') {
    console.log('Invalid method:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    const headers = req.headers;

    // Allow bypassing signature verification in sandbox/simulator via env flag
    const skipVerify = process.env.PAYPAL_WEBHOOK_SKIP_VERIFY === 'true';
    if (skipVerify) {
      console.warn('[Webhook] PAYPAL_WEBHOOK_SKIP_VERIFY is true — skipping signature verification (simulator/testing only)');
    }

    // Auto-skip verification for Vercel's internal PayPal simulator traffic
    const botName = (getHeader(headers, 'x-vercel-internal-bot-name') || '').toLowerCase();
    const botCategory = (getHeader(headers, 'x-vercel-internal-bot-category') || '').toLowerCase();
    const isVercelPaypalBot = botName === 'paypal' && botCategory === 'webhook';
    if (isVercelPaypalBot) {
      console.warn('[Webhook] Detected Vercel internal PayPal simulator — skipping signature verification and processing.');
      return res.status(200).json({ success: true, skipped: 'vercel_simulator' });
    }

    // Verify PayPal webhook signature
    if (!skipVerify && !isVercelPaypalBot) {
      const isValid = await verifyPayPalWebhook(headers, body);
      if (!isValid) {
        console.error('Invalid PayPal webhook signature');
        return res.status(403).json({ error: 'Invalid webhook signature' });
      }
    }

    const event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    console.log('PayPal event type:', event.event_type);

    // Handle different PayPal events
    switch (event.event_type) {
      case 'PAYMENT.SALE.COMPLETED':
      case 'BILLING.SUBSCRIPTION.ACTIVATED':
      case 'CHECKOUT.ORDER.APPROVED':
        await handleSuccessfulPayment(event);
        break;
      
      case 'BILLING.SUBSCRIPTION.CANCELLED':
      case 'BILLING.SUBSCRIPTION.SUSPENDED':
        await handleSubscriptionCancellation(event);
        break;
      
      default:
        console.log('Unhandled PayPal event type:', event.event_type);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}

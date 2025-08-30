import crypto from 'crypto';
import axios from 'axios';

// PayPal webhook configuration - Using live environment
const PAYPAL_WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID || '';
const PAYPAL_CLIENT_ID = 'AX6mXdqElTQ87jSXefb4-AFzDj82pMXKDpSWVXhD9ESCTy6uTQB2ZRbYpva4uayp7fGmvKLw63l';
const PAYPAL_CLIENT_SECRET = 'EBw3gZ0Y5-4csTdQh8dN4Zzc67UELAbNswexpHAaim-QRarQ2iSTz8fhWpqK3pzfpGnivCtwXyp4Ypvw';
const PAYPAL_SANDBOX = false; // Using live environment

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
  name: "futbot",
  ownerid: "j5oBWrvrnm",
  secret: "71d7d7717aea788ae29b063fab062482e707ae9826c1e425acffaa7cd816dfc5",
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
async function getPayPalAccessToken(): Promise<string | null> {
  const baseURL = PAYPAL_SANDBOX 
    ? 'https://api.sandbox.paypal.com' 
    : 'https://api.paypal.com';

  console.log(`🔑 Requesting PayPal access token from: ${baseURL}`);
  
  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    console.error('❌ Missing PayPal API credentials. Please check your environment variables.');
    console.error(`CLIENT_ID: ${PAYPAL_CLIENT_ID ? '***' : 'MISSING'}`);
    console.error(`CLIENT_SECRET: ${PAYPAL_CLIENT_SECRET ? '***' : 'MISSING'}`);
    return null;
  }
  
  try {
    const startTime = Date.now();
    const response = await axios.post(
      `${baseURL}/v1/oauth2/token`,
      'grant_type=client_credentials',
      {
        headers: {
          'Accept': 'application/json',
          'Accept-Language': 'en_US',
          'Content-Type': 'application/x-www-form-urlencoded',
          'PayPal-Request-Id': `token-${Date.now()}`
        },
        auth: {
          username: PAYPAL_CLIENT_ID,
          password: PAYPAL_CLIENT_SECRET
        },
        timeout: 10000 // 10 second timeout
      }
    );

    const responseTime = Date.now() - startTime;
    
    if (!response.data.access_token) {
      console.error('❌ No access token in PayPal response:', response.data);
      return null;
    }

    console.log(`✅ Successfully obtained PayPal access token (${responseTime}ms)`);
    console.log(`   Token expires in: ${response.data.expires_in || 'unknown'} seconds`);
    
    return response.data.access_token;
    
  } catch (error: any) {
    const errorDetails = {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: {
          ...error.config?.headers,
          Authorization: '***REDACTED***'
        }
      }
    };
    
    console.error('❌ Failed to get PayPal access token:', JSON.stringify(errorDetails, null, 2));
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('PayPal API Error Response:', {
        status: error.response.status,
        headers: error.response.headers,
        data: error.response.data
      });
      
      if (error.response.status === 401) {
        console.error('❌ Authentication failed. Please verify your PayPal API credentials.');
        console.error('   Make sure you are using the correct client ID and secret for the', 
          PAYPAL_SANDBOX ? 'SANDBOX' : 'PRODUCTION', 'environment');
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from PayPal API. Check your network connection.');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Request setup error:', error.message);
    }
    
    return null;
  }
}

async function verifyPayPalWebhook(headers: any, body: string): Promise<boolean> {
  console.log('🔍 Starting webhook verification...');
  
  if (!PAYPAL_WEBHOOK_ID) {
    console.error('❌ No PAYPAL_WEBHOOK_ID configured in environment variables');
    return false;
  }

  const baseURL = PAYPAL_SANDBOX 
    ? 'https://api.sandbox.paypal.com' 
    : 'https://api.paypal.com';
  
  console.log(`🌐 Using PayPal ${PAYPAL_SANDBOX ? 'Sandbox' : 'Production'} API: ${baseURL}`);
  
  try {
    console.log('🔑 Getting PayPal access token...');
    const accessToken = await getPayPalAccessToken();
    
    if (!accessToken) {
      console.error('❌ Failed to get PayPal access token');
      return false;
    }
    
    const auth_algo = getHeader(headers, 'paypal-auth-algo');
    const cert_url = getHeader(headers, 'paypal-cert-url');
    const transmission_id = getHeader(headers, 'paypal-transmission-id');
    const transmission_sig = getHeader(headers, 'paypal-transmission-sig');
    const transmission_time = getHeader(headers, 'paypal-transmission-time');

    // Log all headers for debugging
    console.log('📋 Webhook Headers:', {
      'paypal-auth-algo': auth_algo ? '***' : 'MISSING',
      'paypal-cert-url': cert_url ? '***' : 'MISSING',
      'paypal-transmission-id': transmission_id ? '***' : 'MISSING',
      'paypal-transmission-sig': transmission_sig ? '***' : 'MISSING',
      'paypal-transmission-time': transmission_time || 'MISSING'
    });

    if (!auth_algo || !transmission_id || !transmission_sig || !transmission_time) {
      console.error('❌ Missing required PayPal webhook headers');
      return false;
    }

    if (!cert_url) {
      console.warn('⚠️ Missing paypal-cert-url header - this may cause verification to fail');
    }

    // Parse the webhook event for logging (without sensitive data)
    let webhookEvent;
    try {
      webhookEvent = JSON.parse(body);
      console.log('📨 Webhook Event Type:', webhookEvent.event_type || 'UNKNOWN');
    } catch (e) {
      console.error('❌ Failed to parse webhook body as JSON');
      return false;
    }

    const verificationData = {
      auth_algo,
      cert_url,
      transmission_id,
      transmission_sig,
      transmission_time,
      webhook_id: PAYPAL_WEBHOOK_ID,
      webhook_event: webhookEvent
    };

    console.log('🔍 Verifying webhook signature with PayPal...');
    const response = await axios.post(
      `${baseURL}/v1/notifications/verify-webhook-signature`,
      verificationData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'PayPal-Request-Id': `webhook-verification-${Date.now()}`
        },
        timeout: 10000 // 10 second timeout
      }
    );

    const verificationStatus = response.data.verification_status;
    console.log('✅ Webhook verification result:', {
      status: verificationStatus,
      statusCode: response.status,
      data: response.data
    });

    return verificationStatus === 'SUCCESS';
    
  } catch (error: any) {
    console.error('❌ Webhook verification failed:', {
      error: error.message,
      response: error.response?.data || 'No response data',
      status: error.response?.status,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: {
          ...error.config?.headers,
          Authorization: error.config?.headers?.Authorization ? '***' : 'MISSING'
        }
      }
    });
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
  // Log all incoming requests (sanitized for production)
  console.log('=== PayPal Webhook Request ===');
  console.log('Method:', req.method);
  console.log('Environment:', PAYPAL_SANDBOX ? 'SANDBOX' : 'PRODUCTION');
  
  // Sanitize headers for logging
  const logHeaders = { ...req.headers };
  if (logHeaders.authorization) {
    logHeaders.authorization = '***REDACTED***';
  }
  
  console.log('Headers:', JSON.stringify(logHeaders, null, 2));
  
  // Sanitize body for logging
  let logBody = req.body;
  if (typeof logBody === 'object' && logBody !== null) {
    logBody = { ...logBody };
    if (logBody.resource) {
      logBody.resource = '***RESOURCE DATA***';
    }
  }
  console.log('Body Type:', typeof req.body);
  console.log('Body:', JSON.stringify(logBody, null, 2));
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
      console.log('Verifying webhook signature...');
      try {
        const isValid = await verifyPayPalWebhook(headers, body);
        if (!isValid) {
          console.error('❌ Invalid PayPal webhook signature');
          return res.status(403).json({ 
            error: 'Invalid webhook signature',
            environment: PAYPAL_SANDBOX ? 'sandbox' : 'production',
            webhook_id: PAYPAL_WEBHOOK_ID || 'not_set'
          });
        }
        console.log('✅ Webhook signature verified');
      } catch (error) {
        console.error('❌ Webhook verification error:', error);
        return res.status(500).json({ 
          error: 'Webhook verification failed',
          details: error instanceof Error ? error.message : String(error)
        });
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

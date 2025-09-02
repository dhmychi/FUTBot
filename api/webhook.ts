import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
import { Resend } from 'resend';

// PayPal webhook configuration - Use environment variables
const PAYPAL_WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID || '';
const PAYPAL_CLIENT_ID = process.env.VITE_PAYPAL_CLIENT_ID || process.env.PAYPAL_CLIENT_ID || '';
const PAYPAL_CLIENT_SECRET = process.env.VITE_PAYPAL_CLIENT_SECRET || process.env.PAYPAL_CLIENT_SECRET || '';
const PAYPAL_SANDBOX = process.env.PAYPAL_ENVIRONMENT === 'sandbox'; // Use environment variable

// Helper to safely read header values (handles string | string[])
function getHeader(headers: any, name: string): string | undefined {
  if (!headers) return undefined;
  const key = name.toLowerCase();
  const val = headers[key] ?? headers[name] ?? headers[name.toLowerCase()];
  if (Array.isArray(val)) return val[0];
  if (typeof val === 'string') return val;
  return undefined;
}

// KeyAuth configuration - Use environment variables
const KEYAUTH_CONFIG = {
  name: process.env.KEYAUTH_NAME || process.env.KEYAUTH_APP_NAME || "futbot",
  ownerid: process.env.KEYAUTH_OWNER_ID || "",
  secret: process.env.KEYAUTH_SECRET || process.env.KEYAUTH_APP_SECRET || "",
  version: process.env.KEYAUTH_VERSION || process.env.KEYAUTH_APP_VERSION || "1.0.0",
  url: process.env.KEYAUTH_URL || "https://keyauth.win/api/1.2/"
};

// بدلاً من pool ثابت، سنستخدم Seller API لإنشاء مفتاح جديد لكل عميل
const KEYAUTH_SELLER_KEY = process.env.KEYAUTH_SELLER_KEY || '';

// إنشاء مفتاح جديد لكل عميل
async function createLicenseKey() {
  if (KEYAUTH_SELLER_KEY && KEYAUTH_SELLER_KEY.length === 32) {
    // إنشاء مفتاح جديد عبر Seller API
    const params = new URLSearchParams();
    params.append('sellerkey', KEYAUTH_SELLER_KEY);
    params.append('type', 'add');
    params.append('expiry', '30'); // 30 يوم
    params.append('amount', '1');
    params.append('level', '1');
    params.append('mask', '******-******-******-******');
    params.append('format', 'JSON');
    
    const response = await axios.post('https://keyauth.win/api/seller/', params);
    return response.data.key;
  }
  
  // fallback إذا لم يكن Seller Key متوفر
  return `FUTBOT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Resend configuration
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev';
const resendClient = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

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
async function createLicenseViaSeller(email: string, days: number): Promise<string> {
  if (!KEYAUTH_SELLER_KEY) {
    throw new Error('KEYAUTH_SELLER_KEY not set');
  }

  const params = new URLSearchParams();
  params.append('sellerkey', KEYAUTH_SELLER_KEY);
  params.append('type', 'add');
  params.append('expiry', String(days));
  params.append('amount', '1');
  params.append('level', '1');
          params.append('mask', '******-******-******-******');
  params.append('format', 'JSON');
  params.append('note', `Created for ${email}`);

  const url = 'https://keyauth.win/api/seller/';
  const resp = await axios.post(url, params, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });

  console.log('Seller API add response:', resp.data);

  if (!resp.data?.success) {
    throw new Error(resp.data?.message || 'Seller API add failed');
  }

  return resp.data.key || resp.data.keys?.[0];
}
async function createKeyAuthLicense(username: string, email: string, duration: number): Promise<string> {
  try {
    // Prefer Seller API if available (more reliable for license creation)
    if (KEYAUTH_SELLER_KEY) {
      try {
        const key = await createLicenseViaSeller(email, duration);
        return key;
      } catch (sellerErr) {
        console.error('Seller API license creation failed, falling back to App API:', sellerErr);
      }
    }

    // Initialize KeyAuth session
    const initPayload = new URLSearchParams();
    initPayload.append('type', 'init');
    initPayload.append('name', KEYAUTH_CONFIG.name);
    initPayload.append('ownerid', KEYAUTH_CONFIG.ownerid);
    initPayload.append('secret', KEYAUTH_CONFIG.secret);
    initPayload.append('version', KEYAUTH_CONFIG.version);

    const initResponse = await axios.post(KEYAUTH_CONFIG.url, initPayload, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    if (!initResponse.data.success) {
      throw new Error(`KeyAuth initialization failed: ${initResponse.data.message}`);
    }

    const sessionId = initResponse.data.sessionid;

    // Try to create license using KeyAuth API
    const licensePayload = new URLSearchParams();
    licensePayload.append('type', 'addkey');
    licensePayload.append('name', KEYAUTH_CONFIG.name);
    licensePayload.append('ownerid', KEYAUTH_CONFIG.ownerid);
    licensePayload.append('secret', KEYAUTH_CONFIG.secret);
    licensePayload.append('sessionid', sessionId);
    licensePayload.append('expiry', duration.toString()); // days
    licensePayload.append('mask', '******-******-******-******'); // v1.3 license format
    licensePayload.append('amount', '1'); // number of licenses to create
    licensePayload.append('level', '1'); // subscription level
    licensePayload.append('note', `Created for ${username} (${email})`);

    const licenseResponse = await axios.post(KEYAUTH_CONFIG.url, licensePayload, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    console.log('KeyAuth addkey response:', licenseResponse.data);

    if (!licenseResponse.data.success) {
      console.error('❌ KeyAuth license creation failed:', licenseResponse.data);
      // Fallback to generated key if API fails
      const fallbackKey = `FUTBOT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      console.log('⚠️ Using fallback generated license key:', fallbackKey);
      return fallbackKey;
    }

    const licenseKey = licenseResponse.data.key || licenseResponse.data.keys?.[0];
    console.log('✅ KeyAuth license created successfully:', licenseKey);
    return licenseKey;
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

// Register a user in KeyAuth using a license key
async function registerKeyAuthUser(username: string, password: string, licenseKey: string, email: string): Promise<boolean> {
  try {
    // Initialize session
    const initPayload = new URLSearchParams();
    initPayload.append('type', 'init');
    initPayload.append('name', KEYAUTH_CONFIG.name);
    initPayload.append('ownerid', KEYAUTH_CONFIG.ownerid);
    initPayload.append('secret', KEYAUTH_CONFIG.secret);
    initPayload.append('version', KEYAUTH_CONFIG.version);

    const initResponse = await axios.post(KEYAUTH_CONFIG.url, initPayload, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    if (!initResponse.data.success) {
      throw new Error(`KeyAuth initialization failed: ${initResponse.data.message}`);
    }

    const sessionId = initResponse.data.sessionid;

    // Register user using license
    const registerPayload = new URLSearchParams();
    registerPayload.append('type', 'register');
    registerPayload.append('name', KEYAUTH_CONFIG.name);
    registerPayload.append('ownerid', KEYAUTH_CONFIG.ownerid);
    registerPayload.append('secret', KEYAUTH_CONFIG.secret);
    registerPayload.append('sessionid', sessionId);
    registerPayload.append('username', username);
    registerPayload.append('pass', password);
    registerPayload.append('key', licenseKey); // KeyAuth expects 'key', not 'license'
    registerPayload.append('email', email);

    const registerResponse = await axios.post(KEYAUTH_CONFIG.url, registerPayload, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    if (!registerResponse.data.success) {
      console.error('❌ KeyAuth register failed:', registerResponse.data);
      throw new Error(`KeyAuth registration failed: ${registerResponse.data.message || 'Unknown error'}`);
    }

    console.log('✅ KeyAuth user registered successfully:', { username, email });
    return true;
  } catch (error) {
    console.error('KeyAuth user registration failed:', error);
    return false;
  }
}

// Send welcome email with login credentials (Resend)
async function sendWelcomeEmail(email: string, username: string, licenseKey: string, plan: string, accessCode?: string): Promise<boolean> {
  try {
    if (!resendClient) {
      console.warn('[Email] RESEND_API_KEY not configured; skipping email send');
      return false;
    }

    const fromAddress = FROM_EMAIL; // e.g., 'FUTBot <no-reply@send.futbot.club>' once verified

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4169E1;">Welcome to FUTBot! 🚀</h2>
        <p>Congratulations! Your <strong>${plan}</strong> subscription is now active.</p>
        <div style="background: #f8f9fa; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <h3>Your Login Credentials</h3>
          <p><strong>Username:</strong> ${email}</p>
          ${accessCode ? `<p><strong>Password:</strong> ${accessCode}</p>` : ''}
          <p><strong>License Key:</strong> ${licenseKey}</p>
        </div>
        <h3>Getting Started</h3>
        <ol>
          <li>Install the FUTBot Chrome Extension.</li>
          <li>Log in using your email as username and your access code as password.</li>
          <li>Configure your trading settings and start trading!</li>
        </ol>
        <p style="margin-top: 16px;">Need help? Contact us at <a href="mailto:support@futbot.club">support@futbot.club</a></p>
        <p>Happy Trading!<br/>FUTBot Team</p>
      </div>
    `;

    await resendClient.emails.send({
      from: fromAddress,
      to: email,
      subject: 'Welcome to FUTBot! Your Account is Ready',
      html
    });

    return true;
  } catch (error: any) {
    console.error('Failed to send welcome email:', error?.response?.data || error);
    return false;
  }
}

// Create user subscription record
async function createUserSubscription(subscriptionData: {
  email: string;
  username: string;
  licenseKey: string;
  subscriptionType: string;
  amountPaid: number;
  paymentId: string;
  paymentStatus: string;
  paymentMethod: string;
  duration: number;
}) {
  try {
    // Calculate end date based on duration
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + subscriptionData.duration);

    // Here you would typically save to your database
    // Since I see Supabase migrations in the codebase, this would be a Supabase call
    console.log('Creating user subscription record:', {
      ...subscriptionData,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });

    // For now, just log the data. You should replace this with actual database insertion
    // Example with Supabase:
    // const { data, error } = await supabase
    //   .from('user_subscriptions')
    //   .insert({
    //     email: subscriptionData.email,
    //     subscription_type: subscriptionData.subscriptionType,
    //     amount_paid: subscriptionData.amountPaid,
    //     payment_id: subscriptionData.paymentId,
    //     payment_status: subscriptionData.paymentStatus,
    //     payment_method: subscriptionData.paymentMethod,
    //     start_date: startDate.toISOString(),
    //     end_date: endDate.toISOString(),
    //     is_active: true
    //   });

    return true;
  } catch (error) {
    console.error('Failed to create user subscription record:', error);
    throw error;
  }
}

async function handleSuccessfulPayment(event: any) {
  try {
    // Extract payment information
    const amount = event.resource?.amount?.total || event.resource?.gross_amount?.value;
    const currency = event.resource?.amount?.currency || event.resource?.gross_amount?.currency_code;
    const payerEmail = event.resource?.payer?.email_address || event.resource?.payer_info?.email;
    const paymentId = event.resource?.id;
    
    // Extract user data from custom_id
    let userEmail = payerEmail;
    // Use email as username directly - much simpler and clearer for users
    let username = payerEmail;
    let accessCode: string | undefined = undefined;
    
    try {
      const customId = event.resource?.purchase_units?.[0]?.custom_id;
      if (customId) {
        const userData = JSON.parse(customId);
        if (userData.email) {
          userEmail = userData.email;
          username = userData.email; // Use email as username
        }
        if (userData.accessCode) {
          accessCode = String(userData.accessCode);
        }
        if (userEmail || accessCode) {
          console.log('Using custom user data from PayPal order:', { email: userEmail, username, accessCodePresent: !!accessCode });
        }
      }
    } catch (e) {
      console.log('No valid custom user data found, using payer email as username');
    }
    
    console.log('Processing payment:', { amount, currency, userEmail, paymentId, username });

    // Validate currency
    if (currency !== 'USD') {
      console.warn(`Unsupported currency received (${currency}), ignoring event.`);
      return; // don't fail the webhook, just ignore
    }

    // Find matching subscription plan
    const amountStr = String(amount); // Convert to string to match object keys
    const subscriptionPlan = SUBSCRIPTION_PLANS[amountStr as keyof typeof SUBSCRIPTION_PLANS];
    if (!subscriptionPlan) {
      console.warn(`Unknown subscription amount (${amountStr}), ignoring event.`);
      return; // ignore unrecognized simulator/test amounts
    }

    // Get license key from pre-created pool or use fallback
    const LICENSE_KEYS_POOL = (process.env.KEYAUTH_LICENSE_KEYS || '').split(',').filter(key => key.trim());
    let licenseKey: string;
    
    if (LICENSE_KEYS_POOL.length > 0) {
      // Use a random key from the pool
      const randomIndex = Math.floor(Math.random() * LICENSE_KEYS_POOL.length);
      licenseKey = LICENSE_KEYS_POOL[randomIndex];
      console.log('✅ Using license key from pool:', `***${licenseKey.slice(-4)}`);
    } else {
      // Use predefined default key or generate fallback
      licenseKey = process.env.KEYAUTH_DEFAULT_LICENSE || `FUTBOT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      console.log('⚠️ No license keys in pool, using default/fallback:', `***${licenseKey.slice(-4)}`);
    }

    // If customer provided access code, register a KeyAuth user using the license
    if (accessCode) {
      console.log('🔑 Attempting to register KeyAuth user:', { username, email: userEmail, accessCodeLength: accessCode.length });
      try {
        const registered = await registerKeyAuthUser(username, accessCode, licenseKey, userEmail);
        console.log('✅ KeyAuth user registration:', registered ? 'SUCCESS' : 'FAILED');
      } catch (error) {
        console.error('❌ KeyAuth user registration error:', error);
        // Continue processing even if user registration fails
      }
    } else {
      console.log('ℹ️ No access code provided, skipping KeyAuth user registration');
    }

    // Create user subscription record in database
    await createUserSubscription({
      email: userEmail,
      username: username,
      licenseKey: licenseKey,
      subscriptionType: subscriptionPlan.plan,
      amountPaid: parseFloat(amount),
      paymentId: paymentId,
      paymentStatus: 'completed',
      paymentMethod: 'paypal',
      duration: subscriptionPlan.duration
    });

    console.log('License and user record created successfully:', {
      username,
      email: userEmail,
      licenseKey,
      plan: subscriptionPlan.plan,
      duration: subscriptionPlan.duration,
      paymentId
    });

    // TODO: Send license key and login instructions to user via email
    // You can integrate with your email service here
    await sendWelcomeEmail(userEmail, username, licenseKey, subscriptionPlan.plan, accessCode);
    
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
  if (allowedOrigins.includes(origin as string)) {
    res.setHeader('Access-Control-Allow-Origin', origin as string);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Paypal-Auth-Assertion, Paypal-Auth-Algo, Paypal-Cert-Url, Paypal-Transmission-Id, Paypal-Transmission-Sig, Paypal-Transmission-Time');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Log all incoming requests (sanitized for production)
  console.log('=== PayPal Webhook Request ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Environment:', PAYPAL_SANDBOX ? 'SANDBOX' : 'PRODUCTION');
  console.log('User-Agent:', req.headers['user-agent'] || 'N/A');
  
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
    
    // Force skip verification for debugging - DISABLED for production
    const forceSkip = false; // Set to true only for debugging
    if (forceSkip) {
      console.warn('[Webhook] FORCE SKIPPING verification for debugging purposes');
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
    if (!skipVerify && !isVercelPaypalBot && !forceSkip) {
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

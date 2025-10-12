import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // إعدادات CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { planId, email, accessCode } = req.body || {};
    if (!planId || !email || !accessCode)
      return res.status(400).json({ error: 'Missing required fields' });
    if (planId !== '1_month')
      return res.status(400).json({ error: 'Only 1_month plan is enabled' });

    const paddleToken = process.env.PADDLE_TOKEN;
    const priceId = process.env.PADDLE_PRICE_ID_1_MONTH;
    const rawAppUrl = process.env.VITE_APP_URL;
    const appUrl = !rawAppUrl || /^\$\{.+\}$/.test(rawAppUrl)
      ? 'https://futbot.club'
      : rawAppUrl;
    const appUrlNormalized = appUrl.replace(/\/+$/, '');

    const isPlaceholder = (value?: string) => typeof value === 'string' && /^\$\{.+\}$/.test(value);

    if (!paddleToken || !priceId || isPlaceholder(paddleToken) || isPlaceholder(priceId)) {
      console.error('Paddle env invalid:', {
        hasToken: Boolean(paddleToken),
        hasPriceId: Boolean(priceId),
        tokenLooksPlaceholder: isPlaceholder(paddleToken),
        priceIdLooksPlaceholder: isPlaceholder(priceId),
      });
      return res.status(500).json({
        error: 'Invalid Paddle env vars',
        details: 'PADDLE_TOKEN and/or PADDLE_PRICE_ID_1_MONTH are missing or unresolved placeholders',
      });
    }

    const env = (process.env.PADDLE_ENV || 'sandbox').toLowerCase();
    const envLooksPlaceholder = isPlaceholder(process.env.PADDLE_ENV);

    // Base URL الصحيح
    const baseUrl =
      env === 'live'
        ? 'https://api.paddle.com/'
        : 'https://sandbox-api.paddle.com/';

    console.log('🔍 Environment check:', {
      PADDLE_ENV: process.env.PADDLE_ENV,
      PADDLE_TOKEN: paddleToken?.substring(0, 20) + '...',
      PADDLE_PRICE_ID: priceId,
      baseUrl,
      env,
      envLooksPlaceholder,
    });

    const payload = {
      items: [{ price_id: priceId, quantity: 1 }],
      customer: { email },
      custom_data: { planId, email, accessCode },
      settings: {
        success_url: `${appUrlNormalized}/subscription/success`,
        cancel_url: `${appUrlNormalized}/`,
      },
    };

    // ✅ endpoint الصحيح لإنشاء جلسة Checkout
    const sessionsEndpoint = `${baseUrl}v1/checkout/sessions`;
    console.log('Creating checkout session at:', sessionsEndpoint, {
      successUrl: payload.settings.success_url,
      cancelUrl: payload.settings.cancel_url,
    });

    let response;
    try {
      response = await axios.post(sessionsEndpoint, payload, {
        headers: {
          Authorization: `Bearer ${paddleToken}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'Paddle-Version': '1',
        },
      });
    } catch (err: any) {
      const code = err?.response?.data?.error?.code || err?.code;
      const status = err?.response?.status;
      const fallbackEndpoint = `${baseUrl}v1/checkout`;
      // Fallback في حال كان مسار الجلسات غير مدعوم في الحساب/البيئة
      if (code === 'invalid_url' || status === 404) {
        console.warn('Checkout sessions endpoint invalid; retrying fallback endpoint:', fallbackEndpoint);
        response = await axios.post(fallbackEndpoint, payload, {
          headers: {
            Authorization: `Bearer ${paddleToken}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'Paddle-Version': '1',
          },
        });
      } else {
        throw err;
      }
    }

    const checkoutUrl =
      response?.data?.data?.url ||
      response?.data?.data?.checkout_url ||
      response?.data?.redirect_url;

    if (!checkoutUrl) {
      console.error('No checkout URL found:', response.data);
      return res.status(500).json({
        error: 'Failed to create Paddle checkout',
        details: response.data,
      });
    }

    return res.status(200).json({ success: true, checkoutUrl });
  } catch (error: any) {
    console.error('Paddle checkout error:', error?.response?.data || error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error?.response?.data || String(error),
    });
  }
}

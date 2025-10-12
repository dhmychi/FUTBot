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
    const appUrl = process.env.VITE_APP_URL || 'https://futbot.club';

    if (!paddleToken || !priceId) {
      return res.status(500).json({ error: 'Missing Paddle env vars (PADDLE_TOKEN, PADDLE_PRICE_ID_1_MONTH)' });
    }

    const env = (process.env.PADDLE_ENV || 'sandbox').toLowerCase();
    const baseUrl = env === 'live' ? 'https://api.paddle.com' : 'https://sandbox-api.paddle.com';

    // 🔍 لوق تشخيصي للمتغيرات
    console.log('🔍 Environment check:', {
      PADDLE_ENV: process.env.PADDLE_ENV,
      PADDLE_TOKEN: paddleToken?.substring(0, 20) + '...',
      PADDLE_PRICE_ID: priceId,
      baseUrl,
      env
    });

    const payload = {
      items: [{ price_id: priceId, quantity: 1 }],
      customer: { email },
      custom_data: { planId, email, accessCode },
      settings: {
        success_url: `${appUrl}/subscription/success`,
        cancel_url: `${appUrl}/`,
      },
    };

    console.log('Creating Billing checkout session at:', `${baseUrl}/v1/checkout/sessions`);
    const response = await axios.post(`${baseUrl}/v1/checkout/sessions`, payload, {
      headers: {
        Authorization: `Bearer ${paddleToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    const checkoutUrl = response?.data?.data?.url || response?.data?.data?.checkout_url;
    if (!checkoutUrl) {
      console.error('No checkout URL found:', response.data);
      return res.status(500).json({ error: 'Failed to create Paddle checkout', details: response.data });
    }

    return res.status(200).json({ success: true, checkoutUrl });

  } catch (error: any) {
    console.error('Paddle checkout error:', error?.response?.data || error);
    return res.status(500).json({ error: 'Internal server error', details: error?.response?.data || String(error) });
  }
}

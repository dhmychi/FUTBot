import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { planId, email, accessCode } = req.body || {};

    if (!planId || !email || !accessCode) {
      return res.status(400).json({ error: 'Missing required fields: planId, email, accessCode' });
    }

    if (planId !== '1_month') {
      return res.status(400).json({ error: 'Only 1_month plan is enabled' });
    }

    // Get environment variables
    const vendorId = process.env.PADDLE_VENDOR_ID;
    const vendorAuthCode = process.env.PADDLE_VENDOR_AUTH_CODE;
    const priceId = process.env.PADDLE_PRICE_ID_1_MONTH;
    const paddleEnv = process.env.PADDLE_ENV || 'sandbox';
    const appUrl = process.env.VITE_APP_URL || 'https://www.futbot.club';

    if (!vendorId || !vendorAuthCode || !priceId) {
      return res.status(500).json({ error: 'Paddle environment variables not configured properly' });
    }

    // Log for debugging
    console.log('Vendor ID:', vendorId);
    console.log('Paddle Environment:', paddleEnv);
    console.log('Price ID:', priceId);

    // Determine API base URL
    const baseUrl = paddleEnv === 'live' 
      ? 'https://vendors.paddle.com/api/2.0/order' 
      : 'https://sandbox-vendors.paddle.com/api/2.0/order';

    // Payload according to Paddle API
    const payload = {
      vendor_id: vendorId,
      vendor_auth_code: vendorAuthCode,
      price_id: priceId,
      quantity: 1,
      customer_email: email,
      passthrough: JSON.stringify({ planId, email, accessCode }),
      return_url: `${appUrl}/subscription/success?plan=${encodeURIComponent(planId)}`,
    };

    console.log('Making request to Paddle:', baseUrl);
    console.log('Payload:', payload);

    const response = await axios.post(baseUrl, payload, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      transformRequest: [(data) => {
        // Paddle API expects URL-encoded form
        return Object.entries(data)
          .map(([key, val]) => `${encodeURIComponent(key)}=${encodeURIComponent(val as string)}`)
          .join('&');
      }],
    });

    console.log('Paddle response:', response.data);

    if (!response.data || !response.data.success) {
      return res.status(500).json({ error: 'Failed to create Paddle checkout', details: response.data });
    }

    // Checkout URL returned by Paddle
    const checkoutUrl = response.data.response?.url;
    return res.status(200).json({ success: true, checkoutUrl });

  } catch (error: any) {
    console.error('Paddle checkout error:', error?.response?.data || error?.message || error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error?.response?.data || error?.message || String(error) 
    });
  }
}
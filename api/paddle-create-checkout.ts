import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

// Create Paddle Checkout session for one-time price and return checkout url
export default async function handler(req: VercelRequest, res: VercelResponse) {
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

    // Only 1_month supported for now in sandbox
    if (planId !== '1_month') {
      return res.status(400).json({ error: 'Only 1_month plan is enabled in sandbox' });
    }

    const priceId = process.env.PADDLE_PRICE_ID_1_MONTH as string;
    if (!priceId) {
      return res.status(500).json({ error: 'PADDLE_PRICE_ID_1_MONTH is not configured' });
    }

    const paddleToken = process.env.PADDLE_TOKEN as string;
    if (!paddleToken) {
      return res.status(500).json({ error: 'PADDLE_TOKEN is not configured' });
    }
    
    // Check if token is not resolved (contains ${})
    if (paddleToken.includes('${')) {
      return res.status(500).json({ error: 'PADDLE_TOKEN is not resolved - check Vercel Environment Variables' });
    }
    
    const paddleEnv = (process.env.PADDLE_ENV || 'sandbox').toLowerCase();
    const baseUrl = paddleEnv === 'live' ? 'https://api.paddle.com' : 'https://sandbox-api.paddle.com';
    const appUrl = process.env.VITE_APP_URL || 'https://www.futbot.club';
    
    // Log token for debugging (first 10 chars only)
    console.log('PADDLE_TOKEN starts with:', paddleToken.substring(0, 10) + '...');
    console.log('PADDLE_ENV:', paddleEnv);
    console.log('Base URL:', baseUrl);
    console.log('Price ID:', priceId);

    // Build request to create a transaction with checkout URL using Paddle Billing API v1
    const payload: any = {
      items: [
        {
          price_id: priceId,
          quantity: 1,
        },
      ],
      customer_email: email,
      custom_data: {
        planId,
        email,
        accessCode,
      },
      checkout: {
        url: `${appUrl}/subscription/success?plan=${encodeURIComponent(planId)}`,
      },
    };

    const response = await axios.post(`${baseUrl}/v1/transactions`, payload, {
      headers: {
        Authorization: `Bearer ${paddleToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    const checkoutUrl = response?.data?.data?.checkout?.url || response?.data?.data?.url || response?.data?.data?.checkout_url;
    const transactionId = response?.data?.data?.id;

    if (!checkoutUrl) {
      return res.status(500).json({ error: 'Failed to create Paddle checkout' });
    }

    return res.status(200).json({ success: true, checkoutUrl, transactionId });
  } catch (error: any) {
    console.error('Paddle checkout creation failed:', error?.response?.data || error);
    return res.status(500).json({ error: 'Internal server error', details: error?.response?.data || error?.message || String(error) });
  }
}



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

    // Only 1_month supported for now
    if (planId !== '1_month') {
      return res.status(400).json({ error: 'Only 1_month plan is enabled' });
    }

    // Get environment variables
    const paddleToken = process.env.PADDLE_TOKEN;
    const priceId = process.env.PADDLE_PRICE_ID_1_MONTH;
    const paddleEnv = process.env.PADDLE_ENV || 'sandbox';
    const appUrl = process.env.VITE_APP_URL || 'https://www.futbot.club';

    if (!paddleToken) {
      return res.status(500).json({ error: 'PADDLE_TOKEN not configured' });
    }

    if (!priceId) {
      return res.status(500).json({ error: 'PADDLE_PRICE_ID_1_MONTH not configured' });
    }

    // Log for debugging
    console.log('Paddle Token starts with:', paddleToken.substring(0, 10) + '...');
    console.log('Paddle Environment:', paddleEnv);
    console.log('Price ID:', priceId);

    // Determine API base URL
    const baseUrl = paddleEnv === 'live' ? 'https://api.paddle.com' : 'https://sandbox-api.paddle.com';

    // Create Paddle checkout session
    const payload = {
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

    console.log('Making request to:', `${baseUrl}/v1/transactions`);
    console.log('Payload:', JSON.stringify(payload, null, 2));

    const response = await axios.post(`${baseUrl}/v1/transactions`, payload, {
      headers: {
        Authorization: `Bearer ${paddleToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    console.log('Paddle response:', response.data);

    const checkoutUrl = response?.data?.data?.checkout?.url || response?.data?.data?.url;
    const transactionId = response?.data?.data?.id;

    if (!checkoutUrl) {
      return res.status(500).json({ error: 'Failed to create Paddle checkout' });
    }

    return res.status(200).json({ 
      success: true, 
      checkoutUrl, 
      transactionId 
    });

  } catch (error: any) {
    console.error('Paddle checkout error:', error?.response?.data || error?.message || error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error?.response?.data || error?.message || String(error) 
    });
  }
}

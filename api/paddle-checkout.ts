import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
import qs from 'qs';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { planId, email, accessCode } = req.body || {};
    if (!planId || !email || !accessCode) return res.status(400).json({ error: 'Missing required fields' });
    if (planId !== '1_month') return res.status(400).json({ error: 'Only 1_month plan is enabled' });

    const paddleToken = process.env.PADDLE_TOKEN;
    const priceId = process.env.PADDLE_PRICE_ID_1_MONTH;
    const appUrl = process.env.VITE_APP_URL || 'https://www.futbot.club';

    if (!paddleToken || !priceId) return res.status(500).json({ error: 'Paddle environment not configured' });

    const payload = qs.stringify({
      product_id: priceId,
      customer_email: email,
      custom_data: JSON.stringify({ planId, email, accessCode }),
      return_url: `${appUrl}/subscription/success?plan=${encodeURIComponent(planId)}`,
    });

    const response = await axios.post('https://sandbox-vendors.paddle.com/api/2.0/product/generate_pay_link', payload, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Bearer ${paddleToken}`,
      },
    });

    const checkoutUrl = response?.data?.response?.url;
    if (!checkoutUrl) return res.status(500).json({ error: 'Failed to create Paddle checkout' });

    return res.status(200).json({ success: true, checkoutUrl });

  } catch (error: any) {
    console.error('Paddle checkout error:', error?.response?.data || error?.message || error);
    return res.status(500).json({ error: 'Internal server error', details: error?.response?.data || String(error) });
  }
}
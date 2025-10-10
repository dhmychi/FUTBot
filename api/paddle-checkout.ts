import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
import qs from 'qs'; // لتحويل البيانات إلى URL-encoded

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { planId, email, accessCode } = req.body || {};
    if (!planId || !email || !accessCode)
      return res.status(400).json({ error: 'Missing required fields: planId, email, accessCode' });

    if (planId !== '1_month') return res.status(400).json({ error: 'Only 1_month plan is enabled' });

    // المتغيرات البيئية
    const paddleToken = process.env.PADDLE_TOKEN; // استخدم API Key هنا
    const priceId = process.env.PADDLE_PRICE_ID_1_MONTH;
    const paddleEnv = process.env.PADDLE_ENV || 'sandbox';
    const appUrl = process.env.VITE_APP_URL || 'https://www.futbot.club';

    if (!paddleToken) return res.status(500).json({ error: 'PADDLE_TOKEN not configured' });
    if (!priceId) return res.status(500).json({ error: 'PADDLE_PRICE_ID_1_MONTH not configured' });

    // URL API حسب البيئة
    const baseUrl =
      paddleEnv === 'live'
        ? 'https://vendors.paddle.com/api/2.0/product/generate_pay_link'
        : 'https://sandbox-vendors.paddle.com/api/2.0/product/generate_pay_link';

    const payload = qs.stringify({
      vendor_auth_code: paddleToken,
      product_id: priceId,
      quantity: 1,
      customer_email: email,
      passthrough: JSON.stringify({ planId, email, accessCode }),
      return_url: `${appUrl}/subscription/success?plan=${encodeURIComponent(planId)}`,
    });

    console.log('Making request to:', baseUrl);
    console.log('Payload:', payload);

    const response = await axios.post(baseUrl, payload, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    console.log('Paddle response:', response.data);

    const checkoutUrl = response?.data?.response?.url;
    const transactionId = response?.data?.response?.order_id;

    if (!checkoutUrl) return res.status(500).json({ error: 'Failed to create Paddle checkout' });

    return res.status(200).json({
      success: true,
      checkoutUrl,
      transactionId,
    });
  } catch (error: any) {
    console.error('Paddle checkout error:', error?.response?.data || error?.message || error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error?.response?.data || error?.message || String(error),
    });
  }
}
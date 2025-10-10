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

    // Classic Vendors API variables
    const vendorId = process.env.PADDLE_VENDOR_ID;
    const vendorAuthCode = process.env.PADDLE_VENDOR_AUTH_CODE;
    const productId = process.env.PADDLE_PRODUCT_ID_1_MONTH; // Classic numeric product_id
    const appUrl = process.env.VITE_APP_URL || 'https://www.futbot.club';

    if (!vendorId || !vendorAuthCode || !productId) {
      return res.status(500).json({ error: 'Paddle Classic env not configured (PADDLE_VENDOR_ID, PADDLE_VENDOR_AUTH_CODE, PADDLE_PRODUCT_ID_1_MONTH)' });
    }

    const payload = qs.stringify({
      vendor_id: vendorId,
      vendor_auth_code: vendorAuthCode,
      product_id: productId,
      quantity: 1,
      customer_email: email,
      passthrough: JSON.stringify({ planId, email, accessCode }),
      return_url: `${appUrl}/subscription/success?plan=${encodeURIComponent(planId)}`,
    });

    console.log('Making request to Paddle (Classic) with payload:', payload);

    const response = await axios.post('https://sandbox-vendors.paddle.com/api/2.0/product/generate_pay_link', payload, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    console.log('Paddle response:', JSON.stringify(response.data, null, 2));

    const checkoutUrl = response?.data?.response?.url || response?.data?.url || response?.data?.checkout_url;
    if (!checkoutUrl) {
      console.error('No checkout URL found in response:', response.data);
      return res.status(500).json({ error: 'Failed to create Paddle checkout', details: response.data });
    }

    return res.status(200).json({ success: true, checkoutUrl });

  } catch (error: any) {
    console.error('Paddle checkout error:', error?.response?.data || error?.message || error);
    return res.status(500).json({ error: 'Internal server error', details: error?.response?.data || String(error) });
  }
}
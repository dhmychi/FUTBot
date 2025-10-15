import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // استلام البيانات من الطلب
    const { planId, email, accessCode } = req.body || {};
    if (!planId || !email || !accessCode)
      return res.status(400).json({ error: 'Missing required fields' });

    if (planId !== '1_month')
      return res.status(400).json({ error: 'Only 1_month plan is enabled' });

    // استخدام التوكن من المتغيرات البيئية (Sandbox)
    const paddleToken = (process.env.PADDLE_TOKEN || '').trim();
    const priceId = (process.env.PADDLE_PRICE_ID_1_MONTH || '').trim();
    // const appUrl = (process.env.VITE_APP_URL || 'https://futbot.club').replace(/\/+$/, '');

    if (!paddleToken || !priceId) {
      return res.status(500).json({ error: 'Invalid Paddle environment variables' });
    }

    // تجهيز البيانات لإرسالها إلى Paddle Sandbox
    const payload = {
      items: [{ price_id: priceId, quantity: 1 }],
      customer: { email },
      custom_data: { planId, email, accessCode },
      collection_mode: 'automatic'
    };

    const endpoint = 'https://sandbox-api.paddle.com/transactions';

    // إرسال الطلب (Transactions API)
    const response = await axios.post(endpoint, payload, {
      headers: {
        Authorization: `Bearer ${paddleToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'Paddle-Version': '1',
      },
    });

    const checkoutUrl =
      response?.data?.checkout_url ||
      response?.data?.data?.checkout_url ||
      response?.data?.data?.checkout?.url ||
      response?.data?.url;
    if (!checkoutUrl) {
      return res.status(500).json({ error: 'Failed to create Paddle checkout', details: response.data });
    }

    // إرسال الرابط للعميل
    return res.status(200).json({ success: true, checkoutUrl });

  } catch (error: any) {
    console.error('Paddle checkout error:', error?.response?.data || error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error?.response?.data || String(error),
    });
  }
}

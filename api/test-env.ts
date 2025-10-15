import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const KEYAUTH_SELLER_KEY_RAW = process.env.KEYAUTH_SELLER_KEY || '';
    const KEYAUTH_SELLER_KEY = KEYAUTH_SELLER_KEY_RAW.replace(/[^A-Za-z0-9]/g, '').trim();
    
    return res.status(200).json({
      success: true,
      env_check: {
        KEYAUTH_SELLER_KEY_raw_length: KEYAUTH_SELLER_KEY_RAW.length,
        KEYAUTH_SELLER_KEY_clean_length: KEYAUTH_SELLER_KEY.length,
        KEYAUTH_SELLER_KEY_tail: KEYAUTH_SELLER_KEY.slice(-4),
        PADDLE_TOKEN_exists: !!process.env.PADDLE_TOKEN,
        PADDLE_TOKEN_length: (process.env.PADDLE_TOKEN || '').length,
        NODE_ENV: process.env.NODE_ENV,
        VERCEL_ENV: process.env.VERCEL_ENV
      }
    });
  } catch (error: any) {
    return res.status(500).json({
      error: 'Environment check failed',
      details: String(error)
    });
  }
}

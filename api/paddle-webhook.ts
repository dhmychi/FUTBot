// Load .env variables at the very beginning
import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const body: any = req.body;
    // Paddle Billing webhook commonly includes event_type like 'transaction.completed'
    const eventType: string | undefined = body?.event_type || body?.event || body?.type;
    const data = body?.data || body;
    const status: string | undefined = data?.status || data?.transaction?.status;

    console.log('📥 Paddle Webhook received:', { eventType, status });

    if (!data) return res.status(400).json({ error: 'Invalid webhook payload' });

    // Only proceed when transaction is completed/paid
    const isCompleted = (eventType && /transaction\.completed/i.test(eventType)) || status === 'completed' || status === 'paid';
    if (!isCompleted) {
      console.log('⏭️ Skipping non-completed event');
      return res.status(200).json({ ok: true });
    }

    // Extract custom data and email
    const customData = data?.custom_data || data?.transaction?.custom_data || {};
    const planId: string | undefined = customData?.planId || customData?.plan || data?.plan_id;
    const email: string | undefined = customData?.email || data?.customer_email || data?.customer?.email;
    const accessCode: string | undefined = customData?.accessCode || customData?.password;

    if (!planId || !email || !accessCode) {
      console.error('❌ Missing purchase info', { planId, email: !!email, accessCode: !!accessCode });
      return res.status(400).json({ error: 'Missing required custom_data (planId, email, accessCode)' });
    }

    // Map planId to duration and price (adjust as needed)
    const PLANS: Record<string, { duration: number; price: number; name: string }> = {
      '1_month': { duration: 30, price: 15.0, name: '1 Month' },
    };
    const plan = PLANS[planId];
    if (!plan) return res.status(400).json({ error: 'Invalid planId' });

    const KEYAUTH_SELLER_KEY = process.env.KEYAUTH_SELLER_KEY as string;
    if (!KEYAUTH_SELLER_KEY) return res.status(500).json({ error: 'Missing KEYAUTH_SELLER_KEY' });

    // Create license key via Seller API
    const sellerParams = new URLSearchParams();
    sellerParams.append('sellerkey', KEYAUTH_SELLER_KEY);
    sellerParams.append('type', 'add');
    sellerParams.append('expiry', plan.duration.toString());
    sellerParams.append('amount', '1');
    sellerParams.append('level', '1');
    sellerParams.append('mask', '******-******-******-******');
    sellerParams.append('format', 'JSON');
    sellerParams.append('note', `Paddle transaction - ${email} - Plan: ${plan.name}`);

    const addResp = await axios.post('https://keyauth.win/api/seller/', sellerParams, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    if (!addResp.data?.success) {
      console.error('❌ KeyAuth add failed:', addResp.data);
      return res.status(500).json({ error: 'KeyAuth add license failed', details: addResp.data });
    }
    const licenseKey: string | undefined = addResp.data.key || addResp.data.keys?.[0];
    if (!licenseKey) return res.status(500).json({ error: 'No license key returned from KeyAuth add' });

    // Activate user
    const activateParams = new URLSearchParams();
    activateParams.append('sellerkey', KEYAUTH_SELLER_KEY);
    activateParams.append('type', 'activate');
    activateParams.append('user', email);
    activateParams.append('key', licenseKey);
    activateParams.append('pass', accessCode);

    const actResp = await axios.get(`https://keyauth.win/api/seller/?${activateParams.toString()}`);
    if (!actResp.data?.success) {
      console.error('❌ KeyAuth activate failed:', actResp.data);
      return res.status(500).json({ error: 'KeyAuth activate failed', details: actResp.data });
    }

    console.log('✅ KeyAuth user created successfully');
    return res.status(200).json({ success: true, email, licenseKey, planId });
  } catch (error: any) {
    console.error('💥 Paddle webhook error:', error?.response?.data || error);
    return res.status(500).json({ error: 'Internal server error', details: error?.response?.data || String(error) });
  }
}

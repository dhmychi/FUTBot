// ==============================
// Paddle Webhook Handler (Vercel)
// ==============================

// Load .env variables immediately
import dotenv from 'dotenv';
dotenv.config();

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
    const eventType: string | undefined = body?.event_type || body?.event || body?.type;
    const data = body?.data || body;
    let status: string | undefined = data?.status || data?.transaction?.status;

    console.log('📥 Paddle Webhook received:', { eventType, status });

    if (!data) return res.status(400).json({ error: 'Invalid webhook payload' });

    const normalizedEvent = (eventType || '').toLowerCase();
    const successEvents = new Set(['transaction.completed', 'transaction.paid', 'transaction.billed']);
    const successStatuses = new Set(['completed', 'paid', 'billed']);

    // Handle transaction.updated by fetching latest status
    const transactionIdEarly: string | undefined = data?.id || data?.transaction?.id;
    if ((!status || !successStatuses.has(String(status).toLowerCase())) && normalizedEvent === 'transaction.updated' && transactionIdEarly) {
      try {
        const token = (process.env.PADDLE_TOKEN || '').trim();
        if (token) {
          const txResp = await axios.get(`https://sandbox-api.paddle.com/transactions/${encodeURIComponent(transactionIdEarly)}`, {
            headers: { Authorization: `Bearer ${token}`, Accept: 'application/json', 'Paddle-Version': '1' }
          });
          const txData = txResp?.data?.data || txResp?.data || {};
          status = txData?.status || status;
        }
      } catch (e) {
        console.warn('⚠️ Failed to refresh transaction status:', (e as any)?.response?.data || String(e));
      }
    }

    const isCompleted = successEvents.has(normalizedEvent) || successStatuses.has(String(status || '').toLowerCase());
    if (!isCompleted) {
      console.log('⏭️ Skipping non-completed event');
      return res.status(200).json({ ok: true });
    }

    // Extract custom data and email
    let customData: any = data?.custom_data || data?.transaction?.custom_data || {};
    const transactionId: string | undefined = data?.id || data?.transaction?.id;

    // Fallback: fetch full transaction details from Paddle if custom_data missing
    if ((!customData || Object.keys(customData).length === 0) && transactionId) {
      try {
        const token = (process.env.PADDLE_TOKEN || '').trim();
        if (token) {
          const txResp = await axios.get(`https://sandbox-api.paddle.com/transactions/${encodeURIComponent(transactionId)}`, {
            headers: { Authorization: `Bearer ${token}`, Accept: 'application/json', 'Paddle-Version': '1' }
          });
          const txData = txResp?.data?.data || txResp?.data || {};
          customData = txData?.custom_data || txData?.transaction?.custom_data || customData || {};
        }
      } catch (e) {
        console.warn('⚠️ Failed to fetch transaction details for custom_data fallback:', (e as any)?.response?.data || String(e));
      }
    }

    const planId: string | undefined = customData?.planId || customData?.plan || data?.plan_id;
    const email: string | undefined = customData?.email || data?.customer_email || data?.customer?.email;
    const accessCode: string | undefined = customData?.accessCode || customData?.password;

    if (!planId || !email || !accessCode) {
      console.error('❌ Missing purchase info', { planId, email: !!email, accessCode: !!accessCode });
      return res.status(400).json({ error: 'Missing required custom_data (planId, email, accessCode)' });
    }

    // Map planId to duration and price
    const PLANS: Record<string, { duration: number; price: number; name: string }> = {
      '1_month': { duration: 30, price: 15.0, name: '1 Month' },
    };
    const plan = PLANS[planId];
    if (!plan) return res.status(400).json({ error: 'Invalid planId' });

    // Load and sanitize Seller Key (strip any non-alphanumerics just in case)
    const KEYAUTH_SELLER_KEY_RAW = process.env.KEYAUTH_SELLER_KEY || '';
    const KEYAUTH_SELLER_KEY = KEYAUTH_SELLER_KEY_RAW.replace(/[^A-Za-z0-9]/g, '').trim();
    console.log('KEYAUTH_SELLER_KEY length:', KEYAUTH_SELLER_KEY.length, 'tail:', KEYAUTH_SELLER_KEY.slice(-4));

    if (!KEYAUTH_SELLER_KEY) return res.status(500).json({ error: 'Missing KEYAUTH_SELLER_KEY' });
    if (KEYAUTH_SELLER_KEY.length !== 32) {
      console.error('❌ Invalid Seller Key length:', KEYAUTH_SELLER_KEY.length);
      return res.status(500).json({
        error: 'Invalid Seller Key length',
        details: `Seller key must be exactly 32 characters long, got ${KEYAUTH_SELLER_KEY.length}`
      });
    }

    // Create license key via KeyAuth Seller API
    console.log('🔑 Creating KeyAuth license for:', email);
    const sellerParams = new URLSearchParams();
    sellerParams.append('sellerkey', KEYAUTH_SELLER_KEY);
    sellerParams.append('type', 'add');
    sellerParams.append('expiry', plan.duration.toString());
    sellerParams.append('amount', '1');
    sellerParams.append('level', '1');
    sellerParams.append('mask', '******-******-******-******-******-******');
    sellerParams.append('format', 'JSON');
    sellerParams.append('note', `Paddle transaction - ${email} - Plan: ${plan.name}`);

    console.log('🔑 Calling KeyAuth add license API...');
    const addResp = await axios.get(`https://keyauth.win/api/seller/?${sellerParams.toString()}`);
    console.log('🔑 KeyAuth add response:', addResp.data);

    if (!addResp.data?.success) {
      console.error('❌ KeyAuth add failed:', addResp.data);
      return res.status(500).json({ error: 'KeyAuth add license failed', details: addResp.data });
    }

    const licenseKey: string | undefined = addResp.data.key || addResp.data.keys?.[0];
    if (!licenseKey) return res.status(500).json({ error: 'No license key returned from KeyAuth add' });

    // Activate user
    console.log('👤 Activating user:', email, 'with license:', licenseKey);
    const activateParams = new URLSearchParams();
    activateParams.append('sellerkey', KEYAUTH_SELLER_KEY);
    activateParams.append('type', 'activate');
    activateParams.append('user', email);
    activateParams.append('key', licenseKey);
    activateParams.append('pass', accessCode);

    console.log('👤 Calling KeyAuth activate API...');
    const actResp = await axios.get(`https://keyauth.win/api/seller/?${activateParams.toString()}`);
    console.log('👤 KeyAuth activate response:', actResp.data);
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

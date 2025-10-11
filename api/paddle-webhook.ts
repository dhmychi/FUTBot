import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Paddle-Signature');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get webhook secret (support both SECRET and ID env names)
    const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET || process.env.PADDLE_WEBHOOK_ID;
    if (!webhookSecret) {
      console.error('PADDLE_WEBHOOK_SECRET not configured');
      return res.status(500).json({ error: 'Webhook secret not configured' });
    }

    // Verify webhook signature (handle common header casings)
    const signature = (req.headers['paddle-signature'] || req.headers['Paddle-Signature'] || req.headers['paddle_signature']) as string;
    if (!signature) {
      console.error('No Paddle signature found');
      return res.status(400).json({ error: 'No signature provided' });
    }

    // Verify signature
    const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    const hmac = crypto.createHmac('sha256', webhookSecret).update(rawBody, 'utf8').digest('hex');
    
    if (!crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(signature))) {
      console.error('Invalid webhook signature');
      return res.status(400).json({ error: 'Invalid signature' });
    }

    // Process webhook event
    const event = req.body;
    console.log('Paddle webhook event:', JSON.stringify(event, null, 2));

    const eventType = event?.event_type || event?.type;
    if (!eventType || !eventType.includes('transaction') || !eventType.includes('completed')) {
      console.log('Event ignored:', eventType);
      return res.status(200).json({ message: 'Event ignored' });
    }

    // Extract transaction data
    const data = event?.data || {};
    const customData = data?.custom_data || {};
    
    const planId = customData?.planId;
    const email = customData?.email;
    const accessCode = customData?.accessCode;
    const transactionId = data?.id;

    if (!planId || !email || !accessCode) {
      console.error('Missing custom data in webhook');
      return res.status(400).json({ error: 'Missing custom data' });
    }

    console.log('Creating KeyAuth user for:', { planId, email, accessCode, transactionId });

    // Create KeyAuth user
    try {
      const createUserResponse = await fetch(`${process.env.VITE_APP_URL || 'https://www.futbot.club'}/api/create-user-after-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          accessCode,
          paymentId: transactionId || `paddle_${Date.now()}`,
          planId,
          amount: data?.details?.totals?.total || data?.amount,
        }),
      });

      if (!createUserResponse.ok) {
        const errorText = await createUserResponse.text();
        console.error('Failed to create KeyAuth user:', errorText);
        return res.status(500).json({ error: 'Failed to create user account' });
      }

      const result = await createUserResponse.json();
      console.log('KeyAuth user created successfully:', result);

    } catch (err) {
      console.error('Error creating KeyAuth user:', err);
      return res.status(500).json({ error: 'Account setup failed' });
    }

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Paddle webhook error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

// Verify Paddle v2 webhook using shared secret (PADDLE_WEBHOOK_SECRET)
function verifySignature(req: VercelRequest): boolean {
  try {
    const signature = (req.headers['paddle-signature'] || req.headers['paddle_signature'] || req.headers['paddle-signature-v2'] || req.headers['paddle-signature-v1']) as string | undefined;
    if (!signature) return false;

    const secret = process.env.PADDLE_WEBHOOK_SECRET as string;
    if (!secret) return false;

    const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    const hmac = crypto.createHmac('sha256', secret).update(rawBody, 'utf8').digest('hex');
    return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(signature));
  } catch {
    return false;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
    if (!verifySignature(req)) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const event = req.body?.event || req.body;
    const type = event?.type || event?.event_type || '';
    const data = event?.data || req.body?.data || {};

    // We only care about completed transactions (one-time checkout)
    // Paddle v2 typically uses event type like 'transaction.completed'
    if (!type || !String(type).includes('transaction') || !String(type).includes('completed')) {
      return res.status(200).json({ message: 'Event ignored' });
    }

    const transactionId = data?.id || data?.transaction_id;
    const items = data?.items || [];
    const amount = data?.details?.totals?.total || data?.amount || undefined;
    const currency = data?.currency || data?.details?.currency || 'USD';
    const custom = data?.custom_data || {};

    const planId: string = custom?.planId;
    const email: string = custom?.email;
    const accessCode: string = custom?.accessCode;

    if (!planId || !email || !accessCode) {
      return res.status(400).json({ error: 'Missing custom data' });
    }

    // Call our existing flow to create KeyAuth user
    try {
      const payload = {
        email,
        accessCode,
        paymentId: transactionId || `paddle_${Date.now()}`,
        planId,
        amount: Number(amount) || undefined,
      };

      // Local import to avoid cold start overhead on Vercel
      const createUser = (await import('./create-user-after-payment')).default as any;

      // Build mock req/res to call handler directly
      const mockReq: any = { method: 'POST', body: payload, headers: { 'content-type': 'application/json' } };
      const resultData: any = {};
      const mockRes: any = {
        status: (code: number) => ({
          json: (data: any) => {
            resultData.statusCode = code;
            resultData.data = data;
            return resultData;
          },
          setHeader: () => mockRes.status,
        }),
        setHeader: () => mockRes,
      };

      await createUser(mockReq, mockRes);
    } catch (err) {
      console.error('Failed to create KeyAuth user from Paddle webhook:', err);
      return res.status(500).json({ error: 'Account setup failed' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Paddle webhook error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}



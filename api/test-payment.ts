import type { VercelRequest, VercelResponse } from '@vercel/node';

// Test payment processing manually
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, accessCode, planId, amount } = req.body;

    if (!email || !accessCode || !planId || !amount) {
      return res.status(400).json({ 
        error: 'Missing required fields: email, accessCode, planId, amount' 
      });
    }

    // Simulate PayPal webhook event
    const mockEvent = {
      event_type: 'PAYMENT.SALE.COMPLETED',
      resource: {
        id: 'test_payment_' + Date.now(),
        amount: {
          total: amount.toString(),
          currency: 'USD'
        },
        payer: {
          email_address: email
        },
        purchase_units: [{
          custom_id: JSON.stringify({
            planId,
            email,
            accessCode,
            timestamp: Date.now()
          })
        }]
      }
    };

    // Import and call the webhook handler
    const webhookHandler = await import('./webhook');
    
    // Create mock request for webhook
    const mockReq = {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'user-agent': 'test-manual-trigger'
      },
      body: JSON.stringify(mockEvent)
    } as any;

    const mockRes = {
      status: (code: number) => ({
        json: (data: any) => {
          console.log('Webhook response:', code, data);
          return { statusCode: code, data };
        }
      })
    } as any;

    // Process the mock webhook
    await webhookHandler.default(mockReq, mockRes);

    res.status(200).json({ 
      success: true, 
      message: 'Payment processed manually',
      event: mockEvent
    });

  } catch (error) {
    console.error('Manual payment processing error:', error);
    res.status(500).json({ 
      error: 'Payment processing failed',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}

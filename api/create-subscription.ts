import { Request, Response } from 'express';
import paypal from '@paypal/checkout-server-sdk';

// Configure PayPal environment
const configureEnvironment = () => {
  const clientId = process.env.VITE_PAYPAL_CLIENT_ID || '';
  const clientSecret = process.env.VITE_PAYPAL_CLIENT_SECRET || '';
  const environment = new paypal.core.SandboxEnvironment(clientId, clientSecret);
  return new paypal.core.PayPalHttpClient(environment);
};

export default async function handler(req: Request, res: Response) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { planId } = req.body;
    
    if (!planId) {
      return res.status(400).json({ error: 'Plan ID is required' });
    }

    const client = configureEnvironment();
    const request = new paypal.orders.OrdersCreateRequest();

    // Map plan IDs to their corresponding prices and names
    const plans = {
      'P-1MONTH-PLAN-ID': {
        name: '1 Month Subscription',
        price: '15.00',
        description: '1 month access to FUTBot Premium'
      },
      'P-3MONTHS-PLAN-ID': {
        name: '3 Months Subscription',
        price: '24.99',
        description: '3 months access to FUTBot Premium'
      },
      'P-12MONTHS-PLAN-ID': {
        name: '12 Months Subscription',
        price: '49.99',
        description: '12 months access to FUTBot Premium'
      }
    };

    const selectedPlan = plans[planId as keyof typeof plans];
    
    if (!selectedPlan) {
      return res.status(400).json({ error: 'Invalid plan ID' });
    }

    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: selectedPlan.price,
            breakdown: {
              item_total: {
                currency_code: 'USD',
                value: selectedPlan.price
              }
            }
          },
          items: [
            {
              name: selectedPlan.name,
              description: selectedPlan.description,
              quantity: '1',
              unit_amount: {
                currency_code: 'USD',
                value: selectedPlan.price
              }
            }
          ]
        }
      ]
    });

    const order = await client.execute(request);
    return res.status(200).json({ id: order.result.id });
    
  } catch (error) {
    console.error('Error creating subscription:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ 
      error: 'Failed to create subscription',
      details: errorMessage
    });
  }
}

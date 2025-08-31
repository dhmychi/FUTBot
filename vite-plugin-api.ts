import { Plugin } from 'vite';
import type { ViteDevServer } from 'vite';
import paypal from '@paypal/checkout-server-sdk';

interface ApiPluginOptions {
  apiPath?: string;
}

export default function apiPlugin(options: ApiPluginOptions = {}): Plugin {
  const { apiPath = '/api' } = options;
  
  // Configure PayPal environment
  const setupPayPal = () => {
    const clientId = process.env.VITE_PAYPAL_CLIENT_ID || '';
    const clientSecret = process.env.VITE_PAYPAL_CLIENT_SECRET || '';
    
    if (!clientId || !clientSecret) {
      console.error('PayPal credentials are not properly configured');
      return null;
    }
    
    const environment = new paypal.core.SandboxEnvironment(clientId, clientSecret);
    return new paypal.core.PayPalHttpClient(environment);
  };
  
  return {
    name: 'vite-plugin-api',
    configureServer(server: ViteDevServer) {
      const paypalClient = setupPayPal();
      
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith(apiPath)) return next();
        
        const pathname = req.url.replace(apiPath, '');
        
        // Handle CORS preflight
        if (req.method === 'OPTIONS') {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
          res.statusCode = 204;
          res.end();
          return;
        }
        
        // Parse request body
        let body = '';
        req.on('data', (chunk) => {
          body += chunk.toString();
        });
        
        req.on('end', async () => {
          try {
            // Set CORS headers
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Content-Type', 'application/json');
            
            if (pathname === '/create-subscription' && req.method === 'POST') {
              if (!paypalClient) {
                throw new Error('PayPal client not properly configured');
              }
              
              const { planId } = JSON.parse(body);
              
              // Map plan IDs to their details
              const plans = {
                'P-1MONTH-PLAN-ID': { price: '15.00', name: '1 Month Subscription' },
                'P-3MONTHS-PLAN-ID': { price: '24.99', name: '3 Months Subscription' },
                'P-12MONTHS-PLAN-ID': { price: '49.99', name: '12 Months Subscription' }
              };
              
              const selectedPlan = plans[planId as keyof typeof plans];
                
              if (!selectedPlan) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Invalid plan ID' }));
                return;
              }
              
              // Create order
              const request = new paypal.orders.OrdersCreateRequest();
              request.prefer('return=representation');
              
              request.requestBody({
                intent: 'CAPTURE',
                purchase_units: [{
                  amount: {
                    currency_code: 'USD',
                    value: selectedPlan.price,
                    breakdown: {
                      item_total: { 
                        currency_code: 'USD', 
                        value: selectedPlan.price 
                      },
                      discount: { currency_code: 'USD', value: '0.00' },
                      handling: { currency_code: 'USD', value: '0.00' },
                      insurance: { currency_code: 'USD', value: '0.00' },
                      shipping_discount: { currency_code: 'USD', value: '0.00' },
                      tax_total: { currency_code: 'USD', value: '0.00' },
                      shipping: { currency_code: 'USD', value: '0.00' }
                    }
                  },
                  items: [{
                    name: selectedPlan.name,
                    quantity: '1',
                    unit_amount: { 
                      currency_code: 'USD', 
                      value: selectedPlan.price 
                    },
                    category: 'DIGITAL_GOODS'
                  }],
                  description: `FUTBot Premium Subscription - ${selectedPlan.name}`
                }],
                application_context: {
                  brand_name: 'FUTBot',
                  landing_page: 'BILLING',
                  user_action: 'PAY_NOW',
                  return_url: `${process.env.VITE_APP_URL || 'http://localhost:3000'}/subscription/success`,
                  cancel_url: `${process.env.VITE_APP_URL || 'http://localhost:3000'}/subscription/canceled`
                }
              });
              
              try {
                const order = await paypalClient.execute(request);
                res.statusCode = 200;
                res.end(JSON.stringify({
                  success: true,
                  orderID: order.result.id,
                  links: order.result.links
                }));
                
              } catch (error: unknown) {
                console.error('Error processing subscription:', error);
                res.statusCode = 500;
                res.end(JSON.stringify({
                  success: false,
                  error: 'Failed to process subscription',
                  details: error instanceof Error ? error.message : 'Unknown error occurred'
                }));
              }
            } else {
              // Handle other API routes
              next();
            }
          } catch (error: unknown) {
            console.error('API Error:', error);
            res.statusCode = 500;
            res.end(JSON.stringify({
              success: false,
              error: 'Internal server error',
              details: process.env.NODE_ENV === 'development' 
                ? (error instanceof Error ? error.message : 'Unknown error') 
                : undefined
            }));
          }
        });
      });
    }
  };
}

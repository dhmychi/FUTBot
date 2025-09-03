import { Plugin } from 'vite';
import type { ViteDevServer } from 'vite';
interface ApiPluginOptions {
  apiPath?: string;
}

export default function apiPlugin(options: ApiPluginOptions = {}): Plugin {
  const { apiPath = '/api' } = options;
  
  return {
    name: 'vite-plugin-api',
    configureServer(server: ViteDevServer) {
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
            
            if (pathname === '/create-user-after-payment' && req.method === 'POST') {
              // Local dev handler to avoid 404 for frontend call
              // In production, Vercel function at /api/create-user-after-payment will handle this
              try {
                const { email, accessCode, paymentId, planId, amount } = JSON.parse(body || '{}');

                if (!email || !accessCode || !paymentId || !planId || typeof amount !== 'number') {
                  res.statusCode = 400;
                  res.end(JSON.stringify({
                    success: false,
                    message: 'Invalid payload. Required: email, accessCode, paymentId, planId, amount'
                  }));
                  return;
                }

                // Simulate success in local dev
                res.statusCode = 200;
                res.end(JSON.stringify({
                  success: true,
                  user: {
                    username: accessCode,
                    email,
                  },
                  planId,
                  amount,
                  paymentId
                }));
              } catch (e) {
                res.statusCode = 500;
                res.end(JSON.stringify({ success: false, message: 'Failed to handle request', details: e instanceof Error ? e.message : 'unknown' }));
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

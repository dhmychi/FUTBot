import { Request, Response } from 'express';
import createSubscription from './create-subscription';

export default function handler(req: Request, res: Response) {
  const { pathname } = new URL(req.url || '', `http://${req.headers.host}`);
  
  // Handle subscription creation
  if (pathname.endsWith('/create-subscription') && req.method === 'POST') {
    return createSubscription(req, res);
  }

  // Default route
  if (req.method === 'GET') {
    return res.status(200).send('FUTBot API running');
  }

  // Method not allowed
  return res.status(405).json({ error: 'Method not allowed' });
}

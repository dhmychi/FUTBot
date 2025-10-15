import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, accessCode } = req.body || {};
    if (!email || !accessCode) {
      return res.status(400).json({ error: 'Missing email or accessCode' });
    }

    const KEYAUTH_SELLER_KEY = (process.env.KEYAUTH_SELLER_KEY || '').replace(/[^A-Za-z0-9]/g, '').trim();
    console.log('🔑 Testing KeyAuth with seller key length:', KEYAUTH_SELLER_KEY.length);

    // Step 1: Create license
    const sellerParams = new URLSearchParams();
    sellerParams.append('sellerkey', KEYAUTH_SELLER_KEY);
    sellerParams.append('type', 'add');
    sellerParams.append('expiry', '1');
    sellerParams.append('amount', '1');
    sellerParams.append('level', '1');
    sellerParams.append('mask', '******-******-******-******-******-******');
    sellerParams.append('format', 'JSON');
    sellerParams.append('note', `Test for ${email}`);

    console.log('🔑 Creating license...');
    const addResp = await axios.get(`https://keyauth.win/api/seller/?${sellerParams.toString()}`);
    console.log('🔑 Add response:', addResp.data);

    if (!addResp.data?.success) {
      return res.status(500).json({ error: 'KeyAuth add failed', details: addResp.data });
    }

    const licenseKey = addResp.data.key;
    console.log('🔑 License created:', licenseKey);

    // Step 2: Activate user
    const activateParams = new URLSearchParams();
    activateParams.append('sellerkey', KEYAUTH_SELLER_KEY);
    activateParams.append('type', 'activate');
    activateParams.append('user', email);
    activateParams.append('key', licenseKey);
    activateParams.append('pass', accessCode);

    console.log('👤 Activating user...');
    const activateResp = await axios.get(`https://keyauth.win/api/seller/?${activateParams.toString()}`);
    console.log('👤 Activate response:', activateResp.data);

    return res.status(200).json({
      success: true,
      licenseKey,
      activation: activateResp.data
    });

  } catch (error: any) {
    console.error('❌ Test failed:', error?.response?.data || error);
    return res.status(500).json({
      error: 'Test failed',
      details: error?.response?.data || String(error)
    });
  }
}

import 'dotenv/config';
import axios from 'axios';

const token = process.env.PADDLE_TOKEN;
const priceId = process.env.PADDLE_PRICE_ID_1_MONTH;
const appUrl = (process.env.VITE_APP_URL || 'https://www.futbot.club').replace(/\/+$/, '');

if (!token || !priceId) {
  console.error('Missing PADDLE_TOKEN or PADDLE_PRICE_ID_1_MONTH.');
  process.exit(1);
}

const versions = [undefined, '1', '2'];
const urls = [
  { success: `${appUrl}/subscription/success`, cancel: `${appUrl}/payment/cancel`, label: 'appUrl' },
  { success: 'https://example.com/success', cancel: 'https://example.com/cancel', label: 'example.com' },
];
const endpoints = [
  { url: 'https://sandbox-api.paddle.com/checkout/sessions', label: 'checkout/sessions' },
  { url: 'https://sandbox-api.paddle.com/v1/checkout/sessions', label: 'v1/checkout/sessions' },
  { url: 'https://sandbox-api.paddle.com/payment-links', label: 'payment-links' },
  { url: 'https://sandbox-api.paddle.com/v1/checkout', label: 'v1/checkout' },
  { url: 'https://sandbox-api.paddle.com/transactions', label: 'transactions' },
];

function buildHeaders(version) {
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
  if (version) headers['Paddle-Version'] = version;
  return headers;
}

function buildPayload(endpointLabel, successUrl, cancelUrl) {
  if (endpointLabel === 'payment-links') {
    // Payment Links API payload (Paddle Billing)
    return {
      items: [{ price_id: priceId, quantity: 1 }],
      customer_email: 'test@example.com',
      custom_data: { test: true },
    };
  }
  if (endpointLabel === 'transactions') {
    return {
      items: [{ price_id: priceId, quantity: 1 }],
      customer_id: undefined,
      customer: { email: 'test@example.com' },
      custom_data: { test: true },
      return_url: `${appUrl}/subscription/success`,
      cancel_url: `${appUrl}/payment/cancel`,
    };
  }
  // Checkout sessions style payload
  return {
    items: [{ price_id: priceId, quantity: 1 }],
    customer: { email: 'test@example.com' },
    settings: {
      success_url: successUrl,
      cancel_url: cancelUrl,
    },
  };
}

async function tryVariant(endpointDef, version, urlSet) {
  const headers = buildHeaders(version);
  const payload = buildPayload(endpointDef.label, urlSet.success, urlSet.cancel);
  try {
    const res = await axios.post(endpointDef.url, payload, { headers, validateStatus: () => true });
    const ok = res.status >= 200 && res.status < 300;
    const url = res?.data?.url || res?.data?.data?.url;
    return { ok, status: res.status, data: res.data, url, version, urlLabel: urlSet.label, endpoint: endpointDef.label };
  } catch (err) {
    return { ok: false, status: err?.response?.status, data: err?.response?.data || String(err), url: undefined, version, urlLabel: urlSet.label, endpoint: endpointDef.label };
  }
}

(async () => {
  console.log('Testing Paddle checkout session creation variants...');
  console.log({ priceId, appUrl });
  for (const endpoint of endpoints) {
    for (const version of versions) {
      for (const urlSet of urls) {
        const result = await tryVariant(endpoint, version, urlSet);
        console.log(`\nVariant: endpoint=${endpoint.label} version=${version || '(none)'} urls=${urlSet.label}`);
        console.log('Status:', result.status);
        console.log('Response:', JSON.stringify(result.data, null, 2));
        if (result.ok && result.url) {
          console.log('\n✅ Success! Checkout URL:', result.url);
          process.exit(0);
        }
      }
    }
  }
  console.log('\n❌ No variant succeeded.');
  process.exit(2);
})();



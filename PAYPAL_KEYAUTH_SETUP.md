# PayPal + KeyAuth Integration Setup Guide

## 🚀 Complete PayPal + KeyAuth Integration for FUTBot

This integration allows users to subscribe via PayPal and automatically receive KeyAuth license keys for your Chrome extension and website.

## 📋 What's Included

### Backend Files:
- **`api/webhook.ts`** - PayPal webhook handler with signature verification
- **`api/paypal-subscription.ts`** - PayPal subscription management API
- **`src/components/SubscriptionModal.tsx`** - React subscription modal for website
- **`chrome-extension/subscription-service.js`** - Chrome extension subscription service

### Features:
- ✅ PayPal webhook signature verification
- ✅ Automatic KeyAuth license creation
- ✅ Subscription plan mapping ($15, $24.99, $49.99)
- ✅ Chrome extension integration
- ✅ Website subscription modal
- ✅ Error handling and logging

## ⚙️ Setup Instructions

### 1. PayPal Developer Setup

1. **Create PayPal App:**
   - Go to [PayPal Developer Dashboard](https://developer.paypal.com/developer/applications/)
   - Create new app for your project
   - Get your `Client ID` and `Client Secret`

2. **Create Subscription Plans:**
   ```bash
   # Use PayPal API or Dashboard to create these plans:
   - 1 Month Plan: $15.00 (P-1MONTH-PLAN-ID)
   - 3 Months Plan: $24.99 (P-3MONTHS-PLAN-ID) 
   - 12 Months Plan: $49.99 (P-12MONTHS-PLAN-ID)
   ```

3. **Setup Webhooks:**
   - Create webhook endpoint: `https://your-domain.com/api/webhook/paypal`
   - Subscribe to events:
     - `PAYMENT.SALE.COMPLETED`
     - `BILLING.SUBSCRIPTION.ACTIVATED`
     - `CHECKOUT.ORDER.APPROVED`
     - `BILLING.SUBSCRIPTION.CANCELLED`

### 2. KeyAuth Setup

1. **Get KeyAuth Credentials:**
   - Login to [KeyAuth Dashboard](https://keyauth.win/)
   - Get your `Owner ID` and `Secret Key`
   - Note your application name

2. **Configure License Settings:**
   - Set license key format: `XXXX-XXXX-XXXX-XXXX`
   - Configure subscription levels and durations

### 3. Environment Variables

Update your `.env` file:

```env
# PayPal Configuration
PAYPAL_CLIENT_ID=your_paypal_client_id_here
PAYPAL_CLIENT_SECRET=your_paypal_client_secret_here
PAYPAL_WEBHOOK_ID=your_paypal_webhook_id_here
PAYPAL_SANDBOX=true  # Set to false for production

# KeyAuth Configuration  
KEYAUTH_OWNER_ID=your_keyauth_owner_id_here
KEYAUTH_SECRET=your_keyauth_secret_here

# Frontend URL
FRONTEND_URL=https://your-domain.com

# Existing Supabase vars (keep these)
VITE_SUPABASE_URL=https://qdvtrvfezpkiertyuida.supabase.co
VITE_SUPABASE_ANON_KEY=your_existing_key
VITE_PAYPAL_CLIENT_ID=your_paypal_client_id_here
```

### 4. Update Chrome Extension

1. **Update `keyauth-config.js`:**
   ```javascript
   const KEYAUTH_CONFIG = {
     name: "FUTBot",
     ownerid: "YOUR_OWNER_ID", // Replace with actual
     secret: "YOUR_SECRET_KEY", // Replace with actual
     version: "1.0.0",
     url: "https://keyauth.win/api/1.2/"
   };
   ```

2. **Update `subscription-service.js`:**
   ```javascript
   // Line 3: Update API URL
   this.apiBaseUrl = 'https://your-actual-domain.com/api';
   ```

3. **Update `manifest.json`:**
   ```json
   {
     "host_permissions": [
       "https://*.ea.com/*",
       "https://qdvtrvfezpkiertyuida.supabase.co/*",
       "https://keyauth.win/*",
       "https://your-domain.com/*"
     ]
   }
   ```

### 5. Website Integration

1. **Add to your React component:**
   ```tsx
   import SubscriptionModal from './components/SubscriptionModal';
   
   function YourComponent() {
     const [showModal, setShowModal] = useState(false);
     
     return (
       <>
         <button onClick={() => setShowModal(true)}>
           Subscribe Now
         </button>
         <SubscriptionModal 
           isOpen={showModal} 
           onClose={() => setShowModal(false)} 
         />
       </>
     );
   }
   ```

## 🔄 Workflow

1. **User clicks "Subscribe"** → Subscription modal opens
2. **User enters email** → Selects plan → Clicks "Subscribe Now"
3. **PayPal checkout** → User completes payment
4. **PayPal webhook** → Verifies payment → Creates KeyAuth license
5. **License key sent** → User receives key via email (implement email service)
6. **User activates** → Uses license key in Chrome extension

## 🧪 Testing

### Test PayPal Webhooks:
```bash
# Use PayPal webhook simulator or ngrok for local testing
ngrok http 3000
# Update PayPal webhook URL to: https://your-ngrok-url.ngrok.io/api/webhook/paypal
```

### Test KeyAuth Integration:
```javascript
// Test license creation in browser console
fetch('/api/webhook/paypal', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    event_type: 'PAYMENT.SALE.COMPLETED',
    resource: {
      amount: { total: '15.00', currency: 'USD' },
      payer: { email_address: 'test@example.com' }
    }
  })
});
```

## 🚨 Important Notes

1. **Replace Placeholder IDs:**
   - Update PayPal Plan IDs in `paypal-subscription.ts`
   - Update KeyAuth credentials in all files
   - Update API URLs in Chrome extension

2. **Security:**
   - Never expose secret keys in frontend code
   - Always verify PayPal webhook signatures
   - Use HTTPS in production

3. **Email Service:**
   - Implement email service to send license keys
   - Consider using SendGrid, Mailgun, or similar

4. **Error Handling:**
   - Monitor webhook logs for failed payments
   - Implement retry logic for KeyAuth API calls
   - Set up alerts for critical failures

## 📞 Support

- PayPal: [PayPal Developer Docs](https://developer.paypal.com/docs/)
- KeyAuth: [KeyAuth Documentation](https://keyauth.win/docs/)
- Issues: Check console logs and webhook delivery status

## 🎉 You're Ready!

Your PayPal + KeyAuth integration is now complete. Users can subscribe on your website or Chrome extension and automatically receive license keys for premium features.

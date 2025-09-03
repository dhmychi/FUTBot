# 🚀 FUTBot KeyAuth Integration Setup Guide

## 📋 Overview

This system automatically creates KeyAuth user accounts after successful PayPal payments. It includes:

- **Automatic user creation** via KeyAuth API
- **License key generation** via Seller API or App API fallback
- **Welcome emails** in Arabic with login credentials
- **Subscription management** with automatic expiration dates

## 🔧 Environment Variables

Add these to your Vercel environment:

### KeyAuth Configuration
```env
KEYAUTH_APP_NAME=futbot
KEYAUTH_OWNER_ID=j5oBWrvrnm
KEYAUTH_APP_SECRET=71d7d7717aea788ae29b063fab062482e707ae9826c1e425acffaa7cd816dfc5
KEYAUTH_APP_VERSION=1.0
KEYAUTH_SELLER_KEY=e5bb8c336379263e3e19f5939357fac6
```

### PayPal Configuration
```env
PAYPAL_CLIENT_ID=AYWxJUUHc56DPvfWhS19vVPSTEiVdW43eMcHTuyXgh6_51R5MnBt2pDXCP7JxhkVm2enqv8MuN4_l3SJ
PAYPAL_CLIENT_SECRET=EPfnWHWC0Ub3a0KtE2f7np1zgLYSAkly_BSc38zKdpNfH-eAigQM_HoFdKkSTRAR3H0c7PBWO7M3ItNx
PAYPAL_ENVIRONMENT=sandbox
PAYPAL_WEBHOOK_ID=77S98565UN457033T
```

### Email Configuration
```env
RESEND_API_KEY=re_Tok42Hju_AxCRATn2dJGfuz5ekTenM7Rn
FROM_EMAIL=no-reply@futbot.club
```

## 🎯 Subscription Plans

| Plan ID | Name | Duration | Price |
|---------|------|----------|-------|
| `1_month` | شهر واحد | 30 days | $15.00 |
| `3_months` | 3 أشهر | 90 days | $24.99 |
| `12_months` | سنة كاملة | 365 days | $49.99 |

## 🔄 How It Works

### 1. Payment Flow
1. Customer selects a plan and enters email/password
2. PayPal payment is processed
3. Frontend calls `/api/create-user-after-payment` directly
4. **OR** PayPal webhook calls `/api/webhook` (backup method)

### 2. KeyAuth Integration
1. **License Creation**: Tries Seller API first, falls back to App API
2. **User Registration**: Creates account with email as username
3. **Session Management**: Handles KeyAuth sessions properly
4. **Error Handling**: Comprehensive fallback system

### 3. Email Delivery
1. **Welcome Email**: Sent in Arabic with all login details
2. **Subscription Info**: Includes plan details and expiration dates
3. **Next Steps**: Clear instructions for customer

## 📁 API Endpoints

### `/api/create-user-after-payment`
- **Method**: POST
- **Purpose**: Create KeyAuth user after frontend payment
- **Body**:
```json
{
  "email": "user@example.com",
  "accessCode": "userpassword123",
  "paymentId": "PAY-123456789",
  "planId": "1_month",
  "amount": "15.00"
}
```

### `/api/webhook`
- **Method**: POST
- **Purpose**: Handle PayPal webhook events
- **Body**: PayPal webhook payload
- **Custom ID Format**: `planId:email:accessCode`

## 🧪 Testing

### Test KeyAuth Integration
```bash
node scripts/test-keyauth.mjs
```

### Test API Endpoints
```bash
# Test user creation
curl -X POST https://your-domain.vercel.app/api/create-user-after-payment \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "accessCode": "testpass123",
    "paymentId": "test123",
    "planId": "1_month",
    "amount": "15.00"
  }'
```

## 🔍 Troubleshooting

### Common Issues

#### 1. "Seller key should be 32 characters long"
- **Cause**: Invalid Seller Key length
- **Solution**: Verify `KEYAUTH_SELLER_KEY` is exactly 32 characters

#### 2. "Invalid license key"
- **Cause**: License creation failed
- **Solution**: Check KeyAuth Seller API permissions and key format

#### 3. "Session ID not provided"
- **Cause**: Missing KeyAuth session initialization
- **Solution**: Ensure proper session flow in API calls

### Debug Steps
1. Check Vercel function logs
2. Verify environment variables
3. Test KeyAuth API directly
4. Check PayPal webhook configuration

## 📧 Email Template

The system sends beautiful Arabic welcome emails with:
- ✅ Login credentials (email + password)
- ✅ License key
- ✅ Subscription details
- ✅ Expiration dates
- ✅ Next steps instructions
- ✅ Support contact information

## 🚀 Deployment

1. **Push to GitHub**: All changes are automatically deployed
2. **Vercel Integration**: Automatic deployments from main branch
3. **Environment Variables**: Set in Vercel dashboard
4. **Function Logs**: Monitor in Vercel function logs

## 🔐 Security Features

- **CORS Protection**: Proper headers for cross-origin requests
- **Input Validation**: Comprehensive field validation
- **Error Handling**: Secure error messages without sensitive data
- **Session Management**: Proper KeyAuth session handling

## 📊 Monitoring

### Key Metrics
- Payment success rate
- KeyAuth user creation success
- Email delivery success
- API response times

### Logs to Watch
- KeyAuth API responses
- PayPal webhook events
- Email sending status
- Error messages and stack traces

## 🎉 Success Indicators

✅ **System Working When:**
- PayPal payments complete successfully
- KeyAuth users are created automatically
- Welcome emails are delivered
- Customers can log in to the extension
- No manual intervention required

## 📞 Support

For technical support:
- **Email**: futbott97@gmail.com
- **Documentation**: This file
- **Logs**: Vercel function logs
- **Testing**: Use provided test scripts

---

**🎯 Goal**: 100% automated system - customer pays → account created → email sent → ready to use!

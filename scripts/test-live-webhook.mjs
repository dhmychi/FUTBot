import axios from 'axios';

async function testLiveWebhook() {
  console.log('🔍 Testing live webhook with real PayPal event...');
  
  // Mock a real PayPal payment event
  const mockPaymentEvent = {
    event_type: 'PAYMENT.SALE.COMPLETED',
    create_time: new Date().toISOString(),
    resource_type: 'sale',
    event_version: '1.0',
    resource_version: '2.0',
    summary: 'Payment completed for $15.00 USD',
    resource: {
      id: 'PAY-' + Date.now(),
      amount: {
        total: '15.00',
        currency: 'USD',
        details: {
          subtotal: '15.00'
        }
      },
      gross_amount: {
        value: '15.00',
        currency_code: 'USD'
      },
      state: 'completed',
      payment_mode: 'INSTANT_TRANSFER',
      protection_eligibility: 'ELIGIBLE',
      protection_eligibility_type: 'ITEM_NOT_RECEIVED_ELIGIBLE,UNAUTHORIZED_PAYMENT_ELIGIBLE',
      transaction_fee: {
        value: '0.74',
        currency: 'USD'
      },
      parent_payment: 'PAYID-' + Date.now(),
      create_time: new Date().toISOString(),
      update_time: new Date().toISOString(),
      payer: {
        email_address: 'testuser@example.com',
        payer_id: 'PAYER123456789',
        address_status: 'CONFIRMED',
        payer_status: 'VERIFIED'
      },
      payer_info: {
        email: 'testuser@example.com',
        payer_id: 'PAYER123456789',
        payer_status: 'verified',
        first_name: 'Test',
        last_name: 'User',
        country_code: 'US'
      },
      purchase_units: [{
        reference_id: 'default',
        amount: {
          currency_code: 'USD',
          value: '15.00'
        },
        payee: {
          email_address: 'sb-wffrm39058809@business.example.com',
          merchant_id: 'MERCHANT123'
        },
        description: 'FUTBot 1-month Subscription',
        custom_id: JSON.stringify({
          planId: '1',
          email: 'testuser@example.com',
          accessCode: 'testpass123',
          timestamp: Date.now()
        }),
        invoice_id: 'INV-' + Date.now(),
        soft_descriptor: 'FUTBOT'
      }]
    }
  };

  const webhookHeaders = {
    'Content-Type': 'application/json',
    'User-Agent': 'PayPal/AUHD-214.0-55090290',
    'Correlation-ID': 'correlation_' + Date.now(),
    'PAYPAL-AUTH-ALGO': 'SHA256withRSA',
    'PAYPAL-AUTH-VERSION': 'v1',
    'PAYPAL-CERT-URL': 'https://api.sandbox.paypal.com/v1/notifications/certs/CERT-360caa42-fca2a594-1d93a270',
    'PAYPAL-TRANSMISSION-ID': 'transmission_' + Date.now(),
    'PAYPAL-TRANSMISSION-SIG': 'mock_signature_' + Date.now(),
    'PAYPAL-TRANSMISSION-TIME': new Date().toISOString()
  };

  try {
    console.log('📤 Sending webhook event to production...');
    console.log('Event type:', mockPaymentEvent.event_type);
    console.log('Amount:', mockPaymentEvent.resource.amount.total, mockPaymentEvent.resource.amount.currency);
    console.log('Customer email:', mockPaymentEvent.resource.payer.email_address);
    console.log('Custom data:', mockPaymentEvent.resource.purchase_units[0].custom_id);

    const response = await axios.post(
      'https://www.futbot.club/api/webhook',
      mockPaymentEvent,
      {
        headers: webhookHeaders,
        timeout: 30000
      }
    );

    console.log('✅ Webhook response:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data
    });

    if (response.status === 200) {
      console.log('🎉 Webhook processed successfully!');
      console.log('Now check:');
      console.log('1. KeyAuth Users dashboard for new user: testuser@example.com');
      console.log('2. Resend logs for welcome email');
    }

  } catch (error) {
    console.error('❌ Webhook test failed:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers
    });

    if (error.response?.status === 403) {
      console.log('🔐 403 Forbidden - webhook signature verification failed');
      console.log('This is expected since we\'re using mock signature');
    } else if (error.response?.status === 405) {
      console.log('🚫 405 Method Not Allowed - webhook endpoint not accepting POST requests');
    } else if (error.response?.status === 500) {
      console.log('💥 500 Internal Server Error - there\'s an error in the webhook code');
    }
  }
}

// Test with different event types
async function testMultipleEvents() {
  console.log('🧪 Testing multiple PayPal event types...\n');
  
  // Test 1: PAYMENT.SALE.COMPLETED
  await testLiveWebhook();
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 2: CHECKOUT.ORDER.APPROVED
  const orderEvent = {
    event_type: 'CHECKOUT.ORDER.APPROVED',
    resource: {
      id: 'ORDER-' + Date.now(),
      amount: {
        total: '24.99',
        currency: 'USD'
      },
      gross_amount: {
        value: '24.99',
        currency_code: 'USD'
      },
      payer: {
        email_address: 'testuser2@example.com'
      },
      payer_info: {
        email: 'testuser2@example.com'
      },
      purchase_units: [{
        custom_id: JSON.stringify({
          planId: '2',
          email: 'testuser2@example.com',
          accessCode: 'testpass456',
          timestamp: Date.now()
        })
      }]
    }
  };

  try {
    console.log('📤 Testing CHECKOUT.ORDER.APPROVED event...');
    const response = await axios.post(
      'https://www.futbot.club/api/webhook',
      orderEvent,
      {
        headers: {
          'Content-Type': 'application/json',
          'PAYPAL-AUTH-ALGO': 'SHA256withRSA',
          'PAYPAL-TRANSMISSION-ID': 'test-transmission-2',
          'PAYPAL-TRANSMISSION-SIG': 'test-signature-2',
          'PAYPAL-TRANSMISSION-TIME': new Date().toISOString()
        },
        timeout: 30000
      }
    );

    console.log('✅ Order event response:', response.status, response.data);
    
  } catch (error) {
    console.log('❌ Order event failed:', error.response?.status, error.response?.data);
  }
}

// Run the tests
testMultipleEvents();

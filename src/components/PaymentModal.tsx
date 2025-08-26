import { useState } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import type { CreateOrderActions, OnApproveData, OnApproveActions, PayPalScriptOptions } from '@paypal/paypal-js';
import toast from 'react-hot-toast';

// Define PricingPlan interface
interface PricingPlan {
  id: string;
  name: string;
  price: number;
  duration: string;
  features: string[];
}

// Get PayPal client ID from environment variables with type assertion
const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID || '';

// PayPal script options
const paypalScriptOptions: PayPalScriptOptions = {
  clientId: PAYPAL_CLIENT_ID,
  currency: 'USD',
  intent: 'capture',
  components: 'buttons',
  disableFunding: 'card,credit,venmo,sepa,bancontact,eps,giropay,ideal,mybank,p24,p24,sofort',
  dataNamespace: 'paypal_sdk',
  dataSdkIntegrationSource: 'integrationbuilder_sc',
  merchantId: '*',
  vault: false,
  debug: import.meta.env.VITE_PAYPAL_ENVIRONMENT === 'sandbox',
};

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: PricingPlan;
  onSuccess: () => void;
}

export default function PaymentModal({ isOpen, onClose, plan, onSuccess }: PaymentModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayPalPayment = async (_data: Record<string, unknown>, actions: CreateOrderActions): Promise<string> => {
    try {
      setIsProcessing(true);
      
      // Create PayPal order with the plan details
      const order = await actions.order.create({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            value: plan.price.toString(),
            currency_code: 'USD',
          },
          description: `FUTBot ${plan.name} Subscription`,
          custom_id: `futbot_${plan.id}_${Date.now()}`,
        }],
        application_context: {
          brand_name: 'FUTBot',
          user_action: 'PAY_NOW',
          payment_method: {
            payee_preferred: 'IMMEDIATE_PAYMENT_REQUIRED'
          },
        },
      });
      
      return order;
    } catch (error) {
      console.error('PayPal error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Payment processing failed';
      toast.error(`Error: ${errorMessage}`);
      setIsProcessing(false);
      throw error;
    }
  };

  const handlePayPalApprove = async (_data: OnApproveData, actions: OnApproveActions) => {
    if (!actions.order) {
      toast.error('Invalid order action');
      setIsProcessing(false);
      return;
    }
    
    try {
      // Capture the payment
      const details = await actions.order.capture();
      console.log('Payment completed successfully', details);
      
      // Show success message
      toast.success('Payment successful! Your subscription is being activated.');
      
      // Call the success callback
      onSuccess();
      
      // Close the modal after a short delay
      setTimeout(() => {
        onClose();
      }, 1500);
      
    } catch (error) {
      console.error('Payment approval error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Payment processing failed';
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative bg-futbot-surface border border-futbot-primary/20 rounded-2xl p-8 w-full max-w-md shadow-xl z-50">
        <button
          onClick={onClose}
          disabled={isProcessing}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img 
              src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_37x23.jpg" 
              alt="PayPal" 
              className="h-12"
            />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Complete Your Purchase</h3>
          <p className="text-gray-300 text-lg">{plan.name}</p>
          <p className="text-futbot-primary text-3xl font-bold my-3">${plan.price}</p>
          <div className="h-px bg-gradient-to-r from-transparent via-futbot-primary/30 to-transparent my-4"></div>
        </div>

        <div className="mb-6">
          <PayPalScriptProvider options={paypalScriptOptions}>
            <div className="space-y-4">
              <PayPalButtons
                style={{ 
                  layout: 'vertical',
                  color: 'blue',
                  shape: 'pill',
                  label: 'pay',
                  height: 48,
                  tagline: false
                }}
                createOrder={handlePayPalPayment}
                onApprove={handlePayPalApprove}
                onError={(err) => {
                  console.error('PayPal error:', err);
                  toast.error('حدث خطأ في معالجة الدفع. يرجى المحاولة مرة أخرى.');
                  setIsProcessing(false);
                }}
                onCancel={() => {
                  toast('تم إلغاء عملية الدفع', { icon: 'ℹ️' });
                  setIsProcessing(false);
                }}
                disabled={isProcessing}
                forceReRender={[plan.id, isProcessing]}
              />
              <div className="flex items-center justify-center space-x-2 text-gray-400 text-sm">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <span>مدفوعات آمنة عبر PayPal</span>
              </div>
            </div>
          </PayPalScriptProvider>
        </div>

        <div className="text-center text-sm text-gray-400 mt-6 pt-4 border-t border-gray-700">
          <p className="flex items-center justify-center space-x-1">
            <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>تفعيل فوري</span>
          </p>
          <p className="flex items-center justify-center space-x-1 mt-1">
            <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span>ضمان استرداد الأموال لمدة 7 أيام</span>
          </p>
        </div>
      </div>
    </div>
  );
}
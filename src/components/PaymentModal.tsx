import { useState } from 'react';
import { PayPalButtons } from '@paypal/react-paypal-js';
import type { CreateOrderActions, OnApproveData, OnApproveActions } from '@paypal/paypal-js';
import toast from 'react-hot-toast';


// Define PricingPlan interface
interface PricingPlan {
  id: string;
  name: string;
  price: number;
  duration: string;
  features: string[];
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: PricingPlan;
  onSuccess: () => void;
}

export default function PaymentModal({ isOpen, onClose, plan, onSuccess }: PaymentModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paypalError, setPaypalError] = useState('');

  const buttonStyle = {
    layout: 'vertical' as const,
    color: 'gold' as const,
    shape: 'rect' as const,
    label: 'pay' as const,
    tagline: false,
    height: 48
  };

  const handlePayPalPayment = async (_data: Record<string, unknown>, actions: CreateOrderActions): Promise<string> => {
    if (!actions.order) {
      throw new Error('PayPal SDK not properly initialized');
    }
    try {
      setIsProcessing(true);
      setPaypalError(''); // Clear any previous errors
      
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
          return_url: window.location.origin + '/payment/success',
          cancel_url: window.location.origin + '/payment/cancel',
        },
      });
      
      return order;
    } catch (error) {
      console.error('PayPal error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Payment processing failed';
      setPaypalError(errorMessage);
      toast.error(`Error: ${errorMessage}`);
      setIsProcessing(false);
      throw error;
    }
  };

  const handlePayPalApprove = async (_data: OnApproveData, actions: OnApproveActions) => {
    if (!actions.order) {
      const errorMsg = 'Invalid order action';
      setPaypalError(errorMsg);
      toast.error(errorMsg);
      setIsProcessing(false);
      return;
    }
    
    try {
      setPaypalError(''); // Clear any previous errors
      
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
      
      // Handle specific PayPal errors
      if (errorMessage.includes('Window closed before response')) {
        setPaypalError('Payment window was closed. Please try again.');
        toast.error('Payment was interrupted. Please try again.');
      } else {
        setPaypalError(errorMessage);
        toast.error(`Payment error: ${errorMessage}`);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-futbot-surface rounded-xl p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
          disabled={isProcessing}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <h2 className="text-2xl font-bold text-white mb-2">Complete Your Purchase</h2>
        <p className="text-gray-400 mb-6">You're subscribing to the {plan.name} plan for ${plan.price} per {plan.duration}</p>
        
        <div className="space-y-4">
          <div className="p-4 bg-futbot-surface-light rounded-lg">
            <h3 className="font-semibold text-white mb-2">Order Summary</h3>
            <div className="flex justify-between text-gray-300 text-sm">
              <span>{plan.name} Subscription</span>
              <span>${plan.price}</span>
            </div>
          </div>
          
          <div className="pt-4">
            <div className="flex justify-between font-semibold text-lg mb-6">
              <span>Total</span>
              <span>${plan.price} USD</span>
            </div>
            
            <div className="space-y-4">
              <div className="mt-6">
                {paypalError ? (
                  <div className="text-red-400 text-center py-4">
                    {paypalError}
                  </div>
                ) : (
                  <div className="min-h-[200px] flex items-center justify-center">
                    <PayPalButtons 
                      style={buttonStyle}
                      disabled={isProcessing}
                      forceReRender={[buttonStyle]}
                      createOrder={handlePayPalPayment}
                      onApprove={handlePayPalApprove}
                      onError={(err) => {
                        console.error('PayPal error:', err);
                        const errorMessage = err.message || 'Unknown error occurred';
                        
                        // Handle specific PayPal errors
                        if (errorMessage.includes('Window closed before response')) {
                          setPaypalError('Payment window was closed. Please try again.');
                          toast.error('Payment was interrupted. Please try again.');
                        } else if (errorMessage.includes('popup')) {
                          setPaypalError('Popup blocked. Please allow popups and try again.');
                          toast.error('Popup blocked. Please allow popups and try again.');
                        } else {
                          setPaypalError(errorMessage);
                          toast.error(`Payment error: ${errorMessage}`);
                        }
                      }}
                      onCancel={() => {
                        console.log('PayPal payment cancelled');
                        setPaypalError('Payment was cancelled.');
                        toast.error('Payment was cancelled.');
                        setIsProcessing(false);
                      }}
                      onInit={() => {
                        console.log('PayPal buttons initialized');
                        setPaypalError(''); // Clear any previous errors
                      }}
                    />
                  </div>
                )}
              </div>
              <div className="text-center text-xs text-gray-500 mt-4">
                Secure payment processed by
                <div className="mt-1">
                  <img 
                    src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_37x23.jpg" 
                    alt="PayPal" 
                    className="h-5 mx-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-gray-400 mt-6 pt-4 border-t border-gray-700">
          <p className="flex items-center justify-center space-x-1">
            <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Instant Activation</span>
          </p>
          <p className="flex items-center justify-center space-x-1 mt-1">
            <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span>7-day money-back guarantee</span>
          </p>
        </div>
      </div>
    </div>
  );
}

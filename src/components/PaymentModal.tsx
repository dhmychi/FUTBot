import React, { useState, useEffect, useCallback } from 'react';
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
  const [paypalReady, setPaypalReady] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  // Access code the customer will use to log in (acts like password)
  const [accessCode, setAccessCode] = useState('');
  const [showUserForm, setShowUserForm] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setPaypalError('');
      setIsProcessing(false);
      setPaypalReady(false);
      setShowUserForm(true);
      setUserEmail('');
      setAccessCode('');
      setShowSuccess(false);
    }
  }, [isOpen]);

  const handleUserFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userEmail || !accessCode) {
      toast.error('Please fill in all fields');
      return;
    }
    if (!userEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (accessCode.length < 6) {
      toast.error('Access code must be at least 6 characters');
      return;
    }
    setShowUserForm(false);
  };

  const buttonStyle = {
    layout: 'vertical' as const,
    color: 'gold' as const,
    shape: 'rect' as const,
    label: 'pay' as const,
    tagline: false,
    height: 48
  };

  const handlePayPalPayment = useCallback(async (_data: Record<string, unknown>, actions: CreateOrderActions): Promise<string> => {
    if (!actions.order) {
      throw new Error('PayPal SDK not properly initialized');
    }
    
    try {
      setIsProcessing(true);
      setPaypalError('');
      
      console.log('Creating PayPal order...');
      
      // Simple PayPal order - minimal required fields only
      const orderRequest: any = {
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: (import.meta as any).env?.VITE_PAYPAL_CURRENCY || 'USD',
            value: plan.price.toString()
          },
          description: `FUTBot ${plan.name} Plan`
        }]
      };

      // Only set payer email if it looks valid
      if (userEmail && userEmail.includes('@')) {
        orderRequest.payer = { email_address: userEmail };
      }

      const order = await actions.order.create(orderRequest);
      
      console.log('PayPal order created successfully:', order);
      return order;
    } catch (error) {
      console.error('Error creating PayPal order:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      // Handle specific PayPal errors with better recovery
      if (errorMessage.includes('Target window is closed')) {
        setPaypalError('Payment window was closed unexpectedly. Please try again.');
        toast.error('Payment window closed. Please try again.');
      } else if (errorMessage.includes('popup') || errorMessage.includes('blocked')) {
        setPaypalError('Popup blocked. Please allow popups and try again.');
        toast.error('Popup blocked. Please allow popups and try again.');
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        setPaypalError('Network error. Please check your connection and try again.');
        toast.error('Network error. Please try again.');
      } else if (errorMessage.includes('global_session_not_found')) {
        setPaypalError('PayPal session expired. Please refresh the page and try again.');
        toast.error('PayPal session expired. Please refresh and try again.');
      } else {
        setPaypalError(`Payment error: ${errorMessage}`);
        toast.error(`Payment error: ${errorMessage}`);
      }
      
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [plan, userEmail, accessCode]);

  const handlePayPalApprove = useCallback(async (_data: OnApproveData, actions: OnApproveActions) => {
    if (!actions.order) {
      const errorMsg = 'Invalid order action';
      setPaypalError(errorMsg);
      toast.error(errorMsg);
      setIsProcessing(false);
      return;
    }
    
    try {
      setPaypalError('');
      
      // Capture the payment
      const details = await actions.order.capture();
      console.log('Payment completed successfully', details);
      
      // Create KeyAuth user immediately after payment
      try {
        console.log('🔄 Creating KeyAuth user after payment...');
        const apiBase = (import.meta as any).env?.VITE_API_BASE_URL || (location.hostname === 'localhost' ? 'https://www.futbot.club' : '');
        const response = await fetch(`${apiBase}/api/create-user-after-payment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: userEmail,
            accessCode: accessCode,
            paymentId: details.id,
            planId: plan.id,
            amount: plan.price
          })
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log('✅ KeyAuth user created successfully:', result);
          toast.success(`🎉 Account created successfully! Username: ${accessCode}`);
        } else {
          let errorText = '';
          try { errorText = await response.text(); } catch {}
          console.error('❌ Failed to create KeyAuth user:', errorText || response.status);
          const message = errorText || `HTTP ${response.status}`;
          toast.error(`Account setup failed: ${message}`);
        }
      } catch (error) {
        console.error('❌ KeyAuth user creation error:', error);
        toast.error('Payment successful, but account setup failed. Contact support.');
      }
      
      // Show success message and credentials
      setShowSuccess(true);
      toast.success('Payment successful! Welcome to FUTBot.');
      
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
  }, [onSuccess, onClose]);

  const handlePayPalError = useCallback((err: any) => {
    console.error('PayPal button error:', err);
    const errorMessage = err.message || 'Unknown error occurred';
    
    // Handle specific PayPal errors
    if (typeof errorMessage === 'string') {
      if (errorMessage.includes('Target window is closed')) {
        setPaypalError('Payment window was closed unexpectedly. Please try again.');
        toast.error('Payment window closed. Please try again.');
      } else if (errorMessage.includes('popup')) {
        setPaypalError('Popup blocked. Please allow popups and try again.');
        toast.error('Popup blocked. Please allow popups and try again.');
      } else if (errorMessage.includes('network')) {
        setPaypalError('Network error. Please check your connection and try again.');
        toast.error('Network error. Please try again.');
      } else if (errorMessage.includes('Window closed before response')) {
        setPaypalError('Payment window was closed. Please try again.');
        toast.error('Payment was interrupted. Please try again.');
      } else if (errorMessage.includes('global_session_not_found')) {
        setPaypalError('PayPal session issue detected. Please refresh the page and try again.');
        toast.error('PayPal session issue. Please refresh the page and try again.');
      } else if (errorMessage.includes('missing') || errorMessage.includes('uid')) {
        setPaypalError('PayPal initialization issue. Please refresh the page and try again.');
        toast.error('PayPal initialization issue. Please refresh and try again.');
      } else {
        setPaypalError('يبدو أن هناك خللاً ما في الوقت الحالي. يرجى المحاولة مرة أخرى لاحقاً.');
        toast.error('يبدو أن هناك خللاً ما. يرجى المحاولة مرة أخرى.');
      }
    } else {
      setPaypalError('An unexpected error occurred with PayPal');
      toast.error('An unexpected error occurred with PayPal');
    }
    
    setIsProcessing(false);
  }, []);

  const handlePayPalCancel = useCallback(() => {
    console.log('PayPal payment cancelled');
    setPaypalError('Payment was cancelled.');
    toast.error('Payment was cancelled.');
    setIsProcessing(false);
  }, []);

  const handlePayPalInit = useCallback(() => {
    console.log('PayPal buttons initialized successfully');
    setPaypalReady(true);
    setPaypalError('');
    
    // Clear any existing errors and reset processing state
    setIsProcessing(false);
  }, []);

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
                {showSuccess ? (
                  <div className="space-y-4 text-center">
                    <h3 className="text-2xl font-bold text-white">Welcome to FUTBot 🎉</h3>
                    <p className="text-gray-300">Your subscription is active. Use these credentials to log in to the extension:</p>
                    <div className="bg-futbot-surface-light border border-gray-700 rounded-lg p-4 text-left">
                      <p className="text-sm text-gray-300"><span className="font-semibold text-white">Email:</span> {userEmail}</p>
                      <p className="text-sm text-gray-300 mt-1"><span className="font-semibold text-white">Access Code:</span> {accessCode}</p>
                    </div>
                    <button
                      onClick={onClose}
                      className="w-full py-3 bg-futbot-primary hover:bg-futbot-primary/80 text-white rounded-lg font-medium transition-colors"
                    >
                      Close
                    </button>
                  </div>
                ) : showUserForm ? (
                  <form onSubmit={handleUserFormSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        className="w-full px-4 py-3 bg-futbot-surface-light border border-gray-600 rounded-lg 
                                 text-white placeholder-gray-400 focus:outline-none focus:border-futbot-primary"
                        placeholder="your@email.com"
                        required
                      />
                      <p className="text-xs text-gray-400 mt-1">Your login credentials will be sent here</p>
                    </div>
                    
                    <div>
                      <label htmlFor="accessCode" className="block text-sm font-medium text-gray-300 mb-2">
                        Access Code (Password) *
                      </label>
                      <input
                        type="password"
                        id="accessCode"
                        value={accessCode}
                        onChange={(e) => setAccessCode(e.target.value)}
                        className="w-full px-4 py-3 bg-futbot-surface-light border border-gray-600 rounded-lg 
                                 text-white placeholder-gray-400 focus:outline-none focus:border-futbot-primary"
                        placeholder="Create a secure access code"
                        required
                        minLength={6}
                      />
                      <p className="text-xs text-gray-400 mt-1">You'll use this to log in to the FUTBot extension</p>
                    </div>
                    
                    <button
                      type="submit"
                      className="w-full py-3 bg-futbot-primary hover:bg-futbot-primary/80 text-white 
                               rounded-lg font-medium transition-colors"
                    >
                      Continue to Payment
                    </button>
                  </form>
                ) : paypalError ? (
                  <div className="text-red-400 text-center py-4">
                    <p className="mb-2">{paypalError}</p>
                    <button
                      onClick={() => setPaypalError('')}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                ) : (
                  <div className="min-h-[200px] flex items-center justify-center">
                    <PayPalButtons 
                      style={buttonStyle}
                      disabled={isProcessing}
                      createOrder={handlePayPalPayment}
                      onApprove={handlePayPalApprove}
                      onError={handlePayPalError}
                      onCancel={handlePayPalCancel}
                      onInit={handlePayPalInit}
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

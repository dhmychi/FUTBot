import React, { useState, useEffect, useCallback } from 'react';
// Replacing PayPal with Paddle checkout flow
import toast from 'react-hot-toast';

// Define PricingPlan interface
interface PricingPlan {
  id: string;
  name: string;
  price: number;
  monthlyPrice?: number;
  totalPrice?: number;
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

  const handleStartPaddleCheckout = useCallback(async () => {
    try {
      setIsProcessing(true);
      setPaypalError('');

      const apiBase = (import.meta as any).env?.VITE_API_BASE_URL || (location.hostname === 'localhost' ? 'https://www.futbot.club' : '');
      const response = await fetch(`${apiBase}/api/paddle-checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: plan.id, email: userEmail, accessCode }),
      });

      if (!response.ok) {
        const msg = await response.text().catch(() => 'Failed to create checkout');
        throw new Error(msg || `HTTP ${response.status}`);
      }

      const data = await response.json();
      const checkoutUrl = data?.checkoutUrl;
      if (!checkoutUrl) throw new Error('Invalid checkout URL');

      window.location.assign(checkoutUrl);
    } catch (error: any) {
      const message = error?.message || 'Failed to start checkout';
      setPaypalError(message);
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  }, [plan?.id, userEmail, accessCode]);

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
        <p className="text-gray-400 mb-6">You're subscribing to the {plan.name} plan for ${plan.price}/month</p>
        
        <div className="space-y-4">
          <div className="p-4 bg-futbot-surface-light rounded-lg">
            <h3 className="font-semibold text-white mb-2">Order Summary</h3>
            <div className="flex justify-between text-gray-300 text-sm">
              <span>{plan.name} Subscription</span>
              <span>${plan.totalPrice || plan.price}</span>
            </div>
            {plan.totalPrice && plan.totalPrice !== plan.price && (
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Monthly rate: ${plan.price}/month</span>
                <span>Duration: {plan.duration}</span>
              </div>
            )}
          </div>
          
          <div className="pt-4">
            <div className="flex justify-between font-semibold text-lg mb-6">
              <span>Total</span>
              <span>${plan.totalPrice || plan.price} USD</span>
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
                  <div className="min-h-[200px] flex items-center justify-center w-full">
                    <button
                      onClick={handleStartPaddleCheckout}
                      disabled={isProcessing}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white rounded-lg font-medium transition-colors"
                    >
                      Continue with Secure Checkout
                    </button>
                  </div>
                )}
              </div>
              <div className="text-center text-xs text-gray-500 mt-4">Secure payment processed by Paddle</div>
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

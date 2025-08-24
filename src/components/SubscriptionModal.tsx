import React, { useState } from 'react';
import { X, Check, Star } from 'lucide-react';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SUBSCRIPTION_PLANS = [
  {
    id: '1-month',
    name: '1 Month Plan',
    price: '$15.00',
    duration: 'Monthly billing',
    features: [
      '✨ Instant Activation',
      '⚡ 24/7 Automated Trading',
      '🎮 Easy Controls',
      '🔄 Free Updates',
      '💬 Premium Support'
    ],
    popular: false
  },
  {
    id: '3-months',
    name: '3 Months Plan',
    price: '$24.99',
    duration: 'Quarterly billing',
    features: [
      '✨ Instant Activation',
      '⚡ 24/7 Automated Trading',
      '🎮 Easy Controls',
      '🔄 Free Updates',
      '💬 Premium Support',
      '💎 Priority Support'
    ],
    popular: false
  },
  {
    id: '12-months',
    name: '12 Months Plan',
    price: '$49.99',
    duration: 'Yearly billing',
    features: [
      '✨ Instant Activation',
      '⚡ 24/7 Automated Trading',
      '🎮 Easy Controls',
      '🔄 Free Updates',
      '💬 24/7 Premium Support',
      '💎 VIP Support',
      '🚀 Faster Performance'
    ],
    popular: true,
    badge: 'Best Value'
  }
];

export default function SubscriptionModal({ isOpen, onClose }: SubscriptionModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubscribe = async (planId: string) => {
    if (!userEmail) {
      alert('Please enter your email address');
      return;
    }

    setIsLoading(true);
    setSelectedPlan(planId);

    try {
      // Create PayPal subscription
      const response = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planType: planId,
          userEmail: userEmail
        })
      });

      const data = await response.json();

      if (data.approvalUrl) {
        // Redirect to PayPal for payment
        window.location.href = data.approvalUrl;
      } else {
        throw new Error('Failed to create subscription');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Failed to create subscription. Please try again.');
    } finally {
      setIsLoading(false);
      setSelectedPlan('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Choose Your Plan</h2>
            <p className="text-gray-600 mt-1">Select the perfect subscription for your trading needs</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Email Input */}
        <div className="p-6 border-b bg-gray-50">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            placeholder="Enter your email to receive license key"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* Plans */}
        <div className="p-6">
          <div className="grid md:grid-cols-3 gap-6">
            {SUBSCRIPTION_PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`relative border-2 rounded-lg p-6 ${
                  plan.popular
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 bg-white'
                } hover:shadow-lg transition-shadow`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                      <Star size={14} />
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    {plan.price}
                  </div>
                  <p className="text-gray-600 text-sm">{plan.duration}</p>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm">
                      <Check size={16} className="text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isLoading || !userEmail}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    plan.popular
                      ? 'bg-green-500 hover:bg-green-600 text-white'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isLoading && selectedPlan === plan.id ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    'Subscribe Now'
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <div className="text-center text-sm text-gray-600">
            <p className="mb-2">
              🔒 Secure payment powered by PayPal • Cancel anytime
            </p>
            <p>
              After payment, you'll receive your license key via email within minutes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

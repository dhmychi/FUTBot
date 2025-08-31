import React, { useState, useCallback } from 'react';
import { X, Check } from 'lucide-react';
import { createSubscription } from '../api/paypal';
// No need for useNavigate since we're using window.location for PayPal redirect

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SUBSCRIPTION_PLANS = [
  {
    id: 'P-1MONTH-PLAN-ID',
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
    id: 'P-3MONTHS-PLAN-ID',
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
    id: 'P-12MONTHS-PLAN-ID',
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

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  if (!isOpen) return null;

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  const handleSubscribe = useCallback(async (planId: string) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await createSubscription(planId);
      
      if (response.success && response.links) {
        // Find the approval URL from PayPal response
        const approvalLink = response.links.find(
          (link: { rel: string; href: string }) => link.rel === 'approve'
        );
        
        if (approvalLink) {
          // Redirect to PayPal for payment approval
          window.location.href = approvalLink.href;
        } else {
          throw new Error('Could not find approval URL in PayPal response');
        }
      } else {
        throw new Error(response.error || 'Failed to create subscription');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ غير متوقع';
      setError(`حدث خطأ أثناء محاولة الاشتراك: ${errorMessage}`);
      console.error('Subscription error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleClose}
    >
      <div 
        className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">اختر الخطة المناسبة</h2>
            <p className="text-gray-600 mt-1">Select the perfect subscription for your trading needs</p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-500"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        {/* Plans */}
        <div className="p-6">
          <div className="grid md:grid-cols-3 gap-6">
            {SUBSCRIPTION_PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`relative flex flex-col p-6 rounded-2xl border-2 transition-all duration-200 ${
                  plan.popular 
                    ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-lg transform hover:scale-105' 
                    : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-md'
                } ${isLoading ? 'opacity-70' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 right-4 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    {plan.badge || 'الأكثر شعبية'}
                  </div>
                )}
                {isLoading && (
                  <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center rounded-2xl">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                )}
                {error && (
                  <div className="mt-4 text-red-500 text-sm text-center">
                    {error}
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
                    <li key={index} className="flex items-center text-sm py-1">
                      <Check size={16} className="text-green-500 ml-2 flex-shrink-0" />
                      <span className="text-gray-700 text-right">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isLoading}
                  className={`mt-4 w-full py-2 px-4 rounded-md font-medium text-white transition-colors ${
                    plan.popular 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-gray-600 hover:bg-gray-700'
                  } ${isLoading ? 'cursor-not-allowed' : ''}`}
                >
                  {isLoading ? 'جاري التحميل...' : 'اشترك الآن'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 rounded-b-lg text-center">
          <p className="text-sm text-gray-600">
            الدفع آمن ومشفر. يمكنك إلغاء الاشتراك في أي وقت.
          </p>
        </div>
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

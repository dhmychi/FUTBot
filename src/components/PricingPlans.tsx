import { useState } from 'react';
import { Shield, Settings, Zap, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { SubscriptionPlan } from '../types/subscription';
import { motion } from 'framer-motion';
import { useI18n } from '../contexts/I18nContext';
import PaymentModal from './PaymentModal';

const features = [
  {
    icon: Shield,
    title: 'Secure Access',
    description: 'Data protection and safe account management'
  },
  {
    icon: Settings,
    title: 'Easy Setup',
    description: 'Simple interface and quick onboarding'
  },
  {
    icon: Zap,
    title: 'Clear Controls',
    description: 'Intuitive tools and configurable preferences'
  },
  {
    icon: Clock,
    title: 'Always Available',
    description: 'Use the tools whenever you need them'
  }
];

const plans: SubscriptionPlan[] = [
  {
    id: '1_month',
    name: 'Monthly',
    price: 15,
    monthlyPrice: 15,
    totalPrice: 15,
    duration: '1 month',
    features: [
      '⚡ Instant Access',
      '📘 Helpful SBC Guidance',
      '🎮 Easy Control Panel',
      '🔄 Free Updates',
      '💬 Premium Support',
      '🧩 SBC Solver'
    ],
  },
  {
    id: '3_months',
    name: '3 Months',
    price: 8.33, // 24.99 / 3 = 8.33 per month
    monthlyPrice: 8.33,
    totalPrice: 24.99,
    duration: '3 months',
    popular: true,
    features: [
      '⚡ Instant Access',
      '📘 Helpful SBC Guidance',
      '🎮 Easy Control Panel',
      '🔄 Free Updates',
      '💬 Premium Support',
      '🧩 SBC Solver',
      '💎 Priority Support'
    ],
  },
  {
    id: '12_months',
    name: '12 Months',
    price: 4.17, // 49.99 / 12 = 4.17 per month
    monthlyPrice: 4.17,
    totalPrice: 49.99,
    duration: '12 months',
    features: [
      '⚡ Instant Access',
      '📘 Helpful SBC Guidance',
      '🎮 Easy Control Panel',
      '🔄 Free Updates',
      '💬 Premium Support',
      '🧩 SBC Solver',
      '🎁 Exclusive Features',
      '🔒 Priority Support'
    ],
  },
];

interface PricingPlansProps {
  onSelectPlan: (plan: SubscriptionPlan) => void;
  plansRef?: React.RefObject<HTMLDivElement>;
}

export default function PricingPlans({ onSelectPlan, plansRef }: PricingPlansProps) {
  const { t } = useI18n();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const handlePlanSelect = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setIsPaymentModalOpen(true);
  };

  const calculateSavings = (plan: SubscriptionPlan) => {
    if (plan.id === '1_month') return 0;
    
    const monthlyRate = plan.monthlyPrice;
    const months = plan.id === '3_months' ? 3 : 12;
    const regularPrice = 15 * months; // Regular monthly price
    const savings = regularPrice - plan.totalPrice;
    
    return Math.max(0, savings);
  };

  const getDiscountPercentage = (plan: SubscriptionPlan) => {
    if (plan.id === '1_month') return 0;
    
    const monthlyRate = plan.monthlyPrice;
    const months = plan.id === '3_months' ? 3 : 12;
    const regularPrice = 15 * months;
    const discount = ((regularPrice - plan.totalPrice) / regularPrice) * 100;
    
    return Math.max(0, Math.round(discount));
  };

  return (
    <div className="py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <h2 className="text-4xl font-bold text-glow mb-6">{t('pricing.choose')}</h2>
        <p className="text-xl text-gray-400 mb-12">{t('pricing.start')}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-futbot-surface/30 rounded-xl p-6 border border-futbot-primary/20
                        hover:border-futbot-primary/40 transition-all duration-300
                        transform hover:scale-105"
            >
              <feature.icon className="w-10 h-10 text-futbot-primary mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

        <div ref={plansRef} className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto px-4">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="relative group"
          >
            <div className={`relative p-8 rounded-2xl transition-all duration-300 h-full flex flex-col ${
              plan.popular 
                ? 'bg-gradient-to-br from-futbot-surface to-futbot-surface/80 border-2 border-futbot-primary shadow-xl shadow-futbot-primary/10' 
                : 'bg-futbot-surface/50 border border-futbot-primary/20 hover:border-futbot-primary/40'
            }`}>
              <div className="flex-1">
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-futbot-primary to-blue-500 text-white text-sm font-bold px-6 py-1 rounded-full shadow-lg">
                    Best Value
                  </div>
                )}
                
                <h3 className="text-2xl font-bold text-white text-center mb-2">{plan.name}</h3>
                
                <div className="flex flex-col items-center mt-6 mb-8">
                  {/* Monthly Price */}
                  <div className="flex items-end justify-center space-x-2">
                    <span className="text-4xl font-bold bg-gradient-to-r from-futbot-primary to-blue-400 bg-clip-text text-transparent">
                      ${plan.price}
                    </span>
                    <span className="text-lg text-gray-400 mb-1">{t('pricing.perMonth')}</span>
                  </div>
                  
                  {/* Total Price and Savings */}
                  {plan.id !== '1_month' && (
                    <div className="mt-3 text-center space-y-1">
                      <div className="text-sm text-gray-400">
                        {t('pricing.total')} <span className="text-white font-semibold">${plan.totalPrice}</span>
                      </div>
                      {calculateSavings(plan) > 0 && (
                        <div className="flex items-center justify-center space-x-2">
                          <span className="text-xs text-gray-500 line-through">
                            ${15 * (plan.id === '3_months' ? 3 : 12)} {t('pricing.regular')}
                          </span>
                          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full font-medium">
                            {t('pricing.save', { amount: calculateSavings(plan).toFixed(2), percent: getDiscountPercentage(plan) })}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Single month plan */}
                  {plan.id === '1_month' && (
                    <div className="mt-3 text-center">
                      <div className="text-sm text-gray-400">
                        {t('pricing.total')} <span className="text-white font-semibold">${plan.totalPrice}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3 mt-8">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-futbot-primary/5 transition-colors">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-futbot-primary/10 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-futbot-primary"></div>
                      </div>
                      <span className="text-sm text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-futbot-primary/10">
                <button
                  onClick={() => handlePlanSelect(plan)}
                  className={`w-full py-3.5 px-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center space-x-3 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40'
                      : 'bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-gray-200 hover:shadow-lg'
                  }`}
                >
                  <span className="font-bold">Continue</span>
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      

      {selectedPlan && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          plan={selectedPlan}
          onSuccess={() => {
            // Handle successful payment - PayPal webhook will handle KeyAuth creation
            toast.success('Payment successful! Check your email for login credentials.');
            
            // Show success message with instructions
            setTimeout(() => {
              toast.success('🎉 Welcome to FUTBot! Your account is being activated...');
            }, 1000);
            
            // Close the modal after showing success
            setTimeout(() => setIsPaymentModalOpen(false), 3000);
          }}
        />
      )}
    </div>
  );
}
import { useState } from 'react';
import { Shield, Settings, Zap, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { SubscriptionPlan } from '../types/subscription';
import { motion } from 'framer-motion';
import PaymentModal from './PaymentModal';

const features = [
  {
    icon: Shield,
    title: 'Secure Account',
    description: 'Complete protection with advanced security system'
  },
  {
    icon: Settings,
    title: 'Easy Setup',
    description: 'Simple interface and quick start process'
  },
  {
    icon: Zap,
    title: 'Clear Controls',
    description: 'Full control over all settings with intuitive interface'
  },
  {
    icon: Clock,
    title: '24/7 Operation',
    description: 'Automated trading around the clock for maximum profit'
  }
];

const plans: SubscriptionPlan[] = [
  {
    id: '1_month',
    name: 'شهري',
    price: 15,
    duration: '1 شهر',
    features: [
      '⚡ تفعيل فوري',
      '🤖 تداول آلي 24/7',
      '🎮 واجهة تحكم سهلة',
      '🔄 تحديثات مجانية',
      '💬 دعم فني ممتاز'
    ],
  },
  {
    id: '3_months',
    name: '3 أشهر',
    price: 24.99,
    duration: '3 أشهر',
    popular: true,
    features: [
      '⚡ تفعيل فوري',
      '🤖 تداول آلي 24/7',
      '🎮 واجهة تحكم سهلة',
      '🔄 تحديثات مجانية',
      '💬 دعم فني ممتاز',
      '💎 دعم فني متميز'
    ],
  },
  {
    id: '12_months',
    name: '12 شهر',
    price: 49.99,
    duration: '12 شهر',
    features: [
      '⚡ تفعيل فوري',
      '🤖 تداول آلي 24/7',
      '🎮 واجهة تحكم سهلة',
      '🔄 تحديثات مجانية',
      '💬 دعم فني ممتاز',
      '🎁 ميزات حصرية',
      '🔒 دعم فني متميز'
    ],
  },
];

interface PricingPlansProps {
  onSelectPlan: (plan: SubscriptionPlan) => void;
}

export default function PricingPlans({ onSelectPlan }: PricingPlansProps) {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const handlePlanSelect = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setIsPaymentModalOpen(true);
  };

  return (
    <div className="py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <h2 className="text-4xl font-bold text-glow mb-6">Choose Your Plan</h2>
        <p className="text-xl text-gray-400 mb-12">Start earning with FUTBot today</p>

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

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
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
                    الأكثر توفيراً
                  </div>
                )}
                
                <h3 className="text-2xl font-bold text-white text-center mb-2">{plan.name}</h3>
                
                <div className="flex items-end justify-center space-x-2 mt-6 mb-8">
                  <span className="text-4xl font-bold bg-gradient-to-r from-futbot-primary to-blue-400 bg-clip-text text-transparent">
                    ${plan.price}
                  </span>
                  <span className="text-lg text-gray-400 mb-1">/{plan.duration}</span>
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
                  <img 
                    src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_37x23.jpg" 
                    alt="PayPal" 
                    className="h-5"
                  />
                  <span className="font-bold">اشترك الآن</span>
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="text-center mt-12 text-gray-400 text-sm">
        <p className="flex items-center justify-center space-x-2">
          <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          <span>مدفوعات آمنة عبر PayPal</span>
        </p>
      </div>

      {selectedPlan && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          plan={selectedPlan}
          onSuccess={() => {
            // Handle successful payment (e.g., show success message, redirect, etc.)
            toast.success('Payment successful! Your subscription is now active.');
            // Call the parent's onSelectPlan if needed
            onSelectPlan(selectedPlan);
            // Close the modal after a delay
            setTimeout(() => setIsPaymentModalOpen(false), 2000);
          }}
        />
      )}
    </div>
  );
}
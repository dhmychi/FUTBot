import React, { useState } from 'react';
import { Check, Sparkles, Shield, Settings, Zap, Clock } from 'lucide-react';
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
    name: '1 Month',
    price: 15,
    duration: '1 month',
    features: [
      '✨ Instant Activation',
      '⚡ 24/7 Automated Trading',
      '🎮 Easy Controls',
      '🔄 Free Updates',
      '💬 Premium Support'
    ],
  },
  {
    id: '3_months',
    name: '3 Months',
    price: 24.99,
    duration: '3 months',
    features: [
      '✨ Instant Activation',
      '⚡ 24/7 Automated Trading',
      '🎮 Easy Controls',
      '🔄 Free Updates',
      '💬 Premium Support',
      '💎 Priority Support'
    ],
  },
  {
    id: '12_months',
    name: '12 Months',
    price: 49.99,
    duration: '12 months',
    features: [
      '✨ Instant Activation',
      '⚡ 24/7 Automated Trading',
      '🎮 Easy Controls',
      '🔄 Free Updates',
      '💬 24/7 Premium Support',
      '💎 VIP Support',
      '🚀 Faster Performance'
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

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 max-w-6xl mx-auto px-4">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="relative group"
          >
            <div className="card-3d relative p-8 rounded-2xl bg-futbot-surface border border-futbot-primary/20
                          hover:border-futbot-primary/40 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-futbot-primary/5 to-transparent rounded-2xl" />
              
              {plan.id === '12_months' && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="px-4 py-1 bg-futbot-primary/20 rounded-full border border-futbot-primary/40
                               text-futbot-primary text-sm font-medium flex items-center space-x-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Best Value</span>
                  </div>
                </div>
              )}

              <div className="relative text-center">
                <h3 className="text-2xl font-bold text-futbot-highlight mb-2">{plan.name}</h3>
                
                <div className="flex items-baseline justify-center mt-4">
                  <span className="text-5xl font-extrabold text-white animate-glow">${plan.price}</span>
                  <span className="ml-2 text-xl text-gray-400">/{plan.duration}</span>
                </div>
                

                <div className="mt-8 space-y-4">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-center text-sm text-gray-300 justify-center">
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handlePlanSelect(plan)}
                  className="mt-8 w-full py-4 px-6 rounded-xl bg-futbot-primary text-white
                           hover:bg-futbot-accent transition-all duration-300
                           font-semibold text-lg group relative overflow-hidden
                           transform hover:scale-105 active:scale-95 shadow-lg"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-futbot-primary to-futbot-accent 
                                opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                  <span className="relative">Subscribe Now</span>
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
        />
      )}
    </div>
  );
}
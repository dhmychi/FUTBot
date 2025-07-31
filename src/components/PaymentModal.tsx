import React, { useState } from 'react';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import { X, Loader2, Shield, Clock, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SubscriptionPlan } from '../types/subscription';
// تم حذف كود supabase بالكامل. أضف هنا كود KeyAuth أو أي كود مصادقة آخر.
import toast from 'react-hot-toast';

const CHROME_EXTENSION_URL = 'https://chromewebstore.google.com/detail/futbot/kmjemgkhfhpjfblpbcomcpbnofglmnmn?pli=1';
const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID;

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: SubscriptionPlan;
}

export default function PaymentModal({ isOpen, onClose, plan }: PaymentModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const validateForm = () => {
    if (!email || !password || !confirmPassword) {
      toast.error('Please fill in all fields');
      return false;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return false;
    }

    return true;
  };

  const handlePayPalPayment = async (data: any, actions: any) => {
    try {
      if (!validateForm()) {
        return actions.reject();
      }

      setIsProcessing(true);

      // Create user account first
      // تم حذف كود supabase بالكامل. أضف هنا كود KeyAuth أو أي كود مصادقة آخر.
      // const { data: authData, error: authError } = await supabase.auth.signUp({
      //   email,
      //   password,
      // });

      // if (authError) throw authError;

      // Calculate subscription end date
      const endDate = calculateEndDate(plan.duration);

      // Create subscription record
      // تم حذف كود supabase بالكامل. أضف هنا كود KeyAuth أو أي كود مصادقة آخر.
      // const { data: subscription, error: dbError } = await supabase
      //   .from('user_subscriptions')
      //   .insert([
      //     {
      //       email,
      //       auth_user_id: authData.user?.id,
      //       subscription_type: plan.id,
      //       amount_paid: plan.price,
      //       payment_method: 'paypal',
      //       payment_status: 'pending',
      //       start_date: new Date().toISOString(),
      //       end_date: endDate,
      //     }
      //   ])
      //   .select()
      //   .single();

      // if (dbError) throw dbError;

      // Create PayPal order
      return actions.order.create({
        purchase_units: [{
          amount: {
            value: plan.price.toString(),
            currency_code: 'USD'
          },
          description: `FUTBot ${plan.name} Subscription`,
          custom_id: 'dummy_subscription_id' // Placeholder, replace with actual subscription ID
        }]
      });
    } catch (error: any) {
      console.error('PayPal error:', error);
      toast.error(error.message || 'Payment failed. Please try again.');
      setIsProcessing(false);
      return actions.reject();
    }
  };

  const handlePayPalApprove = async (data: any, actions: any) => {
    try {
      const order = await actions.order.capture();
      
      // Update subscription status
      // تم حذف كود supabase بالكامل. أضف هنا كود KeyAuth أو أي كود مصادقة آخر.
      // const { error } = await supabase
      //   .from('user_subscriptions')
      //   .update({ 
      //     payment_status: 'completed',
      //     paypal_order_id: order.id,
      //     paypal_payer_id: order.payer.payer_id
      //   })
      //   .eq('email', email);

      // if (error) throw error;

      toast.success('Payment successful! You can now log in to use FUTBot.');
      onClose();
      // Redirect to extension download or show success message
      window.open(CHROME_EXTENSION_URL, '_blank');
    } catch (error: any) {
      console.error('PayPal approval error:', error);
      toast.error('Payment verification failed. Please contact support.');
    } finally {
      setIsProcessing(false);
    }
  };

  const calculateEndDate = (duration: string): string => {
    const now = new Date();
    switch (duration) {
      case '3 months':
        return new Date(now.setMonth(now.getMonth() + 3)).toISOString();
      case '6 months':
        return new Date(now.setMonth(now.getMonth() + 6)).toISOString();
      case '1 year':
        return new Date(now.setFullYear(now.getFullYear() + 1)).toISOString();
      default:
        return new Date(now.setMonth(now.getMonth() + 1)).toISOString();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-futbot-surface border border-futbot-primary/20 rounded-2xl p-8 w-full max-w-md
                     shadow-xl z-50"
          >
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-white mb-2">Almost There! 🚀</h3>
              <div className="bg-futbot-primary/10 rounded-lg p-4 mt-4">
                <p className="text-xl font-semibold text-futbot-primary mb-2">
                  {plan.name} Subscription
                </p>
                <p className="text-2xl font-bold text-white">
                  ${plan.price}
                  <span className="text-sm text-gray-400 ml-1">/{plan.duration}</span>
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg bg-futbot-surface-light border border-futbot-primary/20
                           text-white placeholder-gray-500 px-4 py-3
                           focus:ring-2 focus:ring-futbot-primary focus:border-futbot-primary
                           transition-colors duration-200"
                  placeholder="Email address"
                  required
                />

                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg bg-futbot-surface-light border border-futbot-primary/20
                           text-white placeholder-gray-500 px-4 py-3
                           focus:ring-2 focus:ring-futbot-primary focus:border-futbot-primary
                           transition-colors duration-200"
                  placeholder="Create password (min. 6 characters)"
                  required
                />

                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-lg bg-futbot-surface-light border border-futbot-primary/20
                           text-white placeholder-gray-500 px-4 py-3
                           focus:ring-2 focus:ring-futbot-primary focus:border-futbot-primary
                           transition-colors duration-200"
                  placeholder="Confirm password"
                  required
                />
              </div>

              {isProcessing && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-6 h-6 text-futbot-primary animate-spin" />
                  <span className="ml-2 text-gray-400">Processing payment...</span>
                </div>
              )}

              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#003087] to-[#009cde] opacity-10 rounded-lg" />
                <PayPalScriptProvider options={{
                  "client-id": PAYPAL_CLIENT_ID,
                  currency: "USD",
                  intent: "capture"
                }}>
                  <PayPalButtons
                    style={{ 
                      layout: 'vertical',
                      shape: 'rect',
                      color: 'blue'
                    }}
                    createOrder={handlePayPalPayment}
                    onApprove={handlePayPalApprove}
                    onError={(err) => {
                      console.error('PayPal Error:', err);
                      toast.error('PayPal payment failed. Please try again.');
                      setIsProcessing(false);
                    }}
                    onCancel={() => {
                      toast.info('Payment cancelled');
                      setIsProcessing(false);
                    }}
                  />
                </PayPalScriptProvider>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="text-center">
                  <Shield className="w-6 h-6 text-futbot-primary mx-auto mb-2" />
                  <p className="text-xs text-gray-400">Secure Payment</p>
                </div>
                <div className="text-center">
                  <Clock className="w-6 h-6 text-futbot-primary mx-auto mb-2" />
                  <p className="text-xs text-gray-400">Instant Access</p>
                </div>
                <div className="text-center">
                  <Award className="w-6 h-6 text-futbot-primary mx-auto mb-2" />
                  <p className="text-xs text-gray-400">Premium Support</p>
                </div>
              </div>

              <p className="text-xs text-gray-400 text-center">
                By completing your purchase, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
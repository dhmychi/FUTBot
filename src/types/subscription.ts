export interface Subscription {
  id: string;
  email: string;
  secret_code: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  subscription_type: '3_months' | '6_months' | '1_year';
  amount_paid: number;
  payment_status: 'pending' | 'completed' | 'failed';
  payment_method: 'stripe' | 'paypal' | null;
  created_at: string;
}

export interface SubscriptionPlan {
  id: '1_month' | '3_months' | '12_months';
  name: string;
  price: number;
  originalPrice?: number;
  duration: string;
  features: string[];
}

import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, Download, Mail, Calendar, CreditCard, User, Copy, Key, Shield } from 'lucide-react';

interface SubscriptionData {
  id: string;
  status: string;
  plan_id: string;
  subscriber: {
    email_address: string;
    name?: {
      given_name: string;
      surname: string;
    };
  };
  create_time: string;
  start_time: string;
  billing_info?: {
    next_billing_time: string;
  };
  plan_details?: {
    name: string;
    price: string;
    duration: string;
  };
  password?: string;
}

export default function SubscriptionSuccess() {
  const [searchParams] = useSearchParams();
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const subscriptionId = searchParams.get('subscription_id');
  const token = searchParams.get('token');

  useEffect(() => {
    if (subscriptionId) {
      fetchSubscriptionDetails();
    }
  }, [subscriptionId]);

  const fetchSubscriptionDetails = async () => {
    try {
      const response = await fetch(`/api/verify-subscription?subscriptionId=${subscriptionId}`);
      const data = await response.json();
      setSubscriptionData(data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyPassword = () => {
    if (subscriptionData?.password) {
      navigator.clipboard.writeText(subscriptionData.password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Verifying your subscription...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6 animate-pulse">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            🎉 Payment Successful!
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Welcome to FUTBot! Your subscription is now active and ready to use.
          </p>
        </div>

        {/* Subscription Details Card */}
        {subscriptionData && (
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-8 border border-gray-100">
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-8">
              <div className="flex items-center justify-between text-white">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Subscription Details</h2>
                  <p className="opacity-90 text-lg">Your FUTBot membership information</p>
                </div>
                <div className="text-right">
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3">
                    <span className="text-sm opacity-90 block">Status</span>
                    <div className="font-bold text-xl flex items-center">
                      <Shield className="w-5 h-5 mr-2" />
                      {subscriptionData.status === 'ACTIVE' ? 'Active' : subscriptionData.status}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Left Column - Account Info */}
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                      <User className="w-6 h-6 text-blue-600 mr-3" />
                      Account Information
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Email Address</label>
                        <p className="text-gray-900 font-medium">{subscriptionData.subscriber.email_address}</p>
                      </div>
                      {subscriptionData.subscriber.name && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Name</label>
                          <p className="text-gray-900 font-medium">
                            {subscriptionData.subscriber.name.given_name} {subscriptionData.subscriber.name.surname}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                      <Calendar className="w-6 h-6 text-green-600 mr-3" />
                      Subscription Timeline
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Start Date</label>
                        <p className="text-gray-900 font-medium">{formatDate(subscriptionData.start_time)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Subscription ID</label>
                        <p className="text-gray-900 font-mono text-sm break-all bg-white p-2 rounded border">
                          {subscriptionData.id}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Password & Plan */}
                <div className="space-y-6">
                  {/* Password Section */}
                  {subscriptionData.password && (
                    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border-2 border-yellow-200">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-gray-900 flex items-center">
                          <Key className="w-6 h-6 text-yellow-600 mr-3" />
                          Your Password
                        </h3>
                        <button
                          onClick={copyPassword}
                          className="flex items-center space-x-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105"
                        >
                          <Copy className="w-4 h-4" />
                          <span>{copied ? 'Copied!' : 'Copy'}</span>
                        </button>
                      </div>
                      <div className="bg-white rounded-xl p-4 border-2 border-dashed border-yellow-300 mb-3">
                        <code className="text-2xl font-mono text-gray-800 font-bold tracking-wider">
                          {subscriptionData.password}
                        </code>
                      </div>
                      <div className="flex items-start space-x-2 text-sm text-gray-600">
                        <Shield className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <p>Save this password to activate the Chrome extension</p>
                      </div>
                    </div>
                  )}

                  {/* Plan Details */}
                  {subscriptionData.plan_details && (
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                        <CreditCard className="w-6 h-6 text-blue-600 mr-3" />
                        Plan Details
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 font-medium">Plan</span>
                          <span className="font-bold text-gray-900">{subscriptionData.plan_details.name}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 font-medium">Price</span>
                          <span className="font-bold text-green-600 text-lg">{subscriptionData.plan_details.price}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 font-medium">Duration</span>
                          <span className="font-bold text-gray-900">{subscriptionData.plan_details.duration}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Link
            to="/download"
            className="group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-6 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-3 shadow-xl hover:shadow-2xl"
          >
            <Download className="w-6 h-6 group-hover:animate-bounce" />
            <span className="text-lg">Download Extension</span>
          </Link>
          
          <button
            onClick={() => window.print()}
            className="group bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold py-6 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-3 shadow-xl hover:shadow-2xl"
          >
            <Mail className="w-6 h-6 group-hover:animate-pulse" />
            <span className="text-lg">Print Receipt</span>
          </button>
        </div>

        {/* Next Steps */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Next Steps</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Download className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Download Extension</h3>
              <p className="text-gray-600">Install our Chrome extension for seamless integration</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Key className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Activate License</h3>
              <p className="text-gray-600">Use your password to activate the extension</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Start Using</h3>
              <p className="text-gray-600">Begin using FUTBot with full access to features</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, Download, Mail, Calendar, CreditCard, User, Copy, Key, Shield } from 'lucide-react';

interface SubscriptionData {
  id: string;
  status: string;
  plan_id: string;
  subscriber: {
    email_address: string;
    name?: {
      given_name: string;
      surname: string;
    };
  };
  create_time: string;
  start_time: string;
  billing_info?: {
    next_billing_time: string;
  };
  plan_details?: {
    name: string;
    price: string;
    duration: string;
  };
  password?: string;
}

export default function SubscriptionSuccess() {
  const [searchParams] = useSearchParams();
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const subscriptionId = searchParams.get('subscription_id');
  const token = searchParams.get('token');

  useEffect(() => {
    if (subscriptionId) {
      fetchSubscriptionDetails();
    }
  }, [subscriptionId]);

  const fetchSubscriptionDetails = async () => {
    try {
      const response = await fetch(`/api/verify-subscription?subscriptionId=${subscriptionId}`);
      const data = await response.json();
      setSubscriptionData(data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyPassword = () => {
    if (subscriptionData?.password) {
      navigator.clipboard.writeText(subscriptionData.password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Verifying your subscription...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6 animate-pulse">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            🎉 Payment Successful!
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Welcome to FUTBot! Your subscription is now active and ready to use.
          </p>
        </div>

        {/* Subscription Details Card */}
        {subscriptionData && (
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-8 border border-gray-100">
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-8">
              <div className="flex items-center justify-between text-white">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Subscription Details</h2>
                  <p className="opacity-90 text-lg">Your FUTBot membership information</p>
                </div>
                <div className="text-right">
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3">
                    <span className="text-sm opacity-90 block">Status</span>
                    <div className="font-bold text-xl flex items-center">
                      <Shield className="w-5 h-5 mr-2" />
                      {subscriptionData.status === 'ACTIVE' ? 'Active' : subscriptionData.status}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Left Column - Account Info */}
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                      <User className="w-6 h-6 text-blue-600 mr-3" />
                      Account Information
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Email Address</label>
                        <p className="text-gray-900 font-medium">{subscriptionData.subscriber.email_address}</p>
                      </div>
                      {subscriptionData.subscriber.name && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Name</label>
                          <p className="text-gray-900 font-medium">
                            {subscriptionData.subscriber.name.given_name} {subscriptionData.subscriber.name.surname}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                      <Calendar className="w-6 h-6 text-green-600 mr-3" />
                      Subscription Timeline
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Start Date</label>
                        <p className="text-gray-900 font-medium">{formatDate(subscriptionData.start_time)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Subscription ID</label>
                        <p className="text-gray-900 font-mono text-sm break-all bg-white p-2 rounded border">
                          {subscriptionData.id}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Password & Plan */}
                <div className="space-y-6">
                  {/* Password Section */}
                  {subscriptionData.password && (
                    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border-2 border-yellow-200">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-gray-900 flex items-center">
                          <Key className="w-6 h-6 text-yellow-600 mr-3" />
                          Your Password
                        </h3>
                        <button
                          onClick={copyPassword}
                          className="flex items-center space-x-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105"
                        >
                          <Copy className="w-4 h-4" />
                          <span>{copied ? 'Copied!' : 'Copy'}</span>
                        </button>
                      </div>
                      <div className="bg-white rounded-xl p-4 border-2 border-dashed border-yellow-300 mb-3">
                        <code className="text-2xl font-mono text-gray-800 font-bold tracking-wider">
                          {subscriptionData.password}
                        </code>
                      </div>
                      <div className="flex items-start space-x-2 text-sm text-gray-600">
                        <Shield className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <p>Save this password to activate the Chrome extension</p>
                      </div>
                    </div>
                  )}

                  {/* Plan Details */}
                  {subscriptionData.plan_details && (
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                        <CreditCard className="w-6 h-6 text-blue-600 mr-3" />
                        Plan Details
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 font-medium">Plan</span>
                          <span className="font-bold text-gray-900">{subscriptionData.plan_details.name}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 font-medium">Price</span>
                          <span className="font-bold text-green-600 text-lg">{subscriptionData.plan_details.price}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 font-medium">Duration</span>
                          <span className="font-bold text-gray-900">{subscriptionData.plan_details.duration}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Link
            to="/download"
            className="group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-6 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-3 shadow-xl hover:shadow-2xl"
          >
            <Download className="w-6 h-6 group-hover:animate-bounce" />
            <span className="text-lg">Download Extension</span>
          </Link>
          
          <button
            onClick={() => window.print()}
            className="group bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold py-6 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-3 shadow-xl hover:shadow-2xl"
          >
            <Mail className="w-6 h-6 group-hover:animate-pulse" />
            <span className="text-lg">Print Receipt</span>
          </button>
        </div>

        {/* Next Steps */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Next Steps</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Download className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Download Extension</h3>
              <p className="text-gray-600">Get the Chrome extension for easy access to FUTBot features.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Key className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Activate License</h3>
              <p className="text-gray-600">Use your password to activate the extension and unlock features.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Start Using</h3>
              <p className="text-gray-600">Begin using FUTBot to enhance your FIFA Ultimate Team experience.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import paypal from '@paypal/checkout-server-sdk';

// PayPal environment setup - Using live environment
const environment = new paypal.core.LiveEnvironment(
  'AX6mXdqElTQ87jSXefb4-AFzDj82pMXKDpSWVXhD9ESCTy6uTQB2ZRbYpva4uayp7fGmvKLw63l',
  'EBw3gZ0Y5-4csTdQh8dN4Zzc67UELAbNswexpHAaim-QRarQ2iSTz8fhWpqK3pzfpGnivCtwXyp4Ypvw'
);

const client = new paypal.core.PayPalHttpClient(environment);

// Subscription plans configuration
const SUBSCRIPTION_PLANS = {
  '1-month': {
    id: 'P-1MONTH-PLAN-ID', // Replace with actual PayPal plan ID
    name: '1 Month Subscription',
    price: '15.00',
    duration: 30
  },
  '3-months': {
    id: 'P-3MONTHS-PLAN-ID', // Replace with actual PayPal plan ID
    name: '3 Months Subscription',
    price: '24.99',
    duration: 90
  },
  '12-months': {
    id: 'P-12MONTHS-PLAN-ID', // Replace with actual PayPal plan ID
    name: '12 Months Subscription',
    price: '49.99',
    duration: 365
  }
};

// Main handler for Vercel serverless function
export default async function handler(req: any, res: any) {
  const { method, query, body } = req;

  try {
    // Handle different HTTP methods and routes
    if (method === 'POST' && query.action === 'create-subscription') {
      return await createSubscription(req, res);
    } else if (method === 'GET' && query.subscriptionId) {
      return await getSubscription(req, res);
    } else if (method === 'POST' && query.action === 'cancel-subscription') {
      return await cancelSubscription(req, res);
    } else {
      return res.status(404).json({ error: 'Route not found' });
    }
  } catch (error) {
    console.error('PayPal subscription API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Create subscription
async function createSubscription(req: any, res: any) {
  const { planType, userEmail } = req.body;

  if (!planType || !SUBSCRIPTION_PLANS[planType]) {
    return res.status(400).json({ error: 'Invalid subscription plan' });
  }

  const plan = SUBSCRIPTION_PLANS[planType];

  try {
    const request = new paypal.subscriptions.SubscriptionsCreateRequest();
    request.requestBody({
      plan_id: plan.id,
      subscriber: {
        email_address: userEmail,
      },
      application_context: {
        brand_name: 'FUTBot',
        locale: 'en-US',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'SUBSCRIBE_NOW',
        payment_method: {
          payer_selected: 'PAYPAL',
          payee_preferred: 'IMMEDIATE_PAYMENT_REQUIRED'
        },
        return_url: `${process.env.FRONTEND_URL}/subscription/success`,
        cancel_url: `${process.env.FRONTEND_URL}/subscription/cancel`
      }
    });

    const response = await client.execute(request);
    
    // Find approval URL
    const approvalUrl = response.result.links.find(
      link => link.rel === 'approve'
    )?.href;

    return res.json({
      subscriptionId: response.result.id,
      approvalUrl: approvalUrl,
      status: response.result.status
    });

  } catch (error) {
    console.error('PayPal subscription creation error:', error);
    return res.status(500).json({ error: 'Failed to create subscription' });
  }
}

// Get subscription details
async function getSubscription(req: any, res: any) {
  const { subscriptionId } = req.query;

  try {
    const request = new paypal.subscriptions.SubscriptionsGetRequest(subscriptionId);
    const response = await client.execute(request);

    return res.json({
      id: response.result.id,
      status: response.result.status,
      plan_id: response.result.plan_id,
      subscriber: response.result.subscriber,
      create_time: response.result.create_time,
      start_time: response.result.start_time
    });

  } catch (error) {
    console.error('PayPal subscription fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch subscription' });
  }
}

// Cancel subscription
async function cancelSubscription(req: any, res: any) {
  const { subscriptionId } = req.query;
  const { reason } = req.body;

  try {
    const request = new paypal.subscriptions.SubscriptionsCancelRequest(subscriptionId);
    request.requestBody({
      reason: reason || 'User requested cancellation'
    });

    await client.execute(request);
    return res.json({ success: true, message: 'Subscription cancelled successfully' });

  } catch (error) {
    console.error('PayPal subscription cancellation error:', error);
    return res.status(500).json({ error: 'Failed to cancel subscription' });
  }
}

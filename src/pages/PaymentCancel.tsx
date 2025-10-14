import React from 'react';
import { WolfLogo } from '../components/WolfLogo';

export default function PaymentCancel() {
  return (
    <div className="min-h-screen bg-futbot-dark text-white overflow-hidden flex items-center justify-center">
      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <WolfLogo className="w-28 h-28 md:w-36 md:h-36" />
            <div className="absolute inset-0 bg-gradient-to-b from-futbot-primary/20 to-transparent rounded-full blur-xl animate-pulse-slow" />
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-black mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-futbot-accent">
          Payment Cancelled
        </h1>
        <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
          Your payment was cancelled. No charges were made. You can return to the site and try again anytime.
        </p>

        <div className="mt-8">
          <a
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-futbot-primary hover:bg-blue-600 transition-colors font-semibold"
          >
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}



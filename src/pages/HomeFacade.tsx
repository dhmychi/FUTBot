import React from 'react';
import { WolfLogo } from '../components/WolfLogo';
import PricingPlans from '../components/PricingPlans';

export default function HomeFacade() {
  return (
    <div className="min-h-screen bg-futbot-dark text-white overflow-hidden">
      <section className="relative min-h-[80vh] flex items-center justify-center pt-10">
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <WolfLogo className="w-40 h-40 md:w-56 md:h-56" />
              <div className="absolute inset-0 bg-gradient-to-b from-futbot-primary/20 to-transparent rounded-full blur-xl animate-pulse-slow" />
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl font-black mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-futbot-accent">
            Futbotclub
          </h1>
          <p className="text-xl md:text-2xl text-futbot-accent font-light tracking-wide">
            Smart trading tools and SBC solutions for EA FC 26
          </p>

          <p className="mt-6 max-w-3xl mx-auto text-gray-300">
            Trade smarter with clear insights and streamlined tools. Clean interface, powerful features, and consistent results to help you navigate the market confidently.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="mailto:contact@futbot.club?subject=Subscribe%20to%20Futbotclub&body=Hello%2C%20I%27d%20like%20to%20subscribe%20to%20Futbotclub."
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-futbot-primary hover:bg-blue-600 transition-colors font-semibold"
            >
              Subscribe via Email
            </a>
            <a
              href="mailto:contact@futbot.club"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-white/20 hover:border-white/35 bg-white/5 hover:bg-white/10 transition-colors"
            >
              contact@futbot.club
            </a>
          </div>
        </div>
      </section>

      <section id="pricing" className="relative py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PricingPlans onSelectPlan={() => { /* overridden in component to email */ }} />
        </div>
      </section>

      <footer className="relative bg-futbot-darker py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <WolfLogo className="w-8 h-8" />
              <span className="text-xl font-bold text-white">Futbotclub</span>
            </div>
            <div className="flex space-x-6 mb-4 md:mb-0">
              <a href="/terms" className="text-gray-400 hover:text-white transition">Terms of Service</a>
              <a href="/privacy" className="text-gray-400 hover:text-white transition">Privacy Policy</a>
              <a href="/refund" className="text-gray-400 hover:text-white transition">Refund Policy</a>
            </div>
            <p className="text-gray-500">© {new Date().getFullYear()} Futbotclub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}



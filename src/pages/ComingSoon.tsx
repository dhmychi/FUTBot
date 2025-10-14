import React from 'react';
import { motion } from 'framer-motion';
import { WolfLogo } from '../components/WolfLogo';

export default function ComingSoon() {
  return (
    <div className="min-h-screen bg-futbot-dark text-white overflow-hidden flex items-center justify-center">
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex justify-center mb-8">
            <div className="relative">
              <WolfLogo className="w-40 h-40 md:w-56 md:h-56" />
              <div className="absolute inset-0 bg-gradient-to-b from-futbot-primary/20 to-transparent rounded-full blur-xl animate-pulse-slow" />
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-futbot-accent">
            We’ll be back soon
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto">
            We’re performing maintenance and updates to improve the experience. Thanks for your patience.
          </p>

          <div className="mt-10">
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-futbot-primary/10 border border-futbot-primary/30">
              <span className="text-futbot-accent font-semibold">Futbotclub</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}



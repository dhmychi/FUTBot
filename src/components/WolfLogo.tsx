import React from 'react';
import { motion } from 'framer-motion';

export const WolfLogo = ({ className = "w-12 h-12" }: { className?: string }) => {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`relative ${className}`}
    >
      <img 
        src="https://i.imgur.com/DiHvYRg.png" 
        alt="FUTBot Wolf Logo" 
        className="w-full h-full object-contain"
        style={{
          imageRendering: 'high-quality',
          WebkitImageRendering: 'high-quality'
        }}
      />
      <div 
        className="absolute inset-0 bg-gradient-to-b from-futbot-primary/10 to-transparent opacity-50 mix-blend-overlay"
        style={{
          maskImage: `url(${encodeURI('https://i.imgur.com/DiHvYRg.png')})`,
          WebkitMaskImage: `url(${encodeURI('https://i.imgur.com/DiHvYRg.png')})`,
          maskSize: 'contain',
          WebkitMaskSize: 'contain',
          maskRepeat: 'no-repeat',
          WebkitMaskRepeat: 'no-repeat',
          maskPosition: 'center',
          WebkitMaskPosition: 'center'
        }}
      />
    </motion.div>
  );
};
import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search, Bot, Zap, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { WolfLogo } from '../components/WolfLogo';
import SEO, { SEOConfigs } from '../components/SEO';

export default function NotFound() {
  const suggestions = [
    {
      title: "الصفحة الرئيسية",
      description: "العودة إلى الصفحة الرئيسية لـ FUTBot",
      icon: Home,
      link: "/",
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "خطط الاشتراك",
      description: "اختر الخطة المناسبة لك",
      icon: Zap,
      link: "/#pricing",
      color: "from-green-500 to-green-600"
    },
    {
      title: "تحميل الإضافة",
      description: "حمل إضافة FUTBot للمتصفح",
      icon: Bot,
      link: "https://chromewebstore.google.com/detail/futbot/kmjemgkhfhpjfblpbcomcpbnofglmnmn",
      color: "from-purple-500 to-purple-600",
      external: true
    }
  ];

  const features = [
    {
      icon: Shield,
      title: "أمان كامل",
      description: "حماية متقدمة لحسابك"
    },
    {
      icon: Zap,
      title: "تداول تلقائي",
      description: "24/7 بدون توقف"
    },
    {
      icon: Bot,
      title: "سهولة الاستخدام",
      description: "واجهة بسيطة ومفهومة"
    }
  ];

  return (
    <>
      <SEO {...SEOConfigs.notFound} />
      <div className="min-h-screen bg-futbot-dark text-white overflow-hidden relative">
      {/* Background Animation */}
      <div className="absolute inset-0 bg-gradient-to-br from-futbot-darker via-futbot-dark to-futbot-surface opacity-50"></div>
      
      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-futbot-primary rounded-full opacity-20"
            animate={{
              x: [0, 100, 0],
              y: [0, -100, 0],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 10 + i * 2,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8"
        >
          <WolfLogo className="w-24 h-24 md:w-32 md:h-32" />
        </motion.div>

        {/* 404 Error */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-center mb-8"
        >
          <h1 className="text-8xl md:text-9xl font-black bg-gradient-to-r from-futbot-primary to-futbot-accent bg-clip-text text-transparent mb-4">
            404
          </h1>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            الصفحة غير موجودة
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها. 
            لكن لا تقلق، يمكنك العودة إلى الصفحة الرئيسية أو استكشاف خدماتنا.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 mb-12"
        >
          <Link
            to="/"
            className="group px-8 py-4 bg-gradient-to-r from-futbot-primary to-futbot-accent 
                     rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-futbot-primary/20 
                     transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
          >
            <Home className="w-5 h-5" />
            <span>الصفحة الرئيسية</span>
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="group px-8 py-4 bg-futbot-surface border border-futbot-primary/30 
                     rounded-xl font-semibold text-white hover:border-futbot-primary/60 
                     transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>العودة</span>
          </button>
        </motion.div>

        {/* Suggestions */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="w-full max-w-4xl mb-12"
        >
          <h3 className="text-2xl font-bold text-center text-white mb-8">
            ربما تبحث عن:
          </h3>
          
          <div className="grid md:grid-cols-3 gap-6">
            {suggestions.map((suggestion, index) => (
              <motion.div
                key={index}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 + index * 0.1, duration: 0.8 }}
                className="group"
              >
                {suggestion.external ? (
                  <a
                    href={suggestion.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-6 bg-futbot-surface/50 border border-futbot-primary/20 
                             rounded-xl hover:border-futbot-primary/40 transition-all duration-300 
                             transform hover:scale-105 h-full"
                  >
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl 
                                   bg-gradient-to-r ${suggestion.color} mb-4`}>
                      <suggestion.icon className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="text-xl font-semibold text-white mb-2 group-hover:text-futbot-accent transition-colors">
                      {suggestion.title}
                    </h4>
                    <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                      {suggestion.description}
                    </p>
                  </a>
                ) : (
                  <Link
                    to={suggestion.link}
                    className="block p-6 bg-futbot-surface/50 border border-futbot-primary/20 
                             rounded-xl hover:border-futbot-primary/40 transition-all duration-300 
                             transform hover:scale-105 h-full"
                  >
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl 
                                   bg-gradient-to-r ${suggestion.color} mb-4`}>
                      <suggestion.icon className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="text-xl font-semibold text-white mb-2 group-hover:text-futbot-accent transition-colors">
                      {suggestion.title}
                    </h4>
                    <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                      {suggestion.description}
                    </p>
                  </Link>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="w-full max-w-4xl"
        >
          <h3 className="text-2xl font-bold text-center text-white mb-8">
            لماذا FUTBot؟
          </h3>
          
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.1 + index * 0.1, duration: 0.8 }}
                className="text-center p-6 bg-futbot-surface/30 rounded-xl border border-futbot-primary/20 
                         hover:border-futbot-primary/40 transition-all duration-300"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full 
                               bg-futbot-primary/10 mb-4">
                  <feature.icon className="w-8 h-8 text-futbot-primary" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">{feature.title}</h4>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.3, duration: 0.8 }}
          className="mt-16 text-center text-gray-500"
        >
          <p className="flex items-center justify-center space-x-2">
            <span>© 2024 FUTBot. جميع الحقوق محفوظة.</span>
          </p>
          <p className="mt-2 text-sm">
            تحتاج مساعدة؟ راسلنا على{' '}
            <a 
              href="mailto:futbott97@gmail.com" 
              className="text-futbot-primary hover:text-futbot-accent transition-colors"
            >
              futbott97@gmail.com
            </a>
          </p>
        </motion.div>
      </div>
      </div>
    </>
  );
}

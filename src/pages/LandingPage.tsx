import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Zap, Clock, ChevronRight, Sparkles, Download, Award, Lock, Users, HelpCircle, ChevronDown, BarChart, Star, TrendingUp, Coins, Settings, Bot, Gauge, Sliders, ChevronLeft } from 'lucide-react';
import PricingPlans from '../components/PricingPlans';
import { SubscriptionPlan } from '../types/subscription';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { WolfLogo } from '../components/WolfLogo';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useI18n } from '../contexts/I18nContext';
import { useAuth } from '../contexts/AuthContext';
import SEO, { SEOConfigs } from '../components/SEO';

const CHROME_EXTENSION_URL = 'https://chromewebstore.google.com/detail/futbot/kmjemgkhfhpjfblpbcomcpbnofglmnmn?pli=1';

const stats = [
  {
    icon: Coins,
    value: "Ultra Fast",
    label: "Millisecond Snipes"
  },
  {
    icon: TrendingUp,
    value: "300K",
    label: "Coins Per Day Average"
  },
  {
    icon: Users,
    value: "10K",
    label: "Already Used FUTBot"
  },
  {
    icon: Shield,
    value: "0",
    label: "Account Bans"
  }
];

const testimonials = [
  {
    text: "Insane results! Huge profits in my first week. Super easy to use. 🎯",
    rating: 5,
    emoji: "💎",
    style: "text-2xl font-bold"
  },
  {
    text: "Started with 50k coins, now making 200k+ daily. This bot is seriously next level!",
    rating: 5,
    emoji: "🚀",
    style: "text-xl italic"
  },
  {
    text: "Best bot I've tried! Earned over 250k coins in two days. 🔥",
    rating: 5,
    emoji: "⚡",
    style: "text-2xl"
  },
  {
    text: "Finally a bot that actually delivers! Making consistent profits while I'm at work.",
    rating: 5,
    emoji: "💫",
    style: "text-lg font-medium"
  },
  {
    text: "Can't believe I used to trade manually! This bot changed everything. ✨",
    rating: 5,
    emoji: "🎮",
    style: "text-xl font-bold"
  },
  {
    text: "Best investment ever! The automation is perfect and profits are insane.",
    rating: 5,
    emoji: "🎯",
    style: "text-xl"
  },
  {
    text: "كنت اشتري كويز اختصر علي كل شيء، الحين وأنا نايم ألاقي الحساب صايد كم لاعب",
    rating: 5,
    emoji: "🌙",
    style: "text-xl"
  },
  {
    text: "I’ve been running FUTBot for about 3 months. Works well and definitely saves time. The profits vary though, some days are great, others are just okay",
    rating: 5,
    emoji: "⏱️",
    style: "text-lg"
  },
  {
    text: "All great",
    rating: 5,
    emoji: "✅",
    style: "text-xl font-medium"
  }
];

const snipes = [
  {
    src: '/snipes/1.jpg',
    price: '10,500',
    caption: 'Perfect snipe at an ideal price — instant profit'
  },
  {
    src: '/snipes/2.jpg',
    price: '850',
    caption: 'Fast snipe at a minimal cost — golden opportunity'
  },
  {
    src: '/snipes/3.jpg',
    price: '16,000',
    caption: 'Great catch — excellent price for the value'
  },
  {
    src: '/snipes/4.jpg',
    price: '850',
    caption: 'Rare pickup — low cost, high return'
  }
];

const features = [
  {
    title: "24/7 Automated Trading",
    description: "Trade automatically around the clock without any manual intervention. The bot never sleeps, ensuring you never miss profitable opportunities.",
    icon: Bot
  },
  {
    title: "Smart Filters & Controls",
    description: "Advanced filtering system with customizable parameters. Set your own profit margins, price ranges, and risk levels.",
    icon: Sliders
  },
  {
    title: "Easy Setup & Use",
    description: "User-friendly interface with guided setup. Start trading within minutes, no technical knowledge required.",
    icon: Settings
  },
  {
    title: "Performance Analytics",
    description: "Real-time monitoring and detailed statistics. Track your profits, success rates, and trading patterns.",
    icon: Gauge
  }
];

const faqs = [
  {
    question: "How does FUTBot protect my account?",
    answer: "FUTBot uses advanced security measures including human-like trading patterns and rate limiting to keep your account safe. We've had zero bans in our operation."
  },
  {
    question: "Does FUTBot help with SBCs?",
    answer: "Yes, our SBC Solver automatically finds solutions for any challenge, helping you save time."
  },
  {
    question: "What's the average daily profit?",
    answer: "Most users earn between 200,000 to 500,000 coins daily, depending on market conditions and trading settings."
  },
  {
    question: "How long until I see results?",
    answer: "From the very first use, the bot starts cracking the market and turning trades into profit. Instant impact, instant results. ⚡🔥"
  },
  {
    question: "Can I customize trading strategies?",
    answer: "Yes! You have full control over the bot – manage it the way you want. Adjust filters, set your own price ranges, choose your trading style, and fine-tune every detail until it matches your strategy. The power is completely in your hands. 🚀"
  },
  {
    question: "What happens if I need help?",
    answer: "Our support team is available 24/7 through Discord and email. We typically respond within 1-2 hours to ensure you get help when you need it."
  }
];

export default function LandingPage() {
  console.log('LandingPage component is rendering...');
  const { user } = useAuth();
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState(0);
  const [activeTestimonialIndex, setActiveTestimonialIndex] = useState(0);
  const [isAutoplay, setIsAutoplay] = useState(true);
  const [activeSnipeIndex, setActiveSnipeIndex] = useState(0);
  const [isSnipesAutoplay, setIsSnipesAutoplay] = useState(true);
  const { scrollYProgress } = useScroll();
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pricingRef = useRef<HTMLDivElement>(null);

  const scrollToPricing = () => {
    pricingRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  useEffect(() => {
    if (!isAutoplay) return;

    const interval = setInterval(() => {
      setActiveTestimonialIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoplay]);

  useEffect(() => {
    if (!isSnipesAutoplay) return;
    const interval = setInterval(() => {
      setActiveSnipeIndex((prev) => (prev + 1) % snipes.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [isSnipesAutoplay]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number;
      y: number;
      radius: number;
      dx: number;
      dy: number;
      color: string;
    }> = [];

    const colors = ['#4169E1', '#1E90FF', '#6495ED'];
    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2 + 1,
        dx: (Math.random() - 0.5) * 0.5,
        dy: (Math.random() - 0.5) * 0.5,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    function animate() {
      if (!canvas || !ctx) return;
      requestAnimationFrame(animate);
      ctx.fillStyle = 'rgba(15, 23, 41, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach(particle => {
        particle.x += particle.dx;
        particle.y += particle.dy;

        if (!canvas) return;
        if (particle.x < 0 || particle.x > canvas.width) particle.dx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.dy *= -1;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
      });

      particles.forEach((particleA, i) => {
        particles.slice(i + 1).forEach(particleB => {
          const dx = particleA.x - particleB.x;
          const dy = particleA.y - particleB.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(65, 105, 225, ${0.2 * (1 - distance / 150)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particleA.x, particleA.y);
            ctx.lineTo(particleB.x, particleB.y);
            ctx.stroke();
          }
        });
      });
    }

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSelectPlan = async (plan: SubscriptionPlan) => {
    try {
      console.log('Creating PayPal order for plan:', plan.id);
      
      // Use same-origin to avoid CORS issues
      const API_BASE = window.location.origin;
      
      const response = await fetch(`${API_BASE}/api/create-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: plan.id
        }),
      });

      const data = await response.json();
      
      if (data.success && data.approvalUrl) {
        // Redirect to PayPal for payment
        window.location.href = data.approvalUrl;
      } else {
        console.error('Failed to create subscription:', data);
        alert('Failed to create subscription. Please try again.');
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
      alert('Error creating subscription. Please try again.');
    }
  };

  const TestimonialsSection = () => (
    <section className="relative py-16 bg-futbot-darker overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-white mb-4">{t('testimonials.title')}</h2>
          <p className="text-xl text-gray-400">{t('testimonials.subtitle')}</p>
        </motion.div>

        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTestimonialIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center"
            >
              <div className="text-6xl mb-6">{testimonials[activeTestimonialIndex].emoji}</div>
              <div className="bg-futbot-surface p-8 rounded-2xl border border-futbot-primary/20 max-w-2xl mx-auto
                          transition-all duration-300">
                <div className="flex justify-center mb-4">
                  {[...Array(testimonials[activeTestimonialIndex].rating)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className={`${testimonials[activeTestimonialIndex].style} text-gray-300`}>
                  "{testimonials[activeTestimonialIndex].text}"
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setActiveTestimonialIndex(index);
                  setIsAutoplay(false);
                }}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === activeTestimonialIndex
                    ? 'bg-futbot-primary scale-125'
                    : 'bg-futbot-primary/30 hover:bg-futbot-primary/50'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );

  const WeeklySnipesSection = () => (
    <section className="relative py-16 bg-futbot-surface/30 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-4xl font-bold text-white mb-3">{t('snipes.title')}</h2>
          <p className="text-lg text-gray-400">{t('snipes.subtitle')}</p>
        </motion.div>

        <div className="relative flex flex-col items-center">
          <div className="relative w-full flex flex-col items-center">
            <div className="relative bg-futbot-surface p-4 rounded-2xl border border-futbot-primary/20 shadow-lg w-full max-w-lg h-[420px]">
              {snipes.map((item, index) => (
                <motion.img
                  key={item.src}
                  src={item.src}
                  alt="Snipe proof"
                  className="absolute inset-0 w-full h-full rounded-xl object-contain"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: index === activeSnipeIndex ? 1 : 0 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  style={{ pointerEvents: 'none' }}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              aria-label="Previous"
              onClick={() => { setActiveSnipeIndex((activeSnipeIndex - 1 + snipes.length) % snipes.length); setIsSnipesAutoplay(false); }}
              className="p-2 rounded-lg bg-futbot-primary/10 border border-futbot-primary/30 hover:bg-futbot-primary/20 transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex gap-2">
              {snipes.map((_, index) => (
                <button
                  key={index}
                  onClick={() => { setActiveSnipeIndex(index); setIsSnipesAutoplay(false); }}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === activeSnipeIndex ? 'bg-futbot-primary scale-125' : 'bg-futbot-primary/30 hover:bg-futbot-primary/50'
                  }`}
                  aria-label={`Go to snipe ${index + 1}`}
                />
              ))}
            </div>
            <button
              aria-label="Next"
              onClick={() => { setActiveSnipeIndex((activeSnipeIndex + 1) % snipes.length); setIsSnipesAutoplay(false); }}
              className="p-2 rounded-lg bg-futbot-primary/10 border border-futbot-primary/30 hover:bg-futbot-primary/20 transition"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );

  return (
    <>
      <SEO {...SEOConfigs.home} />
      <div className="min-h-screen bg-futbot-dark text-white overflow-hidden">
        <canvas
          ref={canvasRef}
          className="fixed inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 0 }}
        />

      <header className="fixed w-full z-50">
        <nav className="glass-effect border-b border-futbot-primary/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20">
            <div className="flex items-center justify-between h-full">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center space-x-3"
              >
                <WolfLogo className="w-12 h-12" />
                <span className="text-2xl font-bold text-white">FUTBot</span>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center space-x-6"
              >
                <LanguageSwitcher />
                <a
                  href={CHROME_EXTENSION_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg
                           bg-futbot-primary/10 border border-futbot-primary/30 text-white text-sm
                           hover:bg-futbot-primary/15 hover:border-futbot-primary/40 hover:text-futbot-accent
                           transition-colors duration-200"
                  aria-label="Download FUTBot Chrome Extension"
                >
                  <Download className="w-4 h-4" />
                  <span className="font-semibold">{t('nav.download')}</span>
                </a>
              </motion.div>
            </div>
          </div>
        </nav>
      </header>

      <section className="relative min-h-screen flex items-center justify-center pt-20">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.div 
              className="flex justify-center mb-8"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <div className="relative">
                <WolfLogo className="w-72 h-72 md:w-[32rem] md:h-[32rem]" />
                <div className="absolute inset-0 bg-gradient-to-b from-futbot-primary/20 to-transparent rounded-full filter blur-xl animate-pulse-slow" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="relative z-10"
            >
              <h1 className="text-6xl md:text-8xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-futbot-accent">
                FUTBot
              </h1>
              <p className="text-2xl md:text-3xl text-futbot-accent font-light tracking-wider mb-6">
                {t('hero.subtitle')}
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-8"
            >
              <button
                onClick={scrollToPricing}
                className="group relative px-8 py-4 bg-gradient-to-r from-futbot-primary to-futbot-accent 
                         rounded-lg overflow-hidden hover:shadow-lg hover:shadow-futbot-primary/20 
                         transition-all duration-300 transform hover:scale-105 inline-flex items-center"
              >
                <Download className="w-5 h-5 mr-2" />
                <span>{t('hero.cta')}</span>
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="relative py-16 bg-futbot-surface/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center space-y-8"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-futbot-accent">
              {t('why.heading')}
            </h2>
            <p className="text-lg md:text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              {t('why.paragraph')}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="relative py-16 bg-futbot-surface/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center p-6 rounded-xl bg-futbot-surface/50 border border-futbot-primary/20"
              >
                <stat.icon className="w-8 h-8 text-futbot-primary mx-auto mb-4" />
                <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Proven Excellence
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="card-3d group"
              >
                <div className="relative p-8 rounded-xl bg-futbot-surface border border-futbot-primary/20
                              hover:border-futbot-primary/40 transition-all duration-300">
                  <div className="relative">
                    <span className="inline-flex items-center justify-center p-3 bg-futbot-primary/10 rounded-xl
                                   group-hover:bg-futbot-primary/20 transition-colors duration-300">
                      <feature.icon className="h-8 w-8 text-futbot-primary group-hover:text-futbot-accent" />
                    </span>
                    <h3 className="mt-6 text-xl font-semibold text-white">{feature.title}</h3>
                    <p className="mt-4 text-gray-400">{feature.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <TestimonialsSection />

      <WeeklySnipesSection />

      <section className="relative py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-white mb-4">{t('faq.title')}</h2>
            <p className="text-xl text-gray-400">{t('faq.subtitle')}</p>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-futbot-surface border border-futbot-primary/20 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setActiveTab(activeTab === index ? -1 : index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between"
                >
                  <span className="text-lg font-medium text-white">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-futbot-primary transition-transform ${
                      activeTab === index ? 'transform rotate-180' : ''
                    }`}
                  />
                </button>
                {activeTab === index && (
                  <div className="px-6 pb-4 text-gray-400">
                    {faq.answer}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="relative py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PricingPlans onSelectPlan={handleSelectPlan} plansRef={pricingRef} />
        </div>
      </section>

      <footer className="relative bg-futbot-darker py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <WolfLogo className="w-8 h-8" />
              <span className="text-xl font-bold text-white">FUTBot</span>
            </div>
            <div className="flex space-x-6 mb-4 md:mb-0">
              <a href="/terms" className="text-gray-400 hover:text-white transition">Terms of Service</a>
              <a href="/privacy" className="text-gray-400 hover:text-white transition">Privacy Policy</a>
              <a href="/refund" className="text-gray-400 hover:text-white transition">Refund Policy</a>
            </div>
            <p className="text-gray-500">© 2023 FUTBot. All rights reserved.</p>
          </div>
        </div>
      </footer>
      </div>
    </>
  );
}
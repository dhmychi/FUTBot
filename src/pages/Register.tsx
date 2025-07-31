import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { WolfLogo } from '../components/WolfLogo';
import { motion } from 'framer-motion';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await signUp(email, password);
      // Redirect to pricing section after successful registration
      window.location.href = '/#pricing';
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-futbot-dark py-12 px-4 sm:px-6 lg:px-8">
      <canvas
        className="fixed inset-0 w-full h-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, #1a2337 0%, #0f1729 100%)',
          opacity: 0.8
        }}
      />
      
      <div className="max-w-md w-full relative z-10">
        <Link
          to="/"
          className="absolute top-0 left-0 -mt-12 flex items-center text-futbot-primary hover:text-futbot-accent transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to home
        </Link>

        <div className="bg-futbot-surface border border-futbot-primary/20 rounded-2xl shadow-2xl p-8 transform transition-all duration-300 hover:border-futbot-primary/40">
          <div className="flex flex-col items-center">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <WolfLogo className="w-20 h-20" />
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 text-center text-3xl font-extrabold text-white"
            >
              Create your account
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-2 text-center text-sm text-gray-400"
            >
              Join the most advanced FIFA trading community
            </motion.p>
          </div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 space-y-6"
            onSubmit={handleSubmit}
          >
            <div className="rounded-2xl bg-futbot-surface-light/50 p-1 space-y-1">
              <div>
                <label htmlFor="email" className="sr-only">Email address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-futbot-primary" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="appearance-none rounded-xl relative block w-full px-3 py-3 pl-10 
                             bg-futbot-surface-light border border-futbot-primary/20
                             placeholder-gray-500 text-white
                             focus:outline-none focus:ring-2 focus:ring-futbot-primary focus:border-transparent
                             focus:z-10 sm:text-sm transition-all duration-200"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="sr-only">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-futbot-primary" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="appearance-none rounded-xl relative block w-full px-3 py-3 pl-10 
                             bg-futbot-surface-light border border-futbot-primary/20
                             placeholder-gray-500 text-white
                             focus:outline-none focus:ring-2 focus:ring-futbot-primary focus:border-transparent
                             focus:z-10 sm:text-sm transition-all duration-200"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="sr-only">Confirm Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-futbot-primary" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    className="appearance-none rounded-xl relative block w-full px-3 py-3 pl-10 
                             bg-futbot-surface-light border border-futbot-primary/20
                             placeholder-gray-500 text-white
                             focus:outline-none focus:ring-2 focus:ring-futbot-primary focus:border-transparent
                             focus:z-10 sm:text-sm transition-all duration-200"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent
                         text-sm font-medium rounded-xl text-white bg-gradient-to-r from-futbot-primary to-futbot-accent
                         hover:from-futbot-primary/90 hover:to-futbot-accent/90
                         focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-futbot-primary
                         disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-200
                         hover:scale-[1.02] disabled:hover:scale-100 shadow-lg"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating account...
                  </span>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>

            <div className="text-center text-sm">
              <span className="text-gray-400">Already have an account?</span>
              {' '}
              <Link
                to="/"
                className="font-medium text-futbot-primary hover:text-futbot-accent transition-colors duration-200"
              >
                Back to home
              </Link>
            </div>
          </motion.form>
        </div>
      </div>
    </div>
  );
}
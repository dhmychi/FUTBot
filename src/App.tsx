import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import LandingPage from './pages/LandingPage';
import Register from './pages/Register';
import TermsPage from './pages/Terms';
import PrivacyPage from './pages/Privacy';
import RefundPage from './pages/Refund';
import { AuthProvider } from './contexts/AuthContext';

import type { PayPalScriptOptions } from '@paypal/paypal-js';

// PayPal configuration - optimized for stability
const paypalOptions: PayPalScriptOptions = {
  clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID,
  currency: 'USD',
  intent: 'capture',
  commit: true,
  vault: false,
  components: 'buttons',
  // Simplified funding options for sandbox environment
  disableFunding: ['card', 'credit', 'paylater', 'venmo'],
  // Stable configuration for sandbox
  debug: true, // Enable debug for troubleshooting
  dataNamespace: 'paypal_sdk',
  integrationDate: '2023-10-01',
  'enable-funding': ['paypal'],
  // Add stability options
  'data-sdk-integration-source': 'button-factory',
  // Ensure proper session handling
  'data-client-token': undefined,
  // Force clean session
  'data-csp-nonce': undefined
};

function App() {
  // Debug: Log the PayPal client ID to verify it's loaded
  console.log('PayPal Client ID:', import.meta.env.VITE_PAYPAL_CLIENT_ID);
  
  // Check if PayPal client ID is configured
  if (!import.meta.env.VITE_PAYPAL_CLIENT_ID) {
    console.error('PayPal Client ID is not configured. Please set VITE_PAYPAL_CLIENT_ID in your environment variables.');
  }
  
  return (
    <PayPalScriptProvider options={paypalOptions}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/register" element={<Register />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/refund" element={<RefundPage />} />
          </Routes>
          <Toaster position="top-right" />
        </BrowserRouter>
      </AuthProvider>
    </PayPalScriptProvider>
  );
}

export default App;
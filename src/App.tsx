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

// PayPal configuration - dynamic based on environment
const isProduction = import.meta.env.NODE_ENV === 'production';
const useSandbox = import.meta.env.VITE_PAYPAL_SANDBOX !== 'false';

const paypalOptions: PayPalScriptOptions = {
  // Use production or sandbox client ID based on environment
  clientId: useSandbox 
    ? (import.meta.env.VITE_PAYPAL_SANDBOX_CLIENT_ID || 'AZDxjDScFpQtjWTOUtWKbyN_bDt4OgqaF4eYXlewfBP4-8aqX3PiV8e1GWU6liB2CUXlkA59kJXE7M6R')
    : (import.meta.env.VITE_PAYPAL_CLIENT_ID || 'AX6mXdqElTQ87jSXefb4-AFzDj82pMXKDpSWVXhD9ESCTy6uTQB2ZRbYpva4uayp7fGmvKLw63l'),
  currency: 'USD',
  intent: 'capture',
  components: 'buttons',
  debug: !isProduction
};

function App() {
  // Debug: Log the PayPal configuration
  const actualClientId = useSandbox 
    ? (import.meta.env.VITE_PAYPAL_SANDBOX_CLIENT_ID || 'AZDxjDScFpQtjWTOUtWKbyN_bDt4OgqaF4eYXlewfBP4-8aqX3PiV8e1GWU6liB2CUXlkA59kJXE7M6R')
    : (import.meta.env.VITE_PAYPAL_CLIENT_ID || 'AX6mXdqElTQ87jSXefb4-AFzDj82pMXKDpSWVXhD9ESCTy6uTQB2ZRbYpva4uayp7fGmvKLw63l');
  
  console.log('PayPal Configuration:');
  console.log('- Environment:', isProduction ? 'Production' : 'Development');
  console.log('- Using Sandbox:', useSandbox);
  console.log('- Client ID loaded:', actualClientId ? 'Yes' : 'No');
  console.log('- Client ID (first 20 chars):', actualClientId?.substring(0, 20) + '...');
  
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
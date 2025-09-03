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

// PayPal configuration - using sandbox for development
const paypalOptions: PayPalScriptOptions = {
  // Use PayPal sandbox test client ID that works with localhost
  clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID || 'AZDxjDScFpQtjWTOUtWKbyN_bDt4OgqaF4eYXlewfBP4-8aqX3PiV8e1GWU6liB2CUXlkA59kJXE7M6R',
  currency: 'USD',
  intent: 'capture',
  components: 'buttons'
};

function App() {
  // Debug: Log the PayPal client ID to verify it's loaded
  const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID || 'AZDxjDScFpQtjWTOUtWKbyN_bDt4OgqaF4eYXlewfBP4-8aqX3PiV8e1GWU6liB2CUXlkA59kJXE7M6R';
  console.log('PayPal Client ID loaded:', clientId ? 'Yes' : 'No');
  console.log('Using PayPal environment:', import.meta.env.VITE_PAYPAL_CLIENT_ID ? 'Production' : 'Sandbox (Development)');
  
  // Log environment status
  if (!import.meta.env.VITE_PAYPAL_CLIENT_ID) {
    console.warn('Using fallback PayPal Client ID. Set VITE_PAYPAL_CLIENT_ID in environment variables for production.');
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
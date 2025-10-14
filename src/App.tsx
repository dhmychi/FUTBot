import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { HelmetProvider } from 'react-helmet-async';
import LandingPage from './pages/LandingPage';
import SimpleLandingPage from './pages/SimpleLandingPage';
import HomeFacade from './pages/HomeFacade';
import Register from './pages/Register';
import TermsPage from './pages/Terms';
import PrivacyPage from './pages/Privacy';
import RefundPage from './pages/Refund';
import NotFound from './pages/NotFound';
import SubscriptionSuccess from './pages/SubscriptionSuccess';
import { AuthProvider } from './contexts/AuthContext';
import { I18nProvider } from './contexts/I18nContext';
import en from './locales/en';
import ar from './locales/ar';
import es from './locales/es';
import ComingSoon from './pages/ComingSoon';

import type { PayPalScriptOptions } from '@paypal/paypal-js';

// PayPal configuration - simplified for testing
// Force USD to avoid CURRENCY_NOT_SUPPORTED in Sandbox
const CURRENCY = 'USD';

const paypalOptions: PayPalScriptOptions = {
  clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID,
  currency: CURRENCY,
  intent: 'capture',
  components: 'buttons'
};

function App() {
  console.log('PayPal: Using Client ID from env');
  const maintenanceMode = String(import.meta.env.VITE_MAINTENANCE_MODE || '').toLowerCase() === 'true';
  
  if (maintenanceMode) {
    return (
      <HelmetProvider>
        <PayPalScriptProvider options={paypalOptions}>
          <I18nProvider dictionaries={{ en, ar, es }}>
            <AuthProvider>
              <ComingSoon />
              <Toaster position="top-right" />
            </AuthProvider>
          </I18nProvider>
        </PayPalScriptProvider>
      </HelmetProvider>
    );
  }

  return (
    <HelmetProvider>
      <PayPalScriptProvider options={paypalOptions}>
        <I18nProvider dictionaries={{ en, ar, es }}>
          <AuthProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<HomeFacade />} />
                <Route path="/register" element={<Register />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/refund" element={<RefundPage />} />
                <Route path="/subscription/success" element={<SubscriptionSuccess />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster position="top-right" />
            </BrowserRouter>
          </AuthProvider>
        </I18nProvider>
      </PayPalScriptProvider>
    </HelmetProvider>
  );
}

export default App;
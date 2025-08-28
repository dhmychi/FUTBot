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

// PayPal configuration
const paypalOptions: PayPalScriptOptions = {
  clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID,
  currency: 'USD',
  intent: 'capture',
  commit: true,
  vault: false,
  components: 'buttons,messages,funding-eligibility',
  enableFunding: 'paypal,venmo',
  disableFunding: 'card,credit,sepa,bancontact,eps,giropay,ideal,mybank,p24,sofort',
  dataSdkIntegrationSource: 'integrationbuilder_sc',
  dataNamespace: 'paypal_sdk',
  merchantId: '*',
  debug: import.meta.env.DEV,
  integrationDate: '2023-10-01'
};

function App() {
  // Debug: Log the PayPal client ID to verify it's loaded
  console.log('PayPal Client ID:', import.meta.env.VITE_PAYPAL_CLIENT_ID);
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
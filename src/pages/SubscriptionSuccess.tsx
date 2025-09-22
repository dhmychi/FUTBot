import React, { useEffect, useState } from 'react';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { WolfLogo } from '../components/WolfLogo';

type PurchaseInfo = {
  email?: string;
  accessCode?: string;
  paymentId?: string;
  planId?: string;
  ts?: number;
};

export default function SubscriptionSuccess() {
  const [info, setInfo] = useState<PurchaseInfo>({});

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('orderId') || undefined;
    const planId = params.get('plan') || undefined;

    try {
      const raw = localStorage.getItem('futbot:purchase');
      if (raw) {
        const parsed = JSON.parse(raw);
        setInfo({
          email: parsed.email,
          accessCode: parsed.accessCode,
          paymentId: orderId || parsed.paymentId,
          planId: planId || parsed.planId,
          ts: parsed.ts
        });
      } else {
        setInfo({ paymentId: orderId, planId });
      }
    } catch {
      setInfo({ paymentId: orderId, planId });
    }
  }, []);

  const copy = async (text: string) => {
    try { await navigator.clipboard.writeText(text); } catch {}
  };

  return (
    <div className="min-h-screen bg-futbot-dark text-white flex items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <WolfLogo className="w-16 h-16" />
          </div>
          <div className="text-5xl mb-3">🎉🤖✨</div>
          <h1 className="text-3xl md:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-futbot-accent">
            Thank you for choosing FUTBot
          </h1>
          <p className="text-gray-400 mt-2">Your subscription is now active</p>
        </div>

        <div className="bg-futbot-surface rounded-2xl border border-futbot-primary/20 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle className="text-green-400" />
            <p className="text-green-400 font-semibold">Payment successful • Account activated</p>
          </div>

          <div className="space-y-4">
            <div className="bg-futbot-surface/60 rounded-xl p-4 border border-futbot-primary/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">✉️</div>
                  <div>
                    <div className="text-sm text-gray-400">Email address</div>
                    <div className="font-semibold">{info.email || '—'}</div>
                  </div>
                </div>
                {info.email ? (
                  <button
                    onClick={() => copy(info.email!)}
                    className="px-3 py-1.5 text-sm rounded-lg bg-futbot-primary/10 hover:bg-futbot-primary/20 border border-futbot-primary/30"
                  >
                    Copy
                  </button>
                ) : null}
              </div>
            </div>

            <div className="bg-futbot-surface/60 rounded-xl p-4 border border-futbot-primary/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">🔑</div>
                  <div>
                    <div className="text-sm text-gray-400">Access code (password)</div>
                    <div className="font-semibold">{info.accessCode || '—'}</div>
                  </div>
                </div>
                {info.accessCode ? (
                  <button
                    onClick={() => copy(info.accessCode!)}
                    className="px-3 py-1.5 text-sm rounded-lg bg-futbot-primary/10 hover:bg-futbot-primary/20 border border-futbot-primary/30"
                  >
                    Copy
                  </button>
                ) : null}
              </div>
            </div>

            <div className="text-xs text-gray-500">
              Your login details are saved locally on this device for quick access. Please keep them secure and do not share them with anyone.
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <a
              href="/"
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-futbot-primary to-futbot-accent hover:opacity-90 transition"
            >
              Back to Home
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="https://chromewebstore.google.com/detail/futbot/kmjemgkhfhpjfblpbcomcpbnofglmnmn"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-futbot-surface-light border border-futbot-primary/20 hover:border-futbot-primary/40 transition"
            >
              Get the browser extension
            </a>
          </div>
        </div>

        <div className="text-center text-xs text-gray-500 mt-6">
          Order ID: {info.paymentId || '—'}
        </div>
      </div>
    </div>
  );
}



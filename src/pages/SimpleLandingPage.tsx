import React from 'react';
import { Download } from 'lucide-react';

const CHROME_EXTENSION_URL = 'https://chromewebstore.google.com/detail/futbot/kmjemgkhfhpjfblpbcomcpbnofglmnmn?pli=1';

export default function SimpleLandingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b1022] text-white">
      <div className="max-w-2xl w-full mx-auto p-6 text-center">
        <div className="mb-8">
          <img
            src="https://futbot.club/wolf-logo.png"
            alt="FUTBot"
            className="mx-auto w-20 h-20 rounded-xl"
          />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight">FUTBot</h1>
        <p className="mt-3 text-lg text-gray-300">
          Ultra-fast autobuyer and sniping bot for EA FC 26. Clean, reliable, and powerful.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href={CHROME_EXTENSION_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[#4169E1] hover:bg-[#3658c2] transition-colors"
          >
            <Download className="w-5 h-5" />
            <span className="font-semibold">Get Chrome Extension</span>
          </a>
          <a
            href="mailto:info@futbot.club"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border border-white/20 hover:border-white/35 bg-white/5 hover:bg-white/10 transition-colors"
          >
            Contact Support
          </a>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          <div className="rounded-lg border border-white/10 bg-white/5 p-3">
            <div className="text-white font-semibold">Ultra Fast</div>
            <div className="text-gray-400">Millisecond snipes</div>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-3">
            <div className="text-white font-semibold">300K+/day</div>
            <div className="text-gray-400">Average profits</div>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-3">
            <div className="text-white font-semibold">Zero Bans</div>
            <div className="text-gray-400">Safe patterns</div>
          </div>
        </div>

        <p className="mt-10 text-xs text-gray-500">© {new Date().getFullYear()} FUTBot. All rights reserved.</p>
      </div>
    </div>
  );
}



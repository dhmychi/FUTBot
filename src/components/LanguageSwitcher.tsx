import React, { useMemo, useState } from 'react';
import { Globe } from 'lucide-react';
import { useI18n, Locale } from '../contexts/I18nContext';

export default function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);

  const languages = useMemo(() => (
    [
      { code: 'en', label: 'English' },
      { code: 'ar', label: 'العربية' },
      { code: 'es', label: 'Español' },
    ] as { code: Locale; label: string }[]
  ), []);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-futbot-surface/50 border border-futbot-primary/20 hover:border-futbot-primary/40 transition-colors"
        aria-label="Change language"
      >
        <Globe className="w-4 h-4" />
        <span className="text-sm">{locale.toUpperCase()}</span>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-futbot-surface border border-futbot-primary/20 rounded-lg shadow-lg z-50">
          {languages.map((l) => (
            <button
              key={l.code}
              onClick={() => { setLocale(l.code); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-futbot-primary/10 ${locale === l.code ? 'text-futbot-accent' : 'text-gray-200'}`}
            >
              {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}



import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type Locale = 'en' | 'ar' | 'es';

type Dictionary = Record<string, any>;

interface I18nContextType {
  locale: Locale;
  direction: 'ltr' | 'rtl';
  setLocale: (loc: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType>({} as I18nContextType);

const flatten = (obj: Dictionary, prefix = ''): Record<string, string> => {
  const out: Record<string, string> = {};
  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(out, flatten(value, fullKey));
    } else {
      out[fullKey] = String(value);
    }
  });
  return out;
};

export function I18nProvider({ children, dictionaries }: { children: React.ReactNode; dictionaries: Record<Locale, Dictionary> }) {
  const [locale, setLocale] = useState<Locale>(() => (localStorage.getItem('locale') as Locale) || 'en');

  useEffect(() => {
    localStorage.setItem('locale', locale);
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
  }, [locale]);

  const maps = useMemo(() => {
    const result: Record<Locale, Record<string, string>> = {
      en: flatten(dictionaries.en),
      ar: flatten(dictionaries.ar),
      es: flatten(dictionaries.es)
    } as any;
    return result;
  }, [dictionaries]);

  const t = (key: string, params?: Record<string, string | number>) => {
    const current = maps[locale]?.[key] ?? maps.en?.[key] ?? key;
    if (!params) return current;
    return Object.keys(params).reduce((acc, p) => acc.replace(new RegExp(`{${p}}`, 'g'), String(params[p])), current);
  };

  const value: I18nContextType = {
    locale,
    direction: locale === 'ar' ? 'rtl' : 'ltr',
    setLocale,
    t
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export const useI18n = () => useContext(I18nContext);



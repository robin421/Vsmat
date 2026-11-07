import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { SupportedLanguage, TranslationDictionary } from './types';
import { zh } from './locales/zh';
import { en } from './locales/en';
import { ja } from './locales/ja';
import { ko } from './locales/ko';

export * from './types';

const LOCALES: Record<SupportedLanguage, TranslationDictionary> = {
  zh,
  en,
  ja,
  ko,
};

const STORAGE_LANG_KEY = 'vsmat_ui_language';

export function detectDefaultLanguage(): SupportedLanguage {
  try {
    const saved = localStorage.getItem(STORAGE_LANG_KEY);
    if (saved === 'zh' || saved === 'en' || saved === 'ja' || saved === 'ko') {
      return saved;
    }
  } catch {}
  return 'zh';
}

export function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    return vars[key] !== undefined ? String(vars[key]) : `{${key}}`;
  });
}

interface I18nContextValue {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: TranslationDictionary;
  format: (template: string, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

interface I18nProviderProps {
  language?: SupportedLanguage;
  onLanguageChange?: (lang: SupportedLanguage) => void;
  children: React.ReactNode;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({
  language: controlledLanguage,
  onLanguageChange,
  children,
}) => {
  const [internalLanguage, setInternalLanguage] = useState<SupportedLanguage>(() => detectDefaultLanguage());

  const activeLanguage = controlledLanguage || internalLanguage;

  const handleSetLanguage = useCallback((newLang: SupportedLanguage) => {
    try {
      localStorage.setItem(STORAGE_LANG_KEY, newLang);
    } catch {}
    setInternalLanguage(newLang);
    onLanguageChange?.(newLang);
  }, [onLanguageChange]);

  useEffect(() => {
    if (controlledLanguage) {
      try {
        localStorage.setItem(STORAGE_LANG_KEY, controlledLanguage);
      } catch {}
    }
  }, [controlledLanguage]);

  const value = useMemo<I18nContextValue>(() => {
    return {
      language: activeLanguage,
      setLanguage: handleSetLanguage,
      t: LOCALES[activeLanguage] || LOCALES.zh,
      format: interpolate,
    };
  }, [activeLanguage, handleSetLanguage]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    // Graceful fallback for non-provider usage (e.g. testing)
    return {
      language: 'zh',
      setLanguage: () => {},
      t: LOCALES.zh,
      format: interpolate,
    };
  }
  return ctx;
}

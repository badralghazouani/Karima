'use client';

import { useEffect, useState } from 'react';
import { getLocale, getMessages, type Locale } from '@/lib/i18n';

export function useTranslation() {
  const [locale, setLocale] = useState<Locale>('en');
  const [messages, setMessages] = useState(getMessages('en'));

  useEffect(() => {
    const currentLocale = getLocale();
    setLocale(currentLocale);
    setMessages(getMessages(currentLocale));
  }, []);

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = messages;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // Return key if translation not found
      }
    }

    return typeof value === 'string' ? value : key;
  };

  return { t, locale };
}

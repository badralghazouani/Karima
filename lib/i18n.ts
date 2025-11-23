import { cookies } from 'next/headers';
import enMessages from '@/messages/en.json';
import frMessages from '@/messages/fr.json';

export type Locale = 'en' | 'fr';
export const defaultLocale: Locale = 'en';
export const locales: Locale[] = ['en', 'fr'];

const messages = {
  en: enMessages,
  fr: frMessages,
};

export function getLocale(): Locale {
  // Try to get locale from cookie
  if (typeof window !== 'undefined') {
    const savedLocale = localStorage.getItem('locale') as Locale;
    if (savedLocale && locales.includes(savedLocale)) {
      return savedLocale;
    }
  }
  return defaultLocale;
}

export function getMessages(locale: Locale) {
  return messages[locale] || messages[defaultLocale];
}

export function setLocale(locale: Locale) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('locale', locale);
  }
}

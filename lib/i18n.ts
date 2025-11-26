import enMessages from '@/messages/en.json';
import frMessages from '@/messages/fr.json';

export type Locale = 'en' | 'fr';
export const defaultLocale: Locale = 'en';
export const locales: Locale[] = ['en', 'fr'];

const messages = {
  en: enMessages,
  fr: frMessages,
};

function getLocaleFromCookie(): Locale | null {
  if (typeof document === 'undefined') return null;

  const match = document.cookie.match(/(?:^|;\s*)locale=([^;]+)/);
  if (!match) return null;

  const locale = decodeURIComponent(match[1]) as Locale;
  return locales.includes(locale) ? locale : null;
}

export function getLocale(): Locale {
  // Try to get locale from cookie
  if (typeof window !== 'undefined') {
    const cookieLocale = getLocaleFromCookie();
    if (cookieLocale) return cookieLocale;

    const savedLocale = localStorage.getItem('locale') as Locale | null;
    if (savedLocale && locales.includes(savedLocale)) return savedLocale;
  }

  return defaultLocale;
}

export function getMessages(locale: Locale) {
  return messages[locale] || messages[defaultLocale];
}

export function setLocale(locale: Locale) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('locale', locale);
    document.cookie = `locale=${locale}; path=/; max-age=31536000`;
  }
}

import { cookies } from 'next/headers';
import { defaultLocale, getMessages, locales, type Locale } from '@/lib/i18n';

export function getServerLocale(): Locale {
  const cookieLocale = cookies().get('locale')?.value as Locale | undefined;
  return cookieLocale && locales.includes(cookieLocale) ? cookieLocale : defaultLocale;
}

export function getServerTranslator() {
  const locale = getServerLocale();
  const messages = getMessages(locale);

  const t = (
    key: string,
    params?: Record<string, string | number | null | undefined>
  ): string => {
    const keys = key.split('.');
    let value: any = messages;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key;
      }
    }

    if (typeof value !== 'string') {
      return key;
    }

    if (!params) {
      return value;
    }

    return Object.entries(params).reduce((result, [paramKey, paramValue]) => {
      return result.replace(
        new RegExp(`{{\\s*${paramKey}\\s*}}`, 'g'),
        String(paramValue ?? '')
      );
    }, value);
  };

  return { t, locale };
}

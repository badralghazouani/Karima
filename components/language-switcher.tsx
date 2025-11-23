'use client';

import { useEffect, useState } from 'react';
import { setLocale, getLocale, type Locale } from '@/lib/i18n';

export function LanguageSwitcher() {
  const [currentLocale, setCurrentLocale] = useState<Locale>('en');

  useEffect(() => {
    setCurrentLocale(getLocale());
  }, []);

  const handleLanguageChange = (newLocale: Locale) => {
    setLocale(newLocale);
    setCurrentLocale(newLocale);
    // Reload page to apply new language
    window.location.reload();
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleLanguageChange('en')}
        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
          currentLocale === 'en'
            ? 'bg-primary text-primary-foreground'
            : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700'
        }`}
        aria-label="Switch to English"
      >
        🇬🇧 EN
      </button>
      <button
        onClick={() => handleLanguageChange('fr')}
        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
          currentLocale === 'fr'
            ? 'bg-primary text-primary-foreground'
            : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700'
        }`}
        aria-label="Passer au français"
      >
        🇫🇷 FR
      </button>
    </div>
  );
}

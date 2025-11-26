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
    <label className="relative inline-flex items-center text-sm text-muted-foreground">
      <span className="sr-only">Select language</span>
      <div className="relative">
        <select
          value={currentLocale}
          onChange={(e) => handleLanguageChange(e.target.value as Locale)}
          className="appearance-none bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md py-2 pl-3 pr-9 text-sm font-medium text-gray-900 dark:text-gray-100 shadow-sm hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
        >
          <option value="en">English</option>
          <option value="fr">Français</option>
        </select>
        <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-500">
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.18l3.71-3.95a.75.75 0 011.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      </div>
    </label>
  );
}

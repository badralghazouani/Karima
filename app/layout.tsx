import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { cookies } from 'next/headers';
import { defaultLocale, locales, type Locale } from '@/lib/i18n';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Karima - Online Course Platform',
  description: 'Learn new skills with our comprehensive online courses',
};

function getServerLocale(): Locale {
  const cookieLocale = cookies().get('locale')?.value as Locale | undefined;
  return cookieLocale && locales.includes(cookieLocale) ? cookieLocale : defaultLocale;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = getServerLocale();

  return (
    <html lang={locale}>
      <body className={plusJakarta.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

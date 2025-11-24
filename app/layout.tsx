import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { cookies } from 'next/headers';
import { defaultLocale, locales, type Locale } from '@/lib/i18n';

const inter = Inter({ subsets: ['latin'] });

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
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

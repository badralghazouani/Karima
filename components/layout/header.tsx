'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/language-switcher';
import { useTranslation } from '@/hooks/useTranslation';

export function Header() {
  const { data: session } = useSession();
  const { t } = useTranslation();

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-primary">
          {t('common.appName')}
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/courses" className="hover:text-primary transition">
            {t('nav.courses')}
          </Link>
          {session?.user && (session.user as any).role === 'INSTRUCTOR' && (
            <Link
              href="/instructor/dashboard"
              className="hover:text-primary transition"
            >
              {t('nav.teach')}
            </Link>
          )}
          {session?.user && (session.user as any).role === 'ADMIN' && (
            <Link
              href="/admin/dashboard"
              className="hover:text-primary transition"
            >
              {t('nav.adminPanel')}
            </Link>
          )}
        </nav>

        <div className="flex items-center space-x-4">
          <LanguageSwitcher />
          {session?.user ? (
            <>
              <Link href="/dashboard/my-courses">
                <Button variant="ghost">{t('nav.myLearning')}</Button>
              </Link>
              <Link href="/dashboard/profile">
                <Button variant="outline">{t('nav.profile')}</Button>
              </Link>
              <Button onClick={() => signOut()} variant="ghost">
                {t('common.logout')}
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="ghost">{t('common.login')}</Button>
              </Link>
              <Link href="/auth/signup">
                <Button>{t('common.signup')}</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const { t } = useTranslation();

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'Configuration':
        return t('auth.errorConfiguration');
      case 'AccessDenied':
        return t('auth.errorAccessDenied');
      case 'Verification':
        return t('auth.errorVerification');
      case 'OAuthSignin':
        return t('auth.errorOAuthSignin');
      case 'OAuthCallback':
        return t('auth.errorOAuthCallback');
      case 'OAuthCreateAccount':
        return t('auth.errorOAuthCreateAccount');
      case 'EmailCreateAccount':
        return t('auth.errorEmailCreateAccount');
      case 'Callback':
        return t('auth.errorCallback');
      case 'OAuthAccountNotLinked':
        return t('auth.errorOAuthAccountNotLinked');
      case 'EmailSignin':
        return t('auth.errorEmailSignin');
      case 'CredentialsSignin':
        return t('auth.errorCredentialsSignin');
      case 'SessionRequired':
        return t('auth.errorSessionRequired');
      default:
        return t('common.errorGeneric');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-destructive"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            {t('auth.errorTitle')}
          </CardTitle>
          <CardDescription className="text-center">
            {getErrorMessage(error)}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-muted-foreground">
            {t('auth.errorSupport')}
          </p>
        </CardContent>
        <CardFooter className="flex gap-4 justify-center">
          <Link href="/auth/login">
            <Button>{t('auth.tryAgain')}</Button>
          </Link>
          <Link href="/">
            <Button variant="outline">{t('common.goHome')}</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

import { requireAuth } from '@/lib/auth-utils';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { getServerTranslator } from '@/lib/i18n-server';

export default async function ProfilePage() {
  const user = await requireAuth();
  const { t } = getServerTranslator();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">{t('profile.settingsTitle')}</h1>

          <div className="space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle>{t('profile.personalInfo')}</CardTitle>
                <CardDescription>
                  {t('profile.personalInfoDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('auth.fullName')}</label>
                  <Input defaultValue={user.name || ''} placeholder={t('profile.namePlaceholder')} />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('common.email')}</label>
                  <Input defaultValue={user.email} disabled />
                  <p className="text-xs text-muted-foreground">
                    {t('profile.emailLocked')}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('profile.role')}</label>
                  <Input defaultValue={user.role} disabled />
                </div>

                <Button>{t('profile.saveChanges')}</Button>
              </CardContent>
            </Card>

            {/* Change Password */}
            <Card>
              <CardHeader>
                <CardTitle>{t('profile.changePassword')}</CardTitle>
                <CardDescription>
                  {t('profile.changePasswordDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('profile.currentPassword')}</label>
                  <Input type="password" placeholder="••••••••" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('profile.newPassword')}</label>
                  <Input type="password" placeholder="••••••••" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('profile.confirmNewPassword')}</label>
                  <Input type="password" placeholder="••••••••" />
                </div>

                <Button>{t('profile.updatePassword')}</Button>
              </CardContent>
            </Card>

            {/* Account Information */}
            <Card>
              <CardHeader>
                <CardTitle>{t('profile.accountInfo')}</CardTitle>
                <CardDescription>
                  {t('profile.accountInfoDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm text-muted-foreground">{t('profile.accountType')}</span>
                  <span className="text-sm font-medium">{user.role}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm text-muted-foreground">{t('profile.memberSince')}</span>
                  <span className="text-sm font-medium">
                    {new Date().toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-sm text-muted-foreground">{t('profile.emailVerified')}</span>
                  <span className="text-sm font-medium">
                    {user.email ? t('common.yes') : t('common.no')}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">{t('profile.dangerZone')}</CardTitle>
                <CardDescription>
                  {t('profile.dangerZoneDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="destructive">{t('profile.deleteAccount')}</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

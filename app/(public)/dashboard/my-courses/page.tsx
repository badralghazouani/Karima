import { requireAuth } from '@/lib/auth-utils';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { EnrolledCourses } from '@/components/dashboard/enrolled-courses';
import { getServerTranslator } from '@/lib/i18n-server';

export default async function MyCoursesPage() {
  const user = await requireAuth();
  const { t } = getServerTranslator();
  const userName = user.name ?? t('common.user');

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t('dashboard.myCourses')}</h1>
          <p className="text-muted-foreground">
            {t('dashboard.welcomeBack', { name: userName })}
          </p>
        </div>

        <EnrolledCourses />
      </main>

      <Footer />
    </div>
  );
}

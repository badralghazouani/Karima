import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { getServerTranslator } from '@/lib/i18n-server';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const { t } = getServerTranslator();

  // Only allow admin role
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/');
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-1">
        {/* Admin Sidebar */}
        <aside className="w-64 border-r bg-gray-50 dark:bg-gray-900">
          <div className="p-6">
            <h2 className="text-lg font-bold mb-6">{t('admin.panel')}</h2>
            <nav className="space-y-2">
              <a
                href="/admin/dashboard"
                className="block px-4 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
              >
                📊 {t('nav.dashboard')}
              </a>
              <a
                href="/admin/courses"
                className="block px-4 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
              >
                📚 {t('admin.allCourses')}
              </a>
              <a
                href="/admin/users"
                className="block px-4 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
              >
                👥 {t('admin.users')}
              </a>
              <a
                href="/admin/payments"
                className="block px-4 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
              >
                💳 {t('admin.payments')}
              </a>
              <a
                href="/admin/categories"
                className="block px-4 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
              >
                🏷️ {t('admin.categories')}
              </a>
              <a
                href="/admin/student-groups"
                className="block px-4 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
              >
                👨‍🎓 {t('admin.studentGroups')}
              </a>
              <a
                href="/admin/publication-calendar"
                className="block px-4 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
              >
                📅 {t('admin.publicationCalendar')}
              </a>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}

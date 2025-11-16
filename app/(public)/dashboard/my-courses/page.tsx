import { requireAuth } from '@/lib/auth-utils';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { EnrolledCourses } from '@/components/dashboard/enrolled-courses';

export default async function MyCoursesPage() {
  const user = await requireAuth();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Courses</h1>
          <p className="text-muted-foreground">
            Welcome back, {user.name}! Continue your learning journey.
          </p>
        </div>

        <EnrolledCourses />
      </main>

      <Footer />
    </div>
  );
}

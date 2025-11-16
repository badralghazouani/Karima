import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function CoursesPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        {/* Page Header */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold mb-4">All Courses</h1>
            <p className="text-lg text-muted-foreground">
              Explore our collection of courses and start learning today
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {/* Filters */}
          <div className="mb-8 flex flex-wrap gap-4">
            <select className="px-4 py-2 border rounded-md">
              <option>All Categories</option>
              <option>Web Development</option>
              <option>Programming</option>
              <option>Design</option>
              <option>Business</option>
            </select>

            <select className="px-4 py-2 border rounded-md">
              <option>All Levels</option>
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>

            <select className="px-4 py-2 border rounded-md">
              <option>All Prices</option>
              <option>Free</option>
              <option>Paid</option>
            </select>

            <input
              type="search"
              placeholder="Search courses..."
              className="flex-1 min-w-[200px] px-4 py-2 border rounded-md"
            />
          </div>

          {/* Empty State */}
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-10 h-10 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">No courses available yet</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Courses will appear here once instructors start creating content. Check back soon!
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

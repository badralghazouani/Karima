'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { CourseCard } from '@/components/courses/course-card';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail: string | null;
  price: string;
  isFree: boolean;
  level: string;
  instructor: {
    id: string;
    name: string;
  };
  lessons: Array<{ id: string; duration: number }>;
  _count: {
    enrollments: number;
  };
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    level: '',
    isFree: '',
    search: '',
  });

  useEffect(() => {
    fetchCategories();
    fetchCourses();
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [filters]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.level) params.append('level', filters.level);
      if (filters.isFree) params.append('isFree', filters.isFree);
      if (filters.search) params.append('search', filters.search);

      const response = await fetch(`/api/courses?${params.toString()}`);
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

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
            <select
              className="px-4 py-2 border rounded-md"
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>

            <select
              className="px-4 py-2 border rounded-md"
              value={filters.level}
              onChange={(e) => handleFilterChange('level', e.target.value)}
            >
              <option value="">All Levels</option>
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
              <option value="ALL_LEVELS">All Levels</option>
            </select>

            <select
              className="px-4 py-2 border rounded-md"
              value={filters.isFree}
              onChange={(e) => handleFilterChange('isFree', e.target.value)}
            >
              <option value="">All Prices</option>
              <option value="true">Free</option>
              <option value="false">Paid</option>
            </select>

            <input
              type="search"
              placeholder="Search courses..."
              className="flex-1 min-w-[200px] px-4 py-2 border rounded-md"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>

          {/* Courses Grid */}
          {isLoading ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground">Loading courses...</p>
            </div>
          ) : courses.length === 0 ? (
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
              <h2 className="text-2xl font-bold mb-2">No courses found</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Try adjusting your filters or check back later for new courses
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4 text-sm text-muted-foreground">
                Showing {courses.length} {courses.length === 1 ? 'course' : 'courses'}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface EnrolledCourse {
  id: string;
  enrolledAt: string;
  completedAt: string | null;
  course: {
    id: string;
    title: string;
    slug: string;
    description: string;
    instructor: {
      name: string;
    };
    lessons: Array<{ id: string; duration: number }>;
  };
  progress: {
    completed: number;
    total: number;
    percentage: number;
  };
}

export function EnrolledCourses() {
  const [enrollments, setEnrollments] = useState<EnrolledCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      const response = await fetch('/api/enrollments');
      const data = await response.json();
      setEnrollments(data);
    } catch (error) {
      console.error('Failed to fetch enrollments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Loading courses...</p>
      </div>
    );
  }

  const totalEnrolled = enrollments.length;
  const inProgress = enrollments.filter((e) => !e.completedAt && e.progress.completed > 0).length;
  const completed = enrollments.filter((e) => e.completedAt).length;

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Enrolled Courses</CardDescription>
            <CardTitle className="text-3xl">{totalEnrolled}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>In Progress</CardDescription>
            <CardTitle className="text-3xl">{inProgress}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Completed</CardDescription>
            <CardTitle className="text-3xl">{completed}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Courses List */}
      {enrollments.length === 0 ? (
        <div className="bg-white rounded-lg border p-8 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-primary"
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
            <h2 className="text-xl font-semibold mb-2">No courses yet</h2>
            <p className="text-muted-foreground mb-6">
              Start learning by enrolling in your first course
            </p>
            <Link href="/courses">
              <Button>Browse Courses</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Continue Learning</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map((enrollment) => (
              <Card key={enrollment.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-full h-32 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg mb-4 flex items-center justify-center">
                    <svg
                      className="w-12 h-12 text-primary/40"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <CardTitle className="line-clamp-2">{enrollment.course.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    by {enrollment.course.instructor.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Progress Bar */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Progress</span>
                        <span className="text-sm text-muted-foreground">
                          {enrollment.progress.percentage}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full">
                        <div
                          className="h-2 bg-primary rounded-full transition-all"
                          style={{ width: `${enrollment.progress.percentage}%` }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {enrollment.progress.completed} of {enrollment.progress.total} lessons
                      </div>
                    </div>

                    {/* Status Badge */}
                    {enrollment.completedAt ? (
                      <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ✓ Completed
                      </div>
                    ) : enrollment.progress.completed > 0 ? (
                      <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        In Progress
                      </div>
                    ) : (
                      <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Not Started
                      </div>
                    )}

                    {/* Action Button */}
                    <Link href={`/learn/${enrollment.course.slug}`} className="block">
                      <Button className="w-full" variant={enrollment.completedAt ? 'outline' : 'default'}>
                        {enrollment.completedAt ? 'Review Course' : 'Continue Learning'}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

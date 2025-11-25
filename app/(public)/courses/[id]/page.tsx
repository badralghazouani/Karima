'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ReviewList } from '@/components/reviews/review-list';
import { formatPrice, formatDuration } from '@/lib/utils';

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  duration: number;
  order: number;
  isFree: boolean;
}

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string | null;
  price: string;
  isFree: boolean;
  level: string;
  language: string;
  isPublished: boolean;
  instructor: {
    id: string;
    name: string;
    avatar: string | null;
  };
  lessons: Lesson[];
  _count: {
    enrollments: number;
  };
  isEnrolled: boolean;
}

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      const detailResponse = await fetch(`/api/courses/${courseId}`);
      const courseData = await detailResponse.json();
      if (detailResponse.ok) {
        setCourse(courseData);
      }
    } catch (error) {
      console.error('Failed to fetch course:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!session) {
      router.push('/auth/login');
      return;
    }

    setIsEnrolling(true);
    try {
      const response = await fetch('/api/enrollments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId: course?.id,
        }),
      });

      if (response.ok) {
        // Redirect to course player
        router.push(`/learn/${course?.id}`);
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to enroll');
      }
    } catch (error) {
      console.error('Failed to enroll:', error);
      alert('An error occurred');
    } finally {
      setIsEnrolling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p>Loading course...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!course || !course.isPublished) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Course not found</h2>
            <p className="text-muted-foreground mb-4">
              This course doesn't exist or is not published yet.
            </p>
            <Link href="/courses">
              <Button>Browse Courses</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const totalDuration = course.lessons.reduce((acc, lesson) => acc + lesson.duration, 0);
  const isFreeCourse = course.isFree || Number(course.price) === 0;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl">
              <div className="mb-4">
                <Link
                  href="/courses"
                  className="text-sm text-muted-foreground hover:text-primary flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Courses
                </Link>
              </div>

              <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-lg text-muted-foreground mb-6">{course.description}</p>

              <div className="flex flex-wrap items-center gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>{course.instructor.name}</span>
                </div>

                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span>{course._count.enrollments} students</span>
                </div>

                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{formatDuration(totalDuration)} total</span>
                </div>

                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span>{course.level}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Course Curriculum */}
              <Card>
                <CardHeader>
                  <CardTitle>Course Curriculum</CardTitle>
                  <CardDescription>
                    {course.lessons.length} lessons
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {course.lessons.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">
                        No lessons added yet
                      </p>
                    ) : (
                      course.lessons.map((lesson, index) => (
                        <div
                          key={lesson.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent"
                        >
                          <div className="flex items-center gap-4 flex-1">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium">{lesson.title}</h4>
                              {lesson.description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {lesson.description}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-muted-foreground">
                              {formatDuration(lesson.duration)}
                            </span>
                            {lesson.isFree && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                Preview
                              </span>
                            )}
                            {(course.isEnrolled || lesson.isFree) && (
                              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            )}
                            {!course.isEnrolled && !lesson.isFree && (
                              <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Instructor Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Instructor</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-2xl font-bold text-primary">
                        {course.instructor.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{course.instructor.name}</h3>
                      <p className="text-muted-foreground">Course Instructor</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Reviews Section */}
              <div>
                <h2 className="text-2xl font-bold mb-6">Student Reviews</h2>
                <ReviewList courseId={course.id} isEnrolled={course.isEnrolled} />
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardContent className="pt-6">
                  <div className="text-center mb-6">
                    <div className="text-3xl font-bold mb-2">
                      {isFreeCourse ? 'Free' : formatPrice(course.price)}
                    </div>
                    {!isFreeCourse && (
                      <p className="text-sm text-muted-foreground">One-time payment</p>
                    )}
                  </div>

                  {course.isEnrolled ? (
                    <Link href={`/learn/${course.id}`}>
                      <Button className="w-full" size="lg">
                        Continue Learning
                      </Button>
                    </Link>
                  ) : isFreeCourse ? (
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={handleEnroll}
                      disabled={isEnrolling}
                    >
                      {isEnrolling ? 'Enrolling...' : 'Enroll for Free'}
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <Button
                        className="w-full"
                        size="lg"
                        onClick={() => router.push(`/checkout/${course.id}`)}
                      >
                        Buy Now
                      </Button>
                      <p className="text-xs text-center text-muted-foreground">
                        30-day money-back guarantee
                      </p>
                    </div>
                  )}

                  <div className="mt-6 space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Lifetime access</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{course.lessons.length} video lessons</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Learn at your own pace</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Mobile and desktop access</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

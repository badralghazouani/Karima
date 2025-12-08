'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPrice, formatDuration } from '@/lib/utils';

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  duration: number;
  order: number;
  isFree: boolean;
}

interface Instructor {
  id: string;
  name: string;
  avatar: string | null;
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
  instructor: Instructor;
  lessons: Lesson[];
  isEnrolled: boolean;
  canAccess: boolean;
  _count: {
    enrollments: number;
    reviews: number;
  };
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
      router.push(`/auth/login?redirect=/courses/${courseId}`);
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
        const error = await response.json();
        alert(error.error || 'Failed to enroll');
      }
    } catch (error) {
      console.error('Enrollment error:', error);
      alert('Failed to enroll in course');
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleBuyCourse = () => {
    if (!session) {
      router.push(`/auth/login?redirect=/courses/${courseId}`);
      return;
    }
    // Redirect to checkout
    router.push(`/checkout/${course?.id}`);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading course...</p>
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
            <p className="text-muted-foreground mb-6">
              This course doesn't exist or is not published yet
            </p>
            <Link href="/courses">
              <Button>Browse All Courses</Button>
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
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl">
              <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-lg text-muted-foreground mb-6">{course.description}</p>

              <div className="flex flex-wrap items-center gap-4 mb-6">
                {course.isFree && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    FREE
                  </span>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span>Created by {course.instructor.name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                  <span>{course._count.enrollments} students enrolled</span>
                </div>
              </div>

              {/* Enrollment CTA */}
              {course.isEnrolled || course.canAccess ? (
                <div className="flex gap-3">
                  <Button size="lg" onClick={() => router.push(`/learn/${course.id}`)}>
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    Go to Course
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div>
                    <div className="text-3xl font-bold mb-1">
                      {course.isFree ? 'Free' : formatPrice(course.price)}
                    </div>
                  </div>
                  {isFreeCourse ? (
                    <Button
                      size="lg"
                      onClick={handleEnroll}
                      disabled={isEnrolling}
                    >
                      {isEnrolling ? 'Enrolling...' : 'Enroll for Free'}
                    </Button>
                  ) : (
                    <Button
                      size="lg"
                      onClick={handleBuyCourse}
                    >
                      Buy Course
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Course Content */}
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* What You'll Learn */}
              <Card>
                <CardHeader>
                  <CardTitle>What you'll learn</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{course.description}</p>
                </CardContent>
              </Card>

              {/* Course Content / Curriculum */}
              <Card>
                <CardHeader>
                  <CardTitle>Course Content</CardTitle>
                  <CardDescription>
                    {course.lessons.length} lessons • {formatDuration(totalDuration)} total length
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {course.lessons.map((lesson, index) => (
                      <div
                        key={lesson.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{lesson.title}</h4>
                            {lesson.description && (
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {lesson.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {lesson.isFree && (
                            <span className="text-xs font-medium text-green-600">Free Preview</span>
                          )}
                          <span className="text-sm text-muted-foreground">
                            {formatDuration(lesson.duration)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Instructor */}
              <Card>
                <CardHeader>
                  <CardTitle>Instructor</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                      {course.instructor.avatar ? (
                        <img
                          src={course.instructor.avatar}
                          alt={course.instructor.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl font-bold text-primary">
                          {course.instructor.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{course.instructor.name}</h3>
                      <p className="text-sm text-muted-foreground">Course Instructor</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Course Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Level:</span>
                    <span className="font-medium">{course.level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-medium">{formatDuration(totalDuration)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Lessons:</span>
                    <span className="font-medium">{course.lessons.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Language:</span>
                    <span className="font-medium">{course.language === 'en' ? 'English' : 'French'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Enrolled:</span>
                    <span className="font-medium">{course._count.enrollments} students</span>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="text-2xl font-bold mb-4">
                      {isFreeCourse ? 'Free' : formatPrice(course.price)}
                    </div>
                    {course.isEnrolled || course.canAccess ? (
                      <Button
                        className="w-full"
                        size="lg"
                        onClick={() => router.push(`/learn/${course.id}`)}
                      >
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                        Start Learning
                      </Button>
                    ) : (
                      <>
                        {isFreeCourse ? (
                          <Button
                            className="w-full"
                            size="lg"
                            onClick={handleEnroll}
                            disabled={isEnrolling}
                          >
                            {isEnrolling ? 'Enrolling...' : 'Enroll for Free'}
                          </Button>
                        ) : (
                          <Button
                            className="w-full"
                            size="lg"
                            onClick={handleBuyCourse}
                          >
                            Buy Now
                          </Button>
                        )}
                      </>
                    )}
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

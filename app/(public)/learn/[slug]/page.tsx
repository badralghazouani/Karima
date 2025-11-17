'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ExerciseList } from '@/components/student/exercise-list';
import { formatDuration } from '@/lib/utils';

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  videoUrl: string;
  duration: number;
  order: number;
  isFree: boolean;
}

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  lessons: Lesson[];
  isEnrolled: boolean;
}

interface ProgressRecord {
  lessonId: string;
  isCompleted: boolean;
}

export default function CoursePlayerPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const slug = params.slug as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [progress, setProgress] = useState<ProgressRecord[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sidebarView, setSidebarView] = useState<'lessons' | 'exercises'>('lessons');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated') {
      fetchCourse();
    }
  }, [status, slug]);

  useEffect(() => {
    if (course && course.lessons.length > 0) {
      const lessonParam = searchParams.get('lesson');
      if (lessonParam) {
        const lesson = course.lessons.find(l => l.id === lessonParam);
        if (lesson) {
          setCurrentLesson(lesson);
        } else {
          setCurrentLesson(course.lessons[0]);
        }
      } else {
        setCurrentLesson(course.lessons[0]);
      }
    }
  }, [course, searchParams]);

  const fetchCourse = async () => {
    try {
      // Fetch course by slug
      const response = await fetch(`/api/courses?search=${slug}`);
      const courses = await response.json();
      const foundCourse = courses.find((c: Course) => c.slug === slug);

      if (foundCourse) {
        // Fetch full details
        const detailResponse = await fetch(`/api/courses/${foundCourse.id}`);
        const courseData = await detailResponse.json();

        if (!courseData.isEnrolled) {
          router.push(`/courses/${slug}`);
          return;
        }

        setCourse(courseData);

        // Fetch progress
        const progressResponse = await fetch(`/api/progress?courseId=${courseData.id}`);
        const progressData = await progressResponse.json();
        setProgress(progressData);
      }
    } catch (error) {
      console.error('Failed to fetch course:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLessonComplete = async (lessonId: string) => {
    try {
      const response = await fetch('/api/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lessonId,
          isCompleted: true,
        }),
      });

      if (response.ok) {
        // Refresh progress
        if (course) {
          const progressResponse = await fetch(`/api/progress?courseId=${course.id}`);
          const progressData = await progressResponse.json();
          setProgress(progressData);
        }
      }
    } catch (error) {
      console.error('Failed to mark lesson complete:', error);
    }
  };

  const handleNextLesson = () => {
    if (!course || !currentLesson) return;

    const currentIndex = course.lessons.findIndex(l => l.id === currentLesson.id);
    if (currentIndex < course.lessons.length - 1) {
      const nextLesson = course.lessons[currentIndex + 1];
      setCurrentLesson(nextLesson);
      router.push(`/learn/${slug}?lesson=${nextLesson.id}`);
    }
  };

  const handlePreviousLesson = () => {
    if (!course || !currentLesson) return;

    const currentIndex = course.lessons.findIndex(l => l.id === currentLesson.id);
    if (currentIndex > 0) {
      const prevLesson = course.lessons[currentIndex - 1];
      setCurrentLesson(prevLesson);
      router.push(`/learn/${slug}?lesson=${prevLesson.id}`);
    }
  };

  const isLessonCompleted = (lessonId: string) => {
    return progress.some(p => p.lessonId === lessonId && p.isCompleted);
  };

  const completedCount = course?.lessons.filter(l => isLessonCompleted(l.id)).length || 0;
  const totalLessons = course?.lessons.length || 0;
  const progressPercentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading course...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Course not found</h2>
          <Link href="/dashboard/my-courses">
            <Button>Back to My Courses</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <Link href="/dashboard/my-courses" className="text-sm hover:text-primary">
              ← Back to My Courses
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="font-medium">{completedCount}</span> / {totalLessons} lessons
            </div>
            <div className="w-32 h-2 bg-gray-200 rounded-full">
              <div
                className="h-2 bg-primary rounded-full transition-all"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <span className="text-sm font-medium">{progressPercentage}%</span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Lessons & Exercises */}
        <div
          className={`${
            isSidebarOpen ? 'w-full lg:w-80' : 'hidden'
          } border-r bg-white overflow-y-auto flex flex-col`}
        >
          <div className="p-4 border-b">
            <h2 className="font-bold text-lg mb-2">{course.title}</h2>
            <p className="text-sm text-muted-foreground">
              {course.lessons.length} lessons
            </p>
          </div>

          {/* Tabs */}
          <div className="border-b flex">
            <button
              onClick={() => setSidebarView('lessons')}
              className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                sidebarView === 'lessons'
                  ? 'border-primary text-primary'
                  : 'border-transparent hover:text-primary'
              }`}
            >
              Lessons
            </button>
            <button
              onClick={() => setSidebarView('exercises')}
              className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                sidebarView === 'exercises'
                  ? 'border-primary text-primary'
                  : 'border-transparent hover:text-primary'
              }`}
            >
              Exercises
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {sidebarView === 'lessons' ? (
              <div className="divide-y">
                {course.lessons.map((lesson, index) => (
                  <button
                    key={lesson.id}
                    onClick={() => {
                      setCurrentLesson(lesson);
                      router.push(`/learn/${slug}?lesson=${lesson.id}`);
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full text-left p-4 hover:bg-accent transition-colors ${
                      currentLesson?.id === lesson.id ? 'bg-accent' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {isLessonCompleted(lesson.id) ? (
                          <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center">
                            <span className="text-xs text-gray-600">{index + 1}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm mb-1 line-clamp-2">{lesson.title}</h4>
                        <p className="text-xs text-muted-foreground">
                          {formatDuration(lesson.duration)}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4">
                <ExerciseList courseId={course.id} />
              </div>
            )}
          </div>
        </div>

        {/* Main Content - Video Player */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {currentLesson ? (
            <>
              {/* Video */}
              <div className="bg-black flex-1 flex items-center justify-center">
                <video
                  key={currentLesson.id}
                  className="w-full h-full"
                  controls
                  onEnded={() => handleLessonComplete(currentLesson.id)}
                >
                  <source src={currentLesson.videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>

              {/* Lesson Info & Controls */}
              <div className="bg-white border-t p-6">
                <div className="container mx-auto max-w-4xl">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h1 className="text-2xl font-bold mb-2">{currentLesson.title}</h1>
                      {currentLesson.description && (
                        <p className="text-muted-foreground">{currentLesson.description}</p>
                      )}
                    </div>
                    <Button
                      onClick={() => handleLessonComplete(currentLesson.id)}
                      variant={isLessonCompleted(currentLesson.id) ? 'outline' : 'default'}
                      disabled={isLessonCompleted(currentLesson.id)}
                    >
                      {isLessonCompleted(currentLesson.id) ? (
                        <>
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Completed
                        </>
                      ) : (
                        'Mark as Complete'
                      )}
                    </Button>
                  </div>

                  {/* Navigation */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={handlePreviousLesson}
                      disabled={course.lessons.findIndex(l => l.id === currentLesson.id) === 0}
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Previous Lesson
                    </Button>

                    <Button
                      onClick={handleNextLesson}
                      disabled={
                        course.lessons.findIndex(l => l.id === currentLesson.id) ===
                        course.lessons.length - 1
                      }
                    >
                      Next Lesson
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-muted-foreground">Select a lesson to start learning</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

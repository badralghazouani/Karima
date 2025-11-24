'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { VideoPlayer } from '@/components/video-player';
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

interface Instructor {
  id: string;
  name: string;
  avatar: string | null;
}

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  instructor: Instructor;
  lessons: Lesson[];
  isEnrolled: boolean;
  canAccess: boolean;
  _count: {
    enrollments: number;
  };
}

interface ProgressRecord {
  lessonId: string;
  isCompleted: boolean;
}

export default function WatchPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const slug = params.slug as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [progress, setProgress] = useState<ProgressRecord[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showLessonList, setShowLessonList] = useState(false);

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

        if (!courseData.canAccess) {
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
      router.push(`/watch/${slug}?lesson=${nextLesson.id}`);
    }
  };

  const isLessonCompleted = (lessonId: string) => {
    return progress.some(p => p.lessonId === lessonId && p.isCompleted);
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-white">Loading video...</div>
      </div>
    );
  }

  if (!course || !currentLesson) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Video not found</h2>
          <Link href="/dashboard/my-courses">
            <Button>Back to My Courses</Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentIndex = course.lessons.findIndex(l => l.id === currentLesson.id);
  const completedCount = course.lessons.filter(l => isLessonCompleted(l.id)).length;
  const progressPercentage = Math.round((completedCount / course.lessons.length) * 100);

  return (
    <div className="min-h-screen bg-black">
      {/* Video Player Section */}
      <div className="w-full aspect-video bg-black">
        <VideoPlayer
          key={currentLesson.id}
          src={currentLesson.videoUrl}
          title={currentLesson.title}
          onEnded={() => {
            handleLessonComplete(currentLesson.id);
            handleNextLesson();
          }}
          autoPlay={false}
        />
      </div>

      {/* Content Below Video */}
      <div className="bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content - Video Info */}
            <div className="lg:col-span-2 space-y-4">
              {/* Video Title */}
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {currentLesson.title}
              </h1>

              {/* Course Info Bar */}
              <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4">
                <div className="flex items-center gap-4">
                  <Link
                    href={`/courses/${course.slug}`}
                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                  >
                    ← Back to Course
                  </Link>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Lesson {currentIndex + 1} of {course.lessons.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {progressPercentage}% Complete
                  </div>
                </div>
                <Button
                  onClick={() => handleLessonComplete(currentLesson.id)}
                  variant={isLessonCompleted(currentLesson.id) ? 'outline' : 'default'}
                  size="sm"
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
                    'Mark Complete'
                  )}
                </Button>
              </div>

              {/* Instructor Info */}
              <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  {course.instructor.avatar ? (
                    <img
                      src={course.instructor.avatar}
                      alt={course.instructor.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-xl font-bold text-gray-600 dark:text-gray-300">
                      {course.instructor.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {course.instructor.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Course Instructor</p>
                </div>
              </div>

              {/* Description */}
              {currentLesson.description && (
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    About this lesson
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                    {currentLesson.description}
                  </p>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (currentIndex > 0) {
                      const prevLesson = course.lessons[currentIndex - 1];
                      setCurrentLesson(prevLesson);
                      router.push(`/watch/${slug}?lesson=${prevLesson.id}`);
                    }
                  }}
                  disabled={currentIndex === 0}
                  className="flex-1"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous Lesson
                </Button>
                <Button
                  onClick={handleNextLesson}
                  disabled={currentIndex === course.lessons.length - 1}
                  className="flex-1"
                >
                  Next Lesson
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Button>
              </div>
            </div>

            {/* Sidebar - Lesson List */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden sticky top-4">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Course Content</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {completedCount} / {course.lessons.length} lessons completed
                  </p>
                  <div className="mt-2 w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 transition-all"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>
                <div className="max-h-[600px] overflow-y-auto">
                  {course.lessons.map((lesson, index) => (
                    <button
                      key={lesson.id}
                      onClick={() => {
                        setCurrentLesson(lesson);
                        router.push(`/watch/${slug}?lesson=${lesson.id}`);
                      }}
                      className={`w-full text-left p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                        currentLesson.id === lesson.id
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-600'
                          : ''
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
                            <div className="w-6 h-6 rounded-full border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center">
                              <span className="text-xs text-gray-600 dark:text-gray-400">{index + 1}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-gray-900 dark:text-white line-clamp-2">
                            {lesson.title}
                          </h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {formatDuration(lesson.duration)}
                            {lesson.isFree && ' • Free'}
                          </p>
                        </div>
                        {currentLesson.id === lesson.id && (
                          <div className="flex-shrink-0">
                            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ExerciseManager } from '@/components/instructor/exercise-manager';
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
  description: string;
  price: string;
  level: string;
  language: string;
  isPublished: boolean;
  isArchived: boolean;
  lessons: Lesson[];
}

export default function EditCoursePage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'curriculum' | 'exercises' | 'settings'>('details');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '0',
    level: 'BEGINNER',
    language: 'en',
  });

  const [lessonForm, setLessonForm] = useState({
    title: '',
    description: '',
    videoUrl: '',
    duration: '',
    isFree: false,
  });

  const [showLessonForm, setShowLessonForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      const response = await fetch(`/api/courses/${courseId}`);
      const data = await response.json();

      if (response.ok) {
        setCourse(data);
        setFormData({
          title: data.title,
          description: data.description,
          price: data.price.toString(),
          level: data.level,
          language: data.language,
        });
      }
    } catch (error) {
      console.error('Failed to fetch course:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveCourse = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
        }),
      });

      if (response.ok) {
        alert('Course updated successfully!');
        fetchCourse();
      } else {
        alert('Failed to update course');
      }
    } catch (error) {
      console.error('Failed to save course:', error);
      alert('An error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddLesson = async () => {
    try {
      const order = course?.lessons.length || 0;
      const response = await fetch(`/api/courses/${courseId}/lessons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...lessonForm,
          duration: parseInt(lessonForm.duration),
          order,
        }),
      });

      if (response.ok) {
        setShowLessonForm(false);
        setLessonForm({
          title: '',
          description: '',
          videoUrl: '',
          duration: '',
          isFree: false,
        });
        fetchCourse();
      } else {
        alert('Failed to add lesson');
      }
    } catch (error) {
      console.error('Failed to add lesson:', error);
      alert('An error occurred');
    }
  };

  const handleUpdateLesson = async (lessonId: string) => {
    try {
      const response = await fetch(`/api/lessons/${lessonId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...lessonForm,
          duration: parseInt(lessonForm.duration),
        }),
      });

      if (response.ok) {
        setShowLessonForm(false);
        setEditingLesson(null);
        setLessonForm({
          title: '',
          description: '',
          videoUrl: '',
          duration: '',
          isFree: false,
        });
        fetchCourse();
      } else {
        alert('Failed to update lesson');
      }
    } catch (error) {
      console.error('Failed to update lesson:', error);
      alert('An error occurred');
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm('Are you sure you want to delete this lesson?')) {
      return;
    }

    try {
      const response = await fetch(`/api/lessons/${lessonId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchCourse();
      } else {
        alert('Failed to delete lesson');
      }
    } catch (error) {
      console.error('Failed to delete lesson:', error);
      alert('An error occurred');
    }
  };

  const handlePublishToggle = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isPublished: !course?.isPublished,
        }),
      });

      if (response.ok) {
        fetchCourse();
      } else {
        alert('Failed to update publish status');
      }
    } catch (error) {
      console.error('Failed to toggle publish:', error);
      alert('An error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const handleArchiveToggle = async () => {
    const action = course?.isArchived ? 'unarchive' : 'archive';
    if (!confirm(`Are you sure you want to ${action} this course?`)) {
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isArchived: !course?.isArchived,
        }),
      });

      if (response.ok) {
        fetchCourse();
      } else {
        alert('Failed to update archive status');
      }
    } catch (error) {
      console.error('Failed to toggle archive:', error);
      alert('An error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const startEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setLessonForm({
      title: lesson.title,
      description: lesson.description || '',
      videoUrl: lesson.videoUrl,
      duration: lesson.duration.toString(),
      isFree: lesson.isFree,
    });
    setShowLessonForm(true);
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

  if (!course) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Course not found</h2>
            <Link href="/instructor/courses">
              <Button>Back to Courses</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link
            href="/instructor/courses"
            className="text-sm text-muted-foreground hover:text-primary flex items-center gap-2 mb-4"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Courses
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{course.title}</h1>
              <p className="text-muted-foreground mt-1">
                {course.isPublished ? 'Published' : 'Draft'}
              </p>
            </div>
            <Button
              onClick={handlePublishToggle}
              variant={course.isPublished ? 'outline' : 'default'}
              disabled={isSaving}
            >
              {course.isPublished ? 'Unpublish' : 'Publish Course'}
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b mb-6">
          <nav className="flex gap-8">
            <button
              onClick={() => setActiveTab('details')}
              className={`pb-4 px-1 border-b-2 transition-colors ${
                activeTab === 'details'
                  ? 'border-primary text-primary font-medium'
                  : 'border-transparent hover:text-primary'
              }`}
            >
              Course Details
            </button>
            <button
              onClick={() => setActiveTab('curriculum')}
              className={`pb-4 px-1 border-b-2 transition-colors ${
                activeTab === 'curriculum'
                  ? 'border-primary text-primary font-medium'
                  : 'border-transparent hover:text-primary'
              }`}
            >
              Curriculum ({course.lessons.length} lessons)
            </button>
            <button
              onClick={() => setActiveTab('exercises')}
              className={`pb-4 px-1 border-b-2 transition-colors ${
                activeTab === 'exercises'
                  ? 'border-primary text-primary font-medium'
                  : 'border-transparent hover:text-primary'
              }`}
            >
              Exercises & Quizzes
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`pb-4 px-1 border-b-2 transition-colors ${
                activeTab === 'settings'
                  ? 'border-primary text-primary font-medium'
                  : 'border-transparent hover:text-primary'
              }`}
            >
              Settings
            </button>
          </nav>
        </div>

        {/* Details Tab */}
        {activeTab === 'details' && (
          <Card>
            <CardHeader>
              <CardTitle>Course Information</CardTitle>
              <CardDescription>Update your course details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <textarea
                  rows={5}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Price (USD)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Level</label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                    <option value="ALL_LEVELS">All Levels</option>
                  </select>
                </div>
              </div>

              <Button onClick={handleSaveCourse} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Curriculum Tab */}
        {activeTab === 'curriculum' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Course Curriculum</CardTitle>
                    <CardDescription>Manage your course lessons</CardDescription>
                  </div>
                  <Button onClick={() => setShowLessonForm(true)}>Add Lesson</Button>
                </div>
              </CardHeader>
              <CardContent>
                {course.lessons.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">No lessons yet</p>
                    <Button onClick={() => setShowLessonForm(true)}>Add Your First Lesson</Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {course.lessons.map((lesson, index) => (
                      <div
                        key={lesson.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <span className="text-muted-foreground">#{index + 1}</span>
                          <div className="flex-1">
                            <h4 className="font-medium">{lesson.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {formatDuration(lesson.duration)}
                              {lesson.isFree && ' • Free Preview'}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startEditLesson(lesson)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteLesson(lesson.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Lesson Form Modal */}
            {showLessonForm && (
              <Card>
                <CardHeader>
                  <CardTitle>{editingLesson ? 'Edit Lesson' : 'Add New Lesson'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Lesson Title</label>
                    <Input
                      value={lessonForm.title}
                      onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                      placeholder="e.g., Introduction to JavaScript"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description (optional)</label>
                    <textarea
                      rows={3}
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={lessonForm.description}
                      onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                      placeholder="Brief description of the lesson..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Video URL</label>
                    <Input
                      value={lessonForm.videoUrl}
                      onChange={(e) => setLessonForm({ ...lessonForm, videoUrl: e.target.value })}
                      placeholder="https://..."
                    />
                    <p className="text-xs text-muted-foreground">
                      Upload video to your hosting service and paste the URL here
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Duration (seconds)</label>
                    <Input
                      type="number"
                      value={lessonForm.duration}
                      onChange={(e) => setLessonForm({ ...lessonForm, duration: e.target.value })}
                      placeholder="e.g., 600"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isFree"
                      checked={lessonForm.isFree}
                      onChange={(e) => setLessonForm({ ...lessonForm, isFree: e.target.checked })}
                    />
                    <label htmlFor="isFree" className="text-sm">
                      Allow free preview of this lesson
                    </label>
                  </div>

                  <div className="flex gap-2">
                    {editingLesson ? (
                      <Button onClick={() => handleUpdateLesson(editingLesson.id)}>
                        Update Lesson
                      </Button>
                    ) : (
                      <Button onClick={handleAddLesson}>Add Lesson</Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowLessonForm(false);
                        setEditingLesson(null);
                        setLessonForm({
                          title: '',
                          description: '',
                          videoUrl: '',
                          duration: '',
                          isFree: false,
                        });
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Exercises Tab */}
        {activeTab === 'exercises' && (
          <ExerciseManager courseId={courseId} />
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <Card>
            <CardHeader>
              <CardTitle>Course Settings</CardTitle>
              <CardDescription>Manage advanced course settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Publication Status</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  {course.isPublished
                    ? 'Your course is currently published and visible to students.'
                    : 'Your course is in draft mode and not visible to students.'}
                </p>
                <Button onClick={handlePublishToggle} disabled={isSaving}>
                  {course.isPublished ? 'Unpublish Course' : 'Publish Course'}
                </Button>
              </div>

              <div className="p-4 border border-orange-300 rounded-lg">
                <h4 className="font-medium mb-2">Archive Status</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  {course.isArchived
                    ? 'This course is archived and hidden from your active courses list.'
                    : 'Archive this course to remove it from your active courses list without deleting it.'}
                </p>
                <Button
                  onClick={handleArchiveToggle}
                  disabled={isSaving}
                  variant={course.isArchived ? 'default' : 'outline'}
                >
                  {course.isArchived ? 'Unarchive Course' : 'Archive Course'}
                </Button>
              </div>

              <div className="p-4 border border-destructive rounded-lg">
                <h4 className="font-medium text-destructive mb-2">Danger Zone</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Permanently delete this course and all associated content.
                </p>
                <Button variant="destructive" onClick={() => router.push('/instructor/courses')}>
                  Delete Course
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
}
